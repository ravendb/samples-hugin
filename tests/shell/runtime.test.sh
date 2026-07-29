#!/usr/bin/env bash
set -Eeuo pipefail

grep -qxF 'HUGIN_DB_NAME=HuginAI' runtime/etc/default/hugin
grep -qxF 'HUGIN_EMB_TASK_IDENTIFIER=embedtaskhuginai' \
  runtime/etc/default/hugin
grep -qxF 'EMB_MODEL=snowflake-arctic-embed:s' runtime/etc/default/hugin

grep -qxF 'zram-size = 768' runtime/etc/systemd/zram-generator.conf
grep -qxF 'compression-algorithm = lz4' \
  runtime/etc/systemd/zram-generator.conf
grep -qxF 'swap-priority = 100' runtime/etc/systemd/zram-generator.conf
grep -qxF 'vm.swappiness=60' runtime/etc/sysctl.d/99-hugin.conf
grep -qxF 'vm.vfs_cache_pressure=200' runtime/etc/sysctl.d/99-hugin.conf
grep -qxF 'vm.min_free_kbytes=8192' runtime/etc/sysctl.d/99-hugin.conf

! grep -Eq '^(Wants|Requires)=.*ravendb' \
  runtime/etc/systemd/system/hugin.service
grep -qxF 'After=ollama.service' \
  runtime/etc/systemd/system/ravendb.service.d/hugin.conf
grep -qxF 'TimeoutStopSec=300' \
  runtime/etc/systemd/system/ravendb.service.d/hugin.conf
grep -qxF 'RemainAfterExit=yes' \
  runtime/etc/systemd/system/hugin-warmup.service
grep -qxF 'RuntimeDirectoryPreserve=yes' \
  runtime/etc/systemd/system/hugin-warmup.service

for payload in \
  runtime/etc/dhcpcd.conf \
  runtime/etc/dnsmasq.d/hugin.conf \
  runtime/etc/nginx/sites-available/hugin \
  runtime/etc/default/hugin \
  runtime/etc/systemd/zram-generator.conf \
  runtime/etc/systemd/system/ollama.service.d \
  runtime/etc/systemd/system/ravendb.service.d; do
  grep -qF "$payload" setup.sh
done

! grep -Eq '(^|[[:space:]])rm[[:space:]].*\./\*' setup.sh
! grep -qi 'license.json' setup.sh
