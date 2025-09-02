import { Pool } from 'pg';
import dotenv from 'dotenv';
import { ensureAdminUser } from './routes/auth.js';
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5433),
  user: process.env.PGUSER || 'munidocs',
  password: process.env.PGPASSWORD || 'munidocs',
  database: process.env.PGDATABASE || 'munidocs',
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

export async function initDb() {
  // tablas principales
  await db.query(`
    CREATE TABLE IF NOT EXISTS units(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'funcionario', -- admin, secretario, abogado, director, ciudadano
      unit_id INT REFERENCES units(id),
      password_hash TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS expedientes(
      id SERIAL PRIMARY KEY,
      numero TEXT UNIQUE,
      titulo TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'abierto', -- abierto, en_tramite, finalizado, archivado
      clasificacion TEXT,
      created_by INT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS documentos(
      id SERIAL PRIMARY KEY,
      expediente_id INT REFERENCES expedientes(id) ON DELETE SET NULL,
      titulo TEXT NOT NULL,
      mime TEXT,
      size_bytes INT,
      sha256 TEXT,
      storage_key TEXT NOT NULL,
      version INT NOT NULL DEFAULT 1,
      creado_por INT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS doc_metadata(
      id SERIAL PRIMARY KEY,
      doc_id INT REFERENCES documentos(id) ON DELETE CASCADE,
      k TEXT NOT NULL,
      v TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_meta_doc ON doc_metadata(doc_id);
    CREATE TABLE IF NOT EXISTS retention_categories(
      id SERIAL PRIMARY KEY,
      serie TEXT NOT NULL,
      subserie TEXT,
      nombre TEXT NOT NULL,
      ret_gestion INT NOT NULL DEFAULT 5,
      ret_central INT NOT NULL DEFAULT 5,
      disposicion TEXT NOT NULL DEFAULT 'Conservacion Total'
    );
    CREATE TABLE IF NOT EXISTS doc_retention(
      doc_id INT PRIMARY KEY REFERENCES documentos(id) ON DELETE CASCADE,
      category_id INT REFERENCES retention_categories(id),
      legal_hold BOOLEAN DEFAULT false,
      fecha_corte DATE
    );
    CREATE TABLE IF NOT EXISTS events(
      id BIGSERIAL PRIMARY KEY,
      at TIMESTAMPTZ DEFAULT now(),
      actor INT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      ip TEXT,
      prev_hash TEXT,
      rec_hash TEXT
    );
  `);

  // seed unidad y admin
  await db.query(`INSERT INTO units(name) VALUES('Secretaría Municipal') ON CONFLICT DO NOTHING;`);
  await ensureAdminUser();
}
