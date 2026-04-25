import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import { config } from './config/app.config';
import { connectRedis } from './config/redis.config';
import { initSchema } from './schema/init';
import { seedDefaultUsers } from './modules/auth/auth.service';
import { startSyncCron } from './sync';
import { httpLogger, logger } from './middlewares/logger';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';

import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import financialRouter from './modules/financial/financial.routes';
import productsRouter from './modules/products/products.routes';
import ordersRouter from './modules/orders/orders.routes';
import auditRouter from './modules/audit/audit.routes';
import returnedChequesRouter from './routes/returnedCheques';

const app = express();

// ─── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: config.isProduction }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(httpLogger);

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// ─── Public routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Protected routes ─────────────────────────────────────────────────────────
app.use('/api', authMiddleware);
app.use('/api/users', usersRouter);
app.use('/api/financial', financialRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/audit', auditRouter);
app.use('/api/returned-cheques', returnedChequesRouter);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectRedis();

  await initSchema();
  logger.info('[schema] ready');

  await seedDefaultUsers();

  startSyncCron();

  app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
