const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, 'Public')));

app.get("/player.html", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "player.html"));
});

const PORT = process.env.PORT || 33945;

server.listen(PORT, () => {
    console.log(`CALC CALC WOOOOOO! Servidor rodando em: http://localhost:${PORT}`);
});