# Hugin operations

Hugin development and integration target Raspberry Pi Zero 2 W. There is no
Compose development stack.

## Provision and update

Build the frontend and provide a Bookworm arm64 RavenDB package plus an
installed Ollama binary/model, then run:

```bash
sudo RAVENDB_DEB=/path/to/ravendb-arm64.deb ./setup.sh
```

If RavenDB and all OS dependencies are already installed, use
`sudo ./setup.sh --offline`. Provisioning installs the application, runtime
tools, dynamic dhcpcd client/AP configuration, captive DNS/nginx, boot-time
Wi-Fi recovery, service units and the 768 MiB zram profile. It keeps licenses,
models and databases outside the repository and never creates a second
database copy on the SD card. A fresh installation only requires the
read-only `/api/boot-status` endpoint to become reachable; full readiness is
expected only after the sealed database has been transferred.

Reboot after initial provisioning. `hugin-boot.service` then tries the saved
client configuration and falls back to the `Hugin (ravendb)` AP.

Deploy application-only changes with `hugin-deploy user@pi`. Add `--system`
only when reviewed units or configuration changed. Run `hugin-status` and
`hugin-logs -n 200` after every deploy.

## Network operations

- `sudo hugin-boot` tries saved Wi-Fi networks, then falls back to the AP.
- `sudo hugin-ap` assigns `10.1.1.1/24` and starts the captive DNS service.
- `sudo hugin-wifi SSID PASSWORD` stores a network and retries client mode.
- `sudo hugin-reset-radio` reloads brcmfmac and repeats the bounded boot flow.
- `hugin-clients` lists neighbours currently visible on wlan0.

## Indexes and database

Build `QuestionsSearch`, `QuestionsTags`, `Questions/ByVector`, and the
embedding-generation task on a development machine. The Pi only validates
them. The task identifier must match `HUGIN_EMB_TASK_IDENTIFIER`.

Run `hugin-db plan TARGET`, then `push`, then `verify`. `System` is transferred
without `--inplace`; the database may use `--inplace` only while RavenDB is
stopped. Run `plan` while the source RavenDB is available so the tool can
confirm that its `System` registry contains exactly one database (`HuginAI`),
then stop the source cleanly before `push`. Set `HUGIN_DB_SOURCE_URL` when the
source does not listen on `http://127.0.0.1:8080`. Keep the sealed source
artifact on the development machine.

## Smoke

After deploy and after a cold boot: inspect `/api/boot-status`, run one FTS
query, one unique AI query, repeat the AI query, and check `free`, `swapon`,
`df`, service logs, index freshness, and model residency.

Before opening a PR, follow [Pre-PR Raspberry Pi validation](pi-validation.md).
The default harness takes only the Pi's LAN IP; deploy, radio and database
checks are explicit options.
The hosted and local non-hardware checks are documented in
[Testing Hugin](testing.md).
