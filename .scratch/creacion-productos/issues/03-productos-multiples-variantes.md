# 03: Soporte para Productos con Múltiples Variantes

**What to build:**
Capacidad dentro del modal de creación para activar un interruptor (switch) "Tiene múltiples variaciones" para productos físicos, permitiendo agregar y remover dinámicamente múltiples variantes (calidades, colores, modelos) especificando para cada una su nombre descriptivo, SKU único, precio individual y cantidad de stock inicial.

**Blocked by:** 02: Creación de Productos Simples y Servicios de Taller

**Status:** completed

- [x] Esquema Zod de backend ampliado para recibir opcionalmente una lista de variaciones en la creación de producto.
- [x] Validación en backend de unicidad de SKUs entre las variaciones enviadas y con las existentes en la base de datos.
- [x] Interfaz dinámica en `CreateProductoModal` con switch para habilitar variantes múltiples.
- [x] Lista interactiva para añadir/eliminar filas de variantes con sus propios campos (Nombre, SKU con auto-generación, Precio, Stock).
- [x] Validación en frontend para evitar enviar variantes con SKUs vacíos o duplicados en la misma solicitud.
