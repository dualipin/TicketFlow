# 05: Edición Completa de Productos y Variantes

**What to build:**
Capacidad para editar productos existentes y sus variantes. El usuario puede abrir un modal de edición (`EditProductoModal`) desde la tabla de inventario, modificar nombre, descripción, categoría y tipo, actualizar precios y stock de las variantes existentes, agregar nuevas variantes y remover variantes que no tengan ventas asociadas.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Campo `activo` (Int default 1) verificado/incorporado en el modelo `Producto`.
- [x] Endpoint `PUT /api/inventario/productos/:id` con validación Zod y lógica en `inventario.service.ts` para actualizar información general y sincronizar variantes (actualizar existentes, crear nuevas, verificar que no haya SKUs duplicados).
- [x] Mutación en React Query `useUpdateProducto` con invalidación de caché de inventario (`productos`, `variaciones`, `categorias`).
- [x] Componente `EditProductoModal.tsx` con formulario precargado y edición de variantes.
- [x] Botón de acción "Editar" (icono de lápiz) en cada fila de la tabla en `InventarioView.tsx`.
