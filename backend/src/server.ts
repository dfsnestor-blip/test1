import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { initDb } from './db.js';
import authRouter from './routes/auth.js';
import expedienteRouter from './routes/expedientes.js';
import docRouter from './routes/documentos.js';
import searchRouter from './routes/busqueda.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 4001;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5174';

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/expedientes', expedienteRouter);
app.use('/api/documentos', docRouter);
app.use('/api/busqueda', searchRouter);

initDb().then(() => {
  app.listen(PORT, () => console.log(`MuniDocs API en http://localhost:${PORT}`));
}).catch(e => {
  console.error('Fallo al iniciar DB', e);
  process.exit(1);
});
