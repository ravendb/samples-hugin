"use strict";

const fs = require("fs");
const { DB_NAME, RAVENDB_URL, OLLAMA_URL, EMB_MODEL } = require("../db-config");

function probeError(error, service) {
  const detail = String(error?.code || error?.message || error);
  return { status: "failed", detail: `${service} unreachable (${detail})` };
}

function createBootStatus({ axios, existsSync = fs.existsSync, startedAt = Date.now() }) {
  const cache = new Map();
  async function cached(key, fn) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < 1000) return hit.value;
    const value = await fn();
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  async function ollama() {
    return cached("ollama", async () => {
      try {
        await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
        const ps = await axios.get(`${OLLAMA_URL}/api/ps`, { timeout: 3000 });
        const resident = (ps.data?.models || []).some((model) =>
          model?.name === EMB_MODEL || model?.model === EMB_MODEL);
        return resident
          ? { status: "ready", detail: `model ${EMB_MODEL} resident` }
          : { status: "loading", detail: `model ${EMB_MODEL} not resident` };
      } catch (error) {
        return probeError(error, "ollama");
      }
    });
  }

  async function ravendb() {
    return cached("ravendb", async () => {
      try {
        await axios.get(`${RAVENDB_URL}/build/version`, { timeout: 3000 });
        const response = await axios.get(
          `${RAVENDB_URL}/databases/${encodeURIComponent(DB_NAME)}/stats`,
          { timeout: 5000 },
        );
        const indexes = response.data?.Indexes || response.data?.indexes || [];
        const required = ["QuestionsSearch", "QuestionsTags", "Questions/ByVector"];
        const byName = new Map(indexes.map((index) =>
          [index.Name || index.name, index]));
        const missing = required.filter((name) => !byName.has(name));
        const stale = required.filter((name) => {
          const index = byName.get(name);
          return index && (index.IsStale ?? index.isStale);
        });
        if (missing.length) {
          return { status: "failed", detail: `missing indexes: ${missing.join(", ")}` };
        }
        if (stale.length) {
          return { status: "loading", detail: `stale indexes: ${stale.join(", ")}` };
        }
        return { status: "ready", detail: `${required.length} required indexes ready` };
      } catch (error) {
        return probeError(error, "ravendb");
      }
    });
  }

  function warmup() {
    try {
      return existsSync("/run/hugin/warmup.done")
        ? { status: "ready", detail: "model and vector index warmed" }
        : { status: "pending", detail: "waiting on hugin-warmup.service" };
    } catch {
      return { status: "pending", detail: "warmup marker unavailable" };
    }
  }

  return async function getStatus() {
    const [ollamaStage, ravenStage] = await Promise.all([ollama(), ravendb()]);
    const warmupStage = warmup();
    const stages = {
      hugin: { status: "ready", since: startedAt },
      ollama: ollamaStage,
      ravendb: ravenStage,
      warmup: warmupStage,
    };
    return {
      ready: ["ollama", "ravendb", "warmup"]
        .every((name) => stages[name].status === "ready"),
      stages,
    };
  };
}

module.exports = { createBootStatus };
