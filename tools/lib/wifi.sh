#!/usr/bin/env bash
set -Eeuo pipefail

: "${HUGIN_WPA_CONF:=/etc/wpa_supplicant/wpa_supplicant.conf}"
: "${HUGIN_CLIENT_WPA_CONF:=/var/lib/hugin/wpa-client.conf}"
: "${HUGIN_DHCPCD_CONF:=/etc/dhcpcd.conf}"
: "${HUGIN_WIFI_COUNTRY:=PL}"
: "${HUGIN_AP_SSID:=Hugin (ravendb)}"
: "${HUGIN_AP_CIDR:=10.1.1.1/24}"
: "${HUGIN_WIFI_TIMEOUT:=15}"

WIFI_MARKER_BEGIN="# >>> hugin-mode wlan0 (managed) >>>"
WIFI_MARKER_END="# <<< hugin-mode wlan0 (managed) <<<"

wifi_require_root() {
  [[ "$(id -u)" -eq 0 ]] || {
    echo "run as root" >&2
    return 1
  }
}

wifi_write_ap() {
  local tmp
  tmp="$(mktemp)"
  {
    printf 'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n'
    printf 'update_config=1\n'
    printf 'country=%s\n\n' "$HUGIN_WIFI_COUNTRY"
    printf 'network={\n'
    printf '    ssid="%s"\n' "$HUGIN_AP_SSID"
    printf '    mode=2\n'
    printf '    key_mgmt=NONE\n'
    printf '    frequency=2412\n'
    printf '}\n'
  } >"$tmp"
  install -m 0600 "$tmp" "$HUGIN_WPA_CONF"
  rm -f "$tmp"
}

wifi_write_client() {
  local ssid=$1 password=$2 tmp network
  tmp="$(mktemp)"
  network="$(mktemp)"
  wpa_passphrase "$ssid" "$password" >"$network"
  {
    printf 'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n'
    printf 'update_config=1\n'
    printf 'country=%s\n\n' "$HUGIN_WIFI_COUNTRY"
    sed '/^[[:space:]]*#psk=/d' "$network"
  } >"$tmp"
  install -m 0600 "$tmp" "$HUGIN_WPA_CONF"
  rm -f "$tmp" "$network"
}

wifi_strip_dhcpcd_mode() {
  if grep -qF "$WIFI_MARKER_BEGIN" "$HUGIN_DHCPCD_CONF" 2>/dev/null; then
    sed -i \
      "/^${WIFI_MARKER_BEGIN}\$/,/^${WIFI_MARKER_END}\$/d" \
      "$HUGIN_DHCPCD_CONF"
  fi
  # Remove the unmarked static wlan0 block used by pre-HuginV2 images.
  if grep -qE '^interface wlan0' "$HUGIN_DHCPCD_CONF" 2>/dev/null &&
    grep -qF "static ip_address=$HUGIN_AP_CIDR" "$HUGIN_DHCPCD_CONF"; then
    sed -i \
      "/^interface wlan0\$/,/^\(interface \|\$\)/{/^interface wlan0\$/d; /^static ip_address=/d; /^env wpa_supplicant_conf=/d;}" \
      "$HUGIN_DHCPCD_CONF"
  fi
}

wifi_write_dhcpcd_ap() {
  wifi_strip_dhcpcd_mode
  cat >>"$HUGIN_DHCPCD_CONF" <<EOF

${WIFI_MARKER_BEGIN}
env wpa_supplicant_conf=${HUGIN_WPA_CONF}
interface wlan0
static ip_address=${HUGIN_AP_CIDR}
nohook lookup-hostname
${WIFI_MARKER_END}
EOF
}

wifi_write_dhcpcd_client() {
  wifi_strip_dhcpcd_mode
  cat >>"$HUGIN_DHCPCD_CONF" <<EOF

${WIFI_MARKER_BEGIN}
env wpa_supplicant_conf=${HUGIN_WPA_CONF}
${WIFI_MARKER_END}
EOF
}

wifi_teardown() {
  timeout --kill-after=2s 5s systemctl stop dhcpcd.service >/dev/null 2>&1 || true
  pkill -9 dhcpcd 2>/dev/null || true
  pkill -9 -f '^wpa_supplicant' 2>/dev/null || true
  ip link set wlan0 down 2>/dev/null || true
  ip address flush dev wlan0 2>/dev/null || true
  ip link set wlan0 up
}

wifi_spawn_supplicant() {
  rm -f /var/run/wpa_supplicant/wlan0 2>/dev/null || true
  wpa_supplicant -B -i wlan0 -c "$HUGIN_WPA_CONF"
}

wifi_wait_client() {
  local deadline=$((SECONDS + HUGIN_WIFI_TIMEOUT)) address
  while (( SECONDS < deadline )); do
    address="$(ip -4 -brief address show dev wlan0 2>/dev/null |
      awk '{print $3}' | grep -v '^10\.1\.1\.1/' | head -1 || true)"
    [[ -n "$address" ]] && { printf '%s\n' "$address"; return 0; }
    sleep 1
  done
  return 1
}

wifi_wait_ap() {
  local deadline=$((SECONDS + HUGIN_WIFI_TIMEOUT)) type address
  while (( SECONDS < deadline )); do
    type="$(iw dev wlan0 info 2>/dev/null | awk '/type/{print $2; exit}')"
    address="$(ip -4 -brief address show dev wlan0 2>/dev/null |
      awk '{print $3}' | head -1 || true)"
    [[ "$type" == "AP" && "$address" == "$HUGIN_AP_CIDR" ]] && return 0
    sleep 1
  done
  return 1
}

wifi_try_saved_client() {
  systemctl stop dnsmasq.service 2>/dev/null || true
  if [[ -f "$HUGIN_CLIENT_WPA_CONF" ]]; then
    install -m 0600 "$HUGIN_CLIENT_WPA_CONF" "$HUGIN_WPA_CONF"
  fi
  wifi_write_dhcpcd_client
  wifi_teardown
  wifi_spawn_supplicant
  timeout --kill-after=2s 5s systemctl start dhcpcd.service >/dev/null 2>&1 || true
  wifi_wait_client
}

wifi_apply_client() {
  wifi_write_client "$1" "$2"
  install -m 0600 "$HUGIN_WPA_CONF" "$HUGIN_CLIENT_WPA_CONF"
  wifi_try_saved_client
}

wifi_apply_ap() {
  wifi_write_ap
  wifi_write_dhcpcd_ap
  wifi_teardown
  wifi_spawn_supplicant
  ip address add "$HUGIN_AP_CIDR" dev wlan0 2>/dev/null || true
  systemctl restart dnsmasq.service
  wifi_wait_ap
}
