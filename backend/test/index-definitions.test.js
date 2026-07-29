"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { INDEX_DEFINITIONS } = require("../indexes/definitions");

test("shipped index definitions normalize imported pipe-delimited tags", () => {
  const search = INDEX_DEFINITIONS.find(({ name }) => name === "QuestionsSearch");
  const tags = INDEX_DEFINITIONS.find(({ name }) => name === "QuestionsTags");

  assert.match(search.code, /String\(entry\)\.split\("\|"\)/);
  assert.match(search.code, /Tags: tokens/);
  assert.match(search.code, /Query: \[q\.Title\]\.concat\(tokens\)/);
  assert.match(tags.code, /String\(entry\)\.split\("\|"\)/);
  assert.match(tags.code, /Communities: \{ \[q\.Community\]: 1 \}/);
});

test("vector definition names the final HuginAI embedding task", () => {
  const vector = INDEX_DEFINITIONS.find(({ name }) => name === "Questions/ByVector");
  assert.match(vector.code, /loadVector\("Title", "embedtaskhuginai"\)/);
});
