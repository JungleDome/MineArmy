module.exports = ({ eventManager, state } = {}) => {
    let history = []
    let events = [
        {
            name: 'controlPanel.test',
            fnHandler: (message) => {
                //Save history
                console.log(message)
            }
        },
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