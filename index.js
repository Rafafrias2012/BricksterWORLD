const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let agents = {};
let mutedUsers = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    delete agents[socket.id];
    socket.broadcast.emit('remove', socket.id);
  });

  socket.on('login', (nickname) => {
    agents[socket.id] = { nickname, x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500) };
    socket.emit('loginSuccess', agents[socket.id]);
    socket.broadcast.emit('newUser', agents[socket.id]);
  });

  socket.on('move', (data) => {
    agents[socket.id].x = data.x;
    agents[socket.id].y = data.y;
    socket.broadcast.emit('update', { id: socket.id, x: data.x, y: data.y });
  });

  socket.on('chat', (message) => {
    if (!mutedUsers[agents[socket.id].nickname]) {
      socket.broadcast.emit('chatMessage', { message, x: agents[socket.id].x, y: agents[socket.id].y });
    }
  });

  socket.on('mute', (targetNickname) => {
    mutedUsers[targetNickname] = true;
    socket.broadcast.emit('mute', targetNickname);
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
