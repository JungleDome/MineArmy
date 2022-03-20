const WebServer = require('./webServer.js');
const Bot = require('./bot/bot.js');
const BotViewer = require('./bot/botViewer');
const Process = require('process');

//// For minecraft client proxy
// Bot.CreateProxyBot({host: 'play.fallenskymc.com', port: 25565, version: '1.17.1'});

// For web server control bot
//var bots = Bot.CreateBots();
WebServer.StartServer(3000);

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
