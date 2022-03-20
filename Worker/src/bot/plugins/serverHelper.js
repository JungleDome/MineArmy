const Util = require("./mineflayer-util.js");
const { Movements, goals: { GoalNear, GoalNearXZ } } = require('mineflayer-pathfinder')
const Vec3 = require("Vec3");

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var ServerHelper = (bot, options) => {
    bot.logger.info("Server helper loaded");

    
    let commandEvent = {
        "helper.serverHelper.ping": async () => {
            bot.eventManager.registerEventOnce("message", () => {
                bot.eventManager.triggerEvent("helper.serverHelper.pingDone");
            });
            bot.chat("/ping");
        },
        "helper.serverHelper.coop": async (username) => {
            bot.eventManager.registerEventOnce("message", () => {
                bot.eventManager.triggerEvent("helper.serverHelper.coopDone");
            });
            bot.chat("/is coop " + username);
        },
        "helper.serverHelper.alert": async () => {
            let lastKnownPlayerList = {
                hub: [],
                skyblock: [],
                classic: [],
                towny: [],
                vanilla: [],
                bedwars: []
            }
            bot.eventManager.registerEvent("strippedMessage", (message) => {
                if (message.startsWith("[hub]")) {
                    let players = message.substring(message.indexOf(":") + 1).trim().split(', ');
                    let a = lastKnownPlayerList.hub.filter(x => !players.includes(x));
                    lastKnownPlayerList.hub = players;
                }
            });
        },
        "helper.serverHelper.walkAround": async (username) => {
            bot.setControlState("forward", true);
            await Util.wait("1000");
            bot.setControlState("forward", false);
            await Util.wait("300");
            bot.setControlState("back", true);
            await Util.wait("1000");
            bot.setControlState("back", false);
        },
        "helper.serverHelper.dropAll": async () => {
            bot.inventory.items().forEach(async item => await bot.tossStack(item))
        },
        "helper.serverHelper.selectServer": async (itemName) => {
            try {
                bot.currentWindow ? bot.closeWindow(bot.currentWindow) : null;
                await Util.wait(300);
                bot.activateItem();
                bot.logger.info("Opened server selector");
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
                                            reject("Helper unable to find this item. " + _item);
                                            return;
                                        }
                                        //bot.logger.info(windowItem);
                                        slot = windowItem.slot;
                                    } else {
                                        slot = item.slot;
                                    }
                                    bot.logger.debug("Slot:" + slot + ", btn:" + clickButton + ", mode:" + clickMode);
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
                        if (itemName) {
                            var items = [];
                            var shopItem = bot.mcData.itemsByName[itemName].id;
                            items.push({ id: shopItem, clickMode: 0, clickButton: 1 });
                            bot.logger.info(items);
                            for (const item of items) {
                                await Util.retryOperation(navigateNestedWindow, 3000, 3, item);
                            }
                            bot.logger.info("Done selling");
                            bot.eventManager.triggerEvent("helper.serverHelper.selectServerDone");
                        }
                        bot.currentWindow ? bot.closeWindow(bot.currentWindow) : null;
                    } catch (err) {
                        bot.logger.error(err);
                    }
                });
            } catch (err) {
                bot.logger.error(err);
            }
        },
        "helper.serverHelper.goToPlayer": async (player) => {
            const target = bot.players[player]?.entity
            if (!target) {
                bot.logger.error("I don't see you !")
                return
            }
            const { x: playerX, y: playerY, z: playerZ } = target.position
            
            bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
            bot.eventManager.triggerEvent("helper.serverHelper.goToPlayer");
        },
    }
    
    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func);
        }

        bot.eventManager.registerEvent('helper.command', function (command, commandName) {
            if (command != "") {
                if (command == 'helper ping') {
                    bot.eventManager.registerEventOnce("helper.serverHelper.pingDone", () => {
                        bot.logger.info("Pong");
                    });
                    bot.eventManager.triggerEvent("helper.serverHelper.ping");
                } else if (command.startsWith('helper coop ')) {
                    bot.eventManager.triggerEvent("helper.serverHelper.coop", command.replace('helper coop ',''));
                    bot.eventManager.registerEventOnce("helper.serverHelper.coopDone", () => {
                        bot.logger.info("Coop done");
                    });
                } else if (command == 'helper alert') {
                    bot.chat('/glist all');
                    bot.eventManager.triggerEvent("helper.serverHelper.alert");
                } else if (command == 'helper walkAround') {
                    bot.eventManager.triggerEvent("helper.serverHelper.walkAround");
                } else if (command == 'helper dropAll') {
                    bot.eventManager.triggerEvent("helper.serverHelper.dropAll");
                } else if (command.startsWith('helper select')) {
                    bot.eventManager.triggerEvent("helper.serverHelper.selectServer", command.replace('helper select ', ''));
                } else if (command.startsWith('helper goTo')) {
                    bot.eventManager.triggerEvent("helper.serverHelper.goToPlayer", command.replace('helper goTo ', ''));
                }
            }
        });
    }

    function posInChunk(pos) {
        return new Vec3(Math.floor(pos.x / 16), Math.floor(pos.y), Math.floor(pos.z / 16))
    }

    registerEvent();
}

module.exports = ServerHelper;