var io
var socketContext
var state

let events = [
    {
        name: 'controlPanel.createBot',
        fnHandler: (botDetails) => {
            socketContext.to("worker").emit('worker.createBot', {
                serverIP: botDetails.serverIP,
                serverPort: parseInt(botDetails.serverPort),
                serverVersion: botDetails.serverVersion,
                username: botDetails.username,
                password: botDetails.password,
                offlinePassword: botDetails.offlinePassword
            })
        }
    },
    {
        name: 'controlPanel.commandBot',
        fnHandler: (botDetails) => {
            socketContext.to("worker").emit('worker.command', {
                serverIP: botDetails.serverIP,
                serverPort: parseInt(botDetails.serverPort),
                serverVersion: botDetails.serverVersion,
                username: botDetails.username,
                password: botDetails.password,
                offlinePassword: botDetails.offlinePassword
            })
        }
    },
    {
        name: 'test',
        fnHandler: () => {
            console.log('test event')
        }
    }, {
        name: 'mineflayer.test',
        fnHandler: () => {
            console.log("Sending command to worker")
            socketContext.to("worker").emit('worker.test')
        }
    }
]


module.exports = (_io, _socketContext, _state) => {
    io = _io
    socketContext = _socketContext
    state = _state
    return {
        events: events
    }
}