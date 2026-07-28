# Testing Hugin

GitHub Actions exposes one required `Required` check backed by five independent
lanes. Jobs run concurrently and older runs for the same PR are cancelled.

## Local checks

Use Node.js 22 (see `.node-version`), .NET 8 and Bash:

```bash
(cd backend && npm ci && npm test)
(cd frontend && npm ci && npm run lint && npm test && npm run build)
dotnet restore importer/Hugin.Importer.csproj --locked-mode
dotnet build importer/Hugin.Importer.csproj --no-restore --configuration Release
tests/shell/run.sh
scripts/ci/repo-policy.sh
```

On Linux with ShellCheck, nginx, dnsmasq and systemd tools installed, also run:

```bash
shellcheck -x setup.sh benchmarks/*.sh scripts/ci/*.sh \
  tests/shell/*.sh tests/pi/*.sh tools/hugin-* tools/lib/*.sh
scripts/ci/runtime-config.sh
```

## CI lanes

- **Backend contracts** tests parsing, timings, queueing, origin-compatible HTTP
  responses, semantic query construction, read-only boot status and RavenDB
  outage behavior.
- **Frontend behavior** tests the sequential FTS-to-AI pipeline, abort behavior,
  superseded requests, errors and boot polling cleanup, then lints and builds.
- **Appliance contracts** enforces transfer and deploy safety invariants,
  validates runtime configuration, executable bits, LF and repository policy.
- **Importer build** restores from the NuGet lockfile and builds the standalone
  importer.
- **RavenDB integration** starts a disposable RavenDB 7.2 service, creates a
  tiny database and Corax index, runs the real FTS endpoint and verifies safe
  degradation when the vector index is absent.

The integration test can be reproduced without Compose:

```bash
docker run --rm --name hugin-ci-ravendb -p 18080:8080 \
  -e RAVEN_Setup_Mode=None \
  -e RAVEN_Security_UnsecuredAccessAllowed=PublicNetwork \
  ravendb/ravendb:7.2-latest
```

In another terminal:

```bash
cd backend
HUGIN_INTEGRATION=1 RAVENDB_URL=http://127.0.0.1:18080 \
  npm run test:integration
```

The fixture database is uniquely named and deleted even when an assertion
fails.

## Hardware validation

Hosted CI does not claim radio, cold-boot, memory-pressure or real Ollama
behavior. Before a relevant PR, run `tests/pi/validate.sh <PI_IP>` following
[Pre-PR Raspberry Pi validation](pi-validation.md). Actual timing numbers are
recorded only on the appliance and are never used as hosted-runner thresholds.
