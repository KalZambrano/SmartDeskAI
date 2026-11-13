# SmartDesk AI — Especificaciones e instrucciones de desarrollo

> **Documento base del proyecto académico**  
> Versión: 1.0  
> Fecha: 12 de noviembre de 2026  
> Objetivo de infraestructura: **S/ 0.00**, utilizando herramientas locales y niveles gratuitos.  
> Arquitectura: **monorepo**.

---

## 1. Visión general

### 1.1 Nombre

**SmartDesk AI — Plataforma web inteligente para la gestión y automatización de incidencias.**

### 1.2 Objetivo general

Diseñar e implementar una plataforma web que centralice el registro, clasificación, asignación y seguimiento de incidencias de soporte tecnológico, incorporando inteligencia artificial generativa mediante Google AI Studio (Gemini API), automatización de procesos y prácticas DevOps con Docker y GitHub Actions.

### 1.3 Problema

En una empresa simulada de soporte tecnológico, las solicitudes llegan al equipo de manera desorganizada. El personal debe revisar cada caso, identificar su categoría y prioridad, asignarlo a un técnico y realizar el seguimiento. La gestión manual puede ocasionar demoras, asignaciones inadecuadas y poca visibilidad sobre el estado del servicio.

### 1.4 Solución

SmartDesk AI será una aplicación web con tres perfiles:

- **Solicitante:** registra incidencias y consulta su seguimiento.
- **Técnico:** revisa las incidencias asignadas, actualiza su estado y registra comentarios.
- **Administrador:** gestiona usuarios, técnicos, categorías, reglas y métricas.

Gemini ayudará a analizar la descripción de una incidencia y propondrá una categoría, prioridad, resumen y respuesta inicial. Las decisiones finales y las reglas de asignación serán controladas por el backend, no por la IA.

### 1.5 Objetivos específicos

1. Centralizar el registro y seguimiento de incidencias.
2. Incorporar clasificación asistida por IA generativa.
3. Automatizar la asignación y el escalamiento de incidencias.
4. Visualizar indicadores de atención en un dashboard.
5. Construir y validar la aplicación mediante un pipeline CI/CD.
6. Ejecutar el sistema completo localmente con Docker Compose.

---

## 2. Alineación con los requisitos académicos

El proyecto se enfoca en tres ejes solicitados en las especificaciones:

| Eje | Implementación en SmartDesk AI | Evidencia para la exposición |
|---|---|---|
| Automatización de procesos (RPA / bots) | Asignación automática, notificaciones internas, escalamiento por vencimiento y generación de reportes. | Demostración de reglas y tareas programadas ejecutándose. |
| CI/CD y contenedores | Monorepo, Dockerfiles, Docker Compose y GitHub Actions para pruebas y construcción. | Historial de ejecuciones exitosas del workflow y construcción de imágenes. |
| IA generativa con APIs de OpenAI indicadas en el documento | Se utilizará **Google AI Studio / Gemini API** como proveedor de IA, por decisión del proyecto. | Demostración de clasificación, prioridad sugerida y respuesta generada. |

**Nota de adecuación:** las especificaciones académicas mencionan explícitamente APIs de OpenAI en el eje de IA. Google AI Studio/Gemini es una sustitución tecnológica solicitada para este proyecto, pero no debe asumirse que el docente la aceptará automáticamente como equivalente. Confirmar esta sustitución con el docente y documentarla en el informe.

La visualización de datos se incorpora adicionalmente mediante el dashboard. No se implementarán AR/VR ni IoT porque no son necesarios para cubrir los tres ejes seleccionados.

---

## 3. Restricción de costo cero

### 3.1 Principio

El proyecto debe poder desarrollarse, ejecutarse, probarse y demostrarse localmente sin pagar suscripciones, infraestructura ni servicios externos.

La aplicación no debe depender de un hosting gratuito para funcionar durante la evaluación. El despliegue remoto será opcional; la demostración principal se realizará con Docker Compose en una computadora local.

### 3.2 Herramientas previstas

| Componente | Herramienta | Costo previsto |
|---|---|---:|
| Control de versiones | Git + GitHub | S/ 0 |
| Frontend | Angular + TypeScript | S/ 0 |
| Backend | Java + Spring Boot | S/ 0 |
| Persistencia | PostgreSQL en Docker | S/ 0 |
| IA | Google AI Studio / Gemini API Free Tier | S/ 0 dentro de los límites gratuitos |
| Contenedores | Docker Engine / Docker Desktop para uso personal sujeto a sus condiciones | S/ 0 |
| CI/CD | GitHub Actions, dentro de la cuota aplicable | S/ 0 |
| Pruebas | JUnit, Mockito, Testcontainers opcional, Jasmine/Karma o runner soportado por Angular | S/ 0 |
| Documentación | Markdown en GitHub | S/ 0 |

### 3.3 Condiciones y límites importantes

