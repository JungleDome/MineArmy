const WorkerServer = require('./server/workerServer.js');
const Process = require('process');
const Config = require('./config.json')
const Bot = require('./bot/bot');

//// For minecraft client proxy
// Bot.CreateProxyBot({host: 'play.fallenskymc.com', port: 25565, version: '1.17.1'});

// For web server control bot
// var bots = Bot.CreateBot({
//     host: 'play.blockstackers.xyz',
//     username: 'Ethanord2lm',
//     offlinePassword: 'sasasa',
//     port: 25565,
//     version: '1.17.1',
// });
WorkerServer.CreateConnection(`${Config.coreServerIp}:${Config.coreServerPort}/`);
//var done = (function wait() { if (!done) setTimeout(wait, 1000) })();
// let viewerPort = 3001;
// bots.forEach(function (bot) {
//     BotViewer.CreateViewer(bot, viewerPort);
//     viewerPort++;
// });
//BotViewer._DebugPathFinder(bot);




Process.on('unhandledRejection', function (err) {
    console.warn(err);
    //Process.exit(1);
});
//     .on('uncaughtException', err => {
//     bot.logger.warn(err);
// });
