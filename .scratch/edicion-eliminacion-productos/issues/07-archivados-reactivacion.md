# 07: Filtro de Productos Archivados y Reactivación en Catálogo

**What to build:**
Visualización y control de productos archivados en la vista de inventario. El usuario puede alternar un filtro o pestaña para ver "Productos Archivados" y reactivar cualquiera de ellos mediante un botón de acción rápida que restaura su estado a activo (`activo = 1`) y lo devuelve al catálogo normal de ventas.

**Blocked by:** 06: Eliminación Condicional y Diálogo de Confirmación Destructivo

**Status:** completed

- [x] Soporte en backend para filtrar productos por `activo` (1 por defecto, 0 para archivados, o ALL).
- [x] Endpoint `PATCH /api/inventario/productos/:id/reactivar` para restaurar un producto archivado.
- [x] Mutación en React Query `useReactivarProducto` con invalidación de caché.
- [x] Pestañas o selector de estado en `InventarioView.tsx` ("Activos" vs "Archivados").
- [x] Botón de "Reactivar" visible únicamente en la vista de productos archivados.
