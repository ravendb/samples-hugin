"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeTags,
  normalizeCommunity,
  trimQuestion,
} = require("../lib/documents");

test("normalizeTags accepts Raven arrays and pipe-delimited exports", () => {
  assert.deepEqual(normalizeTags(["linux", "|wifi|radio|", "linux"]), [
    "linux",
    "wifi",
    "radio",
  ]);
});

test("normalizeCommunity preserves the origin response shape", () => {
  assert.deepEqual(
    normalizeCommunity({ id: "unix", name: "Unix" }),
    { id: "unix", name: "Unix", Community: "Unix", Name: "Unix" },
  );
});

test("trimQuestion removes large nested payloads and keeps counts", () => {
  const result = trimQuestion({
    Body: "<p>Hello   world</p>",
    Tags: "|pi|wifi|",
    Answers: [{}, {}],
    Comments: [{}],
  });
  assert.equal(result.Body, "Hello world");
  assert.deepEqual(result.Tags, ["pi", "wifi"]);
  assert.equal(result.AnswerCount, 2);
  assert.equal(result.CommentCount, 1);
  assert.equal(result.Answers, undefined);
});
