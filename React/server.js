const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');

server.listen(8000, () => console.log('connected to port 8000!'));

app.use(cors());

let pot = 0;
let names = [];
let serverNames = [];
let mssg = [];
io.on('connection', socket => {
  console.log('in socket');

  socket.on('UPDATE_CHAT', state => {
    console.log('chat',state)
    mssg =  state.mssg ;
    socket.broadcast.emit('UPDATED_CHAT', state);
  });

  socket.on('GET_CURRENT_CHAT', () => {
  console.log('in get current chat', mssg);
  socket.emit('CURRENT_CHAT', mssg)
  });


  socket.on('SEND_NAME_TO_SERVER', name => {
    serverNames = [...serverNames, { socketId: socket.id, name }];
    names = [...names, name];
    socket.broadcast.emit('SEND_NAMES_TO_CLIENTS', names);
    socket.emit('SEND_NAMES_TO_CLIENTS', names);
  });

  socket.on('disconnect', () => {
    serverNames = serverNames.filter(data => data.socketId !== socket.id);
    names = serverNames.map(data => data.name);
    socket.broadcast.emit('SEND_NAMES_TO_CLIENTS', names);
    socket.emit('SEND_NAMES_TO_CLIENTS', names);
  });

});
