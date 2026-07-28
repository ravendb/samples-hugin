"use strict";

const { EMB_TASK_IDENTIFIER } = require("../db-config");

// These definitions document the exact indexes shipped in the sealed database.
// The Pi validates them but never creates or rebuilds them.
const INDEX_DEFINITIONS = [
  {
    name: "QuestionsSearch",
    version: 2,
    purpose: "Full-text search and sorting",
    code: `map("Questions", q => ({
  Query: [q.Title, q.Tags, q.Body],
  Community: q.Community,
  Tags: q.Tags,
  CreationDate: q.CreationDate,
  ViewCount: q.ViewCount,
  Score: q.Score
}))
// Query is Search; engine is Corax`,
  },
  {
    name: "QuestionsTags",
    version: 2,
    purpose: "Related tag counts",
    code: `map("Questions", q => q.Tags.map(tag => ({
  Tag: tag,
  Community: q.Community,
  Count: 1
})))
// Reduce by Tag + Community and sum Count`,
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
