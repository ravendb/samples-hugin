# Testing Hugin

CI deliberately covers portable application behavior. Hardware behavior stays
in the local Pi validation convention.

## Local checks

Use Node.js 22 (see `.node-version`), .NET 8 and Bash:

```bash
(cd backend && npm ci && npm test)
(cd frontend && npm ci && npm run lint && npm test && npm run build)
dotnet restore importer/Hugin.Importer.csproj --locked-mode
dotnet build importer/Hugin.Importer.csproj --no-restore --configuration Release
shellcheck -x setup.sh benchmarks/*.sh tests/pi/*.sh tools/install.sh \
  tools/hugin-* tools/lib/*.sh
```

## CI

GitHub Actions has three independent jobs:

- **Application** runs backend contracts, frontend tests, lint and production
  build, then restores and builds the importer from its lockfile.
- **RavenDB integration** starts RavenDB 7.2, creates a tiny disposable
  database and Corax index, exercises the real FTS endpoint and verifies safe
  degradation when the vector index is absent.
- **Appliance static** runs ShellCheck and checks whitespace in the pull
  request diff.

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

Hosted CI does not claim provisioning, radio, cold-boot, memory-pressure or
real Ollama behavior. Before a relevant PR, run
`tests/pi/validate.sh <PI_IP>` following
[Pre-PR Raspberry Pi validation](pi-validation.md). Optional flags cover
deploy, radio recovery and database-transfer preflight.
