const EventManager = (bot) => {
    let events = [];
    return {

        triggerEvent: (name, ...options) => {
            //bot.logger.info('Trigger event ', name);
            bot.emit(name, ...options);
        },

        registerEvent: (name, callback) => {
            events.push({ name: name, callback: callback });
            bot.on(name, callback);
        },

        registerEventOnce: (name, callback) => {
            events.push({ name: name, callback: callback });
            bot.once(name, callback);
        },

        clearRegisteredEvent: () => {
            return new Promise((resolve) => {
                var event = events.shift();
                while (event != undefined) {
                    bot.removeListener(event.name, event.callback);
                    event = events.shift();
                }
                resolve();
            });
        }
    }
}

module.exports = EventManager