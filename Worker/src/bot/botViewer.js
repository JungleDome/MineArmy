const MineflayerViewer = require('prismarine-viewer');
// const MineflayerViewer = require('./viewer');

let CreateViewer = function (bot, serverPort) {
    if (!bot)
        throw "No bot instance specified"
    
    bot.once('spawn', function () {
        MineflayerViewer.mineflayer(bot, {port: serverPort})
    })
}

//xyz = {x: 1.0, y:1.0, z:1.0}
let DrawPath = function (bot, xyz) {
    const path = [bot.entity.position.offset(0, 0.5, 0), xyz];
    bot.viewer.drawLine('path', path, 0xff00ff);
}

let _DebugPathFinder = function (bot) {
    bot.on('path_update', (r) => {
        const path = [bot.entity.position.offset(0, 0.5, 0)]
        for (const node of r.path) {
            path.push({ x: node.x, y: node.y + 0.5, z: node.z })
        }
        bot.viewer.drawLine('path', path, 0xff00ff)
    })
}


module.exports = {
    CreateViewer: CreateViewer,
    DrawPath: DrawPath,
    _DebugPathFinder: _DebugPathFinder
}