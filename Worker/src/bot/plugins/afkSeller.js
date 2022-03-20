const Util = require("./mineflayer-util.js");
const { Movements, goals: { GoalNear, GoalNearXZ } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3');
const mineflayerUtil = require("./mineflayer-util.js");

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Farmer = (bot, options) => {
    bot.logger.info("afkSeller loaded");

    let botStartSeller = false;
    let checkInterval = 1000;
    let sellInterval = 10000;
    let sellCount = 0;
    let startTime = new Date();
    let lastIntervalSellTime = new Date();
    let triggerRegisterListener = false;


    let commandEvent = {
        "helper.afkSeller.stop": () => {
            var duration = new Date().getTime() - startTime.getTime();
            bot.logger.info("[AfkSeller] stopping");
            bot.eventManager.triggerEvent("helper.afkSeller.stats");
            sellCount = 0;
            botStartSeller = false;
        },
        "helper.afkSeller.start": () => {
            bot.logger.info(`[AfkSeller] start.`);
            sellCount = 0;
            startTime = new Date();
            lastIntervalSellTime = new Date();
            botStartSeller = true;
            if (!triggerRegisterListener) {
                bot.eventManager.triggerEvent("helper.afkSeller.registerAfkChatReply");
                bot.eventManager.triggerEvent("helper.afkSeller.registerAfkLocationChanged");
                triggerRegisterListener = true;
            }
            bot.eventManager.triggerEvent("helper.afkSeller.checkInventory");
        },
        "helper.afkSeller.stats": () => {
            var duration = new Date().getTime() - startTime.getTime();
            bot.logger.info(`[AfkSeller] sold ${sellCount} times in ${getDurationDisplayString(duration)}.`);
            bot.logger.info(`[AfkSeller] average time per sold: ${getDurationDisplayString(duration / sellCount)}.`);
        },
    }

    let logicEvent = {
        "helper.afkSeller.checkInventory": async () => {
            if (bot.inventory.emptySlotCount() == 0) {
                bot.eventManager.triggerEvent("helper.afkSeller.sellInventory");
            }
            else {
                bot.eventManager.triggerEvent("helper.afkSeller.checkInterval");
            }
        },
        "helper.afkSeller.checkInterval": async () => {
            var duration = new Date().getTime() - lastIntervalSellTime.getTime();
            if (duration >= sellInterval) {
                bot.eventManager.triggerEvent("helper.afkSeller.sellInventory");
            }
            else {
                await Util.wait(checkInterval);
                bot.eventManager.triggerEvent("helper.afkSeller.repeatAction");
            }
        },
        "helper.afkSeller.sellInventory": async () => {
            bot.chat("/sell all");
            sellCount++;
            lastIntervalSellTime = new Date(); //reset interval time check
            await Util.wait(500);
            bot.eventManager.triggerEvent("helper.afkSeller.repeatAction");
        },
        "helper.afkSeller.repeatAction": async () => {
            if (botStartSeller)
                bot.eventManager.triggerEvent("helper.afkSeller.checkInventory");
        },
        "helper.afkSeller.registerAfkChatReply": async () => {
            bot.eventManager.registerEvent("whisper", async (username, message) => {
                bot.logger.info(username, message, botStartSeller);
                //Auto reply to avoid admin checking
                if (botStartSeller) {
                    if (username != 'me') {
                        if (message.replace(/\s/g, "").toLowerCase() == "uthere?") {
                            await Util.wait(2300);
                            bot.chat('/r yeah');
                        } else if (message.replace(/\s/g, "").toLowerCase() == "oi") {
                            await Util.wait(2300);
                            bot.chat('/r apa');
                        } else if (message.replace(/\s/g, "").toLowerCase() == "hi") {
                            await Util.wait(2300);
                            bot.chat('/r hi');
                        }
                    }
                }
            });
        },
        "helper.afkSeller.registerAfkLocationChanged": async () => {
            let movedBack = false;
            bot.eventManager.registerEvent("forcedMove", async () => {
                if (botStartSeller && !movedBack) {
                    await Util.wait(1600);
                    bot.chat('/back');
                    movedBack = true;
                    await Util.wait(10000);
                    movedBack = false;
                }
            });
        },
    }

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func);
        }

        for (const [event, func] of Object.entries(logicEvent)) {
            bot.eventManager.registerEvent(event, func);
        }

        bot.eventManager.registerEvent('helper.command', async function (message, commandPlayerName) {
            try {
                if (message != "") {
                    var strippedMessage = Util.stripTextFormat(message.toString());
                    if (strippedMessage == "afkSeller start") {
                        bot.eventManager.triggerEvent("helper.afkSeller.start");
                    } else if (strippedMessage == "afkSeller stop") {
                        bot.eventManager.triggerEvent("helper.afkSeller.stop");
                    } else if (strippedMessage == "afkSeller stats") {
                        bot.eventManager.triggerEvent("helper.afkSeller.stats");
                    }
                }
            } catch (error) {
                bot.logger.error(error);
            }
        });
    }

    function getDurationDisplayString(milliseconds) {
        var msec = milliseconds;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        msec -= ss * 1000;

        return (hh + ":" + mm + ":" + ss);
    }

    registerEvent();
}

module.exports = Farmer;