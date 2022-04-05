const PluginHelper = require("./pluginHelper.js")
const Enum = require("../bot/enum.js")

/**
 *
 *
 * @param {import("../index.js").Bot} bot
 * @param {*} options
 */
var AfkSeller = (bot, options) => {


    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Afk Seller"
    const PLUGIN_NAME = "afkSeller"
    const COMMAND = {
        SellAll: "/sell all",
        TeleportLastLocation: "/back"
    }
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.LOW
    const PLUGIN_ACTION_START_EVENT_NAME = "afkSeller.start"
    const PLUGIN_ACTION_STOP_EVENT_NAME = "afkSeller.stop"
    let botStartSeller = false

    //Plugin configuration
    let checkInterval = 1000
    let sellInterval = 10000
    let sellCount = 0
    let startTime = new Date()
    let lastIntervalSellTime = new Date()
    let registerAdminMitigationAction = false


    let commandEvent = {
        "afkSeller.stop": () => {
            var duration = new Date().getTime() - startTime.getTime()
            bot.logger.info("Stopped", PLUGIN_DISPLAY_NAME)
            bot.eventManager.triggerEvent("afkSeller.stats")
            sellCount = 0
            botStartSeller = false
        },
        "afkSeller.start": () => {
            bot.logger.info(`Started`, PLUGIN_DISPLAY_NAME)
            sellCount = 0
            startTime = new Date()
            lastIntervalSellTime = new Date()
            botStartSeller = true
            if (!registerAdminMitigationAction) {
                bot.eventManager.triggerEvent("afkSeller.registerAfkChatReply")
                bot.eventManager.triggerEvent("afkSeller.registerAfkLocationChanged")
                registerAdminMitigationAction = true
            }
            bot.eventManager.triggerEvent("afkSeller.checkInventory")
        },
        "afkSeller.stats": () => {
            var duration = new Date().getTime() - startTime.getTime()
            bot.logger.info(`Sold ${sellCount} times in ${PluginHelper.getDurationDisplayString(duration)}.`, PLUGIN_DISPLAY_NAME)
            bot.logger.info(`Average time per sold: ${PluginHelper.getDurationDisplayString(duration / sellCount)}.`, PLUGIN_DISPLAY_NAME)
        },
    }

    let logicEvent = {
        "afkSeller.checkInventory": async () => {
            if (bot.inventory.emptySlotCount() == 0) {
                bot.eventManager.triggerEvent("afkSeller.sellInventory")
            }
            else {
                bot.eventManager.triggerEvent("afkSeller.checkInterval")
            }
        },
        "afkSeller.checkInterval": async () => {
            var duration = new Date().getTime() - lastIntervalSellTime.getTime()
            if (duration >= sellInterval) {
                bot.eventManager.triggerEvent("afkSeller.sellInventory")
            }
            else {
                await Util.wait(checkInterval)
                bot.eventManager.triggerEvent("afkSeller.repeatAction")
            }
        },
        "afkSeller.sellInventory": async () => {
            bot.chat(COMMAND.SellAll)
            sellCount++
            lastIntervalSellTime = new Date() //reset interval time check
            await Util.wait(500)
            bot.eventManager.triggerEvent("afkSeller.repeatAction")
        },
        "afkSeller.repeatAction": async () => {
            if (botStartSeller)
                bot.eventManager.triggerEvent("afkSeller.checkInventory")
        },
        "afkSeller.registerAfkChatReply": async () => {
            bot.eventManager.registerEvent("whisper", async (username, message) => {
                bot.logger.info(username, message, botStartSeller, PLUGIN_DISPLAY_NAME)
                //Auto reply to avoid admin checking
                if (botStartSeller) {
                    if (username != 'me') {
                        if (message.replace(/\s/g, "").toLowerCase() == "uthere?") {
                            await Util.wait(2300)
                            bot.chat('/r yeah')
                        } else if (message.replace(/\s/g, "").toLowerCase() == "hi") {
                            await Util.wait(2300)
                            bot.chat('/r hi')
                        }
                    }
                }
            })
        },
        "afkSeller.registerAfkLocationChanged": async () => {
            let movedBack = false
            bot.eventManager.registerEvent("forcedMove", async () => {
                if (botStartSeller && !movedBack) {
                    await Util.wait(1600)
                    bot.chat(COMMAND.TeleportLastLocation)
                    movedBack = true
                    await Util.wait(10000)
                    movedBack = false
                }
            })
        },
    }

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        for (const [event, func] of Object.entries(logicEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        bot.eventManager.registerEvent('bot.command', async function (message, commandPlayerName) {
            try {
                if (message == "afkSeller start") {
                    bot.eventManager.triggerEvent("afkSeller.start")
                } else if (message == "afkSeller stop") {
                    bot.eventManager.triggerEvent("afkSeller.stop")
                } else if (message == "afkSeller stats") {
                    bot.eventManager.triggerEvent("afkSeller.stats")
                }
            } catch (error) {
                bot.logger.error(error, PLUGIN_DISPLAY_NAME)
            }
        })
    }

    registerEvent()
    bot.logger.info("Loaded", PLUGIN_DISPLAY_NAME)

    //Expose plugin information
    return {
        name: PLUGIN_NAME,
        displayName: PLUGIN_DISPLAY_NAME,
        priority: PLUGIN_PRIORITY,
        startEventName: PLUGIN_ACTION_START_EVENT_NAME,
        stopEventName: PLUGIN_ACTION_STOP_EVENT_NAME
    }
}

module.exports = AfkSeller