- La disponibilidad de modelos Gemini, cuotas, límites por minuto/día y condiciones del nivel gratuito pueden cambiar. Consultar la página oficial antes de seleccionar el modelo.
- Usar exclusivamente un modelo disponible en el nivel gratuito de Gemini API. El nombre del modelo debe configurarse mediante `GEMINI_MODEL`, no repetirse en el código.
- No habilitar facturación ni migrar a un nivel pagado para este proyecto.
- Si se alcanza la cuota gratuita, la aplicación debe informar que el servicio de IA no está disponible temporalmente y permitir continuar con reglas locales.
- La API key de Gemini nunca debe enviarse al navegador ni subirse al repositorio.
- GitHub Actions puede tener cuotas y condiciones distintas según el tipo de repositorio y runner. Mantener workflows eficientes y revisar los límites vigentes.
- No utilizar Render Postgres gratuito como almacenamiento permanente: sus instancias gratuitas tienen límites y caducidad. La base principal será PostgreSQL local.
- No se utilizarán servicios de correo, SMS, WhatsApp, almacenamiento de archivos ni observabilidad que requieran tarjeta o facturación.
- No se garantiza que todo servicio externo gratuito permanezca gratuito. La arquitectura local debe seguir siendo funcional si un proveedor deja de ofrecer su nivel gratuito.

**Política estricta:** no agregar dependencias o servicios que exijan tarjeta bancaria, prueba de pago, créditos temporales o activación de facturación.

---

## 4. Stack tecnológico

### 4.1 Frontend

- Angular, utilizando la versión estable disponible al iniciar el desarrollo.
- TypeScript.
- Angular Router.
- Reactive Forms.
- Angular Signals para estado local cuando corresponda.
- HttpClient para consumir la API REST.
- CSS/SCSS con componentes reutilizables y diseño responsive.
- Librería de iconos gratuita, preferentemente Lucide.

El frontend no debe contener reglas de negocio críticas ni comunicarse directamente con Gemini o PostgreSQL.

### 4.2 Backend

- Java 21 LTS o una versión LTS compatible con la versión estable de Spring Boot seleccionada.
- Spring Boot.
- Spring Web.
- Spring Data JPA.
- Spring Security.
- Bean Validation.
- PostgreSQL Driver.
- Flyway para migraciones.
- Maven.
- JUnit 5 y Mockito.

Organizar el backend por funcionalidades o módulos de dominio, evitando controladores gigantes y lógica de negocio dentro de los controladores.

### 4.3 Base de datos

PostgreSQL ejecutado mediante Docker Compose. Usar migraciones versionadas de Flyway para crear y actualizar el esquema.

### 4.4 IA generativa

- Google AI Studio para crear la API key de Gemini.
- Gemini Developer API.
- Integración realizada exclusivamente desde Spring Boot.
- Modelo configurable mediante variable de entorno.
- Respuesta estructurada en JSON y validada por el backend.

### 4.5 DevOps

- Git y GitHub.
- GitHub Actions.
- Dockerfiles independientes para frontend y backend.
- Docker Compose para levantar frontend, backend y PostgreSQL.
- GitHub Container Registry (GHCR) como publicación opcional de imágenes, si se desea demostrarla y se verifican sus límites y permisos.

---

## 5. Arquitectura de alto nivel

```text
                 USUARIO / ADMINISTRADOR / TÉCNICO
                                |
                                v
                    Angular Web Application
                         (Navegador)
                                |
                         HTTP / REST API
                                |
                                v
                    Spring Boot Backend
                     /       |        \
                    /        |         \
                   v         v          v
             PostgreSQL   Gemini API   Scheduler
             (Docker)   (Google AI)   (procesos)
                   ^         |          |
                   |         v          v
                   |    Clasificación  Reglas de
                   |    y sugerencias  automatización
                   |         |          |
                   +---------+----------+
                         Persistencia
```

### 5.1 Responsabilidades

- **Angular:** presentación, navegación, formularios, validaciones de experiencia de usuario y dashboards.
- **Spring Boot:** autenticación, autorización, reglas de negocio, API REST, integración con Gemini y automatizaciones.
- **PostgreSQL:** persistencia de usuarios, incidencias, asignaciones, comentarios, notificaciones y auditoría.
- **Gemini API:** análisis textual y generación de sugerencias.
- **Scheduler:** ejecución periódica de reglas de escalamiento y tareas automáticas.
- **Docker Compose:** entorno reproducible para ejecutar todos los servicios.
- **GitHub Actions:** validación automática del código y construcción de artefactos/imágenes.

### 5.2 Flujo principal de una incidencia

1. El solicitante inicia sesión y registra una incidencia.
2. El backend valida los datos y guarda la incidencia con estado `OPEN`.
3. El backend solicita a Gemini una clasificación y prioridad sugeridas.
4. El backend valida la respuesta estructurada. Si Gemini falla, aplica reglas locales básicas.
5. El sistema calcula la asignación según categoría, disponibilidad y carga de trabajo de los técnicos activos.
6. Se registra la asignación y se crea una notificación interna.
7. El técnico atiende la incidencia y actualiza su estado.
8. El backend registra cada transición y comentario en el historial.
9. El Scheduler detecta incidencias que exceden el tiempo objetivo y ejecuta el escalamiento definido.
10. El dashboard presenta los indicadores calculados a partir de los datos persistidos.

---

## 6. Estructura del monorepo

Todo el código fuente, documentación, infraestructura y workflows deben vivir en un único repositorio.

