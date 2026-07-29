"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../app");

function createFakeStore({ offline = false } = {}) {
  const calls = [];

  function createQuery(args) {
    const state = { args, stats: null, timings: null };
    calls.push(["query", args]);
    const query = {
      whereEquals(...values) { calls.push(["whereEquals", ...values]); return query; },
      whereIn(...values) { calls.push(["whereIn", ...values]); return query; },
      andAlso() { calls.push(["andAlso"]); return query; },
      search(...values) { calls.push(["search", ...values]); return query; },
      orderByScore() { calls.push(["orderByScore"]); return query; },
      orderByDescending(...values) { calls.push(["orderByDescending", ...values]); return query; },
      skip(value) { calls.push(["skip", value]); return query; },
      take(value) { calls.push(["take", value]); return query; },
      include(value) { calls.push(["include", value]); return query; },
      vectorSearch(field, value) {
        calls.push(["vectorSearch", field({ withField: (name) => name }),
          value({ byText: (...items) => items })]);
        return query;
      },
      statistics(callback) { state.stats = callback; return query; },
      timings(callback) { state.timings = callback; return query; },
      async all() {
        if (offline) {
          const error = new Error("connect ECONNREFUSED 127.0.0.1:8080");
          error.code = "ECONNREFUSED";
          throw error;
        }
        if (args.collection === "Communities") {
          return [{ Community: "unix", Name: "Unix" }];
        }
        if (args.indexName === "QuestionsTags") {
          return [{ Tag: "linux", Community: "unix", Count: 1 }];
        }
        state.stats?.({ totalResults: 1, durationInMs: 4 });
        state.timings?.({
          timings: {
            query: {
              timings: {
                corax: { durationInMs: 2 },
                retriever: { durationInMs: 1 },
              },
            },
          },
        });
        return [{
          id: "questions/1",
          Title: "Wi-Fi on Linux",
          Body: "<p>Use ip link.</p>",
          Tags: ["linux", "wifi"],
          Community: "unix",
          Owner: "users/1",
          Answers: [],
          Comments: [],
        }];
      },
    };
    return query;
  }

  function session() {
    return {
      include(value) { calls.push(["sessionInclude", value]); return this; },
      query: createQuery,
      async load(value) {
        calls.push(["load", value]);
        if (typeof value === "string") {
          return {
            id: value,
            Owner: "users/1",
            Answers: [],
            Comments: [],
          };
        }
        return Object.fromEntries((value || []).map((id) =>
          [id, { id, DisplayName: "Tester" }]));
      },
    };
  }

  return { calls, openSession: session };
}

async function withServer(app, fn) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("origin endpoints retain their response contracts", async () => {
  const store = createFakeStore();
  const app = createApp({
    documentStore: store,
    bootStatus: async () => ({ ready: true, stages: {} }),
  });
  await withServer(app, async (base) => {
    const search = await fetch(`${base}/api/search?q=wifi&tag=linux&pageSize=2`);
    assert.equal(search.status, 200);
    const body = await search.json();
    assert.equal(body.data.totalResults, 1);
    assert.equal(body.data.results[0].Title, "Wi-Fi on Linux");
    assert.equal(typeof body.timings.phases.total, "number");
    assert.equal(body.code, "GET /api/search");

    const communities = await (await fetch(`${base}/api/communities`)).json();
    assert.equal(communities.data[0].Community, "unix");

    const question = await (await fetch(
      `${base}/api/question?id=questions/1`,
    )).json();
    assert.equal(question.data.question.id, "questions/1");

    const indexes = await (await fetch(`${base}/api/indexes`)).json();
    assert.deepEqual(indexes.indexes.map((index) => index.name), [
      "QuestionsSearch",
      "QuestionsTags",
      "Questions/ByVector",
    ]);
  });
});

test("AI mode uses the vector index and explicit task identifier", async () => {
  const store = createFakeStore();
  const app = createApp({
    documentStore: store,
    bootStatus: async () => ({ ready: true, stages: {} }),
  });
  await withServer(app, async (base) => {
    const response = await fetch(`${base}/api/search?mode=ai&q=wireless`);
    assert.equal(response.status, 200);
  });
  assert.ok(store.calls.some((call) =>
    call[0] === "query" && call[1].indexName === "Questions/ByVector"));
  assert.ok(store.calls.some((call) =>
    call[0] === "vectorSearch" &&
    call[2][1] === "embedtaskhuginai"));
});

test("RavenDB transport failures map to a stable 503 contract", async () => {
  const app = createApp({
    documentStore: createFakeStore({ offline: true }),
    bootStatus: async () => ({ ready: false, stages: {} }),
  });
  await withServer(app, async (base) => {
    const response = await fetch(`${base}/api/search?q=wifi`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: "RavenDB is unavailable",
      stage: "ravendb",
      code: "service_unavailable",
    });
  });
});

test("boot status is read-only and heal routes do not exist", async () => {
  const app = createApp({
    documentStore: createFakeStore(),
    bootStatus: async () => ({ ready: false, stages: { warmup: { status: "pending" } } }),
  });
  await withServer(app, async (base) => {
    const status = await fetch(`${base}/api/boot-status`);
    assert.equal(status.status, 200);
    assert.equal((await status.json()).ready, false);
    assert.equal((await fetch(`${base}/api/heal/ravendb`, {
      method: "POST",
    })).status, 404);
  });
});
