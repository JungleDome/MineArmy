const Util = require("./mineflayer-util.js");

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Login = (bot, options) => {
    bot.logger.info("Login loaded");

    registerEvent();

    function registerEvent() {
        bot.eventManager.registerEvent('strippedMessage', async function (strippedMessage) {
            if (strippedMessage) {
                if (strippedMessage.includes("/register")) {
                    bot.chat(`/register ${bot.helperConfig.offlinePassword} ${bot.helperConfig.offlinePassword}`);
                } else if (strippedMessage.includes("/login")) {
                    bot.chat(`/login ${bot.helperConfig.offlinePassword}`);
                } else if (strippedMessage.includes("Successful login")) {
                    bot.logger.info("Logged in");
                } else if (strippedMessage.includes("Successfully registered")) {
                    bot.logger.info("Registered");
                } else if (strippedMessage.includes("Welcome to Skyblock")) {
                    bot.logger.info("Connected to skyblock");
                }
            }
        });
    }
}

module.exports = Login;