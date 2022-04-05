const Mineflayer = require('mineflayer');
const Config = require('../utilities/config.js');
const { pathfinder } = require('mineflayer-pathfinder');
const EventManager = require('../utilities/eventManager.js');
const Logger = require('../utilities/logger.js');
const PluginManager = require('./pluginManager.js');
const Enum = require('./enum.js')
require("format-unicorn");

let botInstances = [];

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

    bot.core = {
        config: {
            username: botDetails.username,
            offlinePassword: botDetails.offlinePassword,
            masterPlayerName: ''
        },
        chatLog: [],
        currentPriority: Enum.PLUGIN_PRIORITY.LOW
    }

    //Inject utilities class
    bot.eventManager = EventManager(bot);
    bot.logger = Logger(bot);
    bot.pluginManager = {
        registerCommand: PluginManager(bot).registerCommand
    }
    

    

    return bot;
}

const RegisterRejoin = function (botInstance, ...args) {
    botInstance.on("bot.rejoin", () => {
        botInstance = CreateBot(...args);
        RegisterRejoin(botInstance, ...args);
    });
}

module.exports = {
    CreateBot: CreateBot,
    _instances: botInstances,
}