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
  });

  socket.on('move', (data) => {
    agents[socket.id] = data;
    socket.broadcast.emit('update', agents);
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
