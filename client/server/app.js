const express = require("express");
const cors = require("cors");
const path = require("path");
const ravendb = require("ravendb");
const { performance } = require("perf_hooks");
const { cwd } = require("process");

const documentStore = new ravendb.DocumentStore(
  "http://127.0.0.1:8080",
  "Hugin"
);
documentStore.initialize();

const app = express();
let currentHandlerFunction = null;
app.asyncGet = function (path, handler) {
  return this.get(path, async (req, res, next) => {
    try {
      currentHandlerFunction = handler;
      await handler(req, res, next);
    } catch (err) {
      res
        .status(err.status || 500)
        .send({ error: err.message });
    }
  });
}

function getRouteCode(req) {
  return `app.${req.method.toLowerCase()}("${req.route.path}", ${currentHandlerFunction})`;
}

const isProdEnv = process.env.NODE_ENV === "production";
if (isProdEnv) {
  app.use(express.static(path.join(path.resolve(), "build", "public")));
} else {
  const corsOptions = {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  };

  app.use(cors(corsOptions));
}

app.asyncGet("/api/question", async (req, res) => {
  console.log(req.query);
  const session = documentStore.openSession();
  const question = await session
    .include("Owner")
    .include("Answers[].Owner")
    .include("Answers[].Comments[].User")
    .load(req.query.id);

  const userIds = question.Answers.map((a) =>
    a.Comments.map((c) => c.User).concat([a.Owner])
  ).flat();
  const users = await session.load(userIds);
  res.send({
    data: { question, users },
    code: getRouteCode(req),
  });
});

app.asyncGet("/api/search", async (req, res) => {
  const session = documentStore.openSession();

  const tags = Array.isArray(req.query.tag)
    ? req.query.tags
    : [req.query.tag].filter((x) => x);
  const page = req.query.page || 0;
  const pageSize = req.query.pageSize || 10;

  const query = session
    .query({ indexName: "Questions/Search" })
    .take(pageSize)
    .skip(page * pageSize);

  if (tags.length > 0) {
    query.whereIn("Tags", tags);
  }
  if (req.query.community) {
    query.andAlso().whereEquals("Community", req.query.community);
  }
  if (req.query.q) {
    query.andAlso().search("Query", req.query.q);
  }

  var queryStart = performance.now();

  if (req.query.orderBy === "Score") {
    query.orderByScore();
  } else {
    query.orderByDescending(req.query.orderBy || "CreationDate");
  }

  let queryStats = null;
  const results = await query
    .statistics((stats) => {
      queryStats = stats;
    })
    .include("Owner")
    .all();

  var queryEnd = performance.now();

  var postTags = new Set(results.map((x) => x.Tags).flat());

  var tagsStart = performance.now();
  const relatedTags = await session
    .query({ indexName: "Questions/Tags" })
    .whereIn("Tag", postTags)
    .orderByDescending("Count", "Long")
    .take(10)
    .all();
  var tagsEnd = performance.now();

  const users = await session.load(results.map((q) => q.Owner));
  res.send({
    data: {
      results,
      users,
      relatedTags,
      totalResults: queryStats.totalResults,
    },
    code: getRouteCode(req),
    timings: {
      query: queryEnd - queryStart,
      tags: tagsEnd - tagsStart,
    },
  });
});

app.asyncGet("/api/communities", async (req, res) => {
  const session = documentStore.openSession();
  var queryStart = performance.now();
  const results = await session.query({ collection: "Communities" }).all();
  var queryEnd = performance.now();

  res.send({
    data: results,
    code: getRouteCode(req),
    timings: {
      query: queryEnd - queryStart,
    },
  });
});

module.exports = app;
