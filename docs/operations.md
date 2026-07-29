# Hugin operations

Hugin development and integration target Raspberry Pi Zero 2 W. There is no
Compose development stack.

## Provision and update

Build the frontend, copy the repository to a Bookworm 64-bit Pi, then run
`sudo ./setup.sh`. The script is idempotent, keeps licenses and databases
outside the repository, disables SD-card swap, and enables 768 MiB zram.

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
stopped. Keep the sealed source artifact on the development machine.

## Smoke

After deploy and after a cold boot: inspect `/api/boot-status`, run one FTS
query, one unique AI query, repeat the AI query, and check `free`, `swapon`,
`df`, service logs, index freshness, and model residency.

Before opening a PR, follow [Pre-PR Raspberry Pi validation](pi-validation.md).
The default harness takes only the Pi's LAN IP; deploy, radio and database
checks are explicit options.
The hosted and local non-hardware checks are documented in
[Testing Hugin](testing.md).
