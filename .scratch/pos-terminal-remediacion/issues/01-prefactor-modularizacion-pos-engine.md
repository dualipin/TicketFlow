# 01: Prefactor de Modularización de `/pos` y Motor Puro de Cálculo (`pos-engine`)

**What to build:**
Descomponer la vista monolítica de la Terminal de Punto de Venta (`/pos`) en módulos independientes de catálogo, carrito y sección de cobro, garantizando que las modificaciones en el carrito o en los montos de pago no fuercen el re-renderizado de las tarjetas del catálogo de productos. Extraer toda la lógica aritmética de subtotales, límites de stock físico, acumulación de efectivo, desglose de pago mixto y cálculo de cambio a un motor puro libre de estado de interfaz y cubierto por pruebas unitarias deterministas, manteniendo intacto todo el flujo operativo actual.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Motor puro de reglas financieras y de carrito extraído y cubierto con pruebas unitarias automatizadas (`bun test`) para cálculo de totales, validación de límites de inventario en productos físicos vs. servicios, suma aditiva de billetes, validación de cobro mixto y cálculo de cambio.
- [x] La vista de catálogo memoiza individualmente cada tarjeta de producto/servicio para que agregar ítems, cambiar cantidades o escribir montos de pago en el carrito no re-renderice la cuadrícula del catálogo.
- [x] La estructura de la terminal separa claramente las responsabilidades de Catálogo, Carrito de Partidas y Sección de Pago sin alterar la funcionalidad existente de venta, búsqueda por código de barras y apertura de turno.
- [x] El componente para estados vacíos en catálogo y carrito utiliza las primitivas semánticas `<Empty>` del sistema de diseño en lugar de contenedores genéricos.
- [x] La compilación y verificación de tipos del proyecto (`tsc -b`) finaliza sin errores.
