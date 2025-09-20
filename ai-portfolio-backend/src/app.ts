import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import generateRouter from './controllers/generateController';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api', generateRouter);

app.use((err: any, _req: Request, res: Response, _next: any) => {
  logger.error('Unhandled error', { error: err?.message ?? String(err), stack: err?.stack });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
