#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
IP="${1:-}"
USER_NAME="${HUGIN_PI_USER:-rdb}"
[[ "$IP" =~ ^[0-9a-fA-F:.]+$ ]] || {
  echo "usage: tests/pi/validate.sh PI_IP" >&2
  exit 2
}
TARGET="${USER_NAME}@${IP}"
SSH=(ssh -o BatchMode=yes -o ConnectTimeout=8 "$TARGET")
REPORT_DIR="$ROOT/artifacts/pi-validation"
REPORT="$REPORT_DIR/$(date +%Y%m%d-%H%M%S).md"
COMMIT="$(git -C "$ROOT" rev-parse HEAD)"
PASS=0
FAIL=0

mkdir -p "$REPORT_DIR"
exec > >(tee -a "$REPORT") 2>&1

pass() { PASS=$((PASS + 1)); printf 'PASS  %s\n' "$*"; }
fail() { FAIL=$((FAIL + 1)); printf 'FAIL  %s\n' "$*" >&2; }
require() { command -v "$1" >/dev/null || { echo "missing local command: $1" >&2; exit 1; }; }
remote() { "${SSH[@]}" "$@"; }
confirm() {
  local answer
  read -r -p "$1 [Y/n] " answer
  [[ -z "$answer" || "$answer" =~ ^[Yy]$ ]]
}
check_json() {
  node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(0,'utf8'));if(!($1))process.exit(1)"
}

require ssh
require curl
require node

printf '# Hugin Pi validation\n\n'
printf -- '- Commit: `%s`\n' "$COMMIT"
printf -- '- Started: `%s`\n\n' "$(date --iso-8601=seconds)"

if remote true; then pass "bounded SSH preflight"; else fail "SSH preflight"; exit 1; fi
model="$(remote "tr -d '\\0' </proc/device-tree/model 2>/dev/null || true")"
arch="$(remote "uname -m")"
bookworm="$(remote ". /etc/os-release; printf '%s' \"\$VERSION_CODENAME\"")"
[[ "$model" == *"Pi Zero 2"* ]] && pass "hardware is Pi Zero 2" || fail "unexpected hardware: $model"
[[ "$arch" == "aarch64" ]] && pass "64-bit userspace" || fail "unexpected architecture: $arch"
[[ "$bookworm" == "bookworm" ]] && pass "Raspberry Pi OS Bookworm" || fail "unexpected OS: $bookworm"
remote "sudo -n true" && pass "passwordless sudo for provisioning" ||
  { fail "passwordless sudo unavailable"; exit 1; }

if [[ "${HUGIN_PI_SKIP_DEPLOY:-0}" != "1" ]]; then
  if confirm "Deploy the current commit twice (idempotence check)?"; then
    "$ROOT/tools/hugin-deploy" "$TARGET" --system
    "$ROOT/tools/hugin-deploy" "$TARGET" --system
    pass "two consecutive deploys"
  fi
fi

for service in hugin ravendb ollama hugin-warmup; do
  if remote "systemctl is-active --quiet '$service'"; then
    pass "$service active"
  else
    fail "$service inactive"
  fi
done

remote "[[ \$(sysctl -n vm.swappiness) = 60 &&
  \$(sysctl -n vm.vfs_cache_pressure) = 200 &&
  \$(sysctl -n vm.min_free_kbytes) = 8192 ]]" &&
  pass "sysctl memory profile" || fail "sysctl memory profile"
remote "swapon --show --noheadings --output NAME |
  grep -Fxq /dev/zram0 &&
  ! swapon --show --noheadings --output NAME | grep -Ev '^/dev/zram0$'" &&
  pass "zram is the only swap" || fail "unexpected swap devices"
remote "[[ \$(cat /sys/block/zram0/disksize) = 805306368 ]]" &&
  pass "zram size is 768 MiB" || fail "zram size"

boot="$(curl --fail --silent --show-error --max-time 20 "http://$IP/api/boot-status")"
printf '%s' "$boot" | check_json 'j.ready===true' &&
  pass "boot status ready" || fail "boot status not ready"

fts="$(curl --fail --silent --show-error --max-time 60 --get \
  --data-urlencode 'q=linux wifi' --data-urlencode 'pageSize=1' \
  "http://$IP/api/search")"
printf '%s' "$fts" | check_json 'Array.isArray(j.data?.results)&&j.data.results.length>0' &&
  pass "FTS smoke" || fail "FTS smoke"

unique="hugin-pre-pr-${COMMIT:0:8}-$(date +%s)"
ai_cold="$(curl --fail --silent --show-error --max-time 300 --get \
  --data-urlencode "q=$unique" --data-urlencode 'mode=ai' \
  --data-urlencode 'pageSize=1' "http://$IP/api/search")"
printf '%s' "$ai_cold" | check_json 'Array.isArray(j.data?.results)' &&
  pass "AI unique-query smoke" || fail "AI unique-query smoke"
ai_warm="$(curl --fail --silent --show-error --max-time 300 --get \
  --data-urlencode "q=$unique" --data-urlencode 'mode=ai' \
  --data-urlencode 'pageSize=1' "http://$IP/api/search")"
printf '%s' "$ai_warm" | check_json 'Array.isArray(j.data?.results)' &&
  pass "AI repeated-query smoke" || fail "AI repeated-query smoke"

if confirm "Run the guided Wi-Fi AP, captive portal and radio recovery test?"; then
  echo "The Pi will leave the LAN. Connect this computer to 'Hugin (ravendb)' when prompted."
  remote "nohup sudo /usr/local/sbin/hugin-ap >/tmp/hugin-ap-validation.log 2>&1 </dev/null &" || true
  read -r -p "After connecting to the Hugin AP, press Enter to continue. "
  curl --fail --silent --show-error --max-time 20 http://10.1.1.1/ >/dev/null &&
    pass "AP and captive HTTP endpoint" || fail "AP or captive HTTP endpoint"
  ssh -o BatchMode=yes -o ConnectTimeout=8 "${USER_NAME}@10.1.1.1" \
    "nohup sudo /usr/local/sbin/hugin-boot >/tmp/hugin-boot-validation.log 2>&1 </dev/null &" || true
  read -r -p "Reconnect this computer to the original LAN, then press Enter. "
  for _ in $(seq 1 60); do
    "${SSH[@]}" true 2>/dev/null && break
    sleep 2
  done
  remote true && pass "AP to saved-client recovery" || fail "AP to saved-client recovery"
  remote "nohup sudo /usr/local/sbin/hugin-reset-radio >/tmp/hugin-radio-validation.log 2>&1 </dev/null &" || true
  sleep 5
  for _ in $(seq 1 60); do
    "${SSH[@]}" true 2>/dev/null && break
    sleep 2
  done
  remote true && pass "brcmfmac reset recovery" || fail "brcmfmac reset recovery"
fi

if [[ -n "${HUGIN_DB_SOURCE:-}" ]] &&
  confirm "Run hugin-db plan against the supplied disposable transfer source?"; then
  "$ROOT/tools/hugin-db" plan "$TARGET"
  pass "database transfer preflight"
else
  echo "SKIP  database transfer (set HUGIN_DB_SOURCE for a disposable XferProbe)"
fi

printf '\n## Result\n\nPASS=%d FAIL=%d\n' "$PASS" "$FAIL"
printf 'Report: %s\n' "$REPORT"
[[ "$FAIL" -eq 0 ]]
