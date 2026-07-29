"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseSearchRequest,
  extractServerTimings,
  buildFtsQuery,
  buildAiQuery,
} = require("../lib/search");

function fakeSession() {
  const calls = [];
  const query = new Proxy({}, {
    get(target, name) {
      return (...args) => {
        calls.push([name, ...args]);
        return query;
      };
    },
  });
  return {
    calls,
    query(args) {
      calls.push(["query", args]);
      return query;
    },
  };
}

test("origin search parameters remain valid and bounded", () => {
  assert.deepEqual(parseSearchRequest({
    q: "disk",
    tag: ["linux", "storage"],
    community: "unix",
    page: "2",
    pageSize: "5000",
    orderBy: "ViewCount",
  }), {
    q: "disk",
    mode: "fts",
    community: "unix",
    tags: ["linux", "storage"],
    page: 2,
    pageSize: 100,
    orderBy: "ViewCount",
    includeTail: true,
  });
});

test("AI query text is bounded and mode is additive", () => {
  const request = parseSearchRequest({
    mode: "ai",
    q: "one two three four five six seven eight nine ten eleven twelve thirteen",
    tail: "0",
  });
  assert.equal(request.mode, "ai");
  assert.equal(request.q.split(" ").length, 12);
  assert.equal(request.includeTail, false);
});

test("FTS query uses the shipped QuestionsSearch index", () => {
  const session = fakeSession();
  buildFtsQuery(session, parseSearchRequest({
    q: "wifi",
    tag: "radio",
    community: "raspberrypi",
  }));
  assert.equal(session.calls[0][1].indexName, "QuestionsSearch");
  assert.ok(session.calls.some(([name]) => name === "search"));
  assert.ok(session.calls.some(([name]) => name === "whereIn"));
});

test("AI query uses explicit vector task identifier", () => {
  const session = fakeSession();
  buildAiQuery(session, parseSearchRequest({ mode: "ai", q: "wifi" }));
  assert.equal(session.calls[0][1].indexName, "Questions/ByVector");
  const vector = session.calls.find(([name]) => name === "vectorSearch");
  const value = { byText: (...args) => args };
  assert.deepEqual(vector[2](value), ["wifi", "embedtaskhuginai"]);
});

test("cache hits never expose stale RavenDB scopes", () => {
  assert.deepEqual(extractServerTimings(
    { timings: { query: { timings: { corax: { durationInMs: 123 } } } } },
    { durationInMs: -1 },
  ), {
    fromCache: true,
    server: null,
    ravenCorax: null,
    ravenRetriever: null,
    ravenEmbed: null,
  });
});
