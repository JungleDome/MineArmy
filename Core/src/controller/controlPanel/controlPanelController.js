/**
 * @param {EventManager} eventManager
 * @param {State} state
 */
module.exports = ({ eventManager, state } = {}) => {
    let history = []
    let events = [
        {
            name: 'controlPanel.updateState',
            fnHandler: () => {
                eventManager.emitToControlPanel('controlPanel.stateUpdated', state)
            }
        },

    ]

    return {
        events
    }
}