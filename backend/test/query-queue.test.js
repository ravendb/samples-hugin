"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createLatestWinsQueue } = require("../lib/query-queue");

test("newest waiter supersedes stale searches", async () => {
  let now = 10;
  const queue = createLatestWinsQueue(() => now);
  const first = queue.acquire({ kind: "search", q: "a", startedAt: now });
  assert.equal((await first.wait()).superseded, false);
  const stale = queue.acquire({ kind: "search", q: "b", startedAt: now });
  const latest = queue.acquire({ kind: "search", q: "c", startedAt: now });
  first.release();
  assert.equal((await stale.wait()).superseded, true);
  assert.equal((await latest.wait()).superseded, false);
  latest.release();
});
