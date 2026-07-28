#!/usr/bin/env bash
set -Eeuo pipefail

fail() { echo "repo-policy: $*" >&2; exit 1; }

[[ -f backend/package-lock.json ]] || fail "backend lockfile missing"
[[ -f frontend/package-lock.json ]] || fail "frontend lockfile missing"
[[ -f importer/packages.lock.json ]] || fail "importer lockfile missing"

tracked="$(git ls-files)"
if grep -Eiq '(^|/)(admin|headcrab|THE-ARC)(/|$)|(^|/)(license\.json|disk-image\.img)$|\.(img|db)$' <<<"$tracked"; then
  fail "private, administrative, database or image artifact is tracked"
fi

if git grep -Il $'\r' -- '*.sh' 'tools/hugin-*' 'tools/lib/*.sh' |
  grep -q .; then
  fail "shell scripts must use LF"
fi

while IFS= read -r file; do
  mode="$(git ls-files -s -- "$file" | awk '{print $1}')"
  [[ "$mode" == "100755" ]] || fail "$file must be executable"
done < <(printf '%s\n' setup.sh benchmarks/search-baseline.sh \
  scripts/ci/*.sh tests/shell/*.sh tests/pi/*.sh tools/hugin-*)

if [[ -n "${GITHUB_BASE_REF:-}" ]] &&
  git rev-parse --verify --quiet "origin/$GITHUB_BASE_REF" >/dev/null; then
  git diff --check "origin/$GITHUB_BASE_REF...HEAD"
elif git rev-parse --verify --quiet HEAD^ >/dev/null; then
  git diff --check HEAD^ HEAD
fi
git diff --check HEAD --
echo "repo-policy: OK"
