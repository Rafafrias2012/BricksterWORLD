const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let agents = [];
let mutedAgents = {};
const images = [
  'https://images.shoutwiki.com/lego/d/df/Pepper_Roni.jpg',
  'https://images.shoutwiki.com/lego/d/db/Infomaniac2.jpg',
  'https://images.shoutwiki.com/lego/1/1d/Brickster.jpg',
  'https://images.shoutwiki.com/lego/thumb/3/3a/Bill_Ding_LI1.png/250px-Bill_Ding_LI1.png',
  'https://images.shoutwiki.com/lego/a/ad/CD_Rom.png',
  'https://images.shoutwiki.com/lego/thumb/0/0e/DrClickitt.png/250px-DrClickitt.png',
  'https://images.shoutwiki.com/lego/7/7f/Jotc.jpg',
  'https://images.shoutwiki.com/lego/thumb/1/18/Laura_Brick.png/250px-Laura_Brick.png',
  'https://images.shoutwiki.com/lego/thumb/a/a2/MBrickolini.jpg/250px-MBrickolini.jpg',
  'https://images.shoutwiki.com/lego/9/9b/Nickbrick.gif',
  'https://images.shoutwiki.com/lego/thumb/4/42/Papa.jpg/250px-Papa.jpg',
  'https://images.shoutwiki.com/lego/6/6b/Enter.jpg',
  'https://images.shoutwiki.com/lego/5/5f/Return.jpg'
];

io.on('connection', (socket) => {
  console.log('a user connected');

  // handle login
  socket.on('login', (nickname) => {
    if (nickname) {
      // create a new agent
      let agent = {
        id: socket.id,
        nickname: nickname,
        x: Math.random() * 400,
        y: Math.random() * 400,
        image: images[Math.floor(Math.random() * images.length)]
      };
      socket.emit('agent', agent);
      // broadcast the agent to all other clients
      socket.broadcast.emit('agent', agent);
      // add agent to agents list
      agents.push(agent);
    }
  });

  // handle agent movement
  socket.on('move', (data) => {
    let agent = agents.find((a) => a.id === socket.id);
    if (agent) {
      agent.x = data.x;
      agent.y = data.y;
      socket.broadcast.emit('move', agent);
    }
  });

  // handle chat messages
  socket.on('chat', (data) => {
    let agent = agents.find((a) => a.id === socket.id);
    if (agent) {
      if (!mutedAgents[agent.id]) {
        io.emit('chat', { id: agent.id, message: data.message });
      }
    }
  });

  // handle mute
  socket.on('mute', (agentId) => {
    mutedAgents[agentId] = true;
  });

  // handle unmute
  socket.on('unmute', (agentId) => {
    delete mutedAgents[agentId];
  });

  // handle disconnection
  socket.on('disconnect', () => {
    console.log('a user disconnected');
    agents = agents.filter((a) => a.id !== socket.id);
  });

  // handle room info
  socket.on('roomInfo', (data) => {
    io.emit('roomInfo', data);
  });

  // send room info to clients
  setInterval(() => {
    const roomId = 'default'; // replace with actual room id
    const roomInfo = 'room is public'; // replace with actual room info
    const memberCount = agents.length;
    io.emit('roomInfo', { roomId, roomInfo, memberCount });
  }, 1000);
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});