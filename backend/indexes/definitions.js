"use strict";

const { EMB_TASK_IDENTIFIER } = require("../db-config");

// These definitions document the exact indexes shipped in the sealed database.
// The Pi validates them but never creates or rebuilds them.
const INDEX_DEFINITIONS = [
  {
    name: "QuestionsSearch",
    version: 3,
    purpose: "Full-text search and sorting",
    code: `map("Questions", q => {
  const tokens = [];
  for (const entry of (q.Tags || [])) {
    for (const part of String(entry).split("|")) {
      const tag = (part || "").trim();
      if (tag) tokens.push(tag);
    }
  }
  return {
    Query: [q.Title].concat(tokens),
    Community: q.Community,
    Tags: tokens,
    CreationDate: q.CreationDate,
    ViewCount: q.ViewCount,
    Score: q.Score
  };
})
// Query is Search; engine is Corax`,
  },
  {
    name: "QuestionsTags",
    version: 3,
    purpose: "Related tag counts",
    code: `map("Questions", q => {
  const tokens = [];
  for (const entry of (q.Tags || [])) {
    for (const part of String(entry).split("|")) {
      const tag = (part || "").trim();
      if (tag) tokens.push(tag);
    }
  }
  return tokens.map(tag => ({
    Tag: tag,
    Count: 1,
    Communities: { [q.Community]: 1 }
  }));
})
// Reduce by Tag, sum Count, and merge Communities`,
  },
  {
    name: "Questions/ByVector",
    version: 1,
    purpose: "Semantic nearest-neighbour search",
    code: `map("Questions", q => ({
  TitleVector: loadVector("Title", "${EMB_TASK_IDENTIFIER}"),
  Community: q.Community,
  Tags: q.Tags
}))
// TitleVector is an HNSW vector field`,
  },
];

module.exports = { INDEX_DEFINITIONS };
