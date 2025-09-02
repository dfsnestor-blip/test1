# 02 — Arquitectura técnica (MVP) y hardening

## Componentes (MVP)
- **API** (Express/TypeScript) con módulos de autenticación, expedientes, documentos,
  búsqueda y auditoría encadenada.
- **DB** PostgreSQL (13+). 
- **Almacenamiento**: filesystem local (dev) o S3/MinIO (prod).
- **Front** React/Vite (BFF simple).

## Seguridad
- **Autenticación**: JWT en MVP; para producción, integrar **OIDC** (Keycloak) y **ClaveÚnica** (IdP estatal). citeturn4search0
- **Firma**: integración con **FirmaGob** (FEA) para actos administrativos y resoluciones. citeturn5search0
- **Auditoría**: bitácora con hash encadenado (prev_hash → rec_hash).
- **Retención**: modelo de TRD en DB; soporta *legal hold*.
- **Interoperabilidad**: exponer y consumir APIs alineadas a DS 12/2023 (JSON + OIDC + firma). citeturn6search6

## Evolución sugerida
- Motor de búsqueda dedicado (OpenSearch/Meilisearch) y OCR para PDFs.
- WORM/S3 Object Lock para custodia inmutable.
- Cifrado de objetos en reposo (KMS).
- Observabilidad (OpenTelemetry), colas de trabajo, escaneo antimalware.

## Despliegue
- Docker/K8s. Backups verificados y ensayos de restauración.
