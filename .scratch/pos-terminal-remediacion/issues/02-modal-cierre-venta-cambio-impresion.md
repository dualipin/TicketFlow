# 02: Cierre de Venta sin Amnesia — Modal de Éxito, Cambio Gigante e Impresión de Ticket

**What to build:**
Al completar un cobro en `/pos`, en lugar de limpiar el carrito en seco y borrar de inmediato la cifra de cambio mientras el cajero cuenta monedas, presentar un diálogo modal de venta completada que destaque en tipografía gigante animada el cambio exacto a devolver al cliente, junto con el folio de la venta, método de pago, cliente asociado y resumen de artículos vendidos. Permitir cerrar el ciclo e iniciar una nueva venta al instante presionando `Enter`, o disparar la impresión del comprobante térmico presionando `Ctrl+P`.

**Blocked by:** 01: Prefactor de Modularización de `/pos` y Motor Puro de Cálculo (`pos-engine`)

**Status:** completed

- [x] Al registrarse exitosamente una venta, se abre el diálogo modal de confirmación conservando visible el monto pagado y mostrando el cambio exacto a entregar en tipografía de alto impacto con `NumberFlow`.
- [x] El modal presenta el número de folio de la venta recién creada, el cliente asignado (o "Público en General"), el método de pago y el listado resumido de partidas con sus subtotales.
- [x] Presionar la tecla `Enter` (o hacer clic en "Nueva Venta") cierra el modal, limpia el carrito y devuelve el foco automáticamente al buscador de código de barras para atender al siguiente cliente.
- [x] El botón "Imprimir Ticket" (y su atajo `Ctrl+P` mientras el modal está abierto) invoca una vista de impresión formateada para recibo de mostrador (`@media print`) que oculta la navegación del sistema y deja únicamente el comprobante limpio.
- [x] Pruebas unitarias y compilación de tipos limpias sin regresiones.
