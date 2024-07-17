const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let agents = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    delete agents[socket.id];
    socket.broadcast.emit('remove', socket.id);
  });

  socket.on('login', (nickname) => {
    agents[socket.id] = { nickname, x: Math.floor(Math.random() * (window.innerWidth - 50)), y: Math.floor(Math.random() * (window.innerHeight - 50)) };
    socket.emit('loginSuccess', agents[socket.id]);
    socket.broadcast.emit('newUser', agents[socket.id]);
  });

  socket.on('move', (data) => {
    agents[socket.id].x = data.x;
    agents[socket.id].y = data.y;
    socket.broadcast.emit('update', { id: socket.id, x: data.x, y: data.y });
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
