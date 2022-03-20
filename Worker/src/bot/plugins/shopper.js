const Util = require("./mineflayer-util.js");
/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Shopper = (bot, options) => {
    bot.logger.info("Shopper loaded");

    registerEvent();

    function registerEvent() {
        //shopSell
        bot.eventManager.registerEvent('helper.shopper.shopSell', async function (items) {
            try {
                bot.currentWindow ? bot.closeWindow(bot.currentWindow) : null;
                await Util.wait(300);
                bot.chat("/shop");
                bot.logger.debug("Say /shop");
                bot.eventManager.registerEventOnce("windowOpen", async function (window) {
                    try {
                        function navigateNestedWindow(item) {
                            return new Promise((resolve, reject) => {
                                try {
                                    let _item = item;
                                    let slot;
                                    let clickMode = 0;
                                    let clickButton = 0;
                                    if (typeof (item) === "object") {
                                        _item = item.id;
                                        clickMode = item.clickMode ?? 0;
                                        clickButton = item.clickButton ?? 0;
                                    }
                                    if (_item) {
                                        let windowItem = bot.currentWindow.findContainerItem(_item)
                                        if (windowItem == null) {
                                            reject("Shopper unable to find this item. " + _item);
                                            return;
                                        }
                                        bot.logger.info(windowItem);
                                        slot = windowItem.slot;
                                    } else {
                                        slot = item.slot;
                                    }
                                    bot.logger.debug("Slot:" +slot + ", btn:" + clickButton + ", mode:" + clickMode);
                                    bot.clickWindow(slot, clickButton, clickMode, () => {
                                        bot.eventManager.registerEventOnce("windowOpen", function () { resolve() });
                                    });
                                    setTimeout(function () {
                                        reject("Timeout waiting");
                                    }, 3000);
                                } catch (error) {
                                    reject(error);
                                }
                            });
                        }
                        if (Array.isArray(items)) {
                            var shopItem = items.pop();
                            items.push({ id: shopItem, clickMode: 0, clickButton: 1 });
                            items.push({ slot: 40, clickMode: 0, clickButton: 1 });
                            bot.logger.info(items);
                            for (const item of items) {
                                await Util.retryOperation(navigateNestedWindow, 3000, 3, item);
                            }
                            bot.logger.info("Done selling");
                            bot.eventManager.triggerEvent("helper.shopper.shopSellDone");
                        }
                        bot.currentWindow ? bot.closeWindow(bot.currentWindow) : null;
                    } catch (err) {
                        bot.logger.error(err);
                    }
                });
            } catch (err) {
                bot.logger.error(err);
            }
        });
        bot.eventManager.registerEvent("windowOpen", function () { bot.logger.info("Trigger window open event...."); });

        bot.eventManager.registerEvent('helper.command', function (command) {
            if (command == "shopper sell cactus") {
                bot.eventManager.triggerEvent('helper.shopper.shopSell', [bot.mcData.itemsByName["wheat"].id, bot.mcData.itemsByName["cactus"].id]);
            } else if (command == "shopper sell nether_wart") {
                bot.eventManager.triggerEvent('helper.shopper.shopSell', [bot.mcData.itemsByName["wheat"].id, bot.mcData.itemsByName["nether_wart"].id]);
            }
        });
    }
}

module.exports = Shopper;