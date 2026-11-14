# 03: Ergonomía táctil y ajuste fino en Taller, Punto de Venta y Corte de Caja

**What to build:** Al gestionar órdenes en Taller, cobrar en el Punto de Venta (POS) o realizar apertura y arqueo de Corte de Caja, los técnicos y cajeros interactúan con botones, selectores de estado, controles de captura multimedia, bandejas de denominaciones y listas de historial con tamaño táctil y tipográfico consistente en escritorio y móvil, dejando alineada la documentación de diseño del frontend con la escala final aplicada.

**Blocked by:** 01: Escala raíz global, legibilidad de cuerpo y ergonomía en primitivas y shell

**Status:** ready-for-agent

- [ ] En el módulo de Taller (vista de cola, modal de creación, panel de detalle, cambio de estado y captura multimedia), los botones y controles de acción abandonan tamaños extra-compactos (`xs` / alturas inferiores a `32px`) para ofrecer operación táctil cómoda sin saturar las tarjetas.
- [ ] En Punto de Venta e Historial de Ventas, los controles de catálogo, limpiado de búsqueda, carrito y filtros mantienen alturas e iconografía legibles y cómodas en pantalla táctil y escritorio.
- [ ] En Corte de Caja (apertura de turno, bandeja de denominaciones, formulario de arqueo e historial de cortes), los botones de ajuste rápido y acciones principales alcanzan dimensiones cómodas al tacto y mantienen legibilidad clara de cifras monetarias.
- [ ] La documentación de diseño del frontend refleja cualquier cambio definitivo en el tracking base o escala tipográfica raíz respecto al estándar previo.
- [ ] La compilación de producción del frontend pasa sin errores y el recorrido completo por Taller, POS, Historial y Corte de Caja se verifica en navegador real en desktop (`>= 1280px`) y mobile (`~375px`) sin desbordes horizontales ni cortes.
