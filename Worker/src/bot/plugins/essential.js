const Util = require("./mineflayer-util.js");

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 */
var Essential = (bot) => {
    console.log("Essential loaded");
 
    bindEvents(bot);
    
    function quit() {
        bot.logger.info("Exiting...");
        bot.quit();
        process.exit();
    }

    function bindEvents(bot) {
        //Register your plugins here
        bot.logger.info("---------------Removing old plugins-------------");
        delete require.cache[require.resolve("./login.js")];
        delete require.cache[require.resolve("./miner.js")];
        delete require.cache[require.resolve("./farmer.js")];
        delete require.cache[require.resolve("./shopper.js")];
        delete require.cache[require.resolve("./serverHelper.js")];
        delete require.cache[require.resolve("./afkSeller.js")];
        delete require.cache[require.resolve("./builder.js")];
        delete require.cache[require.resolve("../../lib/builder/index")];
        delete require.cache[require.resolve("./mineflayer-util.js")];
        bot.logger.info("---------------Loading plugins-------------");
        bot.loadPlugins([
            require("./login.js"),
            require("./miner.js"),
            require("./farmer.js"),
            require("./shopper.js"),
            require("./serverHelper.js"),
            require("./afkSeller.js"),
            require("./builder.js"),
        ]);
        bot.logger.info("---------------Plugins loaded-------------");

        registerEvent();
    }


    function registerEvent() {
        bot.eventManager.registerEvent('message', function (message) {
            if (message != "") {
                var strippedMessage = Util.stripTextFormat(message.toString());
                
                bot.logger.info(strippedMessage);
                bot.eventManager.triggerEvent('strippedMessage', strippedMessage);
            }
        });

        bot.eventManager.registerEvent('helper_webserver_message', function (message) {
            if (message != "") {
                var strippedMessage = Util.stripTextFormat(message.toString());
                bot.logger.info(strippedMessage);
                bot.eventManager.triggerEvent('helper.command', strippedMessage, bot.helperConfig.masterPlayerName);
            }
        });

        bot.eventManager.registerEvent('helper.command', function (command) {
            if (command == "quit") {
                bot.logger.info("Received quit command, goodbye.");
                quit();
            } else if (command == "reload") {
                bot.eventManager.triggerEvent('helper.reload');
            } else if (command.startsWith("say ")) {
                bot.chat(command.replace("say ", ""));
            }
        });
    }
}

module.exports = Essential;