const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let agents = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('newAgent', (agent) => {
    agents.push(agent);
    io.emit('updateAgents', agents);
  });

  socket.on('moveAgent', (agent) => {
    agents = agents.map((a) => {
      if (a.id === agent.id) {
        return agent;
      }
      return a;
    });
    io.emit('updateAgents', agents);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
