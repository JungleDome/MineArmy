const Bot = require('../bot/bot.js')
const BotViewer = require('../bot/botViewer')

module.exports = ({ socket } = {}) => {
    let mineflayerBots = []
    let defaultViewerPort = 3001

    function getBotByName(name) {
        return mineflayerBots.find(x => x.bot.core.config.username == name)
    }

    function getEmptyViewerPort() {
        let lastPort = Math.max(mineflayerBots.map(x => x.viewerPort).filter(x => x))
        return lastPort ? lastPort + 1 : defaultViewerPort
    }

    let events = [
        {
            name: 'worker.test',
            fnHandler: () => {
                console.log("hello from worker")
                socket.emit("worker.testReceived")
            }
        },
        {
            name: 'worker.createBot',
            fnHandler: (botDetails) => {
                console.log("Creating bot...")
                let err, bot
                try {
                    bot = Bot.CreateBot(botDetails)
                } catch (_err) {
                    error = _err
                }
                mineflayerBots.push({
                    instance: bot,
                    viewerPort: null
                })
                //listen for bot error
                bot.on('bot.error', (message) => { socket.emit('worker.botError', botDetails.uuid, message) })
                bot.on('end', (message) => { socket.emit('worker.botDisconnected', botDetails.uuid, message) })
                bot.on('spawn', () => { socket.emit("worker.botCreated", botDetails) })
                
            }
        },
        {
            name: 'worker.createViewer',
            fnHandler: (botName, port) => {
                let viewPort = getEmptyViewerPort()
                if (port)
                    viewPort = port

                let bot = getBotByName(botName)

                try {
                    BotViewer.CreateViewer(bot.instance, viewPort)
                    bot.viewerPort = viewPort
                } catch (err) {
                }
            }
        },
        {
            name: 'worker.command',
            fnHandler: (botName, command) => {
                let bot = getBotByName(botName)

                bot.emit("bot.serverCommand", command)

                socket.emit("worker.commandReceived", botName, command)
            }
        },
    ]

    return {
        events
    }
}