const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require('axios');
const ravendb = require("ravendb");
const { performance } = require("perf_hooks");

const documentStore = new ravendb.DocumentStore(
  "http://127.0.0.1:8080",
  "Hugin"
);
documentStore.initialize();

async function wakeUp() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  while (true) {
    try {
      const session = documentStore.openSession();
      const communities = await session.query({ collection: "Communities" }).all();
      for (const community of communities) {
        await session.query({ indexName: QuestionsSearch.name })
          .whereEquals("Community", community.id)
          .orderByDescending("CreationDate")
          .take(15)
          .all();
      }
      // execute once every 5 minutes, to ensure we are hot
      await sleep(5 * 60 * 1000);
    }
    catch (err) {
      console.error("Failed to wake up", err);
      await sleep(15_000);
    }
  }
}

// We call this on startup to ensure that the db is awake and running
// this is important since IO costs are high (on SD card), so on startup
// we'll pay the cost of waking up the db, and then we'll be able to run
// far faster. The issue is typically on first boot, where everything is cold
_ = wakeUp();

class QuestionsSearch extends ravendb.AbstractJavaScriptIndexCreationTask {
  constructor() {
    super();

    this.map('Questions', q => {
      return {
        Community: q.Community,
        Tags: q.Tags,
        CreationDate: q.CreationDate,
        ViewCount: q.ViewCount,
        Query: [q.Title, q.Tags]
      }
    });
    const SearchMode = 'Search';
    this.index('Query', SearchMode);
    this.searchEngineType = 'Corax'
  }
}

class QuestionsTags extends ravendb.AbstractJavaScriptIndexCreationTask {
  constructor() {
    super();
    this.map("Questions", q => {
      return q.Tags.map(t => {
        const communities = {};
        communities[q.Community] = 1;
        return { Tag: t, Count: 1, Communities: communities };
      })
    })
    this.reduce(g => {
      return g.groupBy(x => x.Tag)
        .aggregate(g => {
          const communities = {};
          const result = {
            Tag: g.key,
            Count: g.values.reduce((count, val) => val.Count + count, 0),
            Communities: communities
          };
          for (const entry of g.values) {
            for (const [key, value] of Object.entries(entry.Communities)) {
              communities[key] = (communities[key] || 0) + value;
            }
          }
          return result;
        })
    });
  }
}

const indexes = [QuestionsSearch, QuestionsTags];

Promise.all(indexes.map(index => new index().execute(documentStore))).then(() => {
  console.log("Indexes created");
}).catch(err => {
  console.error("Failed to create indexes", err);
});

const app = express();
let currentHandlerFunction = null;
app.asyncGet = function (path, handler) {
  return this.get(path, async (req, res, next) => {
    try {
      currentHandlerFunction = handler;
      await handler(req, res, next);
    } catch (err) {
      res
        .status(err.status || 500)
        .send({ error: err.message });
    }
  });
}

function getRouteCode(req) {
  return `app.${req.method.toLowerCase()}("${req.route.path}", ${currentHandlerFunction})`;
}

const isProdEnv = process.env.NODE_ENV === "production";
if (isProdEnv) {
  app.use(express.static(path.join(path.resolve(), "build", "public")));
} else {
  const corsOptions = {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  };

  app.use(cors(corsOptions));
}

app.get("/api/indexes", (req, res) => {
  const start = performance.now();
  const indexesOutput = indexes.map(i => ({ name: i.name, code: i.toString() }));
  const end = performance.now();
  res.send({
    indexes: indexesOutput,
    timings: {
      load: end - start
    }
  })
});

app.asyncGet("/api/question", async (req, res) => {
  const session = documentStore.openSession();
  const loadStart = performance.now();

  const question = await session
    .include("Owner")
    .include("Answers[].Owner")
    .include("Answers[].Comments[].User")
    .load(req.query.id);

  const userIds = question.Answers.map((a) =>
    a.Comments.map((c) => c.User).concat([a.Owner])
  ).concat([question.Owner])
    .concat(question.Comments.map((c) => c.User))
    .flat();
  const users = await session.load(userIds);

  const loadEnd = performance.now();

  res.send({
    data: { question, users },
    code: getRouteCode(req),
    timings: {
      load: loadEnd - loadStart,
    }
  });
});

app.asyncGet("/api/search", async (req, res) => {
  const session = documentStore.openSession();

  const tags = Array.isArray(req.query.tag)
    ? req.query.tags
    : [req.query.tag].filter((x) => x);
  const page = req.query.page || 0;
  const pageSize = req.query.pageSize || 10;

  const query = session
    .query({ indexName: QuestionsSearch.name })
    .take(pageSize)
    .skip(page * pageSize);

  if (tags.length > 0) {
    query.whereIn("Tags", tags);
  }
  if (req.query.community) {
    query.andAlso().whereEquals("Community", req.query.community);
  }
  if (req.query.q) {
    query.andAlso().search("Query", req.query.q);
  }

  var queryStart = performance.now();

  if (req.query.orderBy === "Score") {
    query.orderByScore();
  } else {
    query.orderByDescending(req.query.orderBy || "CreationDate");
  }

  let queryStats = null;
  const results = await query
    .statistics((stats) => {
      queryStats = stats;
    })
    .include("Owner")
    .all();

  var queryEnd = performance.now();

  var postTags = new Set(results.map((x) => x.Tags).flat());

  var tagsStart = performance.now();
  const relatedTags = await session
    .query({ indexName: QuestionsTags.name })
    .whereIn("Tag", postTags)
    .orderByDescending("Count", "Long")
    .take(10)
    .all();
  var tagsEnd = performance.now();

  const users = await session.load(results.map((q) => q.Owner));
  res.send({
    data: {
      results,
      users,
      relatedTags,
      totalResults: queryStats.totalResults,
    },
    code: getRouteCode(req),
    timings: {
      query: queryEnd - queryStart,
      tags: tagsEnd - tagsStart,
    },
  });
});

app.asyncGet("/api/communities", async (req, res) => {
  const session = documentStore.openSession();
  var queryStart = performance.now();
  const results = await session.query({ collection: "Communities" }).all();
  var queryEnd = performance.now();

  res.send({
    data: results,
    code: getRouteCode(req),
    timings: {
      query: queryEnd - queryStart,
    },
  });
});



app.asyncGet("/api/is-online", async (req, res) => {

  const r = await axios.request('https://google.com/generate_204');
  const online = r.status === 204;
  res.status(online ? 200 : 500).send({ online: online });
});


module.exports = app;
