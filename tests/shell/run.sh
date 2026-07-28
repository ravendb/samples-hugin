#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fail() { echo "shell-contract: $*" >&2; exit 1; }
assert_contains() { grep -Fq -- "$2" "$1" || fail "'$2' missing from $1"; }
assert_not_contains() { ! grep -Fq -- "$2" "$1" || fail "'$2' unexpectedly present in $1"; }

mkdir -p "$tmp/bin" "$tmp/source/System" "$tmp/source/Databases/Hugin"
log="$tmp/commands.log"
export HUGIN_TEST_LOG="$log"

cat >"$tmp/bin/ssh" <<'STUB'
#!/usr/bin/env bash
printf 'ssh %s\n' "$*" >>"$HUGIN_TEST_LOG"
exit 0
STUB
cat >"$tmp/bin/rsync" <<'STUB'
#!/usr/bin/env bash
printf 'rsync %s\n' "$*" >>"$HUGIN_TEST_LOG"
exit 0
STUB
cat >"$tmp/bin/wpa_passphrase" <<'STUB'
#!/usr/bin/env bash
printf 'network={\n    ssid="%s"\n    #psk="%s"\n    psk=deadbeef\n}\n' "$1" "$2"
STUB
chmod +x "$tmp/bin/"*

PATH="$tmp/bin:$PATH" HUGIN_DB_SOURCE="$tmp/source" \
  "$ROOT/tools/hugin-db" push rdb@192.0.2.10 --reuse /old/Hugin

system_line="$(grep '^rsync .*System/' "$log")"
database_line="$(grep '^rsync .*Databases/Hugin/' "$log")"
assert_not_contains <(printf '%s\n' "$system_line") "--inplace"
assert_contains <(printf '%s\n' "$database_line") "--inplace"
assert_contains <(printf '%s\n' "$system_line") "--rsync-path=sudo rsync"
assert_contains <(printf '%s\n' "$database_line") "--compare-dest=/old/Hugin"
assert_contains "$log" "systemctl stop hugin ravendb"
assert_contains "$log" "resuming interrupted transfer"

mkdir -p "$tmp/source/Databases/Unexpected"
if PATH="$tmp/bin:$PATH" HUGIN_DB_SOURCE="$tmp/source" \
  "$ROOT/tools/hugin-db" plan rdb@192.0.2.10 >/dev/null 2>&1; then
  fail "plan accepted more than one source database"
fi

wpa="$tmp/wpa_supplicant.conf"
PATH="$tmp/bin:$PATH" HUGIN_WPA_CONF="$wpa" HUGIN_WIFI_COUNTRY=PL \
  bash -c "source '$ROOT/tools/lib/wifi.sh'; wifi_write_client 'Test WiFi' 'secret'"
assert_contains "$wpa" "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev"
assert_contains "$wpa" "country=PL"
assert_contains "$wpa" 'ssid="Test WiFi"'
assert_not_contains "$wpa" '#psk="secret"'

# The deployment script must retain the escaped variable inside its remote
# command string.
# shellcheck disable=SC2016
grep -Fq '[[ \$ready -eq 1 ]]' "$ROOT/tools/hugin-deploy" ||
  fail "deploy does not fail closed when readiness is exhausted"
grep -Fq 'backend/package-lock.json' "$ROOT/tools/hugin-deploy" ||
  fail "deploy allowlist does not include the backend lockfile"
if grep -Eq '^items=\(backend([[:space:]]|$)' "$ROOT/tools/hugin-deploy"; then
  fail "deploy archives the whole backend directory"
fi
grep -Fq 'mode=2' "$ROOT/tools/lib/wifi.sh" ||
  fail "AP is not implemented with the verified wpa_supplicant mode"

echo "shell-contract: OK"
