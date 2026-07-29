#!/usr/bin/env bash
set -Eeuo pipefail

[[ "$(id -u)" -eq 0 ]] || { echo "run as root" >&2; exit 1; }
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
OFFLINE=0
WIFI_COUNTRY="${HUGIN_WIFI_COUNTRY:-PL}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --offline) OFFLINE=1 ;;
    *) echo "usage: setup.sh [--offline]" >&2; exit 2 ;;
  esac
  shift
done

if (( ! OFFLINE )); then
  apt-get update
  apt-get install -y ca-certificates curl dhcpcd dnsmasq iw nginx openssl \
    python3 rfkill systemd-zram-generator wpasupplicant
  node_major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
  if (( node_major < 22 )); then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
else
  for command in curl dhcpcd dnsmasq iw nginx node npm openssl python3 rfkill \
    wpa_passphrase wpa_supplicant; do
    command -v "$command" >/dev/null || {
      echo "missing dependency in offline mode: $command" >&2
      exit 1
    }
  done
  [[ -x /usr/lib/systemd/system-generators/zram-generator ]] || {
    echo "missing dependency in offline mode: systemd-zram-generator" >&2
    exit 1
  }
fi

if [[ -n "${RAVENDB_DEB:-}" ]]; then
  [[ -f "$RAVENDB_DEB" ]] || { echo "RAVENDB_DEB does not exist" >&2; exit 1; }
  apt-get install -y "$RAVENDB_DEB"
fi
systemctl cat ravendb.service >/dev/null 2>&1 || {
  echo "RavenDB is not installed; provide RAVENDB_DEB=/path/to/arm64.deb" >&2
  exit 1
}
[[ -x /usr/local/bin/ollama ]] || {
  echo "Ollama is not installed at /usr/local/bin/ollama" >&2
  exit 1
}

if command -v raspi-config >/dev/null; then
  raspi-config nonint do_wifi_country "$WIFI_COUNTRY"
fi
rfkill unblock wifi
if systemctl cat NetworkManager.service >/dev/null 2>&1; then
  # Do not stop the active unit underneath an SSH provision. It is masked for
  # the next boot, where hugin-boot takes ownership of wlan0.
  systemctl disable NetworkManager.service 2>/dev/null || true
  systemctl mask NetworkManager.service
fi
systemctl disable wpa_supplicant.service 2>/dev/null || true
systemctl mask wpa_supplicant.service 2>/dev/null || true
# hugin-boot starts dnsmasq only when AP mode wins. Keeping it enabled would
# make client-mode boots fail a bind to the absent 10.1.1.1 address.
systemctl disable dnsmasq.service 2>/dev/null || true

getent group hugin >/dev/null || groupadd --system hugin
id -u hugin >/dev/null 2>&1 ||
  useradd --system --gid hugin --home /var/lib/hugin --create-home hugin
getent group ollama >/dev/null || groupadd --system ollama
id -u ollama >/dev/null 2>&1 ||
  useradd --system --gid ollama --home /var/lib/ollama ollama
usermod -aG ravendb,ollama hugin

install -d -o hugin -g hugin -m 0755 \
  /usr/lib/hugin /var/lib/hugin /run/hugin
install -d -o ollama -g ollama -m 2775 \
  /var/lib/ollama /var/lib/ollama/models \
  /var/lib/ollama/models/manifests /var/lib/ollama/models/blobs

install -m 0644 "$ROOT/runtime/etc/dhcpcd.conf" /etc/dhcpcd.conf
install -m 0644 \
  "$ROOT/runtime/etc/nginx/sites-available/hugin" \
  /etc/nginx/sites-available/hugin
ln -sfn /etc/nginx/sites-available/hugin /etc/nginx/sites-enabled/hugin
rm -f /etc/nginx/sites-enabled/default
install -m 0644 \
  "$ROOT/runtime/etc/dnsmasq.d/hugin.conf" \
  /etc/dnsmasq.d/hugin.conf
install -m 0644 \
  "$ROOT/runtime/etc/sysctl.d/99-hugin.conf" \
  /etc/sysctl.d/99-hugin.conf
install -d -m 0755 /etc/systemd
install -m 0644 "$ROOT/runtime/etc/systemd/zram-generator.conf" \
  /etc/systemd/zram-generator.conf
install -d -m 0755 /etc/default
install -m 0644 "$ROOT/runtime/etc/default/hugin" /etc/default/hugin
install -m 0644 \
  "$ROOT/runtime/etc/systemd/system/"*.service \
  /etc/systemd/system/
install -d -m 0755 /etc/systemd/system/ollama.service.d
install -m 0644 "$ROOT/runtime/etc/systemd/system/ollama.service.d/"*.conf \
  /etc/systemd/system/ollama.service.d/
install -d -m 0755 /etc/systemd/system/ravendb.service.d
install -m 0644 "$ROOT/runtime/etc/systemd/system/ravendb.service.d/"*.conf \
  /etc/systemd/system/ravendb.service.d/
if [[ ! -e /etc/wpa_supplicant/wpa_supplicant.conf ]]; then
  install -m 0600 \
    "$ROOT/runtime/etc/wpa_supplicant/wpa_supplicant.conf" \
    /etc/wpa_supplicant/wpa_supplicant.conf
fi

install -d -m 0755 /etc/nginx/certs
if [[ ! -s /etc/nginx/certs/start.ravendb.crt ]]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout /etc/nginx/certs/start.ravendb.key \
    -out /etc/nginx/certs/start.ravendb.crt \
    -subj "/CN=start.ravendb" \
    -addext \
    "subjectAltName=DNS:start.ravendb,DNS:database.ravendb,IP:10.1.1.1"
fi
chmod 0640 /etc/nginx/certs/start.ravendb.key
chmod 0644 /etc/nginx/certs/start.ravendb.crt

"$ROOT/tools/install.sh"

install -d -o hugin -g hugin -m 0755 \
  /usr/lib/hugin/backend /usr/lib/hugin/frontend
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
systemctl enable dhcpcd.service nginx.service ravendb.service \
  ollama.service hugin-boot.service hugin.service \
  hugin-warmup.service

nginx -t
systemctl restart systemd-zram-setup@zram0.service
systemctl restart nginx.service ollama.service \
  ravendb.service hugin.service hugin-warmup.service

ready=0
for _ in $(seq 1 420); do
  if curl -fsS --max-time 3 http://127.0.0.1:3030/api/ready >/dev/null; then
    ready=1
    break
  fi
  sleep 1
done
[[ "$ready" -eq 1 ]] || { echo "Hugin readiness check failed" >&2; exit 1; }

echo "Hugin provisioned. Reboot to activate client-to-AP boot recovery."
echo "No RavenDB license or database was copied."
