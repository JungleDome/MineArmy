const Mineflayer = require('mineflayer');
const Config = require('../utilities/config.js');
const Util = require('../utilities/util.js');
const CommandManagerPlugin = require('./plugins/commandManager.js');
const SimpleLogger = require('simple-node-logger'); //for doc purpose
const { pathfinder } = require('mineflayer-pathfinder');
const EventManager = require('../utilities/eventManager.js');
const mc = require('minecraft-protocol')

const states = mc.states

let botInstances = [];

/**
 *
 *
 * @returns {import('../index.js').Bot[]}
 */
const CreateBots = function () {
    const logger = Util.Logger;
    const dataStore = Util.DataStore;
    for (const bot of Config.bots) {
        let botInstance = CreateBot(Mineflayer, Config.server, bot, logger, dataStore);
        botInstances.push(botInstance);
        RegisterRejoin(botInstance, Mineflayer, Config.server, bot, logger, dataStore);
    }

    return botInstances;
}
/**
 *
 *
 * @param {Mineflayer} mineflayer
 * @param {Config.server} server
 * @param {Object} loginDetails
 * @param {SimpleLogger.Logger} logger
 * @param {Util.DataStore} dataStore
 * @returns {import('../index.js').Bot}
 */
const CreateBot = function (mineflayer, server, loginDetails, logger, dataStore, mineflayerClient) {
    const bot = mineflayer.createBot({
        host: server.host,
        username: loginDetails.username,
        password: loginDetails.password,
        port: server.port,
        version: server.version,
        client: mineflayerClient
    });

    bot.loadPlugin(pathfinder)
    const mcData = require("minecraft-data")(server.version);
    bot.mcData = mcData;

    bot.chatLog = [];
    bot.dataStore = dataStore(loginDetails.username);
    bot.eventManager = EventManager(bot);
    bot.logger = logger({
        writer: function (text) {
            console.log(text);
            bot.chatLog.push(text);
            if (bot.chatLog.length > 100) {
                for (let i = bot.chatLog.length; i > 200; i--) {
                    bot.chatLog.shift();
                }
            }
        }
    });
    bot.helperConfig = {
        username: loginDetails.username,
        offlinePassword: loginDetails.offlinePassword,
        masterPlayerName: Util.masterPlayerName
    }
    bot.helper = {
        currentState: ''
    }

    CommandManagerPlugin(bot);

    return bot;
}

const RegisterRejoin = function (botInstance, ...args) {
    botInstance.on("helper.rejoin", () => {
        botInstance = CreateBot(...args);
        RegisterRejoin(botInstance, ...args);
    });
}

const CreateProxyBot = function (server) {
    const port = 25566;
    const srv = mc.createServer({
        'online-mode': false,
        port: port,
        keepAlive: false,
        version: server.version
    })

    srv.on('login', function (client) {
        const addr = client.socket.remoteAddress
        console.log('Incoming connection', '(' + addr + ')')
        let endedClient = false
        let endedTargetClient = false
        client.on('end', function () {
            endedClient = true
            console.log('Connection closed by client', '(' + addr + ')')
            if (!endedTargetClient) { targetClient.end('End') }
        })
        client.on('error', function (err) {
            endedClient = true
            console.log('Connection error by client', '(' + addr + ')')
            console.log(err.stack)
            if (!endedTargetClient) { targetClient.end('Error') }
        })
        const targetClient = mc.createClient({
            host: server.host,
            port: server.port,
            username: client.username,
            keepAlive: false,
            version: server.version
        })
        //inject local bot library
        const logger = Util.Logger;
        const dataStore = Util.DataStore;
        for (const bot of Config.bots) {
            let botInstance = CreateBot(Mineflayer, { host: 'localhost', port: port, version: server.version }, { username: client.username, offlinePassword: 'sasasa' }, logger, dataStore, targetClient);
            botInstances.push(botInstance);
        }
        //
        client.on('packet', function (data, meta) {
            if (targetClient.state === states.PLAY && meta.state === states.PLAY) {
                if (!endedTargetClient) { targetClient.write(meta.name, data) }
            }
        })
        targetClient.on('packet', function (data, meta) {
            if (meta.state === states.PLAY && client.state === states.PLAY) {
                if (!endedClient) {
                    client.write(meta.name, data)
                    if (meta.name === 'set_compression') {
                        client.compressionThreshold = data.threshold
                    } // Set compression
                }
            }
        })
        targetClient.on('end', function () {
            endedTargetClient = true
            console.log('Connection closed by server', '(' + addr + ')')
            if (!endedClient) { client.end('End') }
        })
        targetClient.on('error', function (err) {
            endedTargetClient = true
            console.log('Connection error by server', '(' + addr + ') ', err)
            console.log(err.stack)
            if (!endedClient) { client.end('Error') }
        })

        targetClient.on('chat', (packet) => {
            console.log(packet.message)
        })
    });
}

module.exports = {
    CreateBot: CreateBot,
    CreateBots: CreateBots,
    CreateProxyBot: CreateProxyBot,
    _instances: botInstances,
}