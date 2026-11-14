# 01: Desmantelamiento Integral de Capa PWA, Service Worker y Controles de Instalación

**What to build:**
La aplicación web opera y se distribuye exclusivamente como una SPA 100% en línea conectada en tiempo real al servidor, eliminando cualquier registro de Service Worker en el arranque, la intercepción de red o almacenamiento en caché mediante Workbox, los manifiestos de instalación web, los scripts y activos estáticos de iconos de PWA, las dependencias asociadas de generación de iconos y Service Worker, y los controles de instalación en el encabezado superior y en la barra lateral, manteniendo alineada la documentación de producto y del sistema de diseño.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] La inicialización del cliente web arranca directamente la aplicación sin registrar ningún Service Worker en el navegador.
- [x] El empaquetador de producción y la configuración de tipos de TypeScript operan sin el plugin de PWA ni referencias globales a tipos de Service Worker, y el documento HTML raíz conserva únicamente los metadatos web estándar (`favicon.svg`, `apple-touch-icon.png` y `theme-color`).
- [x] Todos los artefactos exclusivos de PWA (manifiestos web, Service Worker estático, iconos redimensionados de PWA, carpeta temporal de distribución de desarrollo y script generador de iconos) y las dependencias `vite-plugin-pwa`, `workbox-window` y `sharp` han sido eliminados del repositorio y del lockfile.
- [x] El hook de detección de instalación y los botones `"Instalar App"` / `"Instalar Aplicación"` ya no existen ni se renderizan en la cabecera superior ni en el pie de la barra de navegación lateral.
- [x] La documentación de producto y del sistema de diseño refleja la operación 100% online sin menciones a capacidades PWA, modo offline o acciones de instalación en la interfaz.
- [x] El paquete de producción generado por el bundler no emite `sw.js`, scripts de Workbox ni `manifest.webmanifest`.
