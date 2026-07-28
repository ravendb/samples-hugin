#!/usr/bin/env bash
set -Eeuo pipefail

[[ "$(id -u)" -eq 0 ]] || { echo "run as root" >&2; exit 1; }
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

id -u hugin >/dev/null 2>&1 || useradd --system --home /var/lib/hugin --create-home hugin
install -d -o hugin -g hugin -m 0755 /usr/lib/hugin /var/lib/hugin /run/hugin

install -m 0755 "$ROOT"/tools/hugin-* /usr/local/sbin/
install -d -m 0755 /usr/local/lib/hugin
install -m 0644 "$ROOT/tools/lib/wifi.sh" /usr/local/lib/hugin/wifi.sh
install -m 0644 "$ROOT/runtime/etc/nginx/sites-available/hugin" /etc/nginx/sites-available/hugin
ln -sfn /etc/nginx/sites-available/hugin /etc/nginx/sites-enabled/hugin
install -m 0644 "$ROOT/runtime/etc/dnsmasq.d/hugin.conf" /etc/dnsmasq.d/hugin.conf
install -m 0644 "$ROOT/runtime/etc/sysctl.d/99-hugin.conf" /etc/sysctl.d/99-hugin.conf
install -m 0644 "$ROOT/runtime/etc/systemd/system/"*.service /etc/systemd/system/
install -d -m 0755 /etc/systemd/system/ollama.service.d
install -m 0644 "$ROOT/runtime/etc/systemd/system/ollama.service.d/hugin.conf" \
  /etc/systemd/system/ollama.service.d/hugin.conf
if [[ ! -e /etc/wpa_supplicant/wpa_supplicant.conf ]]; then
  install -m 0600 "$ROOT/runtime/etc/wpa_supplicant/wpa_supplicant.conf" \
    /etc/wpa_supplicant/wpa_supplicant.conf
fi

install -d -o hugin -g hugin -m 0755 /usr/lib/hugin/backend /usr/lib/hugin/frontend
install -m 0644 "$ROOT/backend/app.js" "$ROOT/backend/server.js" \
  "$ROOT/backend/db-config.js" "$ROOT/backend/package.json" \
  "$ROOT/backend/package-lock.json" /usr/lib/hugin/backend/
cp -a "$ROOT/backend/lib" "$ROOT/backend/indexes" /usr/lib/hugin/backend/
cp -a "$ROOT/frontend/dist/." /usr/lib/hugin/frontend/
chown -R hugin:hugin /usr/lib/hugin

sudo -u hugin npm ci --omit=dev --prefix /usr/lib/hugin/backend
swapoff -a || true
systemctl disable --now dphys-swapfile.service 2>/dev/null || true
sysctl --system
systemctl daemon-reload
systemctl enable hugin.service hugin-zram.service hugin-warmup.service
nginx -t
systemctl restart nginx hugin-zram.service hugin.service hugin-warmup.service

echo "Hugin provisioned. No RavenDB license or database was copied."
