#!/usr/bin/env bash
set -Eeuo pipefail

[[ "$(id -u)" -eq 0 ]] || { echo "run as root" >&2; exit 1; }
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR=/usr/local/sbin
LIB_DIR=/usr/local/lib/hugin

# Runtime-only allowlist. hugin-deploy and hugin-db stay on the development
# machine; no admin or automatic healing tools are installed.
RUNTIME_TOOLS=(
  hugin-ap
  hugin-boot
  hugin-clients
  hugin-logs
  hugin-reset-radio
  hugin-status
  hugin-warmup
  hugin-wifi
)

for tool in "${RUNTIME_TOOLS[@]}"; do
  [[ -f "$ROOT/tools/$tool" ]] || {
    echo "missing runtime tool: tools/$tool" >&2
    exit 1
  }
done

install -d -m 0755 "$BIN_DIR" "$LIB_DIR"
install -m 0644 "$ROOT/tools/lib/wifi.sh" "$LIB_DIR/wifi.sh"
for tool in "${RUNTIME_TOOLS[@]}"; do
  install -m 0755 "$ROOT/tools/$tool" "$BIN_DIR/$tool"
done

install -m 0644 \
  "$ROOT/runtime/etc/systemd/system/hugin-boot.service" \
  /etc/systemd/system/hugin-boot.service
ln -sfn /etc/wpa_supplicant/wpa_supplicant.conf \
  /etc/wpa_supplicant/wpa_supplicant-wlan0.conf

systemctl daemon-reload
systemctl enable hugin-boot.service
echo "Hugin runtime tools and boot-time Wi-Fi recovery installed."
