const _ = require("lodash")
const botStateEnum = require("../../enum/botState")
module.exports = ({ eventManager, state } = {}) => {
    let events = [
        {
            name: 'worker.botCreated',
            fnHandler: (botDetails) => {
                state.worker.online.push({ details: botDetails, state: botStateEnum.STATUS.ONLINE })
                eventManager.emitToControlPanel('controlPanel.botCreated', botDetails)
            }
        },
        {
            name: 'worker.botError',
            fnHandler: (botUUID, errMessage) => {
                let bot = _.find(state.worker.online, x => x.details.uuid == botUUID)
                bot.state = botStateEnum.STATUS.ERROR
                eventManager.emitToControlPanel('controlPanel.botError', bot, errMessage)
            }
        },
        {
            name: 'worker.botDisconnected',
            fnHandler: (botUUID) => {
                let bot = _.find(state.worker.online, x => x.details.uuid == botUUID)
                bot.state = botStateEnum.STATUS.OFFLINE
                eventManager.emitToControlPanel('controlPanel.botDisconnected', bot, state.worker.online)
            }
        },
        {
            name: 'worker.queryStatusResponded',
            fnHandler: (bot) => {
                eventManager.emitToControlPanel('controlPanel.queryStatusResponded', bot)
            }
        },
        {
            name: 'worker.commandReceived',
            fnHandler: (botDetails) => {
                console.log('Worker command received.')
            }
        },
        {
            name: 'worker.test',
            fnHandler: () => {
                console.log('Worker replied test.')
            }
        },
        {
            name: 'worker.connected',
            fnHandler: () => {
                state.worker.connected = true
                eventManager.emitToControlPanel('controlPanel.stateUpdated', state)
            }
        },
        {
            name: 'disconnect',
            fnHandler: () => {
                state.worker.connected = false
                eventManager.emitToControlPanel('controlPanel.stateUpdated', state)
            }
        },
    ]

    return {
        events
    }
}