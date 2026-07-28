#!/usr/bin/env bash
set -Eeuo pipefail
BASE_URL="${HUGIN_URL:-http://127.0.0.1}"
CONDITION="${HUGIN_BENCH_CONDITION:-model-warm}"
queries=("wifi connection" "disk full" "service will not start")
exec 9>"${TMPDIR:-/tmp}/hugin-search-benchmark.lock"
flock -n 9 || { echo "benchmark already running" >&2; exit 1; }
printf 'condition,mode,query,wall_ms,raven_ms,ram_used_kb,zram_used_kb,swap_used_kb\n'
for mode in fts ai; do
  for query in "${queries[@]}"; do
    start="$(date +%s%3N)"
    json="$(curl --fail --silent --show-error --max-time 240 --get \
      --data-urlencode "q=$query" --data-urlencode "mode=$mode" \
      "$BASE_URL/api/search")"
    end="$(date +%s%3N)"
    raven="$(printf '%s' "$json" | sed -n 's/.*"server":\([0-9.]*\).*/\1/p')"
    ram="$(awk '/MemTotal/{t=$2}/MemAvailable/{a=$2}END{print t-a}' /proc/meminfo)"
    zram="$(awk '$1 ~ /zram/{print $4}' /proc/swaps | head -1)"; zram="${zram:-0}"
    swap="$(awk '/SwapTotal/{t=$2}/SwapFree/{f=$2}END{print t-f}' /proc/meminfo)"
    printf '%s,%s,"%s",%s,%s,%s,%s,%s\n' "$CONDITION" "$mode" "$query" "$((end-start))" "${raven:-}" "$ram" "$zram" "$swap"
  done
done
