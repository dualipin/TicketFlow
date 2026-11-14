# 02: Normalización tipográfica y táctil en Inventario e indicadores de consulta

**What to build:** Al operar el catálogo de productos y refacciones en Inventario o visualizar avisos de carga, sincronización o error de red en cualquier módulo, el administrador o encargado lee métricas, badges, filtros y formularios sin textos bloqueados en píxeles micro (`10px`/`11px`) y pulsa controles de filtro, edición o eliminación con área táctil cómoda tanto en escritorio como en móvil.

**Blocked by:** 01: Escala raíz global, legibilidad de cuerpo y ergonomía en primitivas y shell

**Status:** ready-for-agent

- [ ] En la vista de Inventario, el selector de categorías, los modales de creación y edición de producto/variantes y el diálogo de confirmación de eliminación, todos los textos rígidos de `10px` y `11px` se migran a tokens relativos de la escala tipográfica para heredar la escala raíz.
- [ ] Los controles interactivos de filtros (estado, tipo, búsqueda) y acciones de edición/archivado/reactivación en Inventario abandonan variantes extra-pequeñas (`xs` / sub-`32px`) en favor de objetivos táctiles cómodos en escritorio y móvil.
- [ ] Los indicadores de estado de consulta (datos obsoletos, recarga en segundo plano y estados de error) usan escala relativa legible y botones de reintento accesibles al tacto.
- [ ] La compilación de producción del frontend pasa sin errores y la pantalla de Inventario (junto con sus modales principales) se verifica en navegador real en desktop (`>= 1280px`) y mobile (`~375px`) sin desbordes ni saltos rotos.
