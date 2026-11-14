# Spec: Eliminación Integral de Capacidades PWA / Offline y Corrección de Tipado del Design System

Status: ready-for-agent

## Problem Statement

El sistema de Punto de Venta y Taller (TicketFlow) mantenía una configuración de Progressive Web App (PWA) con Service Worker, caché de activos estáticos, caché en tiempo de ejecución de peticiones de API (`NetworkFirst`) y botones de instalación en escritorio/móvil que introducían complejidad innecesaria, artefactos residuales de compilación y riesgos de servir estados desactualizados en una operación que requiere conexión en tiempo real con el servidor local/central.

Adicionalmente, tras la actualización reciente de primitivas visuales del sistema de diseño (migración de variantes de insignias al estándar base de shadcn y adopción de `HugeiconsIcon` en el indicador de carga), la compilación estricta de TypeScript presentaba errores de verificación de tipos que impedían generar el paquete de producción:

1. **Complejidad y acoplamiento innecesario por capa PWA / Offline:** El empaquetador inyectaba la generación automática de Service Workers y Workbox, manteniendo scripts de registro al arranque, manifiestos de aplicación web, generadores de iconos con dependencias nativas pesadas (`sharp`, `vite-plugin-pwa`, `workbox-window`), carpetas residuales de desarrollo y disparadores de instalación en la barra lateral y el encabezado del sitio.
2. **Riesgo de caché obsoleta en operaciones críticas de mostrador y caja:** En un entorno transaccional donde el arqueo de turno, el stock de inventario y los folios de taller deben reflejar la fuente única de verdad del servidor, interceptar peticiones o precachear vistas mediante un Service Worker agrega fricción operativa y diagnóstica sin aportar valor al flujo actual 100% online.
3. **Ruptura del pipeline de compilación por variantes de insignias obsoletas:** La vista de catálogo de inventario seguía consumiendo variantes cromáticas personalizadas (`blue`, `yellow`, `green`) que fueron retiradas de la primitiva base de insignias en favor de variantes semánticas estándar combinadas con utilidades de color contextuales.
4. **Incompatibilidad de tipos en la primitiva de carga (`Spinner`):** La definición de propiedades del componente de carga propagaba los atributos nativos de un elemento SVG (`strokeWidth` tipado como `string | number`) hacia el motor de iconos (`HugeiconsIcon`), el cual exige estrictamente `strokeWidth` numérico (`number | undefined`).

## Solution

Simplificar la arquitectura del cliente web hacia una aplicación SPA estándar 100% en línea y restablecer la salud del pipeline de construcción y tipado mediante cuatro ejes:

1. **Desmantelamiento Completo del Stack PWA y Service Worker:**
   - Eliminar el registro del Service Worker durante la inicialización de la aplicación de forma directa y limpia, sin dejar lógica residual en el arranque.
   - Retirar el plugin de PWA del empaquetador, las declaraciones globales de tipos de cliente PWA y los metadatos de instalación web/móvil del documento HTML raíz, conservando únicamente el icono vectorial principal (`favicon.svg`), el icono táctil estándar (`apple-touch-icon.png`) y el color de tema.
   - Borrar todos los activos estáticos exclusivos de PWA (manifiestos web, script de Service Worker manual, iconos redimensionados de PWA, máscara de icono, directorio temporal de distribución de desarrollo y script generador de iconos).
   - Desinstalar las dependencias asociadas a Workbox, al plugin de PWA y al procesamiento nativo de imágenes (`sharp`), aligerando el árbol de paquetes del monorepo.
2. **Limpieza de Controles de Instalación en la Interfaz y Documentación:**
   - Eliminar el hook de detección del evento `beforeinstallprompt` y retirar los botones de acción `"Instalar App"` / `"Instalar Aplicación"` tanto del encabezado superior (`SiteHeader`) como del pie de la barra de navegación lateral (`AppSidebar`).
   - Actualizar la documentación de producto y del sistema de diseño para reflejar que la plataforma opera como aplicación web estándar sin capa PWA ni modo offline.
