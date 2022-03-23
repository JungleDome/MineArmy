import { Bot as MineflayerBot } from "mineflayer";
import SimpleLogger from "simple-node-logger";
import MinecraftData from "minecraft-data";
import { PLUGIN_PRIORITY } from "./bot/enum.js"

export default function (bot: Bot, options: any): void;

export function registerEvent(): void;

export interface Bot extends MineflayerBot {
    logger: SimpleLogger.Logger
    mcData: MinecraftData.IndexedData
    dataStore: DataStore
    eventManager: EventManager
    core: BotCore
}

export interface BotCore {
    config: {
        username: string
        offlinePassword: string
        masterPlayerName: string
    }
    chatLog: string[]
    currentPriority: PLUGIN_PRIORITY
}

export type PLUGIN_PRIORITY = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface CreateBotDetails {
    serverIP: string
    serverPort: Number
    serverVersion?: string
    username: string
    password?: string
    offlinePassword?: string
    mineflayerClient
}

export interface DataStore {
    set: (key: string, value: any) => void
    get: (key: string) => any
    delete: (key: string) => void
}

export interface EventManager {
    triggerEvent: (name: string, ...options: any) => void
    registerEvent: (name: string, callback: Function | Promise<void>) => void
    registerEventOnce: (name: string, callback: Function | Promise<void>) => void
    clearRegisteredEvent: () => Promise<void>
}