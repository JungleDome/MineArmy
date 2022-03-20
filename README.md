# MineArmy
Minecraft control panel capable to spawn & control an army of bot

## Project structure
Core - Control panel for the bot
Web - UI for control panel
Worker - Mineflayer bot which listens to control panel

## Prerequisite
Node.js >= 14

## Usage
### Core
#### Run using npm
`npm run start`
#### Build for docker
1. Edit docker image name in `Dockerfile`
2. Run `docker_build.bat`
3. Spin it up in Docker `docker run -p 8080:80 {your_docker_name}/minearmycore`

### Web
#### Run using npm
`npm run start`
#### Build
1. Run `npm run vue-build`
2. Copy file in `/dist` to `{minearmy_core_folder}/public`
3. Run MineArmy Core

### Worker
In progress...
