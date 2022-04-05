const Enum = require("../bot/enum.js")


/**
 *
 *
 * @param {import("../index.js").Bot} bot
 * @param {*} options
 */
var Login = (bot, options) => {
    const PLUGIN_DISPLAY_NAME = "Login"
    const PLUGIN_NAME = "login"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.CRITICAL
    const COMMAND = {
        Register: "/register {0} {0}",
        Login: "/login {0}",
        ConnectSkyblock: "/server skyblock"
    }

    function registerEvent() {
        bot.eventManager.registerEvent('core.strippedMessage', async function (strippedMessage) {
            if (strippedMessage.includes("/register")) {
                bot.chat(COMMAND.Register.formatUnicorn(bot.core.config.offlinePassword))
                bot.logger.info("Trying to register", PLUGIN_DISPLAY_NAME)
            } else if (strippedMessage.includes("/login")) {
                bot.chat(COMMAND.Login.formatUnicorn(bot.core.config.offlinePassword))
                bot.logger.info("Trying to login", PLUGIN_DISPLAY_NAME)
            } else if (strippedMessage.includes("Successful login")) {
                bot.logger.info("Logged in", PLUGIN_DISPLAY_NAME)
                // change this if you want to connect to other server
                //bot.chat(Command.ConnectSkyblock)
            } else if (strippedMessage.includes("Successfully registered")) {
                bot.logger.info("Registered successful", PLUGIN_DISPLAY_NAME)
            } else if (strippedMessage.includes("Welcome to Skyblock")) {
                bot.logger.info("Connected to skyblock", PLUGIN_DISPLAY_NAME)
            }
        })
    }

    registerEvent()
    bot.logger.info("Loaded", PLUGIN_DISPLAY_NAME)

    //Expose plugin information
    return {
        name: PLUGIN_NAME,
        displayName: PLUGIN_DISPLAY_NAME,
        priority: PLUGIN_PRIORITY
    }
}

module.exports = Login