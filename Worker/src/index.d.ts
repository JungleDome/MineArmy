import { Bot as MineflayerBot } from "mineflayer";
import SimpleLogger from "simple-node-logger";
import MinecraftData from "minecraft-data";

export default function (bot: Bot, options: any): void;

export function registerEvent(): void;

export interface Bot extends MineflayerBot {
    logger: SimpleLogger.Logger
    mcData: MinecraftData.IndexedData
    chatLog: string[]
    helper.config: { offlinePassword: string }
    helper: { currentState: string, currentRunningModule: string }
    dataStore: DataStore,
    eventManager: EventManager
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