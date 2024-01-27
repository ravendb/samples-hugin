const express = require("express");
const cors = require("cors");
const path = require("path");


const app = express();



const isProdEnv = process.env.NODE_ENV === "production";
if (isProdEnv) {
    app.use(express.static(path.join(path.resolve(), "build", "public")));
} else {
    const corsOptions = {
        origin: [
            "http://127.0.0.1:8080",
            "http://localhost:8080",
            "http://127.0.0.1:5173",
            "http://localhost:5173",
        ],
        credentials: true,
    };

    app.use(cors(corsOptions));
}



app.get("/api/cards", (req, res) => {
    const cards = [
        {
            name: "Raspberry Pi",
            description: "Raspberry Pi Stack Exchange is a question and answer site for users and developers of hardware and software for Raspberry Pi",
            image: "raspberry-pi.svg",
            alt: "Raspberry Pi logo",
            link: "/technology/raspberry-pi"
        }, {
            name: "Server Fault",
            description: "Server Faults is a question and answer site for system and network administrators",
            image: "server.svg",
            link: "/technology/server-fault"
        }, {
            name: "Unix & Linux",
            description: "Unix & Linux Stack Exchange Is a question and answer site for users of Linux, FreeBSD and other Un*x-like operating systems",
            image: "linux.svg",
            link: "/technology/unix"
        },
        //  {
        //     name: "RavenDB",
        //     description: "Learn more about RavenDB and how to best use it",
        //     image: "ravendb-logo.svg",
        //     link: "/technology/ravendb"
        // },
    ]

    res.send({
        status: "success",
        data: cards
    })

});

app.get("/**", (req, res) => {
    res.sendFile(path.join(path.resolve(), "build", "public", "index.html"));
});

app.all("*", (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;