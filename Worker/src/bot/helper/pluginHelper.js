module.exports = {
    /**
     *
     *	Strip minecraft color & styling symbol
     * @param {String} text
     * @returns {String} Stripped text
     */
    stripTextFormat: (text) => {
        return text.replace(/§./g, "")
    },


    /**
     * @param {String} text1
     * @param {String} text2
     * @returns {Boolean} 
     */
    compareIgnoreCase: (text1, text2) => {
        return text1.toUpperCase() === text2.toUpperCase()
    },

    wait: ms => new Promise(r => setTimeout(r, ms)),

    retryOperation: (operation, delay, retries, ...context) => new Promise((resolve, reject) => {
        return operation(...context)
            .then(resolve)
            .catch((reason) => {
                if (retries > 0) {
                    return module.exports.wait(delay)
                        .then(module.exports.retryOperation.bind(null, operation, delay, retries - 1, ...context))
                        .then(resolve)
                        .catch(reject)
                }
                return reject(reason)
            })
    }),

    /**
     *
     *
     * @param {import('../..').Bot} bot
     * @param {string} eventName
     * @param {number} [timeout=3000]
     * @returns Event promise
     */
    awaitEvent: (bot, eventName, timeout = 3000) => {
        return new Promise((resolve, reject) => {
            bot.eventManager.registerEventOnce(eventName, () => { resolve() })
            setTimeout(() => { reject("Timeout") }, timeout)
        })
    },

    /**
     * @param {number} milliseconds
     * @returns Formatted time string
     */
    getDurationDisplayString: (milliseconds) => {
        var msec = milliseconds
        var hh = Math.floor(msec / 1000 / 60 / 60)
        msec -= hh * 1000 * 60 * 60
        var mm = Math.floor(msec / 1000 / 60)
        msec -= mm * 1000 * 60
        var ss = Math.floor(msec / 1000)
        msec -= ss * 1000

        return (hh + ":" + mm + ":" + ss)
    }
}