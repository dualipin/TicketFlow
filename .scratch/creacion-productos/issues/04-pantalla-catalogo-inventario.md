# 04: Pantalla de Catálogo de Inventario y Navegación en Sidebar

**What to build:**
Vista completa de gestión de inventario y catálogo (`/inventario`), integrada en el menú de navegación lateral (`AppSidebar`), donde el usuario puede explorar todos los productos físicos y servicios registrados, filtrar por categoría o tipo, buscar por nombre o SKU en tiempo real, visualizar el stock y precio de cada variante y abrir el modal de creación de productos.

**Blocked by:** 03: Soporte para Productos con Múltiples Variantes

**Status:** completed

- [x] Ruta `/inventario` agregada en `packages/frontend/src/App.tsx` dentro de `DashboardLayout`.
- [x] Enlace "Inventario" agregado en `AppSidebar.tsx` con icono de catálogo (`Boxes` o `Package`) y estado activo.
- [x] Componente de pantalla `InventarioView.tsx` implementado en `packages/frontend/src/components/inventario/`.
- [x] Barra superior con buscador en tiempo real, pestañas de filtro ("Todos", "Productos", "Servicios") y selector de categoría.
- [x] Tabla o listado responsive mostrando nombre de producto, categoría, tipo (badge semántico), variantes con stock y precios, y estados vacíos con `Empty`.
- [x] Botón principal "+ Nuevo Producto" que abre el `CreateProductoModal`.
- [x] Verificación completa con `bun run --cwd packages/backend build` y `bun run --cwd packages/frontend build`.
