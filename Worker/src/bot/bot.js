const Mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const EventManager = require('./lib/eventManager.js');
const Logger = require('./lib/logger.js');
const PluginManager = require('./lib/pluginManager.js');
const Enum = require('./lib/enum.js')
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
            uuid: botDetails.uuid,
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
    bot.commandManager = {
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