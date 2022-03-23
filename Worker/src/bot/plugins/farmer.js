const { Movements, goals: { GoalNear, GoalNearXZ } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')
const MineflayerUtil = require("./mineflayer-util.js")
const Enum = require("../enum.js")

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Farmer = (bot, options) => {
    //Plugin information
    const PLUGIN_DISPLAY_NAME = "AfkSeller"
    const PLUGIN_NAME = "afkSeller"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.LOW
    const PLUGIN_ACTION_START_EVENT_NAME = "farmer.start"
    const PLUGIN_ACTION_STOP_EVENT_NAME = "farmer.stop"

    let botStartFarming = false

    //Plugin configuration
    const RANGE_GOAL = 1
    let area1, area2
    let farmableBlock = []
    farmableBlock.push({ farmTile: bot.mcData.blocksByName["soul_sand"], farmItem: "nether_wart", harvestMetadata: 3 })
    let currentFarming
    let currentHarvestBlock


    let commandEvent = {
        "farmer.setArea1": (pos) => {
            area1 = pos
        },
        "farmer.setArea2": (pos) => {
            area2 = pos
        },
        "farmer.clearArea": () => {
            area1 = null
            area2 = null
        },
        "farmer.stop": () => {
            bot.logger.info("Stopping", PLUGIN_DISPLAY_NAME)
            botStartFarming = false
        },
        "farmer.start": () => {
            bot.logger.info(`Farm area: ${JSON.stringify(area1)}, ${JSON.stringify(area2)}`, PLUGIN_DISPLAY_NAME)
            botStartFarming = true
            currentFarming = farmableBlock[0]
            bot.eventManager.triggerEvent("farmer.saveSession")
            bot.eventManager.triggerEvent("farmer.goToArea1")
        },
        "farmer.cleanup": () => {
            currentFarming = null
            currentHarvestBlock = null
            bot.logger.info("Stopped", PLUGIN_DISPLAY_NAME)
        },
        "farmer.resume": () => {
            let loadArea1 = bot.dataStore.get("farmer.area1")
            let loadArea2 = bot.dataStore.get("farmer.area2")
            if (!loadArea1 || !loadArea2) {
                bot.logger.error("No previous session saved", PLUGIN_DISPLAY_NAME)
                return
            }
            bot.eventManager.triggerEvent("farmer.setArea1", loadArea1)
            bot.eventManager.triggerEvent("farmer.setArea2", loadArea2)
            bot.eventManager.triggerEvent("farmer.start")
        },
        "farmer.saveSession": () => {
            bot.dataStore.set("farmer.area1", area1)
            bot.dataStore.set("farmer.area2", area2)
            bot.logger.info("Session saved", PLUGIN_DISPLAY_NAME)
        },
    }

    let logicEvent = {
        "farmer.goToArea1": async () => {
            await bot.pathfinder.goto(new GoalNear(area1.x, area1.y, area1.z, RANGE_GOAL))
            bot.eventManager.triggerEvent("farmer.findHarvestableBlock")
        },
        "farmer.findHarvestableBlock": async () => {
            currentHarvestBlock = bot.findBlock({
                matching: function (block) {
                    return block && block.type == bot.mcData.blocksByName[currentFarming.farmItem].id && block.metadata == currentFarming.harvestMetadata
                }, useExtraInfo: (block) => {
                    return checkPositionWithin(block.position, area1, area2)
                }
            })

            if (currentHarvestBlock != null) {
                bot.eventManager.triggerEvent("farmer.goToHarvestableBlock")
            }
            else {
                setTimeout(() => {
                    bot.eventManager.triggerEvent("farmer.repeatAction")
                }, 3000)
            }
        },
        "farmer.goToHarvestableBlock": async () => {
            await bot.pathfinder.goto(new GoalNearXZ(currentHarvestBlock.position.x, currentHarvestBlock.position.z, RANGE_GOAL)).catch((err) => bot.logger.warn(err, PLUGIN_DISPLAY_NAME))
            bot.eventManager.triggerEvent("farmer.equipHarvestTool")
        },
        "farmer.equipHarvestTool": async () => {
            await bot.equip(bot.mcData.itemsByName['diamond_hoe'].id, "hand").catch((err) => bot.logger.warn(err, PLUGIN_DISPLAY_NAME))
            bot.eventManager.triggerEvent("farmer.breakHarvestableBlock")
        },
        "farmer.breakHarvestableBlock": async () => {
            await bot.dig(currentHarvestBlock).catch((err) => bot.logger.warn(err, PLUGIN_DISPLAY_NAME))
            bot.eventManager.triggerEvent("farmer.plantHarvestable", currentHarvestBlock, currentFarming)
        },
        "farmer.plantHarvestable": async (blockToPlant, farmingDetail) => {
            const blockBelow = bot.blockAt(blockToPlant.position.offset(0, -1, 0))
            await bot.equip(bot.mcData.itemsByName[farmingDetail.farmItem].id, "hand").catch((err) => bot.logger.warn(err, PLUGIN_DISPLAY_NAME))
            try {
                await bot.placeBlock(blockBelow, new Vec3(0, 1, 0)).catch(async (err) => {
                    if (err.message.includes("timeout")) {
                        bot.eventManager.triggerEvent("serverHelper.ping")
                        await MineflayerUtil.awaitEvent(bot, "serverHelper.pingDone", 10000)
                    }
                    else if (err.message != 'No block has been placed : the block is still air') {
                        bot.logger.warn(err.message, PLUGIN_DISPLAY_NAME)
                    }
                })
            } catch (err) {
                bot.logger.error(err, PLUGIN_DISPLAY_NAME)
            }
            bot.eventManager.triggerEvent("farmer.pickupItem")
        },
        "farmer.pickupItem": async () => {
            await Util.wait(300)
            bot.eventManager.triggerEvent("farmer.checkInventory")
        },
        "farmer.checkInventory": async () => {
            if (bot.inventory.emptySlotCount() == 0)
                bot.eventManager.triggerEvent("farmer.sellInventory")
            else
                bot.eventManager.triggerEvent("farmer.repeatAction")
        },
        "farmer.sellInventory": async () => {
            bot.eventManager.triggerEvent('shopper.shopSell', [bot.mcData.itemsByName["wheat"].id, bot.mcData.itemsByName[currentFarming.farmItem].id])
            await Util.awaitEvent(bot, "shopper.shopSellDone", 60000).catch((err) => bot.logger.warn(err, PLUGIN_DISPLAY_NAME))
            bot.eventManager.triggerEvent("farmer.repeatAction")
        },
        "farmer.repeatAction": async () => {
            if (botStartFarming)
                bot.eventManager.triggerEvent("farmer.findHarvestableBlock")
            else
                bot.eventManager.triggerEvent("farmer.cleanup")
        },
    }

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        for (const [event, func] of Object.entries(logicEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        bot.eventManager.registerEvent('core.command', async function (message, commandPlayerName) {
            try {
                if (message == "farmer area 1") {
                    let startingPosition = Util.checkPlayerLookingAt(bot, commandPlayerName)?.position
                    if (startingPosition == null) {
                        bot.logger.error("Selection block is not found. Maybe the chunk is not loaded?", PLUGIN_DISPLAY_NAME)
                    }
                    else {
                        bot.logger.info("Area 1 set." + startingPosition, PLUGIN_DISPLAY_NAME)
                        bot.eventManager.triggerEvent("farmer.setArea1", startingPosition)
                    }
                } else if (message == "farmer area 2") {
                    let endingPosition = Util.checkPlayerLookingAt(bot, commandPlayerName)?.position
                    if (endingPosition == null) {
                        bot.logger.error("Selection block is not found. Maybe the chunk is not loaded?", PLUGIN_DISPLAY_NAME)
                    }
                    else {
                        bot.logger.info("Area 2 set." + endingPosition, PLUGIN_DISPLAY_NAME)
                        bot.eventManager.triggerEvent("farmer.setArea2", endingPosition)
                    }
                } else if (message == "farmer area clear") {
                    area1 = null
                    area2 = null
                    bot.logger.info("Area cleared.", PLUGIN_DISPLAY_NAME)
                } else if (message == "farmer start") {
                    if (!area1 || !area2) {
                        bot.logger.error("Please select an area to start farming", PLUGIN_DISPLAY_NAME)
                        return
                    }
                    bot.eventManager.triggerEvent("farmer.start")

                } else if (message == "farmer stop") {
                    bot.eventManager.triggerEvent("farmer.stop")
                } else if (message == "farmer resume") {
                    bot.eventManager.triggerEvent("farmer.resume")
                }
            } catch (error) {
                bot.logger.error(error, PLUGIN_DISPLAY_NAME)
            }
        })
    }

    function checkPositionWithin(pos, startingPos, endingPos) {
        let xWithin = Math.min(startingPos.x, endingPos.x) <= pos.x && pos.x <= Math.max(startingPos.x, endingPos.x)
        let yWithin = Math.min(startingPos.y, endingPos.y) <= pos.y && pos.y <= Math.max(startingPos.y, endingPos.y)
        let zWithin = Math.min(startingPos.z, endingPos.z) <= pos.z && pos.z <= Math.max(startingPos.z, endingPos.z)
        return xWithin && yWithin && zWithin
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

module.exports = Farmer