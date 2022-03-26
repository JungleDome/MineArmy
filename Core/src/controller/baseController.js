let registeredController = [
    require('./mineflayerController'),
    require('./controlPanelController')
]

let registerBaseControllerEvent = function (socketContext) {
    socketContext.on('join', (roomName) => {
        socketContext.join(roomName)
    })
}

let registerSocketEvent = function (socketContext, events) {
    events.forEach(x => {
        socketContext.on(x.name, x.fnHandler, socketContext)
    })
}

let registerAllControllerEvent = function (socketContext) {
    registerBaseControllerEvent(socketContext)
    registeredController.forEach(x => {
        registerSocketEvent(socketContext, x(socketContext).events)
    })
}

let registerSubControllerEvent = function (socketContext) {
    registeredController.forEach(x => {
        registerSocketEvent(socketContext, x(socketContext).events)
    })
}


module.exports = {
    registerAllControllerEvent: registerAllControllerEvent,
    registerSocketEvent: registerSocketEvent,
    registerBaseControllerEvent: registerBaseControllerEvent,
    registerSubControllerEvent: registerSubControllerEvent,
}