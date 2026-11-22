# SmartDesk AI

Plataforma web inteligente para la gestión y automatización de incidencias de soporte tecnológico.
Proyecto académico con costo de infraestructura S/ 0.00: todo se ejecuta localmente con Docker Compose.

La especificación completa está en SPEC.md. Las reglas para asistentes de programación están en AGENTS.md.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22, TypeScript, Tailwind CSS 4, Lucide, Vitest |
| Backend | Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA, Flyway, Maven |
| Base de datos | PostgreSQL 17 (Docker) |
| IA | Google AI Studio / Gemini API, solo desde el backend, con fallback local |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Requisitos

- Docker con Docker Compose v2
- Para desarrollo sin contenedores: Node.js 22, pnpm 12, JDK 21 y Maven 3.9+

## Inicio rápido

cp .env.example .env
docker compose up --build -d
docker compose logs -f
docker compose down

En PowerShell:

    Copy-Item .env.example .env

Abre http://localhost:4200 o http://localhost:8080/api/v1/health.

## Datos de demostración

Con el stack levantado, crea el administrador, el solicitante y el técnico, así como una incidencia de red vencida. El script es idempotente, así que puedes repetirlo sin miedo. Para que la incidencia quede vencida, define `DEMO_MODE_ENABLED=true` en `.env` antes de levantar los contenedores:

    pwsh infra/scripts/seed-demo.ps1        # Windows
    bash infra/scripts/seed-demo.sh         # Linux, macOS o contenedor

Credenciales resultantes (contraseña `SmartDeskDemo2026!`):

| Rol | Correo |
|---|---|
| Administrador | admin@smartdesk.local |
| Solicitante | solicitante@smartdesk.local |
| Técnico | tecnico@smartdesk.local |

Si prefieres hacerlo a mano, el administrador inicial se crea una sola vez:

    $payload = @{ fullName = "Administrador"; email = "admin@smartdesk.local"; password = "SmartDeskDemo2026!" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/bootstrap -ContentType "application/json" -Body $payload

La ruta `/api/v1/auth/bootstrap` se cierra automáticamente cuando existe el primer usuario.

`DEMO_MODE_ENABLED=true` habilita además `POST /api/v1/demo/tickets/{id}/overdue` (solo ADMIN) para simular vencimientos. Con el valor por defecto (`false`) el endpoint responde `404`.

## Ejecutar solo el backend en local

Si PostgreSQL ya corre en Docker (puerto 5432) y el frontend con `pnpm start`, el backend puede levantarse fuera de Docker:

    cd apps/backend
    mvn spring-boot:run

Sin Maven (usando el jar compilado): `java -jar target/smartdesk-backend.jar`.

Las credenciales se leen de `apps/backend/local.properties`, un archivo **no versionado** que Spring importa automáticamente. Si no existe, créalo con la contraseña de tu PostgreSQL local:

    spring.datasource.url=jdbc:postgresql://localhost:5432/smartdesk
    spring.datasource.username=smartdesk
    spring.datasource.password=tu_clave

El frontend de desarrollo proxea `/api` hacia `http://localhost:8080` (ver `apps/frontend/proxy.conf.json`).

Docker y ejecución local no pueden usar el mismo puerto: detén el contenedor con `docker compose stop backend` antes de iniciar el backend local.

## Estructura

apps/frontend   Angular servido mediante Nginx en el contenedor
apps/backend    Spring Boot organizado por módulos de dominio
infra/scripts   Scripts de apoyo (seed de datos de demostración)
docs/           Documentación técnica y decisiones
.github/        Workflows de CI/CD y plantillas