```text
smartdesk-ai/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── docker-build.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
│
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   ├── angular.json
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/.../smartdesk/
│       │   │   │   ├── auth/
│       │   │   │   ├── user/
│       │   │   │   ├── ticket/
│       │   │   │   ├── category/
│       │   │   │   ├── assignment/
│       │   │   │   ├── comment/
│       │   │   │   ├── notification/
│       │   │   │   ├── automation/
│       │   │   │   ├── ai/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── audit/
│       │   │   │   └── config/
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       └── db/migration/
│       │   └── test/
│       ├── pom.xml
│       └── Dockerfile
│
├── infra/
│   ├── docker/
│   └── scripts/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── CI-CD.md
│   └── DEMO.md
│
├── .env.example
├── .gitignore
├── compose.yaml
├── Makefile
├── README.md
└── SPEC.md
```

La estructura exacta de paquetes Angular y Java puede evolucionar, pero debe conservar la separación de responsabilidades y permanecer dentro de `apps/`.

---

## 7. Requisitos funcionales

### RF-01. Autenticación y autorización

- Inicio y cierre de sesión.
- Contraseñas almacenadas con hash BCrypt.
- Autenticación mediante JWT.
- Roles: `ADMIN`, `TECHNICIAN`, `REQUESTER`.
- Protección de rutas en Angular y autorización en Spring Security.
- Un solicitante solo puede consultar sus propias incidencias.
- Un técnico puede consultar y gestionar las incidencias que tiene asignadas.
- El administrador puede consultar y gestionar todos los registros.

### RF-02. Gestión de usuarios

- Crear, editar, consultar y desactivar usuarios.
- Registrar nombre, correo, contraseña, rol y estado.
- Asociar especialidades a los técnicos.
- Evitar que usuarios desactivados reciban nuevas asignaciones.

### RF-03. Gestión de categorías

Categorías iniciales sugeridas:

- Hardware.
- Software.
- Redes y conectividad.
- Accesos y cuentas.
- Sistemas e infraestructura.
- Otros.

El administrador podrá mantener las categorías.

### RF-04. Gestión de incidencias

Campos mínimos:

- Código legible de incidencia.
- Título.
- Descripción.
- Categoría.
- Prioridad.
- Estado.
- Solicitante.
- Técnico asignado (opcional al crear).
- Fecha de creación.
- Fecha de actualización.
- Fecha objetivo de atención o vencimiento.
- Resumen y recomendación de IA, cuando existan.

Estados:

- `OPEN`: abierta.
- `IN_PROGRESS`: en atención.
- `PENDING`: pendiente de información o acción.
- `RESOLVED`: resuelta.
- `CLOSED`: cerrada.

Prioridades:

- `LOW`: baja.
- `MEDIUM`: media.
- `HIGH`: alta.
- `CRITICAL`: crítica.

Reglas:

- Toda transición de estado debe ser validada por el backend.
- Una incidencia resuelta puede cerrarse.
- Una incidencia cerrada no debe editarse libremente; su reapertura debe seguir una regla explícita.
- Cada cambio importante debe generar un registro de historial.

### RF-05. Comentarios e historial

- El solicitante y el técnico podrán agregar comentarios según sus permisos.
- Registrar autor, contenido y fecha.
- Registrar cambios de estado, prioridad y asignación.
- El historial será de solo lectura para los usuarios normales.

### RF-06. Clasificación asistida por Gemini

Al crear una incidencia, el backend enviará a Gemini el título y la descripción, evitando enviar datos personales innecesarios.

La respuesta esperada tendrá una estructura equivalente a:

```json
{
  "category": "NETWORK",
  "priority": "HIGH",
  "summary": "El usuario reporta interrupciones frecuentes de conexión.",
  "suggestedResponse": "Verifique la conexión física y reinicie el adaptador de red.",
  "reason": "La descripción indica pérdida recurrente de conectividad."
}
```

Reglas obligatorias:

- La respuesta de Gemini es una sugerencia, no una decisión autorizada.
- Validar que la categoría y prioridad pertenezcan a valores permitidos.
- Limitar longitud de entradas y salidas.
- No ejecutar código, SQL ni acciones arbitrarias propuestas por el modelo.
- No incluir contraseñas, tokens ni información sensible en prompts o logs.
- Si el servicio falla, excede la cuota o devuelve contenido inválido, usar clasificación local básica y permitir registrar la incidencia.
- La interfaz debe indicar si la clasificación fue generada por IA o por fallback local.
- La API key debe existir únicamente en variables de entorno del backend.

### RF-07. Asignación automática

Implementar una estrategia sencilla, explicable y determinista:

1. Filtrar técnicos activos que tengan la especialidad de la categoría.
2. Contar incidencias activas asignadas a cada técnico.
3. Elegir al técnico con menor carga.
4. Si hay empate, utilizar un criterio estable (por ejemplo, menor cantidad histórica de asignaciones o identificador).
5. Si no hay técnicos disponibles, dejar la incidencia sin asignar y notificar al administrador.

La asignación debe ejecutarse en backend y quedar registrada.

### RF-08. Automatización y escalamiento

Implementar tareas programadas con Spring Scheduler.

Reglas iniciales configurables:

- Prioridad baja: objetivo de atención de 24 horas.
- Prioridad media: 12 horas.
- Prioridad alta: 4 horas.
- Prioridad crítica: 1 hora.

Estos tiempos son valores simulados para la demostración académica, no acuerdos reales de nivel de servicio.

El Scheduler debe:

- Buscar incidencias activas cuyo tiempo objetivo haya vencido.
- Evitar escalar repetidamente la misma incidencia en cada ejecución.
- Registrar cada escalamiento.
- Crear una notificación interna para el técnico y/o administrador.
- Ejecutarse con una frecuencia configurable.
- Ser idempotente: ejecutar dos veces la misma revisión no debe duplicar efectos.

