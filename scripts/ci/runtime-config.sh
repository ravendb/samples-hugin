#!/usr/bin/env bash
set -Eeuo pipefail

assert_line() {
  grep -Fxq "$2" "$1" || {
    echo "runtime-config: missing '$2' in $1" >&2
    exit 1
  }
}

sysctl=runtime/etc/sysctl.d/99-hugin.conf
assert_line "$sysctl" "vm.swappiness=60"
assert_line "$sysctl" "vm.vfs_cache_pressure=200"
assert_line "$sysctl" "vm.min_free_kbytes=8192"

grep -Fq '768 * 1024 * 1024' tools/hugin-zram
if grep -R -E '/(swapfile|var/swap)|dphys-swapfile.*start' setup.sh tools runtime; then
  echo "runtime-config: SD-card swap configuration found" >&2
  exit 1
fi
grep -Fq 'mode=2' tools/lib/wifi.sh
grep -Fq 'key_mgmt=NONE' tools/lib/wifi.sh
grep -Fq '10.1.1.1/24' tools/lib/wifi.sh
grep -Fq 'OLLAMA_KEEP_ALIVE=30m' \
  runtime/etc/systemd/system/ollama.service.d/hugin.conf

ollama_line="$(grep -n '/api/embeddings' tools/hugin-warmup | cut -d: -f1)"
vector_line="$(grep -n 'mode=ai' tools/hugin-warmup | cut -d: -f1)"
[[ "$ollama_line" -lt "$vector_line" ]] || {
  echo "runtime-config: Ollama must warm before the vector index" >&2
  exit 1
}

systemd-analyze verify runtime/etc/systemd/system/*.service
nginx -t -p "$PWD" -c tests/config/nginx.conf
dnsmasq --test -C runtime/etc/dnsmasq.d/hugin.conf
echo "runtime-config: OK"
