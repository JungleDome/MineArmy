const SimpleNodeLogger = require('simple-node-logger');

const Logger = (bot) => {
    return SimpleNodeLogger.createSimpleLogger({
        writer: function (text) {
            console.log(text);
            bot.core.chatLog.push(text);
            if (bot.core.chatLog.length > 100) {
                for (let i = bot.core.chatLog.length; i > 200; i--) {
                    bot.core.chatLog.shift();
                }
            }
        }
    })
}


module.exports = Logger