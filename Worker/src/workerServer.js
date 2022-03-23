const socketio = require("socket.io")
const Bot = require('./bot/bot.js')
const BotViewer = require('./bot/botViewer')

let mineflayerBots = []
let defaultViewerPort = 3001

function getBotByName(name) {
    return mineflayerBots.find(x => x.bot.core.config.username == name)
}

function getEmptyViewerPort() {
    let lastPort = Math.max(mineflayerBots.map(x => x.viewerPort).filter(x => x))
    return lastPort ? lastPort + 1 : defaultViewerPort
}

function onNewWebsocketConnection(socket) {
    //join worker room
    socket.emit('join', 'worker')

    //listen to worker room event
    socket.on("disconnect", () => {
        console.info(`Socket disconnected.`)
    });


    socket.on("bot.create", (botDetails) => {
        mineflayerBots.push({
            instance: Bot.CreateBot(botDetails),
            viewerPort: null
        })
    })

    socket.on("bot.createViewer", (botName, port, cb) => {
        let viewPort = getEmptyViewerPort()
        if (port)
            viewPort = port
        
        let bot = getBotByName(botName)
        
        try {
            BotViewer.CreateViewer(bot.instance, viewPort)
            bot.viewerPort = viewPort
            cb()
        } catch (err) {
            cb(err)
        }
    })
}

function CreateConnection(serverUrl) {
    var client = new socketio(serverUrl)
    // will fire for every new websocket connection
    client.on("connection", onNewWebsocketConnection)
}

module.exports = {
    CreateConnection: CreateConnection,
}