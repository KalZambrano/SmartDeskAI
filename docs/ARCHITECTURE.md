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
| Imágenes | Multi-stage y usuario no root en backend | Imágenes pequeñas sin secretos |

## Pendiente de decisión

- Publicación de imágenes en GHCR.
- Modelo Gemini disponible en el nivel gratuito.
- Confirmación con el docente de la sustitución de OpenAI por Gemini.

## Decisiones de la Fase 3

| Tema | Decisión | Motivo |
|---|---|---|
| Clasificación | Contrato TicketClassifier, proveedor Gemini y fallback local separados | Permite sustituir el proveedor y mantener la creación disponible |
| Datos a Gemini | Solo título y descripción; categorías activas se envían como opciones válidas | Evita enviar identidad y limita la salida al catálogo actual |
| Modelo | Configuración obligatoria con GEMINI_MODEL; sin nombre predeterminado | El modelo disponible y la cuota dependen de la cuenta y región |
| Persistencia | Campos sugeridos separados de categoría y prioridad seleccionadas | La clasificación es una recomendación, no una decisión del sistema |
| Nueva clasificación | Solo al registrar o por acción explícita de actualizar | Evita llamadas repetidas y consumo inesperado de cuota |
