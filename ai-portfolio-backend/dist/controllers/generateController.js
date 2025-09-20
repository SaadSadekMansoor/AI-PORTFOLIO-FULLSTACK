"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// simplified version due to space
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const validator_1 = require("../utils/validator");
const groqService_1 = require("../services/groqService");
const storageService_1 = require("../services/storageService");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const GenerateBodySchema = zod_1.z.object({
    prompt: zod_1.z.string().min(10, 'Prompt too short (min 10 chars)'),
    options: zod_1.z.object({
        includeJS: zod_1.z.boolean().optional(),
        theme: zod_1.z.string().optional(),
        colorScheme: zod_1.z.string().optional()
    }).optional()
});
router.post('/generate', async (req, res) => {
    try {
        const parsed = (0, validator_1.validateGeneratePayload)(req.body, GenerateBodySchema);
        const requestId = (0, uuid_1.v4)();
        const createdAt = Date.now();
        await storageService_1.storage.storePending(requestId, { status: 'pending', createdAt });
        logger_1.logger.info('Generation requested', { id: requestId });
        const generation = await (0, groqService_1.generateWebsiteFromPrompt)(parsed.prompt, parsed.options ?? {});
        if (!generation || !generation.html) {
            await storageService_1.storage.storeFailed(requestId, { status: 'failed' });
            return res.status(502).json({ error: 'Failed to generate website' });
        }
        await storageService_1.storage.storeResult(requestId, {
            status: 'ready',
            html: generation.html,
            assets: generation.assets ?? {},
            metadata: { prompt: parsed.prompt, options: parsed.options ?? {}, createdAt }
        });
        return res.status(200).json({ id: requestId, status: 'ready', html: generation.html });
    }
    catch (err) {
        logger_1.logger.error('Error in /api/generate', { error: err?.message ?? String(err) });
        return res.status(400).json({ error: err?.message ?? 'Bad request' });
    }
});
router.get('/retrieve/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ error: 'Missing id' });
        const item = await storageService_1.storage.get(id);
        if (!item)
            return res.status(404).json({ error: 'Not found or expired' });
        return res.status(200).json({ id, status: item.status, html: item.html, metadata: item.metadata });
    }
    catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
