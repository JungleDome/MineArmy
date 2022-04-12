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
var Basic = (bot, options) => {

    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Basic"
    const PLUGIN_NAME = "basic"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.MEDIUM


    let commandEvent = {
        "basic.goToPos": async (x, y, z) => {
            await bot.pathfinder.goto(new GoalNear(x, y, z, 1))
            bot.eventManager.triggerEvent("basic.goToPosDone")
        },
    }

    function registerEvent() {
        for (const [event, func] of Object.entries(commandEvent)) {
            bot.eventManager.registerEvent(event, func)
        }

        bot.commandManager.registerCommand(['go', 'to'], function (pos) {
            if (Array.isArray(pos) && pos.length == 3) {
                bot.eventManager.triggerEvent("basic.goToPos", ...pos);
                bot.eventManager.registerEventOnce("basic.goToPosDone", () => {
                    bot.logger.info("Reached position.", PLUGIN_DISPLAY_NAME)
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

module.exports = Basic