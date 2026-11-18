# API

La Fase 0 expone únicamente el endpoint público GET /api/v1/health.

La documentación de autenticación y recursos protegidos se completará junto con las fases funcionales.

### `GET /api/v1/tickets`

Lista las incidencias permitidas según el rol del usuario. Acepta filtros opcionales, aplicados en base de datos:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `status` | `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED` | Estado exacto. |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Prioridad exacta. |
| `categoryId` | `Long` | Categoría exacta. |
| `q` | `string` | Texto a buscar en el código o el título (sin distinción de mayúsculas). Máximo 100 caracteres. |

Los filtros se combinan con el alcance por rol: un solicitante solo ve sus incidencias y un técnico solo las asignadas. Un valor de enum inválido devuelve `400`.
