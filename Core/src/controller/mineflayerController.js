let events = [
    {
        name: 'bot.create',
        fnHandler: (socket, ip, port, username, password, offlinePassword) => {
            socket.to("worker").emit('bot.create', {
                serverIP: ip,
                serverPort: port ? port : 25565,
                username: username,
                password: password,
                offlinePassword: offlinePassword
            })
        }
    }, {
        name: 'test',
        fnHandler: () => {
            console.log('test event')
        }
    }
]


module.exports = {
    events: events
}