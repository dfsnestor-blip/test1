import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware } from './auth.js';
import { z } from 'zod';
import { appendEvent } from '../audit.js';

const router = Router();

router.get('/', authMiddleware(), async (req: any, res) => {
  const r = await db.query('SELECT * FROM expedientes ORDER BY id DESC LIMIT 200');
  res.json(r.rows);
});

const createSchema = z.object({
  titulo: z.string().min(3),
  clasificacion: z.string().optional()
});

router.post('/', authMiddleware(), async (req: any, res) => {
  const p = createSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  const { titulo, clasificacion } = p.data;
  const created = await db.query(
    'INSERT INTO expedientes(titulo, clasificacion, created_by) VALUES($1,$2,$3) RETURNING *',
    [titulo, clasificacion || null, req.user.id]
  );
  const exp = created.rows[0];
  // numero correlativo simple: EXP-YYYY-<id>
  const numero = `EXP-${new Date().getFullYear()}-${exp.id}`;
  await db.query('UPDATE expedientes SET numero=$1 WHERE id=$2', [numero, exp.id]);
  await appendEvent(req.user.id, 'crear', 'expediente', String(exp.id), req.ip);
  res.status(201).json({ ...exp, numero });
});

router.get('/:id', authMiddleware(), async (req: any, res) => {
  const id = Number(req.params.id);
  const r = await db.query('SELECT * FROM expedientes WHERE id=$1', [id]);
  if (!r.rowCount) return res.status(404).json({ error: 'No encontrado' });
  const docs = await db.query('SELECT * FROM documentos WHERE expediente_id=$1 ORDER BY id DESC', [id]);
  res.json({ expediente: r.rows[0], documentos: docs.rows });
});

export default router;
