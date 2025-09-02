import { Router } from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { authMiddleware } from './auth.js';
import { saveFile } from '../storage/fs.js';
import { appendEvent } from '../audit.js';
import { z } from 'zod';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

const metaSchema = z.array(z.object({ k: z.string().min(1), v: z.string().min(1) })).optional();

router.post('/upload', authMiddleware(), upload.single('file'), async (req: any, res) => {
  const expedienteId = req.body.expedienteId ? Number(req.body.expedienteId) : null;
  const titulo = req.body.titulo || (req.file?.originalname || 'documento');
  const meta = metaSchema.parse(req.body.meta ? JSON.parse(req.body.meta) : undefined);
  if (!req.file) return res.status(400).json({ error: 'Falta archivo' });
  const { key, sha256 } = await saveFile(req.file.buffer, req.file.originalname);
  const r = await db.query(
    'INSERT INTO documentos(expediente_id, titulo, mime, size_bytes, sha256, storage_key, version, creado_por) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [expedienteId, titulo, req.file.mimetype, req.file.size, sha256, key, 1, req.user.id]
  );
  const doc = r.rows[0];
  if (meta) {
    for (const m of meta) {
      await db.query('INSERT INTO doc_metadata(doc_id, k, v) VALUES($1,$2,$3)', [doc.id, m.k, m.v]);
    }
  }
  await appendEvent(req.user.id, 'subir', 'documento', String(doc.id), req.ip);
  res.status(201).json(doc);
});

router.get('/:id/download', authMiddleware(), async (req: any, res) => {
  const id = Number(req.params.id);
  const r = await db.query('SELECT storage_key, mime, titulo FROM documentos WHERE id=$1', [id]);
  if (!r.rowCount) return res.status(404).json({ error: 'No encontrado' });
  const fs = await import('fs');
  const path = await import('path');
  const p = path.join(process.cwd(), 'data/docs', r.rows[0].storage_key);
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'Archivo no existe' });
  res.setHeader('Content-Type', r.rows[0].mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${r.rows[0].titulo}"`);
  fs.createReadStream(p).pipe(res);
});

export default router;
