const PluginHelper = require("../helper/pluginHelper.js")
const { Movements, goals: { GoalNear, GoalNearXZ } } = require('mineflayer-pathfinder')
const Vec3 = require("Vec3")
const Enum = require("../lib/enum.js")

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 * @param {*} options
 */
var ServerHelper = (bot, options) => {

    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Server Helper"
    const PLUGIN_NAME = "serverHelper"
    const COMMAND = {
        Ping: "/ping"
    }
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.CRITICAL


    let commandEvent = {
        "serverHelper.ping": async () => {
            bot.eventManager.registerEventOnce("message", () => {
                bot.eventManager.triggerEvent("serverHelper.pingDone")
            })
            bot.chat(COMMAND.Ping)
        },
        "serverHelper.walkAround": async () => {
            bot.setControlState("forward", true)
            await PluginHelper.wait("1000")
            bot.setControlState("forward", false)
            await PluginHelper.wait("300")
            bot.setControlState("back", true)
            await PluginHelper.wait("1000")
            bot.setControlState("back", false)
            bot.eventManager.triggerEvent("serverHelper.walkAroundDone")
        },
        "serverHelper.goToPlayer": async (playerName) => {
            const target = bot.players[playerName]?.entity
            if (!target) {
                bot.logger.error("I don't see you !", PLUGIN_DISPLAY_NAME)
                return
            }
            const { x: playerX, y: playerY, z: playerZ } = target.position

            bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
            bot.eventManager.triggerEvent("serverHelper.goToPlayerDone")
        },
    }

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        bot.eventManager.registerEvent('bot.command', function (command, commandName) {
            if (command == 'helper ping') {
                bot.eventManager.triggerEvent("serverHelper.ping")
                bot.eventManager.registerEventOnce("serverHelper.pingDone", () => {
                    bot.logger.info("Pong", PLUGIN_DISPLAY_NAME)
                })
            } else if (command == 'helper walkAround') {
                bot.eventManager.triggerEvent("serverHelper.walkAround")
                bot.eventManager.registerEventOnce("serverHelper.walkAroundDone", () => {
                    bot.logger.info("Walk around done", PLUGIN_DISPLAY_NAME)
                })
            } else if (command.startsWith('helper goto ')) {
                bot.eventManager.triggerEvent("serverHelper.goToPlayer", command.replace('helper goto ', ''))
                bot.eventManager.registerEventOnce("serverHelper.goToPlayerDone", () => {
                    bot.logger.info("Reached player", PLUGIN_DISPLAY_NAME)
                })
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
    }
}

module.exports = ServerHelper