# 02: Creación de Productos Simples y Servicios de Taller

**What to build:**
Modal de creación de productos donde el usuario puede alternar entre "Producto Físico" y "Servicio de Taller", asignar o crear una categoría, generar automáticamente o escanear un SKU/código de barras, definir precio base y stock inicial (oculto/deshabilitado para servicios), persistirlo en el backend mediante un endpoint validado y recibir feedback visual inmediato (toast de éxito y actualización del listado).

**Blocked by:** 01: Backend Vertical Slice y Creación Inline de Categorías

**Status:** completed

- [x] Esquema Zod y servicio backend para creación de producto simple con su variación por defecto.
- [x] Endpoint `POST /api/inventario/productos` valida entrada con Zod y lanza `ConflictError` si el SKU/código ya existe, o `NotFoundError` si la categoría no existe.
- [x] Mutación frontend `useCreateProducto` agregada en `packages/frontend/src/queries/inventario/` con invalidación de caché para productos y variaciones.
- [x] Modal `CreateProductoModal` implementado con Base UI / Shadcn (`Dialog`, `FieldGroup`, `Field`, `InputGroup`, `Badge`, `Button`).
- [x] Selector de tipo ("Producto Físico" vs "Servicio") que oculta los campos de stock cuando es un servicio.
- [x] Soporte para auto-generar SKU mediante botón de un clic y soporte de lectura de código de barras.
- [x] Integración del selector inline de categorías creado en el Ticket 01.
