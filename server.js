const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  maxHttpBufferSize: 50 * 1024 * 1024, // 50MB cap for videos
});

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room, password, color }) => {
    if (!rooms[room]) {
      rooms[room] = { password, users: [], messages: [], reactions: {} };
    } else if (rooms[room].password !== password) {
      socket.emit("errorMessage", "Incorrect password.");
      return;
    }

    if (rooms[room].users.find(u => u.username === username)) {
      socket.emit("errorMessage", "Username already taken in this room.");
      return;
    }

    socket.username = username;
    socket.room = room;
    socket.color = color || "#5865f2";
    socket.join(room);
    rooms[room].users.push({ username, color: socket.color });

    socket.emit("chatHistory", { messages: rooms[room].messages });
    io.to(room).emit("systemMessage", `${username} joined the room.`);
    io.to(room).emit("userList", rooms[room].users);
  });

  socket.on("chat message", (data) => {
    const room = socket.room;
    const username = socket.username;
    if (!room || !username) return;

    const msg = {
      id: Date.now() + Math.random(),
      username,
      color: socket.color,
      text: data.text || "",
      images: data.images || [],
      videos: data.videos || [],
      timestamp: data.timestamp || Date.now(),
    };

    rooms[room].messages.push(msg);
    if (rooms[room].messages.length > 200)
      rooms[room].messages = rooms[room].messages.slice(-200);

    io.to(room).emit("chat message", msg);
  });

  socket.on("reaction", ({ msgId, emoji, username }) => {
    const room = socket.room;
    if (!room || !rooms[room]) return;
    if (!rooms[room].reactions[msgId]) rooms[room].reactions[msgId] = {};
    if (!rooms[room].reactions[msgId][emoji]) rooms[room].reactions[msgId][emoji] = [];
    const users = rooms[room].reactions[msgId][emoji];
    const idx = users.indexOf(username);
    if (idx >= 0) users.splice(idx, 1);
    else users.push(username);
    io.to(room).emit("reaction update", { msgId, reactions: rooms[room].reactions[msgId] });
  });

  socket.on("typing", ({ username }) => {
    if (socket.room) socket.to(socket.room).emit("typing", { username });
  });

  socket.on("stopTyping", ({ username }) => {
    if (socket.room) socket.to(socket.room).emit("stopTyping", { username });
  });

  socket.on("getUsers", () => {
    if (socket.room && rooms[socket.room])
      socket.emit("userList", rooms[socket.room].users);
  });

  socket.on("clearChat", () => {
    const room = socket.room;
    if (room && rooms[room]) {
      rooms[room].messages = [];
      rooms[room].reactions = {};
      io.to(room).emit("clearChat");
    }
  });

  socket.on("disconnect", () => {
    const { room, username } = socket;
    if (room && rooms[room] && username) {
      rooms[room].users = rooms[room].users.filter(u => u.username !== username);
      io.to(room).emit("systemMessage", `${username} left the room.`);
      io.to(room).emit("userList", rooms[room].users);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`NightChat running on port ${PORT}`));
