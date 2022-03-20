const SimpleNodeLogger = require('simple-node-logger');
const Conf = require('conf');

const logger = SimpleNodeLogger.createSimpleLogger;

// Wrapper for conf storing api
const ConfInstance = new Conf();
const ConfWrapper = (botUsername) => {
    function getTransformedName(name) {
        return `bot.${botUsername}.${name}`;
    }
    
    return {
        instance: ConfInstance,
        botUsername: botUsername,
        set: (name, value) => {
            ConfInstance.set(getTransformedName(name), value);
        },
        get: (name) => {
            return ConfInstance.get(getTransformedName(name));
        },
    }
};

module.exports = {
    Logger: logger,
    DataStore: ConfWrapper
}