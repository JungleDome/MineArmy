let history = []
var io
var socketContext
var state

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
            io.of("/").to("controlPanel").emit('controlPanel.stateUpdated', state)
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