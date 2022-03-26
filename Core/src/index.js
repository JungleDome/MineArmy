'use strict';

const express = require('express')
const { Server: SocketIOServer } = require("socket.io")
const compression = require('compression')
const path = require("path")

const baseController = require('./controller/baseController')


// Constants
const PORT = 8080
const PUBLICFOLDER = path.join(__dirname, '../public')

// App
const app = express();
const server = require('http').createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Serve static page
app.use(compression())
app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/test', (req, res) => {
  res.send('Hello World');
});

// Start server

server.listen(PORT, null, () => {
  console.log(`Running on *:${PORT}`);

  //Inject event
  io.on('connection', (socket) => {
    baseController.registerBaseControllerEvent(socket)
  });

  io.of('/').adapter.on('join-room', (room, id) => {
    let socket = io.sockets.sockets.get(id);
    if (room == 'controlPanel') {
      console.log('An admin connected');
      baseController.registerSubControllerEvent(socket)
    } else if (room == 'worker') {
      console.log('A worker connected');
    }
  })
});