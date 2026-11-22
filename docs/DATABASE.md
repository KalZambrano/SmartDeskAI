# Base de datos

PostgreSQL 17 en Docker, esquema versionado con Flyway en `apps/backend/src/main/resources/db/migration`. JPA usa `ddl-auto: validate`: las entidades no crean tablas.

## Migraciones

| Versión | Contenido |
|---|---|
| V1 | Esquema completo: usuarios, categorías, especialidades, incidencias, comentarios, historial, notificaciones, logs de automatización, secuencia de códigos, índices y `CHECK` de enums. |
| V2 | Catálogo inicial de seis categorías. |
| V3 | Columnas sugeridas por IA (`ai_suggested_category_id`, `ai_suggested_priority`, `ai_reason`). |

## Modelo

- `users` → `tickets` como solicitante o técnico asignado.
- `categories` → `tickets` y → `technician_specialties`.
- `tickets` → `ticket_comments`, `ticket_history`, `notifications`, `automation_logs`.
- `automation_logs.execution_key` es única: implementa la idempotencia del escalamiento y de la asignación automática.
- `notifications.read_at` permite el contador de no leídas.

Los enums se guardan como `VARCHAR` con restricciones `CHECK` y se mapean con `@Enumerated(EnumType.STRING)`.

## Índices

Correo de usuario, código de incidencia, estado, prioridad, categoría, solicitante, técnico asignado, `due_at`, `created_at`, comentarios e historial por incidencia, notificaciones por usuario y logs por incidencia.

## Datos de demostración

`infra/scripts/seed-demo.{ps1,sh}` crea usuarios ficticios, asigna una especialidad y registra una incidencia. No hay contraseñas ni API keys en las migraciones. Para desarrollo local se usa `local.properties` (no versionado) con la credencial de PostgreSQL.
