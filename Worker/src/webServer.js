const http = require("http")
const request = require("request")
const express = require("express")
const socketio = require("socket.io")
const util = require('util')

const MainController = require("./controller/mainController")

const onlineClients = new Set();

let _mineflayerBots;

function index(obj, is, value) {
    if (typeof is == 'string')
        return index(obj, is.split('.'), value);
    else if (is.length == 1 && value !== undefined)
        return obj[is[0]] = value;
    else if (is.length == 0)
        return obj;
    else
        return index(obj[is[0]], is.slice(1), value);
}

function stringifyWithoutCircular(item) {
    var cache = [];
    return JSON.stringify(item, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            // Duplicate reference found, discard key
            if (cache.includes(value)) return;

            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null;
}

function getBotByName(name) {
    return _mineflayerBots.filter(x => x.helper.config.username == name)[0];
}

function onNewWebsocketConnection(socket) {
    //console.info(`Socket ${socket.id} has connected.`);
    onlineClients.add(socket.id);

    socket.on("disconnect", () => {
        onlineClients.delete(socket.id);
        //console.info(`Socket ${socket.id} has disconnected.`);
    });


    socket.on("bot.create", (botDetails) => {
        MainController.CreateBot(botDetails)
    })

    //#region DEPRECATED
    socket.on("bot_list", (callback) => { callback(_mineflayerBots.map(x => x.helper.config.username ?? 'NULL')) });

    socket.on("message", (botUsername, message) => { if (getBotByName(botUsername)) getBotByName(botUsername).emit('webserver_message', message) });

    socket.on("bot_debug_info", (botUsername, botArg, callback) => {
        if (getBotByName(botUsername)) {
            try {
                callback({ bot: stringifyWithoutCircular(index(getBotByName(botUsername), botArg)) });
            } catch (err) {
                console.log(err);
            }
        }
    });

    socket.on("bot_debug_eval", (botUsername, botArg, evalArg, callback) => {
        if (getBotByName(botUsername)) {
            try {
                if (typeof (index(getBotByName(botUsername), botArg)) == 'function')
                    callback({ value: index(getBotByName(botUsername), botArg).apply(getBotByName(botUsername), evalArg) });
                else
                    callback({ value: "Invalid function given" });
            } catch (err) {
                console.log(err);
            }
        }
    });

    socket.on("bot_messages", (botUsername, callback) => {
        if (getBotByName(botUsername))
            callback({ messages: getBotByName(botUsername).chatLog });
    });
    //#endregion
}

function StartServer(port) {
    if (port == null) throw 'Web server port is needed.';

    const path = require('path')
    const compression = require('compression')
    const express = require('express')

    const app = express()
    const http = require('http').createServer(app)

    let prefix = ''

    const io = require('socket.io')(http, { path: prefix + '/socket.io' })

    function setupRoutes(app, prefix = '') {
        app.use(compression())
        app.use(prefix + '/', express.static(path.join(__dirname, '../web/public')))
    }
    setupRoutes(app, prefix)

    // const app = express();
    // const path = require("path");
    // //const favicon = require("serve-favicon")
    // //const engine = require("consolidate")
    // const server = http.createServer(app);
    // const io = socketio(server);
    // const compression = require("compression");

    // app.use(compression());

    // // set up router
    // const router = express.Router();

    // router.use(express.urlencoded({ extended: false }))
    // router.use(express.json())
    // router.use((req, res, next) => { // router middleware
    //     res.header("Access-Control-Allow-Origin", ORIGIN || "*");
    //     next();
    // });
    // // REGISTER ALL ROUTES -------------------------------
    // // all of the routes will be prefixed with /api
    // //app.use("/api", router);

    // // set up express app properties + serve static assets
    // app.use(express.static(path.join(__dirname, "../web")))
    //     .set("views", path.join(__dirname, "../web/views"))
    //     //.engine("html", engine.mustache)
    //     .engine('html', require('ejs').renderFile)
    //     //.use(favicon(path.join(__dirname, "public", "img/favicon.ico")))
    //     .set("view engine", "html")
    //     .get("/", (req, res) => res.render("index.html"))
    //     .get("/debug", (req, res) => res.render("debug.html"))
    // // .post('/botChat', function (req, res) {
    // //     console.log(req);
    // //     var message = req.body.message;
    // //     mineflayerBot.emit('webserver_message', message);
    // //     res.end();
    // // })

    // will fire for every new websocket connection
    io.on("connection", onNewWebsocketConnection);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    // server.listen(port, () => {
    //     console.log(`MinecraftBotHelper is listening on port ${port}!`);
    // });
    app.listen(port, () => {
        console.log(`MinecraftBotHelper is listening on port ${port}!`);
    });

    
    // broadcast here
    /*
    setInterval(() => {
        io.emit("online_clients_tracker", onlineClients.size);
    }, 10000);*/
}

module.exports = {
    StartServer: StartServer,
}