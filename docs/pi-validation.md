# Pre-PR Raspberry Pi validation

Pi validation is a maintainer-run local convention, not a GitHub Actions job.
Run it on the exact commit that will be submitted. The only required argument
is the Pi's current LAN IP:

```bash
./tests/pi/validate.sh 192.168.1.42
```

The default SSH user is `rdb`. Override it with `HUGIN_PI_USER` if needed.
The harness records a Markdown report under ignored `artifacts/pi-validation/`
and never publishes the Pi address.

## Prepare the Pi

Use a disposable or recoverable Pi Zero 2 W, not the only copy of an appliance:

1. Flash Raspberry Pi OS Bookworm 64-bit or restore the current sealed
   development image.
2. Boot it on the same LAN as the development computer.
3. Enable SSH key authentication for `rdb`; the harness is non-interactive over
   SSH and requires `sudo -n true`.
4. Reserve or note its LAN IP.
5. Keep a sealed database artifact on the development machine. The SD card
   must have enough room for the installed database, but not a second full copy.
6. Make sure the development computer has `ssh`, `curl`, Node.js and npm.
7. Run the harness from a clean checkout of the PR commit.

By default the harness offers to run two `hugin-deploy --system` passes. This
provisions the current source and verifies deploy idempotence. Set
`HUGIN_PI_SKIP_DEPLOY=1` only when the exact commit is already installed.

## What the harness checks

- Pi Zero 2 W, aarch64 and Bookworm;
- bounded SSH and provisioning access;
- two identical deploys;
- Hugin, RavenDB, Ollama and warmup services;
- 768 MiB zram as the only swap and the documented sysctl profile;
- read-only boot readiness;
- FTS, unique AI and repeated AI requests;
- optionally, guided AP/captive portal, saved-network recovery and brcmfmac
  reset;
- optionally, database-transfer preflight for a disposable `XferProbe`.

The radio section intentionally pauses. After the Pi switches to
`Hugin (ravendb)`, connect the development computer to that network and follow
the prompt. The harness restores the saved client configuration before asking
you to reconnect to the original LAN.

For database work, prepare a small sealed RavenDB source containing one
`XferProbe` database and run:

```bash
HUGIN_DB_SOURCE=/path/to/xfer-probe ./tests/pi/validate.sh 192.168.1.42
```

Run the destructive `hugin-db push` interruption/resume scenario only on a
disposable card. The normal harness performs `plan` and leaves the full transfer
as an explicit maintainer operation.

## PR convention

A PR touching backend search, runtime, provisioning, Wi-Fi, database transfer
or performance is ready only after a passing report for its HEAD commit.
Frontend- or documentation-only changes may mark Pi validation not applicable.
Do not claim Pi validation when hardware is unavailable.
