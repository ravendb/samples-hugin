const app = require("./app");


const port = process.env.PORT || 3030;

const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...", err);
    server.close(() => {
        process.exit(1);
    });
});