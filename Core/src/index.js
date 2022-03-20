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
const io = new SocketIOServer(server)

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
    console.log('a user connected');
    baseController.registerAllControllerEvent(socket)
  });

});