### RF-09. Notificaciones internas

- Crear notificaciones cuando se registra una incidencia.
- Notificar asignaciones y reasignaciones.
- Notificar cambios de estado relevantes.
- Notificar escalamiento.
- Permitir marcar una notificación como leída.
- Mostrar contador de notificaciones no leídas.

No se requiere integración con correo, WhatsApp o SMS para el MVP.

### RF-10. Dashboard y reportes

Mostrar, según rol:

- Total de incidencias.
- Incidencias abiertas.
- Incidencias en atención.
- Incidencias pendientes.
- Incidencias resueltas.
- Incidencias vencidas.
- Distribución por prioridad.
- Distribución por categoría.
- Tiempo promedio de resolución.
- Carga de trabajo por técnico.

Permitir filtrar por rango de fechas, estado, prioridad y categoría cuando corresponda.

Agregar exportación CSV como funcionalidad complementaria.

---

## 8. Integración con Google AI Studio / Gemini

### 8.1 Configuración

Crear una API key desde Google AI Studio y guardarla en el archivo local `.env`, que debe estar ignorado por Git.

Variables:

```env
GEMINI_API_KEY=replace_with_your_key
GEMINI_MODEL=replace_with_free_tier_model
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_TIMEOUT_SECONDS=20
GEMINI_MAX_OUTPUT_TOKENS=500
```

El valor de `GEMINI_MODEL` debe corresponder a un modelo disponible en el nivel gratuito al momento de la implementación. Verificar disponibilidad y cuotas en la documentación oficial.

### 8.2 Diseño de la integración

Crear una abstracción de servicio, por ejemplo:

- `AiClassificationService`: contrato de clasificación.
- `GeminiAiClassificationService`: implementación que consume Gemini.
- `RuleBasedClassificationService`: fallback local.
- `AiClassificationResult`: DTO validado.

La lógica de negocio no debe depender directamente del cliente HTTP de Gemini. Esto facilita pruebas y permite sustituir el proveedor sin modificar el módulo de incidencias.

### 8.3 Comportamiento ante errores

Manejar explícitamente:

- API key ausente.
- Timeout.
- Error HTTP.
- Cuota excedida / respuesta 429.
- Respuesta inválida o JSON mal formado.
- Modelo no disponible.

Ante cualquiera de estos casos, registrar un log sin secretos, activar el fallback y continuar el registro de la incidencia.

### 8.4 Protección de cuota

- Invocar Gemini solo al crear una incidencia o cuando el usuario solicite explícitamente un nuevo análisis.
- No llamar al modelo cada vez que se abre el detalle.
- Limitar el tamaño del texto enviado.
- Mantener una salida corta y estructurada.
- No habilitar grounding, búsqueda web ni herramientas adicionales para este MVP.
- Mostrar un mensaje claro cuando se alcance la cuota gratuita.

### 8.5 Privacidad

La aplicación utilizará datos ficticios para la demostración. No enviar datos personales reales a Gemini. Informar en la interfaz que la descripción puede procesarse mediante un servicio externo de IA.

Documentación oficial:
- Google AI Studio: https://aistudio.google.com/
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini API documentation: https://ai.google.dev/gemini-api/docs

---

## 9. API REST propuesta

Prefijo: `/api/v1`

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| POST | `/auth/login` | Iniciar sesión | Público |
| GET | `/auth/me` | Obtener usuario autenticado | Autenticado |
| GET | `/users` | Listar usuarios | Admin |
| POST | `/users` | Crear usuario | Admin |
| PUT | `/users/{id}` | Actualizar usuario | Admin |
| GET | `/categories` | Listar categorías | Autenticado |
| POST | `/categories` | Crear categoría | Admin |
| GET | `/tickets` | Listar incidencias permitidas | Según rol |
| POST | `/tickets` | Registrar incidencia | Requester |
| GET | `/tickets/{id}` | Consultar detalle | Según permisos |
| PATCH | `/tickets/{id}/status` | Cambiar estado | Según rol |
| PATCH | `/tickets/{id}/assignment` | Asignar o reasignar | Admin / regla interna |
| POST | `/tickets/{id}/comments` | Agregar comentario | Según permisos |
| GET | `/tickets/{id}/history` | Consultar historial | Según permisos |
| POST | `/tickets/{id}/ai-analysis` | Solicitar nuevo análisis | Según permisos |
| GET | `/notifications` | Listar notificaciones | Autenticado |
| PATCH | `/notifications/{id}/read` | Marcar como leída | Propietario |
| GET | `/dashboard/summary` | Indicadores principales | Según rol |
| GET | `/dashboard/reports` | Datos agregados | Admin |
| GET | `/dashboard/reports/export` | Exportar CSV | Admin |
| GET | `/health` | Estado básico de la aplicación | Público o interno |

Usar DTOs para entrada y salida. No exponer entidades JPA directamente. Implementar paginación y filtros para listados.

La documentación OpenAPI/Swagger puede incorporarse como herramienta de desarrollo si no implica un servicio externo.

---

## 10. Modelo de datos inicial

Entidades recomendadas:

### `users`

- `id` (UUID o BIGINT).
- `full_name`.
- `email` (único).
- `password_hash`.
- `role`.
- `active`.
- `created_at`.
- `updated_at`.

