"use strict";

const { performance } = require("perf_hooks");
const { EMB_TASK_IDENTIFIER } = require("../db-config");
const { normalizeTags, trimQuestion } = require("./documents");

const ALLOWED_SORTS = new Set(["CreationDate", "Score", "ViewCount"]);

function positiveInt(value, fallback, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, max);
}

function parseSearchRequest(query = {}) {
  const q = String(query.q || "").trim();
  const mode = query.mode === "ai" ? "ai" : "fts";
  const requestedSort = ALLOWED_SORTS.has(query.orderBy)
    ? query.orderBy
    : "CreationDate";
  return {
    q: mode === "ai" && process.env.HUGIN_AI_QUERY_TRUNCATE !== "0"
      ? q.split(/\s+/).slice(0, 12).join(" ")
      : q,
    mode,
    community: query.community ? String(query.community) : null,
    tags: normalizeTags(query.tag ?? query.tags),
    page: positiveInt(query.page, 0, 10000),
    pageSize: positiveInt(query.pageSize, 10, 100),
    orderBy: requestedSort,
    includeTail: query.tail !== "0",
  };
}

function featureUnavailable(feature, indexName, cause) {
  const error = new Error(`${feature} is unavailable: ${indexName} is not ready`);
  error.status = 503;
  error.payload = {
    error: error.message,
    code: "index_unavailable",
    feature,
    index: indexName,
  };
  error.cause = cause;
  return error;
}

function isMissingIndex(error, name) {
  const message = String(error && (error.message || error));
  return message.includes(name) &&
    /index|does not exist|not found|disabled|fault/i.test(message);
}

function extractServerTimings(queryTimings, queryStats) {
  const fromCache = queryStats?.durationInMs === -1;
  if (fromCache) {
    return {
      fromCache: true,
      server: null,
      ravenCorax: null,
      ravenRetriever: null,
      ravenEmbed: null,
    };
  }
  const root = queryTimings?.timings?.query?.timings || {};
  return {
    fromCache: false,
    server: typeof queryStats?.durationInMs === "number"
      ? queryStats.durationInMs
      : null,
    ravenCorax: root.corax?.durationInMs ?? null,
    ravenRetriever: root.retriever?.durationInMs ?? null,
    ravenEmbed: root.corax?.timings?.embeddings?.durationInMs ?? null,
  };
}

function applyFilters(query, request) {
  let hasWhere = false;
  if (request.community) {
    query.whereEquals("Community", request.community);
    hasWhere = true;
  }
  if (request.tags.length) {
    if (hasWhere) query.andAlso();
    query.whereIn("Tags", request.tags);
    hasWhere = true;
  }
  return hasWhere;
}

function buildFtsQuery(session, request) {
  const query = session.query({ indexName: "QuestionsSearch" });
  const hasWhere = applyFilters(query, request);
  if (request.q) {
    if (hasWhere) query.andAlso();
    query.search("Query", request.q);
  }
  if (request.orderBy === "Score") query.orderByScore();
  else query.orderByDescending(request.orderBy);
  return query.skip(request.page * request.pageSize).take(request.pageSize);
}

function buildAiQuery(session, request) {
  let query = session
    .query({ indexName: "Questions/ByVector" })
    .vectorSearch(
      (field) => field.withField("TitleVector"),
      (value) => value.byText(request.q, EMB_TASK_IDENTIFIER),
    );
  applyFilters(query, request);
  // Similarity order is authoritative for semantic search. Secondary sorting
  // would misrepresent the result and is therefore deliberately ignored.
  query = query.skip(request.page * request.pageSize).take(request.pageSize);
  return query;
}

async function relatedTags(session, tags) {
  if (!tags.length) return [];
  try {
    return await session.query({ indexName: "QuestionsTags" })
      .whereIn("Tag", tags)
      .orderByDescending("Count", "Long")
      .take(10)
      .all();
  } catch (error) {
    if (isMissingIndex(error, "QuestionsTags")) return [];
    throw error;
  }
}

async function executeSearch(documentStore, request, queueWaitMs = 0) {
  const started = performance.now();
  const session = documentStore.openSession();
  const sessionOpened = performance.now();
  const indexName = request.mode === "ai"
    ? "Questions/ByVector"
    : "QuestionsSearch";
  const query = request.mode === "ai"
    ? buildAiQuery(session, request)
    : buildFtsQuery(session, request);
  const built = performance.now();
  let stats = null;
  let rawTimings = null;
  let results;
  try {
    results = await query
      .statistics((value) => { stats = value; })
      .timings((value) => { rawTimings = value; })
      .include("Owner")
      .all();
  } catch (error) {
    if (isMissingIndex(error, indexName)) {
      throw featureUnavailable(request.mode, indexName, error);
    }
    throw error;
  }
  const queried = performance.now();
  const trimmed = results.map(trimQuestion);
  const tagSet = normalizeTags(trimmed.flatMap((item) => item.Tags || []));
  const ownerIds = [...new Set(trimmed.map((item) => item.Owner).filter(Boolean))];
  const tailStarted = performance.now();
  const [tags, users] = request.includeTail
    ? await Promise.all([
      relatedTags(session, tagSet),
      ownerIds.length ? session.load(ownerIds) : Promise.resolve({}),
    ])
    : [[], {}];
  const finished = performance.now();
  const server = extractServerTimings(rawTimings, stats);
  const embedGenerated = request.mode === "ai" &&
    !server.fromCache &&
    typeof server.ravenEmbed === "number" &&
    server.ravenEmbed > 0;

  return {
    data: {
      results: trimmed,
      users,
      relatedTags: tags,
      totalResults: stats?.totalResults ?? trimmed.length,
    },
    timings: {
      query: queried - built,
      tags: finished - tailStarted,
      fromCache: server.fromCache,
      server: server.server,
      embedGenerated,
      phases: {
        queue_wait: Number(queueWaitMs.toFixed(1)),
        session_open: Number((sessionOpened - started).toFixed(1)),
        query_build: Number((built - sessionOpened).toFixed(1)),
        query_exec: Number((queried - built).toFixed(1)),
        parallel_fanout: Number((finished - tailStarted).toFixed(1)),
        total: Number((finished - started).toFixed(1)),
        raven_corax: server.ravenCorax,
        raven_retriever: server.ravenRetriever,
        raven_embed: server.ravenEmbed,
      },
    },
  };
}

module.exports = {
  parseSearchRequest,
  isMissingIndex,
  extractServerTimings,
  buildFtsQuery,
  buildAiQuery,
  executeSearch,
};
