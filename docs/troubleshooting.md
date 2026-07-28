# Hugin troubleshooting

## No SSID or address

**Checks:** `hugin-status`, `ip link`, `journalctl -u dhcpcd -u wpa_supplicant`.
**Cause:** stale client/AP state or a stalled brcmfmac device. **Recovery:**
run `sudo hugin-boot`, then `sudo hugin-reset-radio`. **Prevention:** keep all
mode changes in the Hugin commands and retain their bounded timeouts.

## RavenDB startup storm after transfer

**Checks:** RavenDB logs and the contents of `System`. **Cause:** copying a
live or partially updated `System` directory. **Recovery:** stop RavenDB,
restore `System` from the sealed artifact without `--inplace`, then start it.
**Prevention:** always use `hugin-db`.

## ENOSPC or interrupted rsync

**Checks:** `df`, `du`, running rsync processes and the transfer lock.
**Recovery:** free unrelated space and repeat `hugin-db push`; partial database
files resume. **Prevention:** run `plan` and use `--reuse OLD_DB` for deltas.

## Voron corruption

**Cause:** `--inplace` on `System` or power loss during writes. **Recovery:**
keep RavenDB stopped and restore from the sealed artifact. **Prevention:** never
use `--inplace` for `System`; shut down cleanly.

## AI triggers embedding work

**Checks:** task identifier, task state and index definition. **Cause:** EGT
identifier mismatch. **Recovery:** stop the task and restore the validated
database. **Prevention:** use the explicit `questionembeddings` identifier.

## Model eviction or kswapd pressure

**Checks:** `/api/ps`, `free`, `swapon`, `vmstat`. **Recovery:** stop competing
work and restart `hugin-warmup`. **Prevention:** retain the zram/sysctl profile
and Ollama keep-alive.

## Captive portal, stale indexes or broken tags

Confirm AP address `10.1.1.1`, dnsmasq, required index freshness, and whether
tags are arrays or pipe-delimited strings. Re-enter AP mode, rebuild indexes
off-Pi, or re-import with normalized tags respectively.
