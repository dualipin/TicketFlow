# 03: Calculadora de Pago Mixto (Dual-Tender Split) y Conciliación en Corte de Caja

**What to build:**
Habilitar el flujo completo de extremo a extremo para el método de pago `MIXTO` tanto en la terminal de ventas como en el arqueo de Corte de Caja. Cuando el cajero selecciona `MIXTO`, la interfaz despliega dos campos numéricos explícitos (porción en Efectivo y porción en Tarjeta/Transferencia), valida en vivo que la suma de ambos cubra el total de la venta (calculando cambio si el efectivo entregado supera la parte en efectivo), registra el desglose exacto en la venta y contabiliza únicamente la porción en efectivo dentro del saldo esperado en gaveta (`ventasEfectivo`) del turno activo.

**Blocked by:** 01: Prefactor de Modularización de `/pos` y Motor Puro de Cálculo (`pos-engine`)

**Status:** completed

- [x] Al seleccionar el método de pago `MIXTO`, se muestran controles dedicados para capturar el monto en Efectivo y el monto en Tarjeta/Transferencia.
- [x] El sistema bloquea el botón de cobro si la suma de Efectivo + Tarjeta/Transferencia es menor al total a cobrar, o si la porción de tarjeta excede el total de la venta, mostrando de forma clara cuánto falta por asignar.
- [x] Si el efectivo recibido junto con el monto en tarjeta supera el total de la orden, la calculadora muestra el cambio exacto a devolver en efectivo.
- [x] El registro de la venta almacena el desglose financiero del pago mixto y el módulo de Corte de Caja suma la porción exacta cobrada en efectivo de las ventas mixtas al cálculo de `ventasEfectivo` y `montoCalculado` del turno abierto.
- [x] Pruebas unitarias en el motor de punto de venta y verificación de contrato para el cálculo de desglose mixto y conciliación de caja.
