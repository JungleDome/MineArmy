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
    bot.logger.info("Farmer loaded");

    const RANGE_GOAL = 1;
    let area1, area2;
    let botStartFarming = false;
    let farmableBlock = [];
    farmableBlock.push({ farmTile: bot.mcData.blocksByName["soul_sand"], farmItem: "nether_wart", harvestMetadata: 3 })
    let currentFarming;
    let currentHarvestBlock;


    let commandEvent = {
        "helper.farmer.setArea1": (pos) => {
            area1 = pos
        },
        "helper.farmer.setArea2": (pos) => {
            area2 = pos
        },
        "helper.farmer.clearArea": () => {
            area1 = null
            area2 = null
        },
        "helper.farmer.stop": () => {
            bot.logger.info("Farmer stopping");
            botStartFarming = false;
        },
        "helper.farmer.start": () => {
            bot.logger.info(`Farm area: ${JSON.stringify(area1)}, ${JSON.stringify(area2)}`);
            botStartFarming = true;
            currentFarming = farmableBlock[0];
            bot.eventManager.triggerEvent("helper.farmer.saveSession");
            bot.eventManager.triggerEvent("helper.farmer.goToArea1");
        },
        "helper.farmer.cleanup": () => {
            botStartFarming = false;
            currentFarming = null;
            currentHarvestBlock = null;
            bot.logger.info("Farmer stopped");
        },
        "helper.farmer.resume": () => {
            let loadArea1 = bot.dataStore.get("farmer.area1");
            let loadArea2 = bot.dataStore.get("farmer.area2");
            if (!loadArea1 || !loadArea2) {
                bot.logger.error("No previous session saved");
                return;
            }
            bot.eventManager.triggerEvent("helper.farmer.setArea1", loadArea1);
            bot.eventManager.triggerEvent("helper.farmer.setArea2", loadArea2);
            bot.eventManager.triggerEvent("helper.farmer.start");
        },
        "helper.farmer.saveSession": () => {
            bot.dataStore.set("farmer.area1", area1);
            bot.dataStore.set("farmer.area2", area2);
            bot.logger.info("Farmer session saved");
        },
    }

    let logicEvent = {
        "helper.farmer.goToArea1": async () => {
            await bot.pathfinder.goto(new GoalNear(area1.x, area1.y, area1.z, RANGE_GOAL));
            bot.eventManager.triggerEvent("helper.farmer.findHarvestableBlock");
        },
        "helper.farmer.findHarvestableBlock": async () => {
            currentHarvestBlock = bot.findBlock({
                matching: function (block) {
                    return block && block.type == bot.mcData.blocksByName[currentFarming.farmItem].id && block.metadata == currentFarming.harvestMetadata;
                }, useExtraInfo: (block) => {
                    return checkPositionWithin(block.position, area1, area2);
                }
            })

            if (currentHarvestBlock != null) {
                bot.eventManager.triggerEvent("helper.farmer.goToHarvestableBlock");
            }
            else {
                setTimeout(() => {
                    bot.eventManager.triggerEvent("helper.farmer.repeatAction");
                }, 3000)
            }
        },
        "helper.farmer.goToHarvestableBlock": async () => {
            await bot.pathfinder.goto(new GoalNearXZ(currentHarvestBlock.position.x, currentHarvestBlock.position.z, RANGE_GOAL)).catch((err) => bot.logger.warn(err));
            bot.eventManager.triggerEvent("helper.farmer.equipHarvestTool");
        },
        "helper.farmer.equipHarvestTool": async () => {
            await bot.equip(bot.mcData.itemsByName['diamond_hoe'].id, "hand").catch((err) => bot.logger.warn(err));
            bot.eventManager.triggerEvent("helper.farmer.breakHarvestableBlock");
        },
        "helper.farmer.breakHarvestableBlock": async () => {
            await bot.dig(currentHarvestBlock).catch((err) => bot.logger.warn(err));
            bot.eventManager.triggerEvent("helper.farmer.plantHarvestable", currentHarvestBlock, currentFarming);
        },
        "helper.farmer.plantHarvestable": async (blockToPlant, farmingDetail) => {
            const blockBelow = bot.blockAt(blockToPlant.position.offset(0, -1, 0))
            await bot.equip(bot.mcData.itemsByName[farmingDetail.farmItem].id, "hand").catch((err) => bot.logger.warn(err));
            try {
                await bot.placeBlock(blockBelow, new Vec3(0, 1, 0)).catch(async (err) => {
                    if (err.message.includes("timeout")) {
                        await mineflayerUtil.awaitEvent(bot, "helper.serverHelper.pingDone", 10000);
                        bot.eventManager.triggerEvent("helper.serverHelper.ping");
                    }
                    else if (err.message != 'No block has been placed : the block is still air') {
                        bot.logger.warn(err.message)
                    }
                });
            } catch (err) {
                bot.logger.error(err);
            }
            bot.eventManager.triggerEvent("helper.farmer.pickupItem");
        },
        "helper.farmer.pickupItem": async () => {
            await Util.wait(300);
            bot.eventManager.triggerEvent("helper.farmer.checkInventory");
        },
        "helper.farmer.checkInventory": async () => {
            if (bot.inventory.emptySlotCount() == 0)
                bot.eventManager.triggerEvent("helper.farmer.sellInventory");
            else
                bot.eventManager.triggerEvent("helper.farmer.repeatAction");
        },
        "helper.farmer.sellInventory": async () => {
            bot.eventManager.triggerEvent('helper.shopper.shopSell', [bot.mcData.itemsByName["wheat"].id, bot.mcData.itemsByName[currentFarming.farmItem].id]);
            await Util.awaitEvent(bot, "helper.shopper.shopSellDone", 60000).catch((err) => bot.logger.warn(err));
            bot.eventManager.triggerEvent("helper.farmer.repeatAction");
        },
        "helper.farmer.repeatAction": async () => {
            if (botStartFarming)
                bot.eventManager.triggerEvent("helper.farmer.findHarvestableBlock");
            else
                bot.eventManager.triggerEvent("helper.farmer.cleanup");
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
                    if (strippedMessage == "farmer area 1") {
                        let startingPosition = Util.checkPlayerLookingAt(bot, commandPlayerName)?.position;
                        if (startingPosition == null) {
                            bot.logger.error("Selection block is not found. Maybe the chunk is not loaded?");
                        }
                        else {
                            bot.logger.info("Farmer area 1 set." + startingPosition);
                            bot.eventManager.triggerEvent("helper.farmer.setArea1", startingPosition);
                        }
                    } else if (strippedMessage == "farmer area 2") {
                        let endingPosition = Util.checkPlayerLookingAt(bot, commandPlayerName)?.position;
                        if (endingPosition == null) {
                            bot.logger.error("Selection block is not found. Maybe the chunk is not loaded?");
                        }
                        else {
                            bot.logger.info("Farmer area 2 set." + endingPosition);
                            bot.eventManager.triggerEvent("helper.farmer.setArea2", endingPosition);
                        }
                    } else if (strippedMessage == "farmer area clear") {
                        area1 = null;
                        area2 = null;
                        bot.logger.info("Farmer area cleared.");
                    } else if (strippedMessage == "farmer start") {
                        if (!area1 || !area2) {
                            bot.logger.error("Please select an area to start farming");
                            return;
                        }
                        bot.eventManager.triggerEvent("helper.farmer.start");

                    } else if (strippedMessage == "farmer stop") {
                        bot.eventManager.triggerEvent("helper.farmer.stop");
                    } else if (strippedMessage == "farmer resume") {
                        bot.eventManager.triggerEvent("helper.farmer.resume");
                    }
                }
            } catch (error) {
                bot.logger.error(error);
            }
        });
    }

    function checkPositionWithin(pos, startingPos, endingPos) {
        let xWithin = Math.min(startingPos.x, endingPos.x) <= pos.x && pos.x <= Math.max(startingPos.x, endingPos.x);
        let yWithin = Math.min(startingPos.y, endingPos.y) <= pos.y && pos.y <= Math.max(startingPos.y, endingPos.y);
        let zWithin = Math.min(startingPos.z, endingPos.z) <= pos.z && pos.z <= Math.max(startingPos.z, endingPos.z);
        return xWithin && yWithin && zWithin;
    }

    registerEvent();
}

module.exports = Farmer;