### `categories`

- `id`.
- `name`.
- `code` (único).
- `description`.
- `active`.

### `technician_specialties`

- `id`.
- `technician_id`.
- `category_id`.

### `tickets`

- `id`.
- `ticket_code` (único).
- `title`.
- `description`.
- `category_id`.
- `priority`.
- `status`.
- `requester_id`.
- `assigned_technician_id` (nullable).
- `ai_summary` (nullable).
- `ai_suggested_response` (nullable).
- `ai_classification_source` (AI / RULES / NONE).
- `due_at`.
- `resolved_at` (nullable).
- `created_at`.
- `updated_at`.

### `ticket_comments`

- `id`.
- `ticket_id`.
- `author_id`.
- `content`.
- `created_at`.

### `ticket_history`

- `id`.
- `ticket_id`.
- `actor_id` (nullable para procesos automáticos).
- `event_type`.
- `old_value` (nullable).
- `new_value` (nullable).
- `description`.
- `created_at`.

### `notifications`

- `id`.
- `user_id`.
- `ticket_id` (nullable).
- `title`.
- `message`.
- `read_at` (nullable).
- `created_at`.

### `automation_logs`

- `id`.
- `ticket_id` (nullable).
- `automation_type`.
- `execution_key` (única cuando aplique).
- `status`.
- `details`.
- `executed_at`.

Agregar índices para correo, código de incidencia, estado, prioridad, categoría, técnico asignado y fechas utilizadas en filtros.

Usar claves foráneas y restricciones para mantener integridad. Las migraciones deben estar versionadas en Flyway.

---

## 11. Docker y ejecución local

### 11.1 Servicios

`compose.yaml` debe definir:

- `frontend`: aplicación Angular servida mediante Nginx en el contenedor.
- `backend`: API Spring Boot.
- `db`: PostgreSQL.

La base de datos tendrá volumen nombrado para persistencia local. Configurar healthcheck para PostgreSQL y esperar a que la base esté saludable antes de iniciar el backend.

### 11.2 Variables de entorno

Crear `.env.example` con valores de ejemplo, nunca con credenciales reales:

```env
POSTGRES_DB=smartdesk
POSTGRES_USER=smartdesk
POSTGRES_PASSWORD=change_me_locally

JWT_SECRET=replace_with_a_long_random_local_secret
JWT_EXPIRATION_MINUTES=60

GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_TIMEOUT_SECONDS=20

BACKEND_PORT=8080
FRONTEND_PORT=4200
```

El backend debe poder iniciar sin `GEMINI_API_KEY`, utilizando el proveedor de reglas locales.

### 11.3 Comandos esperados

Documentar en el README comandos equivalentes a:

```bash
# Copiar variables de entorno
cp .env.example .env

# Construir e iniciar todos los servicios
docker compose up --build -d

# Ver logs
docker compose logs -f

# Detener servicios sin eliminar datos
docker compose down

# Detener y eliminar también los datos locales
docker compose down -v
```

En Windows PowerShell, documentar el comando equivalente para copiar `.env.example` a `.env`.

### 11.4 Persistencia y datos de demostración

- Incluir datos semilla para categorías.
- Crear usuarios ficticios de demostración mediante un perfil o script de desarrollo.
- No incluir contraseñas reales ni API keys en seeds.
- Documentar credenciales de demostración solo si se generan localmente y son claramente ficticias.
- El entorno de pruebas debe usar una base separada o datos aislados.

---

## 12. CI/CD con GitHub Actions

### 12.1 Objetivo del pipeline

Cada cambio debe validarse automáticamente desde el monorepo. El pipeline no debe necesitar secretos de Gemini para ejecutar pruebas.

### 12.2 Workflow `ci.yml`

Eventos:

- `pull_request` hacia `main` y `develop`.
- `push` hacia `main` y `develop`.
- Ejecución manual (`workflow_dispatch`).

Jobs:

**Frontend**
1. Checkout.
2. Configurar Node.js en versión LTS compatible.
3. Instalar dependencias con el lockfile (`npm ci` o el gestor seleccionado).
4. Ejecutar lint.
5. Ejecutar pruebas.
6. Ejecutar build de producción.

**Backend**
1. Checkout.
2. Configurar Java LTS y Maven cache.
3. Ejecutar pruebas unitarias.
4. Ejecutar pruebas de integración necesarias.
5. Ejecutar `mvn verify` o equivalente.

**Infraestructura**
1. Validar sintaxis de Compose.
2. Construir imágenes Docker cuando corresponda.

### 12.3 Workflow `docker-build.yml`

- Ejecutarse al integrar cambios a `main` o manualmente.
- Construir las imágenes de frontend y backend.
- Etiquetar las imágenes con el SHA del commit y `latest` cuando corresponda.
- La publicación en GHCR será opcional y se habilitará solo después de verificar permisos, visibilidad y límites gratuitos.
- No desplegar automáticamente a un hosting que pueda generar cargos.

### 12.4 Buenas prácticas

- Fijar versiones de actions a versiones estables.
- Usar permisos mínimos (`contents: read` y permisos de packages solo cuando se publique).
- No imprimir secretos en logs.
- No ejecutar despliegues desde forks no confiables.
- Utilizar caché de dependencias.
- Evitar instalar herramientas innecesarias.
- Configurar protección de rama y exigir CI exitoso antes de merge.
- Mantener los workflows dentro de la cuota gratuita disponible.

