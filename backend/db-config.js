"use strict";

const DB_NAME = process.env.HUGIN_DB_NAME || "Hugin";
const RAVENDB_URL = process.env.RAVENDB_URL || "http://127.0.0.1:8080";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const EMB_MODEL = process.env.EMB_MODEL || "snowflake-arctic-embed:s";
// This must match the identifier stored in the shipped embedding-generation
// task. It is intentionally explicit: deriving it from an index name caused
// silent, full-corpus re-embedding in early appliance builds.
const EMB_TASK_IDENTIFIER =
  process.env.HUGIN_EMB_TASK_IDENTIFIER || "questionembeddings";

module.exports = {
  DB_NAME,
  RAVENDB_URL,
  OLLAMA_URL,
  EMB_MODEL,
  EMB_TASK_IDENTIFIER,
};
