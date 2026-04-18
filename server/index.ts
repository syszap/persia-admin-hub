import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import returnedChequesRouter from './routes/returnedCheques';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/returned-cheques', returnedChequesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
