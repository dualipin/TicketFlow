# 03: Ergonomía táctil y ajuste fino en Taller, Punto de Venta y Corte de Caja

**What to build:** Al gestionar órdenes en Taller, cobrar en el Punto de Venta (POS) o realizar apertura y arqueo de Corte de Caja, los técnicos y cajeros interactúan con botones, selectores de estado, controles de captura multimedia, bandejas de denominaciones y listas de historial con tamaño táctil y tipográfico consistente en escritorio y móvil, dejando alineada la documentación de diseño del frontend con la escala final aplicada.

**Blocked by:** 01: Escala raíz global, legibilidad de cuerpo y ergonomía en primitivas y shell

**Status:** resolved

- [x] En el módulo de Taller (vista de cola, modal de creación, panel de detalle, cambio de estado y captura multimedia), los botones y controles de acción abandonan tamaños extra-compactos (`xs` / alturas inferiores a `32px`) para ofrecer operación táctil cómoda sin saturar las tarjetas.
- [x] En Punto de Venta e Historial de Ventas, los controles de catálogo, limpiado de búsqueda, carrito y filtros mantienen alturas e iconografía legibles y cómodas en pantalla táctil y escritorio.
- [x] En Corte de Caja (apertura de turno, bandeja de denominaciones, formulario de arqueo e historial de cortes), los botones de ajuste rápido y acciones principales alcanzan dimensiones cómodas al tacto y mantienen legibilidad clara de cifras monetarias.
- [x] La documentación de diseño del frontend refleja cualquier cambio definitivo en el tracking base o escala tipográfica raíz respecto al estándar previo.
- [x] La compilación de producción del frontend pasa sin errores y el recorrido completo por Taller, POS, Historial y Corte de Caja se verifica en navegador real en desktop (`>= 1280px`) y mobile (`~375px`) sin desbordes horizontales ni cortes.

## Answer

Implementado y consolidado en `feat/escala-visual-ergonomia` (controles táctiles en Taller, POS y Corte de Caja, inputs móviles `>= 16px`, `min-w-0` en grid de `PosTerminal` y alineación completa de `DESIGN.md`). Verificado con `bun test` (`61 pass`), `vite build` y navegador real en `/taller`, `/pos`, `/pos/historial`, `/inventario` y `/corte-caja` en `1280x800` y `375x812`.
