import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import txRoutes from './routes/transactions.js';
import statsRoutes from './routes/stats.js';
import { assertDbConnection } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

assertDbConnection();

// CORS
const allowed = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/transactions', txRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
