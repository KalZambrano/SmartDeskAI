# Arquitectura y decisiones técnicas

La arquitectura de alto nivel está en la especificación del proyecto. Este documento registra las decisiones tomadas al implementar las fases.

## Decisiones de la Fase 0

| Tema | Decisión | Motivo |
|---|---|---|
| Frontend | Angular 22, zoneless, Vitest | Versión seleccionada para el proyecto |
| Backend | Java 21 LTS + Spring Boot 4.1.2 | Compatibilidad y ciclo LTS |
| Paquete Java | pe.edu.utp.smartdesk | Decisión del equipo |
| Gestor de paquetes | pnpm | Preferencia del equipo; CI y Docker usan la misma versión |
| Estilos | Tailwind CSS 4 con tokens en src/styles.css | Diseño del frontend |
| Iconos | @lucide/angular | Librería gratuita |
| Comunicación front-back | Rutas relativas /api/v1, proxy de Angular y Nginx | Evita dependencia directa de CORS |
| Enumeraciones | VARCHAR con CHECK y @Enumerated(STRING) | Integridad sin tipos nativos |
| Seguridad base | Sin sesión, CSRF desactivado, 401 para no autenticados; health público | Preparación para JWT |
| Pruebas de integración | Testcontainers con PostgreSQL 17 | Aislamiento de la base local |
| Imágenes | Multi-stage en backend y usuario no root en ambas | Imágenes pequeñas sin secretos; Tomcat corre como usuario `tomcat` |

## Pendiente de decisión

- Publicación de imágenes en GHCR.
- Confirmación con el docente de la sustitución de OpenAI por Gemini.

## Decisiones de la Fase 2

| Tema | Decisión | Motivo |
|---|---|---|
| Administración de usuarios | Vista única `/maestros/usuarios` para ADMIN, TECHNICIAN y REQUESTER, protegida por `roleGuard` | El backend ya exponía los tres roles; solo faltaba la UI y la edición |
| Edición | `PUT /api/v1/users/{id}` actualiza nombre, correo y rol; la clave no se modifica | Evita reemplazar credenciales al corregir un dato; la autorización `/users/**` ya es solo ADMIN |
| Contraseñas temporales | Generador compartido en `core/utils/password.ts`, usado por técnicos y usuarios | Mismo algoritmo en ambos altas, sin duplicar la lógica |

## Decisiones de la Fase 3

| Tema | Decisión | Motivo |
|---|---|---|
| Clasificación | Contrato TicketClassifier, proveedor Gemini y fallback local separados | Permite sustituir el proveedor y mantener la creación disponible |
| Datos a Gemini | Solo título y descripción; categorías activas se envían como opciones válidas | Evita enviar identidad y limita la salida al catálogo actual |
| Modelo | `GEMINI_MODEL=gemini-3.6-flash` en `.env.example`; sin clave no se llama a Gemini | Modelo estable con nivel gratuito verificado en la documentación oficial; la cuota depende de la cuenta y región |
| Persistencia | Campos sugeridos separados de categoría y prioridad seleccionadas | La clasificación es una recomendación, no una decisión del sistema |
| Nueva clasificación | Solo al registrar o por acción explícita de actualizar | Evita llamadas repetidas y consumo inesperado de cuota |

## Decisiones de la Fase 4

| Tema | Decisión | Motivo |
|---|---|---|
| Asignación automática | Solo considera técnicos activos con la especialidad de la categoría; ordena por incidencias activas y luego por ID | Resultado determinista y explicable conforme a la carga de trabajo |
| Sin técnico elegible | La incidencia queda sin asignar y se notifica a los administradores activos | Evita asignar a un técnico sin especialidad |
| Especialidades | El administrador las reemplaza mediante `/api/v1/users/{id}/specialties`; se usan las tablas existentes | No requiere cambio de esquema ni datos de especialidad ficticios |
| Escalamiento | Scheduler configurable mediante `AUTOMATION_ESCALATION_INTERVAL_MS`; procesa incidencias abiertas, en atención o pendientes cuyo `due_at` venció | Permite ajustar la frecuencia sin recompilar |
| Idempotencia | `automation_logs.execution_key` usa una clave única `ESCALATION:{ticketId}` y un `INSERT ... ON CONFLICT DO NOTHING` transaccional | Ejecuciones repetidas no duplican historial ni notificaciones de escalamiento |
| Notificaciones | Persistidas en PostgreSQL, con lectura limitada al propietario y conteo de no leídas | Mantiene privacidad y evita dependencias externas |

