"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWebsiteFromPrompt = generateWebsiteFromPrompt;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.ai/v1/generate';
async function generateWebsiteFromPrompt(prompt, options) {
    const combinedPrompt = `Create a portfolio website with options: ${JSON.stringify(options)}\nDescription: ${prompt}`;
    const body = {
        model: 'groq-1',
        input: combinedPrompt,
        max_tokens: 4000,
        temperature: 0.7,
    };
    try {
        const res = await (0, node_fetch_1.default)(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error('Groq API error: ' + res.status);
        // 👇 Explicitly cast JSON response
        const json = (await res.json());
        const textOutput = json.output?.[0]?.content ||
            json.choices?.[0]?.text ||
            json.data?.text ||
            JSON.stringify(json);
        return { html: textOutput };
    }
    catch (err) {
        logger_1.logger.error('Error calling Groq API', { message: err?.message });
        throw err;
    }
}
