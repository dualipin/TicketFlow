# 03: Salvaguarda de Cobro y Liquidación en Caja al Entregar Equipos con Saldo Pendiente

**What to build:**
Evitar fugas financieras en el mostrador: cuando un operador intente marcar una orden como `ENTREGADO` y el equipo tenga un saldo pendiente (`saldoPendiente > 0`), el sistema intercepta la acción y presenta un diálogo de resolución que permite cobrar el saldo restante en el turno de caja activo o autorizar expresamente la entrega a crédito dejando constancia en la bitácora. Asimismo, elimina los montos ficticios precargados ($800 / $300) en el modal de recepción de tickets para prevenir cotizaciones erróneas.

**Blocked by:** 02: Flujo Contextual de "Siguiente Estado" y Ergonomía de Navegación en Tarjetas

**Status:** completed

- [x] Diálogo modal de confirmación y cobro de saldo deudor implementado (`ConfirmEntregaDialog`).
- [x] Intentar avanzar a `ENTREGADO` con `saldoPendiente > 0` (desde `TicketCard` o `TicketDetailDrawer`) activa la salvaguarda y no cambia el estado sin validación.
- [x] Vía A: "Cobrar y Entregar" invoca el endpoint de pago en caja (`POST /api/taller/tickets/:id/pagos`) y marca el ticket como entregado.
- [x] Vía B: "Autorizar Entrega a Crédito" registra la nota de autorización en la bitácora técnica y avanza el estado manteniendo el saldo deudor visible.
- [x] `CreateTicketModal` inicia los campos de costo total y anticipo vacíos con placeholders `0.00`, eliminando los valores hardcodeados de $800 y $300.
- [x] Pruebas unitarias que validan la intercepción de entrega y cálculo de saldo en `tickets.test.ts`.
- [x] Compilación TypeScript limpia sin errores.
