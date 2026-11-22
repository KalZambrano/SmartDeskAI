# Guion de demostración (7–10 minutos)

## Preparación

1. `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`).
2. En `.env`, definir `DEMO_MODE_ENABLED=true` para poder simular vencimientos.
3. `docker compose up --build -d` y esperar a `GET /api/v1/health`.
4. `pwsh infra/scripts/seed-demo.ps1` o `bash infra/scripts/seed-demo.sh`.
   El script crea los tres usuarios, asigna la especialidad de red al técnico y deja una incidencia vencida lista para el escalamiento.
5. Opcionalmente configurar `GEMINI_API_KEY` y `GEMINI_MODEL` para ver la ruta de IA; sin ellos se muestra el fallback local.

Credenciales ficticias: contraseña `SmartDeskDemo2026!`.

| Rol | Correo |
|---|---|
| ADMIN | admin@smartdesk.local |
| REQUESTER | solicitante@smartdesk.local |
| TECHNICIAN | tecnico@smartdesk.local |

## Demostración

1. **Problema:** gestión manual desorganizada (1 min).
2. **Registro:** login como solicitante y crear una incidencia de red (1,5 min).
3. **IA:** mostrar categoría, prioridad, resumen y respuesta sugeridas, y el origen `AI`/`RULES` (1,5 min).
4. **Automatización:** mostrar la asignación automática al técnico con especialidad y la notificación recibida (1,5 min).
5. **Atención:** login como técnico, ver su incidencia, cambiar a `IN_PROGRESS` y agregar un comentario (1,5 min).
6. **Escalamiento:** abrir la incidencia vencida del seed. El Scheduler (cada 60 s por defecto) registra `ESCALATED` y notifica al técnico y al admin. Repetir la revisión no duplica el evento (1,5 min).
7. **Dashboard:** mostrar el KPI de incidencias sin técnico asignado, los KPIs generales y la distribución por prioridad/categoría (1 min).
8. **Docker y CI:** `docker compose ps` y una ejecución del workflow de CI en GitHub (1 min).

## Escenarios negativos sugeridos

- Sin `GEMINI_API_KEY`: la incidencia se registra con clasificación `RULES`.
- Solicitante intentando abrir la incidencia de otro usuario: `403`.
- Técnico intentando cambiar el estado de una incidencia no asignada: `403`.
- Dos ejecuciones seguidas del Scheduler: una sola entrada `ESCALATED` y una sola notificación.
- Backend sin base de datos: Flyway/health fallan antes de aceptar peticiones.
