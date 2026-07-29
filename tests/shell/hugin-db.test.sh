#!/usr/bin/env bash
set -Eeuo pipefail

TEST_ROOT="$(mktemp -d "$PWD/.hugin-db-test.XXXXXX")"
trap 'rm -rf "$TEST_ROOT"' EXIT
mkdir -p "$TEST_ROOT/bin" "$TEST_ROOT/source/System" \
  "$TEST_ROOT/source/Databases/HuginAI"
touch "$TEST_ROOT/source/System/Raven.voron" \
  "$TEST_ROOT/source/Databases/HuginAI/Raven.voron"

cat >"$TEST_ROOT/bin/curl" <<'SH'
#!/usr/bin/env bash
if [[ "$*" == *"/databases?pageSize=1024"* ]]; then
  if [[ -n "${HUGIN_TEST_DATABASES:-}" ]]; then
    printf '%s\n' "$HUGIN_TEST_DATABASES"
  else
    printf '{"Databases":[{"Name":"HuginAI"}]}\n'
  fi
else
  printf '{"FullVersion":"7.2.test"}\n'
fi
SH
cat >"$TEST_ROOT/bin/ssh" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "remote preflight ok"
SH
chmod +x "$TEST_ROOT/bin/curl" "$TEST_ROOT/bin/ssh"

export PATH="$TEST_ROOT/bin:$PATH"
export HUGIN_DB_SOURCE="$TEST_ROOT/source"

output="$(bash tools/hugin-db plan rdb@192.0.2.1)"
[[ "$output" == *"Databases: HuginAI"* ]]
[[ "$output" == *"remote preflight ok"* ]]

export HUGIN_TEST_DATABASES='{"Databases":[{"Name":"HuginAI"},{"Name":"Scratch"}]}'
if bash tools/hugin-db plan rdb@192.0.2.1 >/dev/null 2>&1; then
  echo "plan accepted a multi-database System registry" >&2
  exit 1
fi
