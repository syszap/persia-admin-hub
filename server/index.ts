import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import returnedChequesRouter from './routes/returnedCheques';

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
      // Allow server-to-server / curl requests (no origin header)
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

app.use('/api/returned-cheques', returnedChequesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
