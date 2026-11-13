# AGENTS.md — Reglas para asistentes de programación

## Reglas generales

1. Leer SPEC.md antes de implementar funcionalidades.
2. Respetar el monorepo; no crear repositorios separados para frontend y backend.
3. No introducir servicios de pago ni dependencias que exijan tarjeta.
4. No inventar requisitos que contradigan SPEC.md.
5. Antes de modificar archivos, revisar la estructura y convenciones existentes.
6. Implementar por fases y mantener el proyecto compilable.
7. No generar todo el sistema en una única operación; dividir el trabajo en funcionalidades pequeñas.
8. No dejar datos ficticios hardcodeados en la lógica de producción.
9. Mantener .env fuera de Git y nunca exponer secretos en el frontend.
10. Documentar cualquier decisión técnica que cambie la arquitectura en docs/ARCHITECTURE.md.

## Reglas de frontend

- Usar Angular y TypeScript con tipado estricto.
- Gestor de paquetes: pnpm; no usar npm ni yarn.
- Estilos: Tailwind CSS con tokens definidos en src/styles.css; iconos con @lucide/angular.
- Preferir componentes pequeños y reutilizables.
- Separar páginas, componentes, servicios, modelos y guards en features/.
- Utilizar Reactive Forms para formularios complejos.
- Usar Signals cuando aporten claridad al estado local.
- Centralizar el acceso HTTP a la API en servicios.
- No colocar lógica de negocio crítica en componentes.
- Implementar estados de carga, error, vacío y éxito.
- Respetar responsive design y accesibilidad.

## Reglas de backend

- Paquete base: pe.edu.utp.smartdesk, organizado por módulos de dominio.
- Mantener separación entre controller, service, repository, entity y DTO.
- Los controladores deben ser delgados.
- Validar entradas mediante Bean Validation.
- No exponer entidades JPA directamente.
- Aplicar autorización en backend, no solo en frontend.
- Utilizar transacciones cuando una operación actualice varias entidades.
- Centralizar el manejo de errores.
- Versionar cambios de base de datos con Flyway.
- Escribir pruebas para reglas de negocio y permisos.

## Reglas de IA

- Gemini se consume únicamente desde el backend.
- Leer la API key desde variables de entorno; el modelo se configura con GEMINI_MODEL.
- No acoplar el dominio a clases específicas del proveedor.
- Validar toda respuesta generada.
- Nunca permitir que la IA ejecute SQL o acciones arbitrarias.
- Implementar fallback local.
- No enviar información personal innecesaria.
- Evitar llamadas repetidas que consuman cuota.

## Reglas de DevOps

- Mantener Dockerfiles y Compose actualizados.
- No incluir secretos en imágenes.
- Los workflows deben poder ejecutarse sin una API key real.
- Toda nueva funcionalidad debe incluir pruebas pertinentes.
- Antes de finalizar una tarea, ejecutar las pruebas y builds afectados.
- Informar qué comandos se ejecutaron y sus resultados reales.
- No afirmar que una prueba pasó si no se ejecutó.

## Flujo de trabajo del agente

1. Leer los apartados pertinentes de SPEC.md.
2. Inspeccionar el código existente.
3. Proponer brevemente los archivos que se modificarán.
4. Implementar un cambio acotado.
5. Ejecutar pruebas y build correspondientes.
6. Corregir errores introducidos.
7. Actualizar documentación si cambió el comportamiento.
8. Resumir archivos modificados, validaciones ejecutadas y pendientes.
