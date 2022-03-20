const { Vec3 } = require('vec3');

function getViewDirection(pitch, yaw) {
    const csPitch = Math.cos(pitch)
    const snPitch = Math.sin(pitch)
    const csYaw = Math.cos(yaw)
    const snYaw = Math.sin(yaw)
    return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
}

let checkPlayerLookingAt = function (bot, playerName) {
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

module.exports = {
    /**
     *
     *	Strip minecraft color & styling symbol
     * @param {String} text
     * @returns {String} Stripped text
     */
    stripTextFormat: (text) => {
        return text.replace(/§./g, "");
    },


    /**
     *
     *
     * @param {String} text1
     * @param {String} text2
     * @returns {Boolean} 
     */
    compareIgnoreCase: (text1, text2) => {
        return text1.toUpperCase() === text2.toUpperCase();
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
                        .catch(reject);
                }
                return reject(reason);
            });
    }),



    raycastLookAtBlock: (entity) => {
        function getViewDirection(pitch, yaw) {
            const csPitch = Math.cos(pitch)
            const snPitch = Math.sin(pitch)
            const csYaw = Math.cos(yaw)
            const snYaw = Math.sin(yaw)
            return new Vec3(-snYaw * csPitch, snPitch, -csYaw * csPitch)
        }

        function checkPlayerLookingAt(entity) {
            let block;
            const maxDistance = 256;
            const eyePosition = entity.position.offset(0, entity.height, 0);
            const viewDirection = getViewDirection(entity.pitch, entity.yaw);
            block = bot.world.raycast(eyePosition, viewDirection, maxDistance, (i) => i.name != "air");
            return block;
        }

        return checkPlayerLookingAt(entity);
    },

    /**
     *
     *
     * @param {import('../..').Bot} bot
     * @param {string} eventName
     * @param {number} [timeout=3000]
     * @returns
     */
    awaitEvent: (bot, eventName, timeout = 3000) => {
        return new Promise((resolve, reject) => {
            bot.eventManager.registerEventOnce(eventName, () => { resolve() });
            setTimeout(() => { reject("Timeout") }, timeout);
        })
    },

    checkPlayerLookingAt: checkPlayerLookingAt,
}