El esquema inicial ya define `technician_specialties`, `notifications` y `automation_logs`; esta entrega los conecta al backend sin agregar una migración redundante.

### Cierre de la Fase 4

| Tema | Decisión | Motivo |
|---|---|---|
| Notificaciones en el cliente | `NotificationService` mantiene un signal de no leídas compartido entre el sidebar y la página | Evita sondeos y mantiene el contador sincronizado al marcar como leída. |
| Modo demostración | Endpoint admin-only `POST /api/v1/demo/tickets/{id}/overdue`, desactivado por defecto con `DEMO_MODE_ENABLED=false` | SPEC §19 permite simular vencimientos; queda fuera del flujo normal y no altera las reglas de `due_at`. |
| Datos de demo | El seed asigna especialidad y registra una incidencia vencida cuando el modo demo está activo | La exposición no depende de esperar a que venza un ticket. |

## Decisiones de la Fase 5

| Tema | Decisión | Motivo |
|---|---|---|
| Cálculo de KPIs | Agregación en memoria sobre el listado filtrado de `DashboardService` (marcado `ponytail:`) | Suficiente para el volumen académico; migrar a consultas agregadas de JPA si crece el número de incidencias. |
| Alcance de reportes | `/dashboard/reports/**` restringido a ADMIN; `/summary` respeta el rol del solicitante/técnico | Los reportes detallados son una herramienta de gestión, no un dato del usuario final. |
| Exportación | CSV con `;`, UTF-8 y escape de fórmulas (`'`) en celdas que empiezan con `=+-@` | Se abre en Excel regional sin romper la codificación ni ejecutar fórmulas. |
| Ruta inicial | `/dashboard` reemplaza a `/incidencias` como destino por defecto tras el login | Superficie de mayor valor al entrar a la aplicación. |
| Gráficos | PrimeNG `p-chart` sobre `chart.js`, con donut de prioridad, barras de categoría y carga, y línea de creadas/resueltas | Reutiliza la librería UI ya instalada y tooltips/leyendas responsive sin librerías de pago. |
| Serie temporal | `timeline` de 14 días UTC calculado en `DashboardService` sobre el listado filtrado | Misma regla de alcance por rol y filtros que los KPIs; sin consultas ni endpoints nuevos. |
| Accesibilidad | Conmutador "Ver tablas" con los mismos datos y leyendas con valores visibles | Los gráficos por canvas no son legibles por lectores de pantalla. |

## Paginación (RNF-06)

| Tema | Decisión | Motivo |
|---|---|---|
| Consulta | `TicketRepository.search` acepta `Pageable` y devuelve `Page<Ticket>`; un método `default` sin paginar conserva el acceso para los agregados del dashboard | Un solo `JPQL` para ambos usos, sin duplicar la consulta ni paginar los KPIs. |
| Orden | `createdAt desc, id desc` | Sin desempate por ID, dos registros con la misma fecha pueden cambiar de página entre consultas. |
| Contrato | `PageResponse` con `content`, `page`, `size`, `totalElements`, `totalPages`, `first` y `last` | La UI necesita el total para el paginador; los DTO de Spring no se exponen directamente. |
| Límites | `page >= 0`, `1 <= size <= 100`, `size` por defecto 20 | Evita consultas sin límite y responde `400` antes de llegar a la base. |
| Cliente | `TicketService.list` envía `page`/`size`; los filtros reinician a la página 0 | Cambiar un filtro desde la página 5 mostraba una lista vacía. |

## CI/CD

| Tema | Decisión | Motivo |
|---|---|---|
| Empaquetado del backend | WAR desplegado como `ROOT.war` en `tomcat:11-jdk21` | Tomcat externo mantiene las rutas `/api/v1` y el proxy de Nginx sin cambios; Tomcat 11 cubre Servlet 6.1 de Spring Boot 4.1. |
| Tomcat embebido | `spring-boot-starter-tomcat` en scope `provided`; `SpringBootServletInitializer` habilita el arranque dentro del contenedor | Las pruebas y el modo standalone siguen funcionando sin empaquetar el servidor en el WAR. |
| Artifacts | Bundle del frontend y WAR del backend se suben con `retention-days: 1` | Los resultados de cada commit se pueden descargar sin acumular almacenamiento. |
| Prueba de despliegue | El job `infra` construye la imagen, levanta `db` + `backend` con Docker y consulta `/api/v1/health` antes de limpiar | Valida el arranque real del WAR en Tomcat, no solo la sintaxis de Compose. |
