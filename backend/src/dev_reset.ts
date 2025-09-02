import { db, initDb } from './db.js';

(async () => {
  await initDb();
  await db.query('DELETE FROM doc_metadata; DELETE FROM documentos; DELETE FROM expedientes;');
  console.log('Base reseteada (preservando usuarios/units)');
  process.exit(0);
})();
