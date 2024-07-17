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
      socket.broadcast.emit('chatMessage', { message, x: agents[socket.id].x, y: agents[socket.id].y, nickname: agents[socket.id].nickname });
    }
  });

  socket.on('mute', (targetNickname) => {
    mutedUsers[targetNickname] = true;
    socket.broadcast.emit('mute', targetNickname);
  });

  socket.on('uploadMedia', (formData) => {
    // Handle media upload here
    // For example, you can use the `multer` middleware to handle file uploads
    const multer = require('multer');
    const upload = multer({ dest: './uploads/' });
    upload(formData, (err) => {
      if (err) {
        console.error(err);
      } else {
        const url = `${formData.file.name}`;
        const alt = formData.file.name;
        socket.broadcast.emit('mediaMessage', { url, alt, x: agents[socket.id].x, y: agents[socket.id].y, nickname: agents[socket.id].nickname });
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
