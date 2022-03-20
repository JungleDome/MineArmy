const EventEmitter = require('events');

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 */
var CommandManager = (bot) => {
    console.log("Command manager loaded");
 
    bindEvents(bot);
    registerWrapper();
    registerEvent();
    registerBasic();

    async function reloadCommand() {
        bot.logger.info("Reloading essential plugin...");
        delete require.cache[require.resolve("./essential.js")];
        
        bot.eventNames().forEach(function (eventName) {
            if (eventName.startsWith("helper_workaround_"))
                bot.removeAllListeners(eventName);
        })
        bot.removeAllListeners("helper_webserver_message");
        await bot.eventManager.clearRegisteredEvent();

        bindEvents(bot);

        bot.logger.info("Plugin reloaded");
    }

    function bindEvents(bot) {
        bot.logger.info("Loading essential plugin...");
        bot.loadPlugins([
            require("./essential.js"),
        ]);
        bot.logger.info("Essential plugin loaded");
    }


    function registerEvent() {
        bot.on('helper.reload', async function (message) {
            await reloadCommand();
        });
    }

    function registerWrapper() {
        //wrapper bypass for reloading remove listener issue
        bot.on('diggingCompleted', function (block) {
            bot.emit('helper_workaround_diggingCompleted', block);
        });

        bot.on('webserver_message', function (message) {
            bot.emit('helper_webserver_message', message);
        });
    }

    function registerBasic() {
        bot.on('error', (err) => {
            bot.logger.info(err);
            bot.logger.info("error");
            bot.emit("helper.rejoin");
        });

        bot.on('login', function () {
            bot.logger.info("[JOINED]");
        });

        bot.on('death', function () {
            bot.logger.info("[DEAD]");
            bot.chat('/is go');
        });

        bot.on('kicked', function (reason) {
            bot.logger.info("[KICKED]:", reason);
            if (reason.text == "[Proxy] Proxy restarting.")
                bot.emit("helper.rejoin");
        });
    }
}

module.exports = CommandManager;