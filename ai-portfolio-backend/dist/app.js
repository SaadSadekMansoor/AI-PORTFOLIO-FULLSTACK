"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const generateController_1 = __importDefault(require("./controllers/generateController"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
app.use('/api', generateController_1.default);
app.use((err, _req, res, _next) => {
    logger_1.logger.error('Unhandled error', { error: err?.message ?? String(err), stack: err?.stack });
    res.status(500).json({ error: 'Internal server error' });
});
if (require.main === module) {
    app.listen(PORT, () => {
        logger_1.logger.info(`AI Portfolio backend listening on port ${PORT}`);
    });
}
exports.default = app;
