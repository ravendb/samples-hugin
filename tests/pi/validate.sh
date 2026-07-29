#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
IP="${1:-}"
shift || true
USER_NAME="${HUGIN_PI_USER:-rdb}"
DEPLOY=0
RADIO=0
DB_PLAN=0

usage() {
  echo "usage: tests/pi/validate.sh PI_IP [--deploy] [--radio] [--db-plan]" >&2
  exit 2
}

[[ "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || usage
while [[ $# -gt 0 ]]; do
  case "$1" in
    --deploy) DEPLOY=1 ;;
    --radio) RADIO=1 ;;
    --db-plan) DB_PLAN=1 ;;
    *) usage ;;
  esac
  shift
done

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
check_json() {
  node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(0,'utf8'));if(!($1))process.exit(1)"
}
require_sudo() {
  remote "sudo -n true" || {
    echo "passwordless sudo is required for --deploy and --radio" >&2
    exit 1
  }
}

require ssh
require curl
require node

printf '# Hugin Pi validation\n\n'
printf -- '- Commit: %s\n' "$COMMIT"
printf -- '- Started: %s\n\n' "$(date --iso-8601=seconds)"

if remote true; then
  pass "bounded SSH preflight"
else
  fail "SSH preflight"
  exit 1
fi

model="$(remote "tr -d '\\0' </proc/device-tree/model 2>/dev/null || true")"
arch="$(remote "uname -m")"
if [[ "$model" == *"Pi Zero 2"* && "$arch" == "aarch64" ]]; then
  pass "Pi Zero 2 W with 64-bit userspace"
else
  fail "unexpected target: $model ($arch)"
fi

if (( DEPLOY )); then
  require_sudo
  "$ROOT/tools/hugin-deploy" "$TARGET" --system
  pass "current commit deployed"
fi

if remote "test -x /usr/local/sbin/hugin-status && /usr/local/sbin/hugin-status"; then
  pass "hugin-status"
else
  fail "hugin-status"
fi

for service in hugin ravendb ollama hugin-warmup \
  systemd-zram-setup@zram0; do
  if remote "systemctl is-active --quiet '$service'"; then
    pass "$service active"
  else
    fail "$service inactive"
  fi
done

if remote "set -a
  . /etc/default/hugin
  [[ \"\$HUGIN_DB_NAME\" == HuginAI ]]
  [[ \"\$HUGIN_EMB_TASK_IDENTIFIER\" == embedtaskhuginai ]]
  [[ \"\$EMB_MODEL\" == snowflake-arctic-embed:s ]]"; then
  pass "HuginAI runtime identity"
else
  fail "HuginAI runtime identity"
fi

if remote "set -e
  [[ \$(cat /sys/block/zram0/disksize) -eq 805306368 ]]
  [[ \$(sysctl -n vm.swappiness) -eq 60 ]]
  [[ \$(sysctl -n vm.vfs_cache_pressure) -eq 200 ]]
  [[ \$(sysctl -n vm.min_free_kbytes) -eq 8192 ]]
  ! swapon --noheadings --show=NAME | grep -qv '^/dev/zram0$'"; then
  pass "768 MiB zram profile with no SD swap"
else
  fail "zram, sysctl or SD swap policy"
fi

boot="$(curl --fail --silent --show-error --max-time 20 "http://$IP/api/boot-status")"
if printf '%s' "$boot" | check_json 'j.ready===true'; then
  pass "boot status ready"
else
  fail "boot status not ready"
fi

fts="$(curl --fail --silent --show-error --max-time 60 --get \
  --data-urlencode 'q=linux wifi' --data-urlencode 'pageSize=1' \
  "http://$IP/api/search")"
if printf '%s' "$fts" |
  check_json 'Array.isArray(j.data?.results)&&j.data.results.length>0'; then
  pass "FTS smoke"
else
  fail "FTS smoke"
fi

unique="hugin-pre-pr-${COMMIT:0:8}-$(date +%s)"
ai="$(curl --fail --silent --show-error --max-time 300 --get \
  --data-urlencode "q=$unique" --data-urlencode 'mode=ai' \
  --data-urlencode 'pageSize=1' "http://$IP/api/search")"
if printf '%s' "$ai" | check_json 'Array.isArray(j.data?.results)'; then
  pass "AI smoke"
else
  fail "AI smoke"
fi

if (( RADIO )); then
  require_sudo
  echo "The Pi will leave the LAN. Connect this computer to 'Hugin (ravendb)' when prompted."
  remote "nohup sudo /usr/local/sbin/hugin-ap >/tmp/hugin-ap-validation.log 2>&1 </dev/null &" || true
  read -r -p "After connecting to the Hugin AP, press Enter to continue. "
  if curl --fail --silent --show-error --max-time 20 http://10.1.1.1/ >/dev/null; then
    pass "AP and captive HTTP endpoint"
  else
    fail "AP or captive HTTP endpoint"
  fi
  ssh -o BatchMode=yes -o ConnectTimeout=8 "${USER_NAME}@10.1.1.1" \
    "nohup sudo /usr/local/sbin/hugin-boot >/tmp/hugin-boot-validation.log 2>&1 </dev/null &" || true
  read -r -p "Reconnect this computer to the original LAN, then press Enter. "
  for _ in $(seq 1 60); do
    "${SSH[@]}" true 2>/dev/null && break
    sleep 2
  done
  if remote true; then
    pass "AP to saved-client recovery"
  else
    fail "AP to saved-client recovery"
  fi
fi

if (( DB_PLAN )); then
  [[ -n "${HUGIN_DB_SOURCE:-}" ]] || {
    echo "set HUGIN_DB_SOURCE before using --db-plan" >&2
    exit 2
  }
  "$ROOT/tools/hugin-db" plan "$TARGET"
  pass "database transfer preflight"
fi

printf '\n## Result\n\nPASS=%d FAIL=%d\n' "$PASS" "$FAIL"
printf 'Report: %s\n' "$REPORT"
[[ "$FAIL" -eq 0 ]]
