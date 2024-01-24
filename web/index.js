const express = require('express');
const path = require('path');
const app = express();
const { DocumentStore } = require('ravendb');

const store = new DocumentStore('http://127.0.0.1:8080', 'raspberrypi.stackexchange.com');
store.initialize();

app.set('view engine', 'ejs');
app.use("/assets", express.static("assets"));

app.get('/', async function (req, res) {
    const session = store.openSession();
    const tags = await session.query({ collection: 'Questions' })
        .groupBy("Tags[]")
        .selectKey("Tags[]", "Name")
        .selectCount("Count")
        .orderByDescending("Count", "Long")
        .take(10)
        .all()

    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        tags[i].recentQuestions = await session.query({ indexName: 'Questions/Search' })
            .whereEquals('Tags', tag.Name)
            .orderByDescending('CreationDate')
            .take(3)
            .include('Owner')
            .all();
    }

    res.render('index', {
        tags: tags
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});