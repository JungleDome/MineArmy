//const server1 = { host: 'play.blockstackers.xyz', port: 25565, version: '1.17.1' }
//const server1 = { host: 'play.sgcraft.net', port: 25565, version: '1.17.1' }
// const server1 = { host: 'skyblock.holocraft.club', port: 25565, version: '1.17.1'}
//const server1 = { host: 'hylexmc.net', port: 25565, version: '1.17.1'}
//const server1 = { host: 'play.dikifi.com', port: 25565, version: '1.17.1'}
const server1 = { host: 'localhost', port: 6548, version: '1.18.1'}
const serverList = [server1];

const bot1 = {username: 'Ethanord2lm', password: null, offlinePassword: '!234Abcd'};
const bot2 = {username: 'DragonFly', password: null, offlinePassword: 'sasasa'};
const bot3 = {username: 'DumDum', password: null, offlinePassword: 'sasasa'};
const bot4 = {username: 'PuffGuy', password: null, offlinePassword: 'sasasa'};
const bot5 = {username: 'VoidCactus', password: null, offlinePassword: 'sasasa'};
const bot6 = {username: 'Butapet', password: null, offlinePassword: 'sasasa'};
const botList = [bot2];

const masterPlayerName = "Ethanord2lm";


module.exports = {
    server: serverList[0],
    bots: botList,
    masterPlayerName: masterPlayerName,
    coreServerIp: 'http://localhost',
    coreServerPort: 8080
}