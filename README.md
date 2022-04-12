# MineArmy
Deployable minecraft bot cluster. Featuring event based control & dynamic bot execution logic

## Features
- Vue based control panel
- Event based communication between control panel & bot cluster
- Hot reload bot plugins (*No more spamming join message in your server*)
- Spawn as many bot you like
- Control your bot cluster from browser

## Project Structure

Core - Event propagator between control panel & workers

Web / Control panel - Controls the creation & the action of workers

Worker - Minecraft bot that interact with minecraft server



## Getting Started
### Installation
1. Install Node.js >= 14 from nodejs.org
2. Install npm dependencies in `./Core`, `./Web`, `./Worker` folder using `npm install --save`

### Run 
1. Run `./Core`, `./Web`, `./Worker` using `npm run start`
2. Open browser, visit `http://localhost:8081/`




## Usage
### Core
Add your events from control panel / worker in controller folder `./Core/src/controller/`

### Control Panel
Add new pages in vue folder `./Web/web/views/`. Please refer to [Vuetify documentation](https://next.vuetifyjs.com/en/getting-started/installation/) for vue component usage.

### Worker
To extend the functionality, you may add additional plugins in plugin folder `./Worker/src/plugins`. The plugins are registered automatically, you dont need to do anything.



## Build
*Note: Web `./dist` folder should be copied to Core `./public` folder before building docker image.
### Core - Build for docker
1. Edit docker image name in `Dockerfile`
2. Run `docker_build.bat`
3. Spin it up in Docker `docker run -p 8080:80 {your_docker_name}/minearmycore`

### Web
1. Run `npm run vue-build`
2. Copy file in `/dist` to `{minearmy_core_folder}/public`
3. Run MineArmy Core

### Worker
In progress...



## Testing
No test suite yet

## Contribute
Feel free to contact me or make a PR

---

## Architecture
### Websocket
All parties utilize socket.io event to maintain realtime communication. Core is the event propagator between Control panel & Worker. 

#### Event naming convention
All event will follow the party naming as it's prefix. 

| Party         | Event Prefix   |
| ------------- | -------------- |
| Control Panel | `controlPanel` |
| Worker        | `worker`       |

*Note: Core does not have any events as it will be consuming events from Control Panel & Worker.

### Worker
#### Plugins
Plugins is where you place all the logic. It is seperated into two general events.

Command events are events that react to commands from player or control panel. You will first need to register a command using `bot.commandManager.registerCommand` or simply listen to any events the bot emits.

Logic events are events that the plugin used for handling logic. You may chain multiple logic event to complete an action.

This should generally be how the plugin works:

Input from control panel -> Command events -> Logic events -> Logic events -> Output/Done

#### Logger (`bot.logger`)
Works the same as `console.log` with more output details and log history.

#### Event Manager (`bot.eventManager`)
All worker plugins **must** listen/emit events through event manager to support hot reloading plugins

#### Plugin Manager (`bot.commandManager`)
Handles registration of worker plugin events, worker plugin commands & receiving command from control panel

