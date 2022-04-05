var io
var socketContext
var state

let events = [
    {
        name: 'worker.botCreated',
        fnHandler: (botDetails) => {
            socketContext.to("controlPanel").emit('controlPanel.botCreated', botDetails)
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
            socketContext.to("controlPanel").emit('controlPanel.stateUpdated', state)
        }
    },
    {
        name: 'disconnect',
        fnHandler: () => {
            state.worker.connected = false
            socketContext.to("controlPanel").emit('controlPanel.stateUpdated', state)
        }
    },
]


module.exports = (_io, _socketContext, _state) => {
    io = _io
    socketContext = _socketContext
    state = _state
    return {
        events: events
    }
}