3. **Estandarización de Insignias de Estado y Tipo en Inventario:**
   - Mantener la primitiva base de insignias (`Badge`) alineada con las variantes canónicas del sistema de diseño (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`).
   - En la tabla del catálogo de inventario, representar los artículos de tipo `Servicio` y los niveles de stock disponible (`<= 3` unidades en advertencia ámbar y `> 3` unidades en estado óptimo esmeralda) utilizando la variante `outline` combinada con clases semánticas translúcidas compatibles con tema claro y oscuro, manteniendo consistencia con el historial de ventas y las insignias de estado de taller.
4. **Alineación del Contrato de Tipos en el Indicador de Carga (`Spinner`):**
   - Conservar `HugeiconsIcon` (`Loading03Icon`) como motor del componente `Spinner` en concordancia con la configuración del sistema de componentes, ajustando su firma de propiedades para omitir la definición conflictiva de `strokeWidth` del estándar SVG y tiparla opcionalmente como `number`.

## User Stories

1. Como operador de mostrador o técnico de taller, quiero una interfaz limpia en el encabezado y en la barra lateral sin botones emergentes de "Instalar App", para concentrarme únicamente en las herramientas operativas de taller, ventas y corte de caja.
2. Como administrador del sistema, quiero que la aplicación web consulte siempre al servidor en vivo sin intercepción de un Service Worker ni cachés de Workbox, para garantizar que los saldos de caja, folios y existencias de inventario nunca provengan de respuestas cacheadas obsoletas.
3. Como desarrollador del proyecto, quiero que el árbol de dependencias del frontend esté libre de paquetes nativos pesados de procesamiento de imágenes y librerías de Service Worker que ya no forman parte del producto, para acelerar la instalación de paquetes y reducir la superficie de mantenimiento.
4. Como desarrollador del proyecto, quiero que el directorio de activos públicos y el empaquetado de producción contengan únicamente los recursos web esenciales, sin generar archivos de Service Worker ni manifiestos de instalación ni directorios residuales de desarrollo.
5. Como encargado de inventario, quiero distinguir visualmente en el catálogo cuáles registros corresponden a un `Servicio` (en tono azul cielo) y cuáles a un producto `Físico`, con el mismo lenguaje visual semántico utilizado en el resto de la plataforma.
6. Como encargado de inventario, quiero identificar de un vistazo el nivel de existencias de cada producto mediante insignias semánticas claras (rojo destructivo para agotados, ámbar para stock crítico de 1 a 3 unidades y esmeralda para stock suficiente), tanto en modo oscuro como en modo claro.
7. Como desarrollador del proyecto, quiero que el componente `Spinner` mantenga compatibilidad total con los atributos estándar de iconos (`className`, `data-icon`, atributos ARIA) y con `HugeiconsIcon` sin producir errores de asignación de tipos en `strokeWidth`.
8. Como responsable de calidad e integración continua, quiero que el comando de compilación del frontend ejecute la verificación estricta de TypeScript y el empaquetado de producción con cero errores, asegurando que ningún cambio rompa el contrato de tipos.
9. Como miembro del equipo que consulta la documentación de producto y diseño, quiero que las especificaciones arquitectónicas describan fielmente el comportamiento online de la aplicación sin referencias huérfanas a capacidades PWA u offline.

## Implementation Decisions

- **Eliminación total de la capa PWA y artefactos asociados:**
  - Se retira por completo el soporte de instalación PWA y almacenamiento en caché por Service Worker en lugar de mantener un modo híbrido de solo manifiesto.
  - La eliminación en el punto de entrada de la aplicación es directa y limpia, suprimiendo el bloque de registro de `navigator.serviceWorker` sin inyectar scripts transitorios de desregistro.
  - Se remueven del repositorio los manifiestos web, el Service Worker estático, las imágenes generadas para iconos de aplicación instalable, la carpeta residual de distribución de desarrollo de Workbox y el script de generación de iconos junto con las dependencias `vite-plugin-pwa`, `workbox-window` y `sharp`.
  - Se conservan los iconos web estándar (`favicon.svg`, `apple-touch-icon.png` e `icons.svg`) y la etiqueta `theme-color` en el documento raíz.
- **Simplificación de componentes de navegación y cabecera:**
  - Se elimina el hook personalizado de instalación PWA y se retiran las acciones condicionales de instalación en la barra lateral y en el encabezado superior, junto con las importaciones de iconos que quedaban sin uso.
- **Convención de variantes cromáticas en insignias (`Badge`):**
  - La primitiva base `Badge` conserva exclusivamente las variantes estándar del sistema de diseño (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`), evitando reintroducir variantes ad-hoc de colores fijos en la primitiva.
  - Los estados cromáticos de dominio en el catálogo de inventario (etiqueta de `Servicio`, alerta de bajo stock y confirmación de stock disponible) se expresan componiendo `variant="outline"` con clases utilitarias semánticas de borde, fondo translúcido y texto adaptativo para tema claro/oscuro (`sky`, `amber` y `emerald`), mientras que el estado agotado (`<= 0`) emplea `variant="destructive"`.
