import crypto from 'crypto';
import { db } from './db.js';

export async function appendEvent(actor: number | null, action: string, entity: string, entityId: string, ip?: string) {
  const last = await db.query('SELECT rec_hash FROM events ORDER BY id DESC LIMIT 1');
  const prevHash = last.rowCount ? last.rows[0].rec_hash : '';
  const base = JSON.stringify({ actor, action, entity, entityId, prevHash, at: new Date().toISOString() });
  const recHash = crypto.createHash('sha256').update(base).digest('hex');
  await db.query('INSERT INTO events(actor, action, entity, entity_id, ip, prev_hash, rec_hash) VALUES($1,$2,$3,$4,$5,$6,$7)', [actor, action, entity, entityId, ip || null, prevHash, recHash]);
  return recHash;
}
