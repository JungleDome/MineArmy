const EventEmitter = require('events')
const Enum = require("../enum.js")

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 */
var CommandManager = (bot) => {
    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Command Manager"
    const PLUGIN_NAME = "commandManager"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.CRITICAL
    let isPluginLoaded = false

    function loadPlugins() {
        //Register your plugins & it's imports here
        let pluginPath = [
            // "./essential.js",
            // "./login.js",
            // "./farmer.js",
            // "./shopper.js",
            // "./serverHelper.js",
            // "./afkSeller.js",
            // "./mineflayer-util.js",
        ]

        if (isPluginLoaded) {
            bot.logger.info("---------------Removing old plugins-------------")
            pluginPath.forEach(x => {
                delete require.cache[require.resolve(x)]
            })
        }
        
        bot.logger.info("---------------Loading plugins-------------")
        pluginPath.forEach(x => {
            bot.loadPlugin(require(x))
        })
        bot.logger.info("---------------Plugins loaded-------------")

        isPluginLoaded = true
    }


    function registerEvent() {
        bot.on('core.server.receiveCommand', function (message) {
            if (message && Util.stripTextFormat(message.toString())) {
                var serverCommand = Util.stripTextFormat(message.toString())
                bot.logger.info(serverCommand, PLUGIN_DISPLAY_NAME)
                bot.emit('core.command', serverCommand, bot.core.config.masterPlayerName)
            }
        })

        bot.on('core.reload', async function (message) {
            loadPlugins()
            bot.logger.info("Plugins reloaded.", PLUGIN_DISPLAY_NAME)
        })

        bot.on('core.command', function (message) {
            if (message == "reload") {
                bot.emit('core.reload')
            }
        })
    }

    registerEvent()
    loadPlugins()
    bot.logger.info("Loaded", PLUGIN_DISPLAY_NAME)

    //Expose plugin information
    return {
        name: PLUGIN_NAME,
        displayName: PLUGIN_DISPLAY_NAME,
        priority: PLUGIN_PRIORITY,
    }
}

module.exports = CommandManager