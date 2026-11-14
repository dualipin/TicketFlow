# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Técnicos de reparación y servicio:** Reciben dispositivos, diagnostican fallas, asignan refacciones, adjuntan fotografías/evidencias y registran el avance de las órdenes de servicio.
- **Cajeros y encargados de mostrador:** Gestionan la atención rápida al cliente, venta directa de artículos de mostrador, cobro de tickets de reparación, control de arqueo y corte de caja por turno.
- **Administrador / Dueño de taller:** Supervisa inventario, catálogo de refacciones/productos, movimientos de efectivo y métricas clave de operación diaria.

## Product Purpose

TicketFlow es una estación de trabajo operativa integral diseñada para talleres de reparación de tecnología y tiendas de mostrador comercial. Su propósito es eliminar la fricción entre la recepción técnica, la gestión de inventario y la facturación en punto de venta, permitiendo una operación continua, rápida y confiable.

## Positioning

A diferencia de los sistemas POS genéricos de retail que carecen de trazabilidad de servicio técnico, o de los softwares tradicionales de taller lentos y desconectados del mostrador, TicketFlow unifica en una experiencia rápida de alta densidad el flujo completo: recepción con evidencia fotográfica, seguimiento de órdenes, venta minorista, inventario y control estricto de caja en tiempo real.

## Operating Context

- **Entorno de trabajo:** Mostrador comercial y mesas de taller con operación intensiva, cambios rápidos de operador durante el día mediante bloqueo de pantalla por PIN (`LockScreen`).
- **Dispositivos y periféricos:** Uso preferente en equipos de escritorio y laptops, lectores de códigos de barras USB/Bluetooth y teclados mecánicos o numéricos.
- **Rituales operativos:** Apertura obligatoria de caja con balance inicial, arqueo y corte al cierre de turno, registro de clientes al recibir órdenes o compras, y consulta rápida de historial de tickets.

## Capabilities and Constraints

- **Taller y Reparaciones:** Seguimiento de tickets de servicio con estados (`recibido`, `en revisión`, `en reparación`, `listo`, `entregado`), notas de taller, registro de refacciones consumidas y compresión de fotos/adjuntos en el cliente.
- **Punto de Venta (POS):** Catálogo con búsqueda rápida, escaneo de código de barras, selección de cliente, adición al carrito con cálculo dinámico y cobro inmediato.
- **Corte de Caja:** Control estricto de turnos; saldo en tiempo real (`NumberFlow`), cálculo de diferencias de arqueo y registro de movimientos de entrada/salida de efectivo.
- **Inventario:** Catálogo de productos y repuestos, categorización, control de stock y edición con carga de imágenes optimizada.
- **Identificadores únicos:** Uso de folios y códigos únicos para tickets, ventas y productos.

## Brand Commitments

- **Nombre:** TicketFlow
- **Tono y Personalidad:** Mecánico, directo, confiable, utilitario y de alta densidad para entornos de trabajo acelerados.
- **Voz:** Concisa, técnica y libre de redundancias decorativas; orientada a la productividad del operador.

## Evidence on Hand

- Código fuente implementado en monorepo:
  - Frontend (`packages/frontend`): React 19, Vite, Tailwind CSS v4, Base UI, Lucide React, TanStack Query.
  - Backend (`packages/backend`): Hono, Bun, Prisma ORM, módulos verticales de inventario, clientes, adjuntos y tickets.
- Componentes clave operativos existentes: `PosTerminal`, `TallerView`, `CorteCajaView`, `InventarioView`, `LockScreen`, `SiteHeader` y `DashboardLayout`.

## Product Principles

1. **Velocidad y respuesta táctil primero:** Toda acción crítica (cobrar, escanear, cambiar estado de ticket) debe responder instantáneamente y admitir atajos de teclado o flujos directos.
2. **Cero ambigüedad operativa:** Los estados de caja, los montos monetarios y los folios de tickets son inequívocos y visibles de un vistazo.
3. **Resiliencia en mostrador:** El sistema debe mantenerse operativo y tolerante a fallas de conexión o cambios de turno rápidos sin pérdida de información de la venta o ticket activo.
4. **Claridad sobre ornamentación:** La interfaz es una herramienta de trabajo intensivo; la legibilidad de seriales, precios y estados prevalece sobre elementos meramente decorativos.

## Accessibility & Inclusion

- Navegación completa mediante teclado y enfoque accesible en diálogos, formularios y atajos rápidos (`Ctrl+B`, modales y drawers).
- Alto contraste visual y legibilidad en tipografía mecánica (Inter para texto y JetBrains Mono/monospace para folios, precios y códigos de barras).
