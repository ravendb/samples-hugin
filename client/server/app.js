const express = require("express");
const cors = require("cors");
const path = require("path");
const ravendb = require("ravendb");

const documentStore = new ravendb.DocumentStore("http://localhost:8080", "Hugin");
documentStore.initialize();

const app = express();

function getRouteCode(req) {
    // quick and dirty way to do self reflection to render the route code
    const code = req.route.stack[0].handle;
    return `app.${req.method.toLowerCase()}("${req.route.path}", ${code})`;
}

const isProdEnv = process.env.NODE_ENV === "production";
if (isProdEnv) {
    app.use(express.static(path.join(path.resolve(), "build", "public")));
} else {
    const corsOptions = {
        origin: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
        ],
        credentials: true,
    };

    app.use(cors(corsOptions));
}

app.get("/api/question", async (req, res) => {
    const session = documentStore.openSession();
    const question = await session.include("Owner")
        .include("Answers[].Owner")
        .include("Answers[].Comments[].User")
        .load(req.query.id);

    const userIds = question.Answers
        .map(a => a.Comments.map(c => c.User)
            .concat([a.Owner])).flat();
    const users = await session.load(userIds);
    res.send({
        status: "success",
        data: { question, users },
        code: getRouteCode(req)
    })
});

app.get("/api/search", async (req, res) => {
    const session = documentStore.openSession();

    const facets = await createQuery()
        .aggregateBy(x => x.byField("Community"))
        .andAggregateBy(x => x.byField("Tags").withOptions({ termSortMode: "CountDesc", pageSize: 10 }))
        .execute();

    const results = await createQuery()
        .orderByDescending(req.query.orderBy || "CreatedDate")
        .include("Owner")
        .all();

    const users = await session.load(results.map(q => q.Owner));

    res.send({
        status: "success",
        data: {
            results,
            users,
            facets
        },
        code: getRouteCode(req)
    })

    function createQuery() { // used for query & facets, so we extract it to a function
        const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags].filter(x => x);
        const page = req.query.page || 0;
        const pageSize = req.query.pageSize || 10;
        const query = session.query({ indexName: "Questions/Search" })
            .take(pageSize).skip(page * pageSize);
        if (tags.length > 0) {
            query.whereIn("Tags", tags).andAlso();
        }
        if (req.query.community) {
            query.whereEquals("Community", req.query.community).andAlso();
        }
        if (req.query.search) {
            query.search("Query", req.query.search);
        }
        else { // need this to complete the "and also" from before
            query.whereExists("Query");
        }
        return query;
    }
})

app.get("/api/communities", async (req, res) => {
    const session = documentStore.openSession();
    const results = await session.query({ collection: "Communities" })
        .all();

    res.send({
        status: "success",
        data: results,
        code: getRouteCode(req)
    })

});

app.get("/**", (req, res) => {
    res.sendFile(path.join(path.resolve(), "build", "public", "index.html"));
});

app.all("*", (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;