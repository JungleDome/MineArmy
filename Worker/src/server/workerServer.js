const socketio = require("socket.io-client").io
const serverEvents = require('../server/serverEvents')

// let mineflayerBots = []
// let defaultViewerPort = 3001

// function getBotByName(name) {
//     return mineflayerBots.find(x => x.bot.core.config.username == name)
// }

// function getEmptyViewerPort() {
//     let lastPort = Math.max(mineflayerBots.map(x => x.viewerPort).filter(x => x))
//     return lastPort ? lastPort + 1 : defaultViewerPort
// }

function registerBasicHandler(socket) {
    socket.on("connect", () => {
        //join worker room
        socket.emit('join', 'worker')
        console.log("I am ready!")
        socket.emit('worker.connected')
    })

    socket.on("disconnect", () => {
        console.info(`Socket disconnected.`)
    });
}

function registerCommandHandler(socket) {
    // socket.onAny((event, ...args) => {
    //     console.log(`got ${event}`);
    // });
    serverEvents({ socket: socket }).events.forEach(x => { socket.on(x.name, x.fnHandler)})

    // socket.on("worker.createBot", (botDetails) => {
    //     console.log("Creating bot...")
    //     let err, bot
    //     try {
    //         bot = Bot.CreateBot(botDetails)
    //     } catch (_err) {
    //         error = _err
    //     }
    //     mineflayerBots.push({
    //         instance: bot,
    //         viewerPort: null
    //     })
    //     //listen for bot error
    //     bot.on('bot.error', (message) => { socket.emit('worker.botError', message)})
    //     socket.emit("worker.botCreated", botDetails, err)
    // })

    // socket.on("worker.createViewer", (botName, port) => {
    //     let viewPort = getEmptyViewerPort()
    //     if (port)
    //         viewPort = port
        
    //     let bot = getBotByName(botName)
        
    //     try {
    //         BotViewer.CreateViewer(bot.instance, viewPort)
    //         bot.viewerPort = viewPort
    //     } catch (err) {
    //     }
    // })    

    // socket.on("worker.command", (botName, command) => {
    //     let bot = getBotByName(botName)

    //     bot.emit("bot.serverCommand", command)

    //     socket.emit("worker.commandReceived", botName, command)
    // })
}

function CreateConnection(serverUrl) {
    let socket = socketio(serverUrl, {
        extraHeaders: {
            "Access-Control-Allow-Origin": "*"
        }
    })

    registerBasicHandler(socket)
    registerCommandHandler(socket)
}

module.exports = {
    CreateConnection: CreateConnection,
}