const PluginHelper = require("./pluginHelper.js")
const Enum = require("../bot/enum.js")

/**
 *
 *
 * @param {import("../index.js").Bot} bot
 */
var Essential = (bot) => {

    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Essential"
    const PLUGIN_NAME = "essential"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.CRITICAL

    let commandEvent = {
        "essential.quit": () => {
            bot.logger.info("Received quit command, goodbye.",)
            bot.logger.info("Exiting...")
            bot.quit()
            process.exit()
        }
    }

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        //Listen for player message
        bot.eventManager.registerEvent('message', (message) => {
            if (message && PluginHelper.stripTextFormat(message.toString())) {
                var strippedMessage = PluginHelper.stripTextFormat(message.toString())
                bot.logger.info(strippedMessage)
                bot.eventManager.triggerEvent('bot.strippedMessage', strippedMessage)
            }
        })

        bot.commandManager.registerCommand(['quit'], x => {
            bot.eventManager.triggerEvent("essential.quit")
        })
        bot.commandManager.registerCommand(['say'], x => {
            bot.chat(x)
        })

        //Listen for mineflayer event
        bot.eventManager.registerEvent('error', (err) => {
            bot.logger.error(err, PLUGIN_DISPLAY_NAME)
            bot.eventManager.triggerEvent("bot.rejoin")
        })

        bot.eventManager.registerEvent('login', () => {
            bot.logger.info("Joined game", PLUGIN_DISPLAY_NAME)
        })

        bot.eventManager.registerEvent('death', () => {
            bot.logger.info("I'm dead", PLUGIN_DISPLAY_NAME)
        })

        bot.eventManager.registerEvent('kicked', (reason) => {
            bot.logger.info(`Kicked - ${reason}`, PLUGIN_DISPLAY_NAME)
            if (reason.text == "[Proxy] Proxy restarting.")
                bot.eventManager.triggerEvent("bot.rejoin")
        })
    }

    registerEvent()
    bot.logger.info("Loaded", PLUGIN_DISPLAY_NAME)

    //Expose plugin information
    return {
        name: PLUGIN_NAME,
        displayName: PLUGIN_DISPLAY_NAME,
        priority: PLUGIN_PRIORITY,
    }
}

module.exports = Essential