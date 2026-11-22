# CI/CD

## Workflows

| Archivo | Eventos | Jobs |
|---|---|---|
| `.github/workflows/ci.yml` | PR y push a `main`/`develop`, manual | `frontend` (pnpm install, lint, format, test, build y artefacto), `backend` (`mvn verify` y artefacto WAR), `infra` (validar Compose, desplegar en Tomcat con Docker y verificar health). |
| `.github/workflows/docker-build.yml` | Push a `main`, manual | Construye las imágenes de frontend y backend con Buildx y etiquetas SHA/`latest`, sin publicar. |

## Artifacts

Cada ejecución de `ci.yml` publica el bundle `apps/frontend/dist/frontend/browser` y el WAR `apps/backend/target/smartdesk-backend.war`. Ambos usan `actions/upload-artifact` con `retention-days: 1`: están disponibles durante un día y luego GitHub los elimina.

## Prueba de despliegue en Tomcat

El job `infra` levanta `db` y `backend` con `docker compose --env-file .env.example up -d --build`, espera hasta 120 segundos a que `GET /api/v1/health` responda, muestra los logs si falla y ejecuta `down -v` siempre. El backend se empaqueta como WAR y se despliega como `ROOT.war` en `tomcat:11-jdk21`, por lo que las rutas `/api/v1` no cambian.

El pipeline no necesita `GEMINI_API_KEY`: sin clave, el backend usa el clasificador local. Las credenciales de base de datos en CI son las de ejemplo de `.env.example`.

## Permisos y caché

Los workflows piden `contents: read`, usan caché de pnpm y Maven, fijan versiones de actions y cancelan ejecuciones duplicadas por rama. La publicación en GHCR queda desactivada hasta revisar permisos y límites.

## Validación local equivalente

```bash
cd apps/frontend && pnpm lint && pnpm format:check && pnpm test:ci && pnpm build
cd apps/backend && mvn verify
docker compose --env-file .env.example config --quiet
docker compose --env-file .env.example up -d --build db backend
curl --fail http://localhost:8080/api/v1/health
docker compose --env-file .env.example down -v
```

Agregar la protección de rama en GitHub para exigir CI exitoso antes de fusionar PR.
