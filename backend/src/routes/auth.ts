import { Router } from 'express';
import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authMiddleware = (roles?: string[]) => {
  return (req: any, res: any, next: any) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
    const token = h.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
      req.user = payload;
      if (roles && !roles.includes(payload.role)) return res.status(403).json({ error: 'Prohibido' });
      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
};

export async function ensureAdminUser() {
  const email = 'admin@muni.cl';
  const name = 'Administrador';
  const role = 'admin';
  const pass = 'admin123';
  const r = await db.query('SELECT id FROM users WHERE email=$1', [email]);
  if (!r.rowCount) {
    const hash = await bcrypt.hash(pass, 10);
    await db.query('INSERT INTO users(email, name, role, password_hash) VALUES($1,$2,$3,$4)', [email, name, role, hash]);
    console.log('Usuario admin creado:', email, '/', pass);
  }
}

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['admin','secretario','abogado','director','funcionario','ciudadano']).optional()
});

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, name, password, role='funcionario' } = parse.data;
  const exists = await db.query('SELECT id FROM users WHERE email=$1', [email]);
  if (exists.rowCount) return res.status(409).json({ error: 'Email ya registrado' });
  const hash = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users(email, name, role, password_hash) VALUES($1,$2,$3,$4)', [email, name, role, hash]);
  res.status(201).json({ ok: true });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
router.post('/login', async (req, res) => {
  const p = loginSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  const { email, password } = p.data;
  const u = await db.query('SELECT id, email, name, role, password_hash FROM users WHERE email=$1', [email]);
  if (!u.rowCount) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, u.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign({ id: u.rows[0].id, email, name: u.rows[0].name, role: u.rows[0].role }, process.env.JWT_SECRET || 'dev', { expiresIn: '8h' });
  res.json({ token });
});

// Placeholders para OIDC/ClaveÚnica
router.get('/oidc/start', (_req, res) => {
  res.status(501).json({ error: 'OIDC/ClaveÚnica no configurado. Ver docs para integrarlo.' });
});
router.get('/oidc/callback', (_req, res) => {
  res.status(501).json({ error: 'OIDC/ClaveÚnica no configurado. Ver docs para integrarlo.' });
});

export default router;
