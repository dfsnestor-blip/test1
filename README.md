# MuniDocs — Gestor Documental Municipal (Chile)

**MuniDocs** es un gestor documental y de expedientes pensado para municipalidades de Chile.
Incluye autenticación (JWT, con opción OIDC/ClaveÚnica), expedientes, carga de documentos con versionado,
búsqueda básica, control de retención y bitácora de auditoría con encadenamiento hash.

> **Este repositorio es un MVP funcional** para desarrollo local. Para producción, ver `docs/02-arquitectura.md`
y la sección **Hardening & Cumplimiento** en `docs/01-cumplimiento.md`.

## Stack
- Backend: Node 20 + Express + TypeScript + PostgreSQL
- Frontend: React + Vite
- Almacenamiento de archivos: **filesystem** (por defecto) o **MinIO/S3** (opcional)
- Búsqueda: SQL (ILIKE); puedes evolucionar a `to_tsvector` o a un motor dedicado
- Contenedores de datos: Docker Compose (PostgreSQL)

## Arranque rápido (desarrollo)
```bash
docker compose up -d db   # levanta PostgreSQL
cd backend
cp .env.example .env      # configura a tu gusto
npm install
npm run dev               # http://localhost:4001

# en otra terminal
cd frontend
npm install
npm run dev               # http://localhost:5174
```
Credenciales admin de ejemplo: `admin@muni.cl` / `admin123` (se crea al primer arranque si no existe).

## Subir a GitHub
```bash
git init && git add .
git commit -m "feat: MuniDocs MVP"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

## Producción (idea)
- Sustituir JWT local por OIDC/Keycloak o ClaveÚnica para ciudadanos.
- Activar S3/MinIO con versionado y retención legal.
- Activar WAF, TLS mTLS en backend interno, auditoría centralizada y backups verificados.
