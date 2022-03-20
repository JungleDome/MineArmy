const Util = require("./mineflayer-util.js");
const mcData = require("minecraft-data")('1.17.1');
const { Vec3 } = require('vec3');

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var Miner = (bot, options) => {
    bot.logger.info("Miner loaded");

    registerEvent();

    const durabilityLimit = 20;
    let startInfiniteDig = false;
    let mineBlockPosition;
    let equipPickaxe;

    function registerEvent() {
        registerInfiniteDigging();
        bot.eventManager.registerEvent('helper.command', async function (command, commandPlayerName) {
            try {
                if (command == "mine here") {
                    // check miner has block
                    let mineBlock = checkPlayerLookingAt(commandPlayerName);
                    if (mineBlock == null) {
                        bot.logger.error('Miner cannot find block. Possible that bot may not load chunk correctly, please relog to try again.');
                        return;
                    }
                    bot.logger.info(mineBlock.position);
                        
                    mineBlockPosition = mineBlock.position;
                    equipPickaxe = mcData.itemsByName.diamond_pickaxe;
                    bot.equip(equipPickaxe);
                    bot.setQuickBarSlot(0);
                    
                    // start digging
                    bot.logger.info("start dig");
                    startInfiniteDig = true;
                    bot.dig(mineBlock)

                } else if (command == "mine stop") {
                    startInfiniteDig = false;
                } else if (command == "walk 1") {
                    bot.setControlState('back', true)
                    setTimeout(() => bot.setControlState('back', false), 500, bot);
                } else if (command.startsWith("mine ")) {
                    let parsedCommand = command.replace("mine ", "");
                    let positions = parsedCommand.split(",");

                    bot.logger.info(positions);
                    mineBlockPosition = new Vec3(parseInt(positions[0]), parseInt(positions[1]), parseInt(positions[2]));
                    let equipPickaxe = mcData.itemsByName.diamond_pickaxe;
                    bot.equip(equipPickaxe);
                    bot.setQuickBarSlot(0);
                    bot.logger.info("start dig");
                    startInfiniteDig = true;
                    bot.logger.info(mineBlockPosition);
                    bot.logger.info(bot.world.getBlock(mineBlockPosition));
                    bot.logger.info(bot.world.getSkyLight(mineBlockPosition));
                    //bot.logger.info(bot.world.getColumns());
                    //await startInfiniteDigging(bot, mineBlockPosition, equipPickaxe);
                    // bot.on('helper_workaround_diggingCompleted', function () {
                    //     if (startInfiniteDig)
                    //         startInfiniteDigging(bot, mineBlockPosition, equipPickaxe);
                    // })
                }
            } catch (err) {
                bot.logger.info(err);
            }
        });
    }

    function registerInfiniteDigging() {
        bot.on("helper_workaround_diggingCompleted", function (block) {
            //bot.logger.info(block);
            if (startInfiniteDig) {
                // check miner holding pickaxe
                if (bot.heldItem?.name != 'diamond_pickaxe') {
                    bot.logger.error(`Miner not holding pickaxe. Current holding: ${bot.heldItem?.name}`);
                    startInfiniteDig = false;
                }
                // check miner pickaxe durability
                if (checkDurabilityLeft(equipPickaxe, bot.heldItem) < durabilityLimit) {
                    bot.logger.error(`Miner pickaxe has low durability. Durability left: ${checkDurabilityLeft(equipPickaxe, bot.heldItem)}`);
                    startInfiniteDig = false;
                }
                let miningBlock = bot.world.getBlock(mineBlockPosition);
                Util.retryOperation(bot.world.getBlock(mineBlockPosition))
                while (miningBlock == null)
                    miningBlock = bot.world.getBlock(mineBlockPosition);
                bot.dig(miningBlock);
            }
        });
    }

    function checkDurabilityLeft(mcDataItem, item) {
        //bot.logger.warn(`Max durability: ${mcDataItem.maxDurability}, Used: ${item.durabilityUsed}, Durability left: ${mcDataItem.maxDurability - item?.durabilityUsed}`);
        return mcDataItem.maxDurability - item?.durabilityUsed;
    }

    function getViewDirection(pitch, yaw) {
        const csPitch = Math.cos(pitch)
        const snPitch = Math.sin(pitch)
        const csYaw = Math.cos(yaw)
        const snYaw = Math.sin(yaw)
        return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
    }

    function checkPlayerLookingAt(playerName) {
        try {
            let block;
            Object.values(bot.entities).forEach(entity => {
                if (entity.type == 'player' && entity.username == playerName) {
                    const maxDistance = 256;
                    const eyePosition = entity.position.offset(0, entity.height, 0);
                    const viewDirection = getViewDirection(entity.pitch, entity.yaw);
                    block = bot.world.raycast(eyePosition, viewDirection, maxDistance, (i) => i.name != "air");
                    return;
                }
            });
            return block;
        } catch (err) {
            bot.logger.info(err);
        }

        return;
    }
}

module.exports = Miner;