### 12.5 Estrategia de ramas

- `main`: versión estable y demostrable.
- `develop`: integración de funcionalidades.
- `feature/nombre`: desarrollo de una funcionalidad.
- `fix/nombre`: correcciones.

Flujo: crear rama de trabajo → commit → Pull Request a `develop` → CI → revisión → merge. Cuando la versión esté lista, Pull Request de `develop` hacia `main`.

---

## 13. Diseño de interfaz

### 13.1 Lineamientos

Construir una interfaz moderna, sobria, profesional y responsive. Debe sentirse como un producto SaaS de soporte empresarial.

- Diseño claro, con jerarquía visual.
- Sidebar para navegación en escritorio.
- Navegación adaptable en pantallas pequeñas.
- Tarjetas de indicadores en el dashboard.
- Tablas con filtros, paginación y estados vacíos.
- Formularios con mensajes de validación claros.
- Badges para estados y prioridades.
- Confirmación antes de acciones destructivas.
- Estados de carga y error.
- Accesibilidad básica: etiquetas, navegación por teclado, contraste y foco visible.

No sobrecargar el diseño con gradientes, animaciones o elementos decorativos innecesarios.

### 13.2 Vistas mínimas

1. Login.
2. Dashboard.
3. Listado de incidencias.
4. Crear incidencia.
5. Detalle de incidencia.
6. Bandeja de trabajo del técnico.
7. Notificaciones.
8. Administración de usuarios.
9. Administración de categorías.
10. Reportes.

Las opciones visibles deben depender del rol del usuario.

---

## 14. Seguridad y calidad

- Guardar contraseñas con BCrypt.
- Usar JWT con expiración.
- Validar roles y propiedad de los recursos en backend.
- Validar y normalizar entradas.
- Aplicar límites de tamaño a título, descripción y comentarios.
- Usar consultas parametrizadas mediante JPA.
- No devolver stack traces al cliente.
- No guardar secretos en Git.
- Mantener `.env` fuera del repositorio.
- Configurar CORS únicamente para los orígenes necesarios.
- No registrar tokens, contraseñas ni API keys.
- Utilizar datos ficticios durante las pruebas y demostraciones.
- Mantener dependencias actualizadas y revisar vulnerabilidades.
- Añadir pruebas para permisos, transiciones de estado, asignación e idempotencia de automatizaciones.

---

## 15. Requisitos no funcionales

| Código | Requisito |
|---|---|
| RNF-01 | La aplicación debe poder ejecutarse localmente mediante Docker Compose. |
| RNF-02 | El sistema debe seguir permitiendo registrar incidencias si Gemini no está disponible. |
| RNF-03 | El backend debe validar toda operación y autorización. |
| RNF-04 | La interfaz debe ser responsive para escritorio, tablet y móvil. |
| RNF-05 | Las operaciones críticas deben generar historial. |
| RNF-06 | Las listas deben tener paginación y filtros desde el backend. |
| RNF-07 | El código debe estar organizado por responsabilidades y funcionalidades. |
| RNF-08 | Las pruebas y compilaciones deben ejecutarse en GitHub Actions. |
| RNF-09 | Los secretos deben gestionarse mediante variables de entorno. |
| RNF-10 | El sistema debe recuperarse de errores temporales de Gemini sin perder la incidencia registrada. |

---

## 16. Alcance del MVP y prioridades

### Imprescindible

- [ ] Monorepo configurado.
- [ ] Angular y Spring Boot ejecutándose.
- [ ] PostgreSQL y migraciones.
- [ ] Login y roles.
- [ ] CRUD de incidencias.
- [ ] Comentarios e historial.
- [ ] Integración Gemini con fallback local.
- [ ] Asignación automática.
- [ ] Escalamiento programado e idempotente.
- [ ] Notificaciones internas.
- [ ] Dashboard básico.
- [ ] Docker Compose.
- [ ] GitHub Actions con pruebas y build.
- [ ] Documentación para ejecutar y demostrar el proyecto.

### Complementario, solo si el MVP está completo

- [ ] Exportación CSV.
- [ ] Filtros avanzados.
- [ ] Reasignación manual.
- [ ] Gráficos adicionales.
- [ ] Publicación de imágenes en GHCR.
- [ ] Despliegue remoto gratuito opcional.

### Fuera de alcance

- WhatsApp, SMS y correo transaccional.
- Integración con Jira u otras plataformas comerciales.
- Aplicación móvil nativa.
- Microservicios.
- Kubernetes.
- Arquitectura multiempresa.
- Agentes autónomos con capacidad de ejecutar acciones sin aprobación.
- AR/VR, metaverso e IoT.
- Funciones que requieran servicios de pago.

---

## 17. Plan de implementación por fases

### Fase 0 — Preparación

- Crear repositorio GitHub.
- Inicializar estructura del monorepo.
- Crear `README.md`, `SPEC.md` y `.env.example`.
- Configurar convenciones de commits y ramas.
- Preparar Angular, Spring Boot y Docker Compose.

**Criterio de salida:** frontend, backend y PostgreSQL inician localmente.

### Fase 1 — Fundamentos backend y persistencia

- Crear entidades y migraciones.
- Implementar repositorios, servicios y controladores.
- Implementar autenticación y autorización.
- Cargar categorías y usuarios ficticios.

