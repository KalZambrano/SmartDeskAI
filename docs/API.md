# API REST

Prefijo: `/api/v1`. Todas las respuestas son JSON y no exponen entidades JPA.

## Autenticación

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Devuelve `{ token, user }`. |
| POST | `/auth/bootstrap` | Público, solo una vez | Crea el administrador inicial; se cierra cuando ya existe un usuario. |
| GET | `/auth/me` | Autenticado | Usuario autenticado. |

El token JWT se envía como `Authorization: Bearer <token>`.

## Usuarios y categorías

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/users` | Admin |
| POST | `/users` | Admin |
| PUT | `/users/{id}` | Admin |
| GET | `/users/{id}/specialties` | Admin |
| PUT | `/users/{id}/specialties` | Admin |
| PATCH | `/users/{id}/active` | Admin |
| GET | `/categories` | Autenticado (activas) |
| GET | `/categories/manage` | Admin (todas) |
| POST / PUT / DELETE | `/categories` | Admin |

`POST /users` recibe `{ "fullName", "email", "password", "role" }`, donde `role` es `ADMIN`, `TECHNICIAN` o `REQUESTER` y la clave tiene al menos 12 caracteres. `PUT /users/{id}` recibe `{ "fullName", "email", "role" }`: no cambia la clave y rechaza un correo ya usado por otro usuario con `409`. `PUT /users/{id}/specialties` recibe `{ "categoryIds": [1, 2] }`; una lista vacía elimina las especialidades.

## Incidencias

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/tickets` | Lista paginada según rol, con filtros en base de datos. |
| POST | `/tickets` | Alta; clasifica con IA/reglas y asigna automáticamente. |
| GET | `/tickets/{id}` | Detalle (solo si el rol da acceso). |
| PUT | `/tickets/{id}` | Edición (admin o solicitante propietario; no si está cerrada). |
| PATCH | `/tickets/{id}/status` | Transición validada por backend. |
| PATCH | `/tickets/{id}/assignment` | Reasignación manual (admin). |
| GET / POST | `/tickets/{id}/comments` | Comentarios. |
| GET | `/tickets/{id}/history` | Historial de solo lectura. |
| POST | `/tickets/{id}/ai-analysis` | Nueva clasificación explícita (consume cuota). |

### Filtros de `GET /tickets`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `status` | `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED` | Estado exacto. |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Prioridad exacta. |
| `categoryId` | `Long` | Categoría exacta. |
| `q` | `string` | Texto en código o título (máx. 100 caracteres). |
| `page` | `int` | Página basada en 0; por defecto `0`. |
| `size` | `int` | Tamaño de página entre 1 y 100; por defecto `20`. |

Los filtros se combinan con el alcance por rol: el solicitante ve solo las suyas, el técnico solo las asignadas y el admin todas. Un enum inválido devuelve `400`, igual que `page < 0` o `size` fuera de rango.

`GET /tickets` responde `{ "content": [...], "page": 0, "size": 20, "totalElements": 45, "totalPages": 3, "first": true, "last": false }`. El orden es `createdAt` descendente con `id` descendente como desempate, para que las páginas sean estables. El resto de listados (comentarios, historial, notificaciones) siguen devolviendo arreglos.

## Notificaciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/notifications` | Últimas 50 notificaciones propias. |
| GET | `/notifications/unread-count` | `{ "count": n }`. |
| PATCH | `/notifications/{id}/read` | Marca como leída una propia; una ajena devuelve `404`. |

## Dashboard y reportes

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| GET | `/dashboard/summary` | Autenticado | KPIs y distribuciones según el alcance por rol. |
| GET | `/dashboard/reports` | Admin | Resumen + filas detalladas. |
| GET | `/dashboard/reports/export` | Admin | CSV UTF-8 con `;`, cabecera `Content-Disposition`. |

Los tres aceptan los filtros opcionales `from`, `to` (ISO-8601), `status`, `priority` y `categoryId`; se combinan con el alcance por rol. `from`/`to` inválidos devuelven `400`. El CSV escapa celdas que empiezan con `=`, `+`, `-` o `@` para evitar inyección de fórmulas.

`/dashboard/summary` incluye `timeline`: 14 puntos `{ "date": "AAAA-MM-DD", "created": n, "resolved": n }` en UTC, calculados sobre las incidencias filtradas (las fechas de creación y resolución se cuentan de forma independiente). El dashboard ofrece gráficos de prioridad, categoría, carga por técnico y serie diaria, con un conmutador a tablas para lectura accesible.

## Modo demostración

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/demo/tickets/{id}/overdue` | Admin | Fija `due_at` un minuto en el pasado para probar el escalamiento. |

Solo existe si `DEMO_MODE_ENABLED=true`; con el valor por defecto (`false`) responde `404`. No altera las reglas de cálculo de vencimientos del registro normal.

## Estado

`GET /health` es público y devuelve `{ status, application, timestamp }`.
