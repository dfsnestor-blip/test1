import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware } from './auth.js';

const router = Router();

router.get('/', authMiddleware(), async (req: any, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q) return res.json([]);
  const like = `%${q}%`;
  const docs = await db.query(
    `SELECT d.*, e.numero as expediente_numero
     FROM documentos d
     LEFT JOIN expedientes e ON e.id = d.expediente_id
     WHERE d.titulo ILIKE $1 OR EXISTS (SELECT 1 FROM doc_metadata m WHERE m.doc_id=d.id AND (m.k ILIKE $1 OR m.v ILIKE $1))
     ORDER BY d.id DESC LIMIT 100`, [like]);
  res.json(docs.rows);
});

export default router;
