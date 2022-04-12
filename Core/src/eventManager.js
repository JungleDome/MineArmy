var EventEmitter = require('events');

module.exports = (io, socketContext) => {
    return {
        io,
        socketContext,
        emitToControlPanel: (...args) => {
            io.of("/").to("controlPanel").emit(...args)
        },
        emitToWorker: (...args) => {
            io.of("/").to("worker").emit(...args)
        }
    }
}