**Criterio de salida:** autenticación y operaciones básicas funcionan con persistencia real.

### Fase 2 — Frontend y gestión de incidencias

- Implementar login y navegación por roles.
- Crear listado, formulario y detalle de incidencias.
- Integrar API REST.
- Agregar comentarios e historial.

**Criterio de salida:** un solicitante registra y consulta incidencias; un técnico puede atender las asignadas.

### Fase 3 — IA generativa

- Crear la abstracción de clasificación.
- Integrar Gemini API desde Spring Boot.
- Validar respuesta estructurada.
- Implementar fallback local.
- Mostrar sugerencias en la interfaz.

**Criterio de salida:** la incidencia puede clasificarse con Gemini o con reglas locales sin bloquear el registro.

### Fase 4 — Automatización

- Implementar asignación automática.
- Implementar Scheduler.
- Implementar escalamiento idempotente.
- Crear notificaciones internas.
- Registrar ejecuciones automáticas.

**Criterio de salida:** una incidencia puede asignarse y escalarse automáticamente, con evidencia en historial y notificaciones.

### Fase 5 — Dashboard y reportes

- Implementar consultas agregadas.
- Crear tarjetas KPI y gráficos.
- Incorporar filtros y exportación CSV si el tiempo lo permite.

**Criterio de salida:** el administrador puede visualizar el estado general del soporte.

### Fase 6 — DevOps y calidad

- Crear Dockerfiles multi-stage.
- Completar Docker Compose.
- Crear workflows de GitHub Actions.
- Agregar pruebas de backend y frontend.
- Validar construcción de imágenes.

**Criterio de salida:** un Pull Request ejecuta las validaciones y el proyecto puede construirse desde cero.

### Fase 7 — Preparación de entrega

- Revisar seguridad y variables de entorno.
- Preparar datos ficticios.
- Completar documentación técnica.
- Preparar guion de demostración.
- Registrar evidencias del pipeline.

**Criterio de salida:** demostración reproducible y documentación lista para el informe.

---

## 18. Pruebas y criterios de aceptación

El proyecto se considerará funcional cuando se pueda demostrar lo siguiente:

1. Un solicitante inicia sesión y registra una incidencia.
2. El backend guarda la incidencia en PostgreSQL.
3. Gemini devuelve una categoría, prioridad sugerida, resumen y respuesta inicial, o se activa el fallback si no está disponible.
4. El sistema asigna la incidencia a un técnico elegible o la deja sin asignar si no existe uno.
5. El técnico visualiza su incidencia y cambia su estado.
6. El sistema registra comentarios y transiciones en el historial.
7. Una incidencia vencida es escalada por el Scheduler sin duplicar el mismo evento.
8. El usuario recibe notificaciones internas.
9. El administrador visualiza indicadores coherentes con los datos almacenados.
10. Los usuarios no pueden acceder a incidencias fuera de sus permisos.
11. `docker compose up --build` permite iniciar el sistema desde un entorno limpio.
12. GitHub Actions ejecuta pruebas y compilaciones correctamente ante un Pull Request.

### Escenarios negativos obligatorios

- Gemini no tiene API key configurada.
- Gemini responde con error o cuota excedida.
- Gemini devuelve una categoría no permitida.
- Un solicitante intenta consultar la incidencia de otro.
- Un técnico intenta modificar una incidencia que no tiene asignada.
- Dos ejecuciones del Scheduler intentan escalar la misma incidencia.
- La base de datos no está disponible al iniciar el backend.

---

## 19. Guion de demostración académica

Duración sugerida: 7–10 minutos.

1. **Presentación del problema:** explicar la gestión manual de incidencias.
2. **Registro:** iniciar sesión como solicitante y crear una incidencia.
3. **IA:** mostrar la clasificación y prioridad sugeridas por Gemini.
4. **Automatización:** mostrar la asignación automática y la notificación.
5. **Atención:** ingresar como técnico, actualizar estado y agregar comentario.
6. **Escalamiento:** mostrar una incidencia de prueba vencida y la ejecución del Scheduler.
7. **Dashboard:** presentar indicadores y distribución de incidencias.
8. **Docker:** mostrar los contenedores activos y los servicios.
9. **CI/CD:** mostrar un Pull Request y la ejecución exitosa de GitHub Actions.

Preparar datos de demostración para que no sea necesario esperar a que una incidencia venza durante la exposición. Se puede incluir un modo de demostración controlado que permita establecer una fecha objetivo vencida, sin alterar las reglas normales del sistema.

---

## 20. Instrucciones para asistentes de programación (AGENTS.md)

Crear un archivo `AGENTS.md` en la raíz del monorepo con estas reglas:

### Reglas generales

1. Leer `SPEC.md` antes de implementar funcionalidades.
2. Respetar el monorepo; no crear repositorios separados para frontend y backend.
3. No introducir servicios de pago ni dependencias que exijan tarjeta.
4. No inventar requisitos que contradigan `SPEC.md`.
5. Antes de modificar archivos, revisar la estructura y convenciones existentes.
6. Implementar por fases y mantener el proyecto compilable.
7. No generar todo el sistema en una única operación; dividir el trabajo en funcionalidades pequeñas.
8. No dejar datos ficticios hardcodeados en la lógica de producción.
9. Mantener `.env` fuera de Git y nunca exponer secretos en frontend.
10. Documentar cualquier decisión técnica que cambie la arquitectura.

