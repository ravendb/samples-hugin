"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const ravendb = require("ravendb");
const { createApp } = require("../../app");

const enabled = process.env.HUGIN_INTEGRATION === "1";
const ravenUrl = process.env.RAVENDB_URL || "http://127.0.0.1:8080";

class Question {
  constructor(values) {
    Object.assign(this, values);
  }
}

class User {
  constructor(values) {
    Object.assign(this, values);
  }
}

class QuestionsSearch extends ravendb.AbstractJavaScriptIndexCreationTask {
  constructor() {
    super();
    this.map("Questions", (question) => ({
      Query: [question.Title, question.Tags, question.Body],
      Community: question.Community,
      Tags: question.Tags,
      CreationDate: question.CreationDate,
      ViewCount: question.ViewCount,
      Score: question.Score,
    }));
    this.index("Query", "Search");
    this.searchEngineType = "Corax";
  }
}

async function waitForIndex(store, name) {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    const stats = await store.maintenance.send(
      new ravendb.GetIndexStatisticsOperation(name),
    );
    if (!stats.isStale) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`index ${name} remained stale`);
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

test("real RavenDB executes the FTS endpoint and degrades missing AI", {
  skip: !enabled,
  timeout: 120000,
}, async () => {
  const database = `HuginCi_${process.env.GITHUB_RUN_ID || process.pid}`;
  const serverStore = new ravendb.DocumentStore(ravenUrl);
  serverStore.initialize();
  const store = new ravendb.DocumentStore(ravenUrl, database);

  try {
    await serverStore.maintenance.server.send(
      new ravendb.CreateDatabaseOperation((builder) =>
        builder.regular(database)),
    );
    store.initialize();

    const session = store.openSession();
    await session.store(new User({ DisplayName: "Alice" }), "users/1");
    await session.store(new Question({
      Title: "Recover a wireless interface",
      Body: "Use ip link and inspect brcmfmac.",
      Tags: ["linux", "wifi"],
      Community: "unix",
      CreationDate: "2026-01-02T00:00:00.000Z",
      ViewCount: 10,
      Score: 5,
      Owner: "users/1",
      Answers: [],
      Comments: [],
    }), "questions/1");
    await session.store(new Question({
      Title: "Inspect disk usage",
      Body: "Use df and du.",
      Tags: ["linux", "storage"],
      Community: "unix",
      CreationDate: "2026-01-01T00:00:00.000Z",
      ViewCount: 20,
      Score: 3,
      Owner: "users/1",
      Answers: [],
      Comments: [],
    }), "questions/2");
    await session.saveChanges();

    await new QuestionsSearch().execute(store);
    await waitForIndex(store, "QuestionsSearch");

    const app = createApp({
      documentStore: store,
      bootStatus: async () => ({ ready: true, stages: {} }),
    });
    await withServer(app, async (base) => {
      const response = await fetch(`${base}/api/search?q=wireless&pageSize=1`);
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.data.totalResults, 1);
      assert.equal(body.data.results[0].Title, "Recover a wireless interface");

      const filtered = await fetch(
        `${base}/api/search?community=unix&tag=wifi&pageSize=1`,
      );
      assert.equal(filtered.status, 200);
      assert.equal((await filtered.json()).data.totalResults, 1);

      const ai = await fetch(`${base}/api/search?mode=ai&q=wireless`);
      assert.equal(ai.status, 503);
      assert.equal((await ai.json()).code, "index_unavailable");
    });
  } finally {
    try {
      await serverStore.maintenance.server.send(
        new ravendb.DeleteDatabasesOperation({
          databaseNames: [database],
          hardDelete: true,
        }),
      );
    } finally {
      store.dispose();
      serverStore.dispose();
    }
  }
});
