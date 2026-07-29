"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const ravendb = require("ravendb");
const { performance } = require("perf_hooks");
const { DB_NAME, RAVENDB_URL } = require("./db-config");
const { INDEX_DEFINITIONS } = require("./indexes/definitions");
const { normalizeCommunity, normalizeTags } = require("./lib/documents");
const { createLatestWinsQueue } = require("./lib/query-queue");
const { parseSearchRequest, executeSearch } = require("./lib/search");
const { createBootStatus } = require("./lib/boot-status");

function routeCode(req) {
  const route = req.route?.path || req.path;
  return `${req.method} ${route}`;
}

function isRavenUnavailable(error) {
  const value = String(error?.code || error?.message || error);
  return /ECONNREFUSED|ECONNRESET|ENOTFOUND|EHOSTUNREACH|ETIMEDOUT|No available node/i
    .test(value);
}

function createApp(options = {}) {
  const documentStore = options.documentStore || new ravendb.DocumentStore(
    RAVENDB_URL,
    DB_NAME,
  );
  if (!options.documentStore) documentStore.initialize();

  const app = express();
  const queue = options.queue || createLatestWinsQueue();
  const bootStatus = options.bootStatus || createBootStatus({ axios });

  app.asyncGet = function asyncGet(route, handler) {
    return this.get(route, async (req, res) => {
      try {
        await handler(req, res);
      } catch (error) {
        if (isRavenUnavailable(error)) {
          res.status(503).send({
            error: "RavenDB is unavailable",
            stage: "ravendb",
            code: "service_unavailable",
          });
          return;
        }
        res.status(error.status || 500).send(
          error.payload || { error: error.message || String(error) },
        );
      }
    });
  };

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "public")));
  } else {
    app.use(cors({
      origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
      credentials: true,
    }));
  }

  app.asyncGet("/api/indexes", async (req, res) => {
    res.send({
      indexes: INDEX_DEFINITIONS,
      timings: { load: 0 },
    });
  });

  app.asyncGet("/api/question", async (req, res) => {
    const session = documentStore.openSession();
    const started = performance.now();
    const question = await session
      .include("Owner")
      .include("Answers[].Owner")
      .include("Answers[].Comments[].User")
      .load(req.query.id);
    if (!question) {
      res.status(404).send({ error: "Question not found" });
      return;
    }
    const answers = Array.isArray(question.Answers) ? question.Answers : [];
    const comments = Array.isArray(question.Comments) ? question.Comments : [];
    const userIds = [
      question.Owner,
      ...comments.map((comment) => comment.User),
      ...answers.flatMap((answer) => [
        answer.Owner,
        ...(Array.isArray(answer.Comments)
          ? answer.Comments.map((comment) => comment.User)
          : []),
      ]),
    ].filter(Boolean);
    const users = await session.load([...new Set(userIds)]);
    res.send({
      data: { question, users },
      code: routeCode(req),
      timings: { load: performance.now() - started },
    });
  });

  app.asyncGet("/api/search", async (req, res) => {
    const request = parseSearchRequest(req.query);
    const slot = queue.acquire({
      kind: "search",
      mode: request.mode,
      q: request.q,
      startedAt: Date.now(),
    });
    const acquired = await slot.wait();
    if (acquired.superseded) {
      slot.release();
      res.status(409).send({ superseded: true });
      return;
    }
    try {
      const result = await executeSearch(
        documentStore,
        request,
        acquired.queueWaitMs,
      );
      res.send({ ...result, code: routeCode(req) });
    } finally {
      slot.release();
    }
  });

  app.asyncGet("/api/query-status", async (req, res) => {
    res.send(queue.status());
  });

  app.asyncGet("/api/search-authors", async (req, res) => {
    const started = performance.now();
    const ids = parseArray(req.query.ids);
    const users = ids.length
      ? await documentStore.openSession().load(ids)
      : {};
    res.send({
      data: { users },
      code: routeCode(req),
      timings: { query: performance.now() - started },
    });
  });

  app.asyncGet("/api/search-tags", async (req, res) => {
    const started = performance.now();
    const tags = normalizeTags(parseArray(req.query.tags));
    let relatedTags = [];
    if (tags.length) {
      try {
        relatedTags = await documentStore.openSession()
          .query({ indexName: "QuestionsTags" })
          .whereIn("Tag", tags)
          .orderByDescending("Count", "Long")
          .take(10)
          .all();
      } catch (error) {
        if (!String(error.message || error).includes("QuestionsTags")) throw error;
      }
    }
    res.send({
      data: { relatedTags },
      code: routeCode(req),
      timings: { query: performance.now() - started },
    });
  });

  app.asyncGet("/api/communities", async (req, res) => {
    const started = performance.now();
    const session = documentStore.openSession();
    const results = await session.query({ collection: "Communities" }).all();
    res.send({
      data: results.map(normalizeCommunity),
      code: routeCode(req),
      timings: { query: performance.now() - started },
    });
  });

  app.asyncGet("/api/boot-status", async (req, res) => {
    res.send(await bootStatus());
  });

  app.asyncGet("/api/ready", async (req, res) => {
    const status = await bootStatus();
    res.status(status.ready ? 200 : 503).send({ ready: status.ready });
  });

  app.asyncGet("/api/is-online", async (req, res) => {
    try {
      const response = await axios.get("https://google.com/generate_204", {
        timeout: 3000,
        validateStatus: () => true,
      });
      const online = response.status === 204;
      res.status(online ? 200 : 503).send({ online });
    } catch {
      res.status(503).send({ online: false });
    }
  });

  return app;
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return value.split(",").filter(Boolean);
  }
}

const app = createApp();
module.exports = app;
module.exports.createApp = createApp;
module.exports.parseArray = parseArray;
module.exports.isRavenUnavailable = isRavenUnavailable;