### Reglas de frontend

- Usar Angular y TypeScript con tipado estricto.
- Preferir componentes pequeños y reutilizables.
- Separar páginas, componentes, servicios, modelos y guards.
- Utilizar Reactive Forms para formularios complejos.
- Usar Signals cuando aporten claridad al estado local.
- Centralizar el acceso HTTP a la API en servicios.
- No colocar lógica de negocio crítica en componentes.
- Implementar estados de carga, error, vacío y éxito.
- Respetar responsive design y accesibilidad.

### Reglas de backend

- Mantener separación entre controller, service, repository, entity y DTO.
- Los controladores deben ser delgados.
- Validar entradas mediante Bean Validation.
- No exponer entidades JPA directamente.
- Aplicar autorización en backend, no solo en frontend.
- Utilizar transacciones cuando una operación actualice varias entidades.
- Centralizar el manejo de errores.
- Versionar cambios de base de datos con Flyway.
- Escribir pruebas para reglas de negocio y permisos.

### Reglas de IA

- Gemini se consume únicamente desde el backend.
- Leer la API key desde variables de entorno.
- No acoplar el dominio a clases específicas del proveedor.
- Validar toda respuesta generada.
- Nunca permitir que la IA ejecute SQL o acciones arbitrarias.
- Implementar fallback local.
- No enviar información personal innecesaria.
- Evitar llamadas repetidas que consuman cuota.

### Reglas de DevOps

- Mantener Dockerfiles y Compose actualizados.
- No incluir secretos en imágenes.
- Los workflows deben poder ejecutarse sin una API key real.
- Toda nueva funcionalidad debe incluir pruebas pertinentes.
- Antes de finalizar una tarea, ejecutar las pruebas y builds afectados.
- Informar qué comandos se ejecutaron y sus resultados reales.
- No afirmar que una prueba pasó si no se ejecutó.

### Flujo de trabajo del agente

Para cada tarea:

1. Leer los apartados pertinentes de `SPEC.md`.
2. Inspeccionar el código existente.
3. Proponer brevemente los archivos que se modificarán.
4. Implementar un cambio acotado.
5. Ejecutar pruebas y build correspondientes.
6. Corregir errores introducidos.
7. Actualizar documentación si cambió el comportamiento.
8. Resumir archivos modificados, validaciones ejecutadas y pendientes.

---

## 21. Primer backlog de desarrollo

Orden sugerido para comenzar:

| ID | Tarea | Prioridad |
|---|---|---|
| SD-001 | Crear estructura del monorepo | Alta |
| SD-002 | Inicializar Angular | Alta |
| SD-003 | Inicializar Spring Boot | Alta |
| SD-004 | Configurar PostgreSQL y Docker Compose | Alta |
| SD-005 | Configurar Flyway y entidades iniciales | Alta |
| SD-006 | Configurar GitHub Actions CI | Alta |
| SD-007 | Implementar login y roles | Alta |
| SD-008 | Implementar CRUD de incidencias | Alta |
| SD-009 | Implementar comentarios e historial | Alta |
| SD-010 | Integrar Gemini API y fallback | Alta |
| SD-011 | Implementar asignación automática | Alta |
| SD-012 | Implementar Scheduler y escalamiento | Alta |
| SD-013 | Implementar notificaciones internas | Media |
| SD-014 | Implementar dashboard | Media |
| SD-015 | Agregar reportes CSV | Baja |
| SD-016 | Preparar documentación y demo | Alta |

---

## 22. Definición de terminado (Definition of Done)

Una tarea se considera terminada cuando:

- Cumple los requisitos funcionales relacionados.
- Respeta las convenciones del monorepo.
- Incluye validaciones y manejo de errores.
- Tiene pruebas pertinentes.
- No introduce secretos ni servicios de pago.
- Compila correctamente.
- Está documentada cuando corresponde.
- No rompe funcionalidades existentes.

---

## 23. Referencias técnicas oficiales

- Angular: https://angular.dev/
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Security: https://spring.io/projects/spring-security
- PostgreSQL: https://www.postgresql.org/docs/
- Docker Compose: https://docs.docker.com/compose/
- Docker: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/actions
- GitHub Actions billing: https://docs.github.com/billing/managing-billing-for-your-products/managing-billing-for-github-actions
- Google AI Studio: https://aistudio.google.com/
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits

---

## 24. Decisiones pendientes antes de implementar

Estas decisiones pueden resolverse al iniciar el repositorio, sin bloquear el diseño general:

1. Confirmar con el docente que Gemini API puede sustituir la referencia a OpenAI del documento académico.
2. Elegir el modelo Gemini que tenga nivel gratuito disponible en la cuenta y región.
3. Confirmar versiones estables compatibles de Angular, Java y Spring Boot.
4. Elegir si el frontend se servirá en desarrollo mediante Angular CLI y en contenedor mediante Nginx.
5. Definir si se publicarán imágenes en GHCR; no es requisito para ejecutar el pipeline de build.
6. Definir el nombre del paquete Java y el nombre final del repositorio.

**Decisión de arquitectura:** ninguna de estas decisiones debe impedir que el sistema se ejecute localmente con Docker Compose y sin credenciales externas. La integración Gemini será opcional y el fallback local garantizará la demostración del flujo principal.
