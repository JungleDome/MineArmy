let registeredController = [
    require('./mineflayerController'),
    require('./controlPanelController')
]

let baseControllerEvent = function (socketContext) {
    socketContext.on('join', (roomName) => {
        socketContext.join(roomName)
    })
}

let registerSocketEvent = function (socketContext, events) {
    events.forEach(x => {
        socketContext.on(x.name, x.fnHandler)
    })
}

let registerAllControllerEvent = function (socketContext) {
    baseControllerEvent(socketContext)
    registeredController.forEach(x => {
        registerSocketEvent(socketContext, x.events)
    })
}


module.exports = {
    registerAllControllerEvent: registerAllControllerEvent,
    registerSocketEvent: registerSocketEvent
}