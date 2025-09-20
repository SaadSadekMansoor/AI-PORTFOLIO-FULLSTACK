import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT ? Number(process.env.PORT) : 5050;

app.listen(PORT, () => {
  logger.info(`AI Portfolio backend listening on port ${PORT}`);
});
