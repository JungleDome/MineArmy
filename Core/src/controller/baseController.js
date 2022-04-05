let state = require('../state/index')

let controlPanelController = [
    require('./controlPanel/mineflayerController'),
    require('./controlPanel/controlPanelController')
]

let workerController = [
    require('./worker/workerController'),
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
    controlPanelController.forEach(x => {
        registerSocketEvent(socketContext, x(socketContext).events)
    })
}

let registerSubControllerEvent = function (io, socketContext, type) {
    if (type == 0) {
        controlPanelController.forEach(x => {
            registerSocketEvent(socketContext, x(io, socketContext, state).events)
        })
    } else if (type == 1) {
        workerController.forEach(x => {
            registerSocketEvent(socketContext, x(io, socketContext, state).events)
        })
    }
}


module.exports = {
    registerAllControllerEvent: registerAllControllerEvent,
    registerSocketEvent: registerSocketEvent,
    registerBaseControllerEvent: registerBaseControllerEvent,
    registerSubControllerEvent: registerSubControllerEvent,
}