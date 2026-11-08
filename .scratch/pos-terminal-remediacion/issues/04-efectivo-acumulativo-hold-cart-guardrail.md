Created At: 2026-11-08T16:44:03-06:00
Completed At: 2026-11-08T16:51:00-06:00

# 04: Ergonomía de Mostrador — Efectivo Acumulativo, Carritos en Espera (Hold Cart) y Guardrail de Vaciado

**What to build:**
Optimizar la operación cotidiana del cajero en mostrador mediante tres mejoras ergonómicas clave: (1) hacer que los botones de billetes rápidos (`$100`, `$200`, `$500`, `$1000`) acumulen su valor de forma aditiva al hacer clic repetidas veces (como al contar billetes reales entregados por el cliente) con un botón `[C]` para reiniciar el conteo; (2) proteger la acción "Vaciar" carrito contra toques accidentales mediante confirmación o recuperación inmediata con botón "Deshacer"; y (3) permitir poner en espera ("Hold Cart") hasta 5 cuentas activas para atender a otros clientes sin perder los productos ya escaneados.

**Blocked by:** 01: Prefactor de Modularización de `/pos` y Motor Puro de Cálculo (`pos-engine`)

**Status:** completed

- [x] Hacer clic en las denominaciones rápidas (`$100`, `$200`, `$500`, `$1000`) suma dicho importe al monto recibido actual en lugar de sobrescribirlo; el botón `Exacto` asigna el total exacto de la cuenta y el botón `[C]` limpia el monto recibido a cero.
- [x] Hacer clic en "Vaciar" ya no destruye irreversiblemente el carrito sin red de seguridad: solicita confirmación rápida o permite restaurar las partidas eliminadas mediante una acción "Deshacer" en notificación toast.
- [x] El cajero puede pausar un carrito con artículos ("Poner en Espera"), lo que limpia la terminal activa y muestra un indicador con los tickets en espera.
- [x] El cajero puede recuperar cualquiera de los carritos en espera con un solo clic, restaurando sus partidas, precios personalizados y cliente seleccionado.
- [x] Pruebas unitarias para el acumulador aditivo de efectivo y las transiciones de retención/restauración de carritos en espera.
