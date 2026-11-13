# Arquitectura y decisiones técnicas

La arquitectura de alto nivel está en la especificación del proyecto. Este documento registra las decisiones tomadas al implementar la Fase 0.

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
| Imágenes | Multi-stage y usuario no root en backend | Imágenes pequeñas sin secretos |

## Pendiente de decisión

- Publicación de imágenes en GHCR.
- Modelo Gemini disponible en el nivel gratuito.
- Confirmación con el docente de la sustitución de OpenAI por Gemini.
