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

Abre http://localhost:4200 o http://localhost:8080/api/v1/health.

## Preparar la primera cuenta (Fase 1)

Con PostgreSQL y backend en ejecución, crea el primer administrador una sola vez desde PowerShell:

    $payload = @{ fullName = "Administrador"; email = "admin@smartdesk.local"; password = "CambiaEstaClavePorUnaDe12+" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/bootstrap -ContentType "application/json" -Body $payload

La ruta de inicialización se cierra cuando existe el primer usuario. Luego inicia sesión con esas credenciales. Crea cuentas de solicitantes y técnicos desde base de datos hasta implementar administración de usuarios.

## Estructura

apps/frontend   Angular servido mediante Nginx en el contenedor
apps/backend    Spring Boot organizado por módulos de dominio
docs/           Documentación técnica y decisiones
.github/        Workflows de CI/CD y plantillas
