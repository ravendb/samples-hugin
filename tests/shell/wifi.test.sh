#!/usr/bin/env bash
set -Eeuo pipefail

TEST_ROOT="$(mktemp -d "$PWD/.wifi-test.XXXXXX")"
trap 'rm -rf "$TEST_ROOT"' EXIT
export HUGIN_KNOWN_NETWORKS="$TEST_ROOT/known-networks.json"

# shellcheck source=tools/lib/wifi.sh
source tools/lib/wifi.sh

wifi_save_network "first network" "first password"
sleep 0.01
wifi_save_network "second network" "second password"
sleep 0.01
wifi_save_network "first network" "replacement password"

mapfile -t networks < <(wifi_known_networks 3 | tr -d '\r')
[[ ${#networks[@]} -eq 2 ]]
[[ "${networks[0]}" == $'first network\treplacement password' ]]
[[ "${networks[1]}" == $'second network\tsecond password' ]]
if [[ "$(uname -s)" != MINGW* ]]; then
  [[ "$(stat -c %a "$HUGIN_KNOWN_NETWORKS")" == "600" ]]
fi
