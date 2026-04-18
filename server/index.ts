import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { initDB } from './postgres';
import pgPool from './postgres';
import { startSyncCron } from './sync';
import { authMiddleware } from './middleware/auth';
import returnedChequesRouter from './routes/returnedCheques';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.FRONTEND_URL,
].filter((o): o is string => Boolean(o));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} is not allowed`));
      }
    },
  })
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Public auth routes (no JWT required)
app.use('/api/auth', authRouter);

// Protect all other /api/* routes with JWT
app.use('/api', authMiddleware);

app.use('/api/returned-cheques', returnedChequesRouter);

async function bootstrap(): Promise<void> {
  // Initialize PostgreSQL schema
  await initDB();
  console.log('[postgres] schema ready');

  // Seed default admin user if no users exist
  const { rows } = await pgPool.query<{ count: string }>('SELECT COUNT(*) AS count FROM users');
  if (parseInt(rows[0].count, 10) === 0) {
    const hash = await bcrypt.hash('admin', 12);
    await pgPool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
      ['admin', hash, 'admin'],
    );
    console.log('[postgres] default admin user created (username: admin, password: admin)');
  }

  // Start sync cron job
  startSyncCron();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
