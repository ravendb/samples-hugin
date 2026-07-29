"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createBootStatus } = require("../lib/boot-status");

test("boot is ready only with resident model, required indexes and warmup", async () => {
  const axios = {
    async get(url) {
      if (url.endsWith("/api/tags")) return { data: { models: [] } };
      if (url.endsWith("/api/ps")) {
        return { data: { models: [{ name: "snowflake-arctic-embed:s" }] } };
      }
      if (url.endsWith("/stats")) {
        return {
          data: {
            Indexes: [
              { Name: "QuestionsSearch", IsStale: false },
              { Name: "QuestionsTags", IsStale: false },
              { Name: "Questions/ByVector", IsStale: false },
            ],
          },
        };
      }
      return { data: {} };
    },
  };
  const getStatus = createBootStatus({ axios, existsSync: () => true });
  const result = await getStatus();
  assert.equal(result.ready, true);
});