- **Contrato de propiedades del componente `Spinner`:**
  - Se mantiene `HugeiconsIcon` con `Loading03Icon` para preservar la coherencia con el resto de las primitivas de interfaz configuradas bajo la librería de iconos del sistema de diseño.
  - La interfaz de propiedades de `Spinner` se define como `Omit<React.ComponentProps<"svg">, "strokeWidth"> & { strokeWidth?: number }`, permitiendo propagar cualquier atributo SVG o `data-icon` sin conflicto de tipos con la propiedad `strokeWidth` numérica de `HugeiconsIcon`.
- **Actualización documental:**
  - Los documentos rectores de producto y sistema de diseño se actualizan para reflejar la operación web directa sin menciones a Service Workers, resiliencia offline por PWA ni botones de instalación en la cabecera.

## Testing Decisions

- **¿Qué constituye una buena prueba?**
  - Las pruebas y verificaciones deben evaluar el comportamiento externo observable del sistema, la validez de tipos del contrato de componentes y la estructura del artefacto de compilación generado, sin acoplarse a detalles internos de implementación.
- **Costura única de verificación (Single Seam):**
  - **Pipeline de Compilación, Tipado Estricto y Empaquetado de Producción + Suite de Pruebas de Dominio:**
    - Verificación estática completa mediante el compilador de TypeScript (`tsc -b`) y el empaquetador de producción (`vite build`), comprobando que el proceso termina con código de salida `0` y que el directorio de salida contiene únicamente los activos web estándar sin generar `sw.js`, scripts de Workbox ni `manifest.webmanifest`.
    - Ejecución íntegra de la suite de pruebas existente (`bun test`) para garantizar cero regresiones en la lógica de estado de servidor, persistencia de tema, motor de punto de venta, motor de corte de caja y flujo de taller.
- **Arte Previo en el Repositorio:**
  - Suite de pruebas unitarias y de integración en `bun:test` para contextos de interfaz, motores de dominio y caché de consultas.

## Out of Scope

- Resolución de advertencias o reglas de estilo de ESLint preexistentes en otros módulos del frontend (`no-explicit-any`, `react-hooks/set-state-in-effect`) que no bloquean la compilación de TypeScript ni forman parte del alcance de PWA o de los errores de build.
- Implementación de colas de sincronización local, almacenamiento en IndexedDB o modos de operación desconectada.
- Cambios en los endpoints, esquemas Zod o servicios del backend (`packages/backend`).

## Further Notes

- Los cambios descritos en esta especificación ya fueron aplicados y verificados en el espacio de trabajo actual, logrando una compilación limpia de TypeScript y Vite (`0` errores) y `61` pruebas pasando en la suite del frontend.
