let State = require('../state/index')
let EventManager = require('../eventManager')

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

let registerSubControllerEvent = function (io, socketContext, type) {
    let eventManager = EventManager(io, socketContext)
    let registeringController = type == 0 ? controlPanelController : type == 1 ? workerController : []

    registeringController.forEach(x => {
        registerSocketEvent(socketContext, x({ eventManager: eventManager, state: State }).events)
    })
}


module.exports = {
    registerSocketEvent: registerSocketEvent,
    registerBaseControllerEvent: registerBaseControllerEvent,
    registerSubControllerEvent: registerSubControllerEvent,
}