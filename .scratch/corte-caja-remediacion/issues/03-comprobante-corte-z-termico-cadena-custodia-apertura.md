# 03: Comprobante Imprimible de "Corte Z", Inspección de Historial y Cadena de Custodia en Apertura

**What to build:**
Garantizar la trazabilidad física y digital en el relevo de caja entre turnos. Al concluir el cierre de un turno, se despliega automáticamente el modal de comprobante oficial de **Corte Z** (`CorteZTicketModal`) formateado como tira contable lista para impresora térmica de 80mm/58mm o exportación PDF (`window.print()` / `Ctrl+P`), incluyendo líneas de firma autógrafa para el cajero saliente y el supervisor que recibe el sobre. Además, cualquier turno cerrado en la tabla de historial puede abrirse para consultar sus notas y reimprimir su Corte Z, y el modal de apertura (`AbrirCajaModal`) elimina los `$500` prellenados estáticos para mostrar como referencia el saldo real con el que cerró el turno anterior.

**Blocked by:** 02: Diálogo de Confirmación de Cierre y Salvaguardas por Bandas de Tolerancia Financiera (P0)

**Status:** completed

- [x] Componente `CorteZTicketModal` implementado con vista previa de tira de auditoría: encabezado de tienda, folio `#CORTE-{id}`, fechas de apertura y cierre, operador responsable, desglose contable (`Fondo Inicial`, `Ventas Ef.`, `Pagos Taller Ef.`, `Esperado`, `Real Contado`, `Diferencia`), desglose de denominaciones/notas y dos bloques de firma física al pie.
- [x] Reglas `@media print` dedicadas para impresión limpia del comprobante de Corte Z y soporte para atajo de teclado `Ctrl+P` mientras el modal está abierto.
- [x] `CorteZTicketModal` se abre automáticamente al finalizar con éxito el cierre de un turno y también al pulsar el botón **"Ver / Imprimir Corte Z"** en cualquier fila cerrada de la tabla de historial.
- [x] `AbrirCajaModal` inicia con monto y notas vacíos (sin `'500'` ni `'Apertura de turno'` hardcodeados), muestra una tarjeta de cadena de custodia con los datos del último corte cerrado (folio, operador y monto real final) y ofrece un botón rápido **"Usar fondo del cierre anterior"**.
