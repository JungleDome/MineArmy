const Mineflayer = require('mineflayer');
const Config = require('../utilities/config.js');
const Util = require('../utilities/util.js');
const CommandManagerPlugin = require('./plugins/commandManager.js');
const SimpleLogger = require('simple-node-logger'); //for doc purpose
const { pathfinder } = require('mineflayer-pathfinder');
const EventManager = require('../utilities/eventManager.js');
const mc = require('minecraft-protocol')
require("format-unicorn");
const Enum = require('./enum.js')

let botInstances = [];

/**
 *
 *
 * @returns {import('../index.js').Bot[]}
 */
const CreateBots = function () {
    for (const bot of Config.bots) {
        let botInstance = CreateBot({
            serverIP: Config.server.host,
            serverPort: Config.server.port,
            username: bot.username,
            password: bot.password
        })
        botInstances.push(botInstance);
        // RegisterRejoin(botInstance, Mineflayer, Config.server, bot, logger, dataStore);
    }

    return botInstances;
}
/**
 *
 *
 * @param {import('../index.js').CreateBotDetails} botDetails
 * @returns {import('../index.js').Bot}
 */
const CreateBot = function (botDetails, mineflayerClient) {
    const bot = Mineflayer.createBot({
        host: botDetails.serverIP,
        username: botDetails.username,
        password: botDetails.password,
        port: botDetails.serverPort,
        version: botDetails.serverVersion,
        client: mineflayerClient
    });

    bot.loadPlugin(pathfinder)
    const mcData = require("minecraft-data")(botDetails.serverVersion);
    bot.mcData = mcData;

    bot.dataStore = Util.DataStore(botDetails.username);
    bot.eventManager = EventManager(bot);
    bot.logger = Util.Logger({
        writer: function (text) {
            console.log(text);
            bot.core.chatLog.push(text);
            if (bot.core.chatLog.length > 100) {
                for (let i = bot.core.chatLog.length; i > 200; i--) {
                    bot.core.chatLog.shift();
                }
            }
        }
    });
    bot.core = {
        config: {
            username: botDetails.username,
            offlinePassword: botDetails.offlinePassword,
            masterPlayerName: Util.masterPlayerName
        },
        chatLog: [],
        currentPriority: Enum.PLUGIN_PRIORITY.LOW
    }

    CommandManagerPlugin(bot);

    return bot;
}

const RegisterRejoin = function (botInstance, ...args) {
    botInstance.on("core.rejoin", () => {
        botInstance = CreateBot(...args);
        RegisterRejoin(botInstance, ...args);
    });
}

module.exports = {
    CreateBot: CreateBot,
    CreateBots: CreateBots,
    _instances: botInstances,
}