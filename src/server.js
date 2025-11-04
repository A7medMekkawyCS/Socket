require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { connectToDatabase } = require("./config/db");
const Message = require("./models/Message");
const { emit } = require("process");

connectToDatabase();

const app = express();
app.use(cors());
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("chat");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  let username = "gest";
  let room = "public";
  
  socket.on("join", async ({ name, toRoom }) => {
    username = name || "gest";
    room = toRoom || "public";
    socket.join(room);
    const allMessages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .lean();
    socket.emit(
      "allMessages",
      allMessages.map((m) => ({
        body: m.body,
        sender: m.sender,
        createdAt: m.createdAt,
      }))
    );
    socket.to(room).emit("notif", `${username} ADD to Room✨`);
  });

  socket.on("message", async (data) => {
    const msg = await Message.create({ body: data, sender: username, room });
    io.in(room).emit("message", {
      body: msg.body,
      sender: username,
      createdAt: msg.createdAt,
    });
  });

  socket.on("typing", (typing) => {
    socket.to(room).emit("typing", { username, typing });
  });

  socket.on("disconnect", () => {
    socket.to(room).emit("notif", `${username} Exit 👋🏽`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io Server running on http://localhost:${PORT}`);
});
