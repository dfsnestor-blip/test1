import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE = process.env.FILES_BASE_DIR || '../data';
const DOCS_DIR = path.resolve(process.cwd(), 'data/docs'); // backend/data/docs

function ensureDir() {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}
ensureDir();

export async function saveFile(buffer: Buffer, filename: string) {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const key = `${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`;
  const p = path.join(DOCS_DIR, key);
  await fs.promises.writeFile(p, buffer);
  return { key, sha256, path: p };
}

export async function readFile(key: string) {
  const p = path.join(DOCS_DIR, key);
  return fs.promises.readFile(p);
}
