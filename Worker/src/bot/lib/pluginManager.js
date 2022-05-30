const EventEmitter = require('events')
const Enum = require("./enum.js")
const FileSystem = require("fs")
const { resolve } = require('path');
const { readdir } = require('fs').promises;

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 */
var PluginManager = (bot) => {
    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Plugin Manager"
    const PLUGIN_NAME = "pluginManager"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.CRITICAL
    let isPluginLoaded = false

    async function getFiles(dir) {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }

    async function loadPlugins() {
        //Dynamically import user plugin here
        let files = await getFiles('./src/plugins')
        let pluginPath = files.filter((file) => {
            return file.endsWith('.js')
        })

        if (isPluginLoaded) {
            bot.logger.info("---------------Removing old plugins-------------")
            pluginPath.forEach(x => {
                delete require.cache[require.resolve(x)]
            })
        }
        
        bot.logger.info("---------------Loading plugins-------------")
        pluginPath.forEach(x => {
            bot.loadPlugin(require(x))
        })
        bot.logger.info("---------------Plugins loaded-------------")

        isPluginLoaded = true
    }

    //TODO: Remove below if can relaod from essential plugin
    function registerEvent() {
        bot.on('bot.serverCommand', function (message) {
            if (message && Util.stripTextFormat(message.toString())) {
                var serverCommand = Util.stripTextFormat(message.toString())
                bot.logger.info(serverCommand, PLUGIN_DISPLAY_NAME)
                //bot.emit('bot.command', serverCommand, bot.bot.config.masterPlayerName)
            }
        })

        bot.on('bot.reload', async function (message) {
            await loadPlugins()
            bot.logger.info("Plugins reloaded.", PLUGIN_DISPLAY_NAME)
        })

        bot.on('bot.command', function (message) {
            if (message == "reload") {
                bot.emit('bot.reload')
            }
        })
    }

    try {
        registerEvent()
        loadPlugins()
    } catch (err) {
        bot.emit('bot.error', err);
    }

    bot.logger.info("Loaded", PLUGIN_DISPLAY_NAME)

    //Expose plugin information
    return {
        name: PLUGIN_NAME,
        displayName: PLUGIN_DISPLAY_NAME,
        priority: PLUGIN_PRIORITY,
        load: loadPlugins
    }
}

module.exports = PluginManager