const Enum = require("./enum.js")

/**
 *
 *
 * @param {import("../../index.js").Bot} bot
 */
var CommandManager = (bot) => {
    //Plugin information
    const PLUGIN_DISPLAY_NAME = "Command Manager"
    const PLUGIN_NAME = "commandManager"
    const PLUGIN_PRIORITY = Enum.PLUGIN_PRIORITY.CRITICAL

    let commands = {}
    /**
     * Register plugin's listening command
     * @param commandPath {Array} Navigation of command path. Example: plugin command1 = ["plugin", "command1"]
     * @param callback {Function} Callback when the command is called.
     */
    function registerCommand(commandPath, callback) {
        if (!Array.isArray(commandPath))
            bot.logger.error(`Unable to register command '${commandPath}'. Argument must be array.`, PLUGIN_DISPLAY_NAME)

        let traversalCommands = commands
        for (const [i, x] of commandPath.entries()) {
            if (traversalCommands[x] && (i == commandPath.length - 1 || typeof (traversalCommands[x]) === 'function')) {
                bot.logger.error(`Unable to register command '${commandPath}'. Command already registered.`, PLUGIN_DISPLAY_NAME)
                break
            } else if (traversalCommands[x]) {
                traversalCommands = traversalCommands[x]
            } else if (!traversalCommands[x]) {
                if (i == commandPath.length - 1) {
                    traversalCommands[x] = callback
                }
                else {
                    traversalCommands[x] = {}
                    traversalCommands = traversalCommands[x]
                }
            }
        }
    }

    function runCommand(message) {
        let commandRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+/g
        let args = message.match(commandRegex)

        let traversalCommand = commands
        for (const [i, x] of args.entries()) {
            if (traversalCommand[x] && typeof (traversalCommand[x]) === 'function') {
                traversalCommand[x](args.slice(i + 1))
                break
            }
            else if (traversalCommand[x])
                traversalCommand = traversalCommand[x]
            else {
                bot.logger.error(`Unknown command.`, PLUGIN_DISPLAY_NAME)

            }
        }
    }

    bot.logger.info("Loaded", PLUGIN_DISPLAY_NAME)

    //Expose plugin information
    return {
        name: PLUGIN_NAME,
        displayName: PLUGIN_DISPLAY_NAME,
        priority: PLUGIN_PRIORITY,
        registerCommand: registerCommand,
        runCommand: runCommand
    }
}

module.exports = CommandManager