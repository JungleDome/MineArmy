const { v4: uuidv4 } = require('uuid');
module.exports = ({ eventManager, state } = {}) => {
    let events = [
        {
            name: 'controlPanel.queryBot',
            fnHandler: (uuid) => {
                eventManager.emitToWorker('worker.queryStatus', uuid)
            }
        },
        {
            name: 'controlPanel.createBot',
            fnHandler: (botDetails) => {
                eventManager.emitToWorker('worker.createBot', {
                    uuid: uuidv4(),
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
            fnHandler: (uuid, commandMessage) => {
                eventManager.emitToWorker('worker.command', uuid, commandMessage)
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
                eventManager.emitToWorker('worker.test')
            }
        }
    ]

    return {
        events
    }
}