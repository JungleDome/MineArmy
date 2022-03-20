const Util = require("./mineflayer-util.js");
const { Movements, goals: { GoalNear, GoalNearXZ } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3');
const BuilderLogic = require("../../lib/builder/index");

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Builder = (bot, options) => {
    bot.logger.info("builder loaded");

    let botStartSeller = false;
    let checkInterval = 5000;
    let sellCount = 0;
    let startTime = new Date();
    let buildSchematic = {};
    let materialChests = [];
    const BuilderLogic2 = BuilderLogic(bot.version);
    let _builderLogic = {
        instance: null,
        get builderLogic() {
            if (!this.instance)
                this.instance = new BuilderLogic2(bot, bot.world, bot.viewer);
            return this.instance;
        }
    }
    let builderLogic = _builderLogic.builderLogic;
    // for region selection
    let startingBlock, endingBlock;

    let commandEvent = {
        "helper.builder.stop": () => {
            var duration = new Date().getTime() - startTime.getTime();
            bot.logger.info("builder stopping");
            bot.logger.info(`builder sold ${sellCount} times in ${getDurationDisplayString(duration)}.`);
            sellCount = 0;
            botStartSeller = false;
        },
        "helper.builder.start": () => {
            bot.logger.info(`builder start.`);
            sellCount = 0;
            startTime = new Date();
            botStartSeller = true;
            bot.eventManager.triggerEvent("helper.builder.checkInventory");
        },
        "helper.builder.stats": () => {
            var duration = new Date().getTime() - startTime.getTime();
            bot.logger.info(`builder sold ${sellCount} times in ${getDurationDisplayString(duration)}.`);
            bot.logger.info(`builder average time per sold: ${getDurationDisplayString(duration / sellCount)}.`);
        },
        "helper.builder.plot": () => {
            // if (buildSchematic) {
            //     const path = [bot.entity.position.offset(10, 10, 2), bot.entity.position.offset(12, 12, 4)]
            //     bot.viewer.drawBoxGrid('path', path[0], path[1], 0xff00ff)
            //     bot.logger.info(`builder grid displayed`);
            // }
            // let gridEnd = builderLogic.selectedRegion.size.clone().abs();
            //gridEnd.y = Math.abs(gridEnd.y);
            // bot.viewer.drawBoxGrid('build2', bot.entity.position, bot.entity.position.plus(gridEnd), 0xff00ff)
            //     const path = [bot.entity.position.offset(10, 10, 2), bot.entity.position.offset(12, 12, 4)]
            //     bot.viewer.drawBoxGrid('path', path[0], path[1], 0xff00ff)
            if (builderLogic.displaySelectionGrid(bot.entity.position))
                bot.logger.info(`builder grid displayed`);
        },
        "helper.builder.setPos": () => {
            bot.logger.info("Set starting position");
            bot.eventManager.registerEventOnce("blockBreakProgressObserved", async (block) => {
                if (block) {
                    startingBlock = block;
                    bot.logger.info('Starting position set');
                    bot.logger.info("Set ending position");
                    await Util.wait(1000);
                    bot.eventManager.registerEventOnce("blockBreakProgressObserved", (block2) => {
                        if (block2) {
                            endingBlock = block2;
                            bot.logger.info('Ending position set');
                            bot.logger.info("Enter command 'builder confirm' to confirm");
                        } else {
                            bot.logger.info('Invalid ending position');
                        }
                    });
                } else {
                    bot.logger.info('Invalid starting position');
                }
            });
        },
        "helper.builder.confirmPos": async () => {
            bot.logger.info("Saving selected region");
            try {
                await builderLogic.setSelectionRegion(startingBlock.position, endingBlock.position);
                bot.logger.info(startingBlock.position);
                bot.logger.info(endingBlock.position);
                bot.logger.info(builderLogic.selectedRegion);
                await builderLogic.saveSelectionRegion(bot.entity.position);
                bot.logger.info("Done save selected region");
            } catch (err) {
                bot.logger.error(err);
            }
        },
        "helper.builder.loadPos": async () => {
            bot.logger.info("Loading selected region");
            try {
                bot.logger.info(builderLogic.world == null ? "a" : "b");
                bot.logger.info(builderLogic.viewer == null ? "a" : "b");
                await builderLogic.loadSelectionRegion();
                bot.logger.info("Done load selected region");
            } catch (err) {
                bot.logger.error(err);
            }
        },
        "helper.builder.assignMaterialChest": () => {
            bot.logger.info("Start assigning material chest");
            bot.eventManager.registerEventOnce("blockBreakProgressObserved", (block) => {
                if (block && block.type == bot.mcData.blocksByName["chest"].id) {
                    materialChests.push(block);
                    bot.logger.info('Material chest register complete');
                } else {
                    bot.logger.info('Invalid material chest');
                }
            });
        },
        "helper.builder.listMaterial": async () => {
            let builderMaterials = builderLogic.listMaterial();
            let materials = Object.keys(builderMaterials).map(item => {
                return {
                    id: item,
                    displayName: bot.mcData.blocks[item],
                    count: builderMaterials[item]
                };
            });
            bot.logger.info(materials);
        },
    }

    let logicEvent = {
        "helper.builder.searchMaterialChest": async (material) => {
            bot.logger.info(material);
            for (let chestBlock of materialChests) {
                await bot.pathfinder.goto(new GoalNear(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z, 2));
                let chest = await bot.openContainer(chestBlock);
                let chestMaterial = chest.findContainerItem(material.id);
                if (chestMaterial) {
                    try {
                        await chest.withdraw(chestMaterial.type, null, 64);
                        bot.logger.info(`withdrew ${64} ${chestMaterial.name}`)
                        break;
                    } catch (err) {
                        bot.logger.warn(`unable to withdraw ${64} ${chestMaterial.name}`)
                        bot.logger.warn(`${err}`)
                    }
                }
            }
        },
        "helper.builder.checkInventory": async () => {
            if (bot.inventory.emptySlotCount() == 0) {
                //bot.chat("/compact");
                //await Util.wait(2000);
                bot.eventManager.triggerEvent("helper.builder.sellInventory");
            }
            else {
                await Util.wait(checkInterval);
                bot.eventManager.triggerEvent("helper.builder.repeatAction");
            }
        },
        "helper.builder.startBuild": async () => {
            bot.chat("/sell all");
            sellCount++;
            await Util.wait(500);
            bot.eventManager.triggerEvent("helper.builder.repeatAction");
        },
        "helper.builder.navigateToPos": async (destination) => {
            bot.creative.startFlying();
            bot.creative.flyTo(destination);
            bot.logger.info('Done navigating');
            bot.eventManager.triggerEvent("helper.builder.doneNavigateToPos");
        },
        "helper.builder.repeatAction": async () => {
            if (botStartSeller)
                bot.eventManager.triggerEvent("helper.builder.checkInventory");
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
                bot.logger.info(message);
                if (message != "") {
                    var strippedMessage = Util.stripTextFormat(message.toString());
                    builderLogic = _builderLogic.builderLogic; //manually load builder logic
                    if (strippedMessage == "builder start") {
                        bot.eventManager.triggerEvent("helper.builder.start");
                    } else if (strippedMessage == "builder stop") {
                        bot.eventManager.triggerEvent("helper.builder.stop");
                    } else if (strippedMessage == "builder stats") {
                        bot.eventManager.triggerEvent("helper.builder.stats");
                    } else if (strippedMessage == "builder plot") {
                        bot.eventManager.triggerEvent("helper.builder.plot");
                    } else if (strippedMessage == "builder assignChest") {
                        bot.eventManager.triggerEvent("helper.builder.assignMaterialChest");
                    } else if (strippedMessage == "builder getMaterial") {
                        bot.eventManager.triggerEvent("helper.builder.searchMaterialChest", bot.mcData.itemsByName['cobblestone']);
                    } else if (strippedMessage == "builder navPos") {
                        bot.eventManager.triggerEvent("helper.builder.navigateToPos", bot.entity.position.offset(2,4,2));
                    } else if (strippedMessage == "builder doneNavPos") {
                        bot.creative.stopFlying();
                    } else if (strippedMessage == "builder setPos") {
                        bot.eventManager.triggerEvent("helper.builder.setPos");
                    } else if (strippedMessage == "builder confirm") {
                        bot.eventManager.triggerEvent("helper.builder.confirmPos");
                    } else if (strippedMessage == "builder loadPos") {
                        bot.eventManager.triggerEvent("helper.builder.loadPos");
                    } else if (strippedMessage == "builder listMat") {
                        bot.eventManager.triggerEvent("helper.builder.listMaterial");
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

module.exports = Builder;