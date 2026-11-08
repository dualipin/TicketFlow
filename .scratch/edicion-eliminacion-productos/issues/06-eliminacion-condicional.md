# 06: Eliminación Condicional y Diálogo de Confirmación Destructivo

**What to build:**
Acción de eliminación desde la tabla de inventario que protege la integridad contable. Si el producto o sus variantes tienen ventas históricas en el POS (`VentaDetalle`), se archiva de forma suave (`activo = 0`). Si no tiene ventas, se elimina definitivamente de la base de datos. Se muestra un diálogo de confirmación antes de proceder.

**Blocked by:** 05: Edición Completa de Productos y Variantes

**Status:** completed

- [x] Lógica en `inventario.service.ts` para verificar ventas asociadas antes de eliminar.
- [x] Endpoint `DELETE /api/inventario/productos/:id` que ejecuta borrado físico o archivo suave según corresponda.
- [x] Mutación en React Query `useDeleteProducto` con invalidación de caché.
- [x] Diálogo de confirmación destructivo (`ConfirmDeleteDialog.tsx`) que advierte sobre la acción.
- [x] Botón de acción "Eliminar" (icono de papelera) en cada fila de `InventarioView.tsx`.
