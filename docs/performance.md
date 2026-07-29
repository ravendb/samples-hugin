# Hugin performance

- **model-cold:** Ollama is running but the embedding model is not resident.
- **model-warm:** the model is resident before the measured request.
- **cache-hit:** RavenDB reports `DurationInMs = -1`; stale server scopes are
  not reported.
- **boot-cold:** first request after power-on with cold page cache.

Every published result must name hardware, RavenDB version, embedding model,
corpus revision, condition, query set and sample count. Run
`benchmarks/search-baseline.sh` with `HUGIN_BENCH_CONDITION` set explicitly.
It prints CSV to stdout and never writes results into the repository.

No historical number is included here: the retained logs do not yet provide
all conditions above in one reproducible record. Add milestones only when
their source record supplies the complete environment and command.
