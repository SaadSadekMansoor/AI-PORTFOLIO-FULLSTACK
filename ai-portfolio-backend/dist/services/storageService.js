"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL;
const TTL_SECONDS = process.env.STORAGE_TTL_SECONDS ? Number(process.env.STORAGE_TTL_SECONDS) : 3600;
let redisClient = null;
const inMemoryStore = new Map();
async function tryInitRedis() {
    if (!REDIS_URL)
        return;
    try {
        redisClient = (0, redis_1.createClient)({ url: REDIS_URL });
        await redisClient.connect();
        logger_1.logger.info('Connected to Redis');
    }
    catch (err) {
        logger_1.logger.warn('Redis unavailable, using memory store');
        redisClient = null;
    }
}
tryInitRedis();
exports.storage = {
    async storePending(id, payload) {
        const item = { status: 'pending', metadata: payload };
        if (redisClient)
            await redisClient.setEx(id, TTL_SECONDS, JSON.stringify(item));
        else
            inMemoryStore.set(id, { item, expiresAt: Date.now() + TTL_SECONDS * 1000 });
    },
    async storeFailed(id, payload) {
        const item = { status: 'failed', metadata: payload };
        if (redisClient)
            await redisClient.setEx(id, TTL_SECONDS, JSON.stringify(item));
        else
            inMemoryStore.set(id, { item, expiresAt: Date.now() + TTL_SECONDS * 1000 });
    },
    async storeResult(id, payload) {
        if (redisClient)
            await redisClient.setEx(id, TTL_SECONDS, JSON.stringify(payload));
        else
            inMemoryStore.set(id, { item: payload, expiresAt: Date.now() + TTL_SECONDS * 1000 });
    },
    async get(id) {
        if (redisClient) {
            const raw = await redisClient.get(id);
            return raw ? JSON.parse(raw) : null;
        }
        const found = inMemoryStore.get(id);
        if (!found)
            return null;
        if (Date.now() > found.expiresAt) {
            inMemoryStore.delete(id);
            return null;
        }
        return found.item;
    }
};
