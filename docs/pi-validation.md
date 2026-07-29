# Pre-PR Raspberry Pi validation

Pi validation is a maintainer-run local convention, not a GitHub Actions job.
Run it on the exact commit that will be submitted. The only required argument
is the Pi's current LAN IP:

```bash
./tests/pi/validate.sh 192.168.1.42
```

The default SSH user is `rdb`. Override it with `HUGIN_PI_USER`. The harness
writes a report under ignored `artifacts/pi-validation/` and does not include
the Pi address in the report.

## Bring the Pi to a test-ready state

1. Flash Raspberry Pi OS Bookworm 64-bit or restore a recoverable development
   image.
2. Provision Hugin with the RavenDB arm64 package as described in
   [Hugin operations](operations.md), or let the harness update an already
   provisioned appliance with `--deploy`.
3. Install a sealed Hugin database containing the required indexes and
   embedding-generation task. Keep the source artifact on the development
   computer rather than storing a second full copy on the SD card.
4. Ensure the configured Ollama model is present and wait until
   `/api/boot-status` reports ready.
5. Connect the Pi to the same LAN as the development computer, enable SSH key
   authentication and note its IP.
6. Run the harness from a clean checkout of the PR commit.

The development computer needs `ssh`, `curl`, Node.js and npm. `--deploy` and
`--radio` additionally require passwordless `sudo` on the Pi.

## Default validation

The normal command is read-only. It checks bounded SSH, the target model,
`hugin-status`, the Hugin/RavenDB/Ollama services, boot readiness, one FTS
query and one AI query.

Additional operations are explicit:

```bash
./tests/pi/validate.sh 192.168.1.42 --deploy
./tests/pi/validate.sh 192.168.1.42 --radio
HUGIN_DB_SOURCE=/path/to/xfer-probe \
  ./tests/pi/validate.sh 192.168.1.42 --db-plan
```

Flags may be combined. `--deploy` installs the current commit once.
`--radio` guides the operator through AP mode and restoration of the saved
client network. `--db-plan` performs only the low-disk transfer preflight.

Run an interrupted/resumed `hugin-db push` only with a disposable `XferProbe`
database and a recoverable SD card.

## PR convention

A PR touching backend search, runtime, provisioning, Wi-Fi, database transfer
or performance should have a passing report for its HEAD commit. Frontend- or
documentation-only changes may mark Pi validation not applicable. Do not claim
Pi validation when hardware is unavailable.
