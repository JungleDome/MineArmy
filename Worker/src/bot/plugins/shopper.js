const PluginHelper = require("../helper/pluginHelper.js")
const Enum = require("../lib/enum.js")
/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Shopper = (bot, options) => {
    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Shopper"
    const PLUGIN_NAME = "shopper"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.LOW
    const COMMAND = {
        OpenShop: "/shop",
    }
    
    let commandEvent = {
        "shopper.shopSell": async (items) => {
            try {
                bot.currentWindow ? bot.closeWindow(bot.currentWindow) : null
                await PluginHelper.wait(300)
                bot.chat(COMMAND.OpenShop)
                bot.logger.debug("Say /shop", PLUGIN_DISPLAY_NAME)
                bot.eventManager.registerEventOnce("windowOpen", async function (window) {
                    try {
                        function navigateNestedWindow(item) {
                            return new Promise((resolve, reject) => {
                                try {
                                    let _item = item
                                    let slot
                                    let clickMode = 0
                                    let clickButton = 0
                                    if (typeof (item) === "object") {
                                        _item = item.id
                                        clickMode = item.clickMode ?? 0
                                        clickButton = item.clickButton ?? 0
                                    }
                                    if (_item) {
                                        let windowItem = bot.currentWindow.findContainerItem(_item)
                                        if (windowItem == null) {
                                            reject("Shopper unable to find this item. " + _item)
                                            return
                                        }
                                        bot.logger.info(windowItem, PLUGIN_DISPLAY_NAME)
                                        slot = windowItem.slot
                                    } else {
                                        slot = item.slot
                                    }
                                    bot.logger.debug("Slot:" + slot + ", btn:" + clickButton + ", mode:" + clickMode, PLUGIN_DISPLAY_NAME)
                                    bot.clickWindow(slot, clickButton, clickMode, () => {
                                        bot.eventManager.registerEventOnce("windowOpen", function () { resolve() })
                                    })
                                    setTimeout(function () {
                                        reject("Timeout waiting")
                                    }, 3000)
                                } catch (error) {
                                    reject(error)
                                }
                            })
                        }
                        if (Array.isArray(items)) {
                            var shopItem = items.pop()
                            items.push({ id: shopItem, clickMode: 0, clickButton: 1 })
                            items.push({ slot: 40, clickMode: 0, clickButton: 1 })
                            bot.logger.info(items, PLUGIN_DISPLAY_NAME)
                            for (const item of items) {
                                await PluginHelper.retryOperation(navigateNestedWindow, 3000, 3, item)
                            }
                            bot.logger.info("Done selling", PLUGIN_DISPLAY_NAME)
                            bot.eventManager.triggerEvent("shopper.shopSellDone")
                        }
                        bot.currentWindow ? bot.closeWindow(bot.currentWindow) : null
                    } catch (err) {
                        bot.logger.error(err, PLUGIN_DISPLAY_NAME)
                    }
                })
            } catch (err) {
                bot.logger.error(err, PLUGIN_DISPLAY_NAME)
            }
        }
    }

    let logicEvent = {
        "windowOpen": () => {
            bot.logger.info("Trigger window open event....", PLUGIN_DISPLAY_NAME)
        }
    }
    

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        for (const [event, func] of Object.entries(logicEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        bot.eventManager.registerEvent('bot.command', function (command) {
            if (command == "shopper sell cactus") {
                bot.eventManager.triggerEvent('shopper.shopSell', [bot.mcData.itemsByName["wheat"].id, bot.mcData.itemsByName["cactus"].id])
            } else if (command == "shopper sell nether_wart") {
                bot.eventManager.triggerEvent('shopper.shopSell', [bot.mcData.itemsByName["wheat"].id, bot.mcData.itemsByName["nether_wart"].id])
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

module.exports = Shopper