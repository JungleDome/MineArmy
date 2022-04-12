let workerState = {
    connected: false,
    online: []
}

let controlPanelState = {
    connected: false
}

module.exports = {
    controlPanel: controlPanelState,
    worker: workerState
}