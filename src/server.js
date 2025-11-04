// server.js
require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { connectToDatabase } = require("./config/db");
const Message = require("./models/Message");

connectToDatabase();

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send("✅ Socket.io Server is running...");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// socket.io structure: كل غرفة = room name
io.on("connection", (socket) => {
  let username = "زائر";
  let room = "عام";

  // استقبال انضمام غرفة واسم
  socket.on("join", async ({ name, toRoom }) => {
    username = name || "زائر";
    room = toRoom || "عام";
    socket.join(room);
    // جلب رسائل الغرفة
    const allMessages = await Message.find({ room }).sort({ createdAt: 1 }).lean();
    socket.emit("allMessages", allMessages.map(m => ({ body: m.body, sender: m.sender, createdAt: m.createdAt })));
    // إشعار دخول
    socket.to(room).emit("notif", `${username} انضم للغرفة ✨`);
  });

  // إرسال رسالة
  socket.on("message", async (data) => {
    const msg = await Message.create({ body: data, sender: username, room });
    io.in(room).emit("message", { body: msg.body, sender: username, createdAt: msg.createdAt });
  });

  // typing event
  socket.on("typing", (typing) => {
    socket.to(room).emit("typing", { username, typing });
  });

  socket.on("disconnect", () => {
    socket.to(room).emit("notif", `${username} غادر 👋🏽`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io Server running on http://localhost:${PORT}`);
});
