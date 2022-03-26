var socketContext;

let events = [
    {
        name: 'cp.createBot',
        fnHandler: (botDetails) => {
            socketContext.to("worker").emit('bot.create', {
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


module.exports = (_socketContext) => {
    socketContext = _socketContext
    return {
        events: events
    }
}