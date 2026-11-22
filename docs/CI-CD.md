# CI/CD

## Workflows

| Archivo | Eventos | Jobs |
|---|---|---|
| `.github/workflows/ci.yml` | PR y push a `main`/`develop`, manual | `frontend` (pnpm install, lint, format, test, build), `backend` (`mvn verify`), `infra` (`docker compose config --quiet`). |
| `.github/workflows/docker-build.yml` | Push a `main`, manual | Construye las imágenes de frontend y backend con Buildx y etiquetas SHA/`latest`, sin publicar. |

El pipeline no necesita `GEMINI_API_KEY`: sin clave, el backend usa el clasificador local. Las credenciales de base de datos en CI son las de ejemplo de `.env.example`.

## Permisos y caché

Los workflows piden `contents: read`, usan caché de pnpm y Maven, fijan versiones de actions y cancelan ejecuciones duplicadas por rama. La publicación en GHCR queda desactivada hasta revisar permisos y límites.

## Validación local equivalente

```bash
cd apps/frontend && pnpm lint && pnpm format:check && pnpm test:ci && pnpm build
cd apps/backend && mvn verify
cp .env.example .env && docker compose config --quiet
```

Agregar la protección de rama en GitHub para exigir CI exitoso antes de fusionar PR.
