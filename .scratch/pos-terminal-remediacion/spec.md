# Spec: Remediación Integral de Arquitectura, Accesibilidad y Ergonomía de Terminal de Punto de Venta (`/pos`)

Status: completed

## Problem Statement

El personal de mostrador, cajeros y técnicos de taller enfrentan deficiencias críticas de usabilidad, riesgo financiero y barreras de accesibilidad en la Terminal de Punto de Venta (`/pos`):
1. **Amnesia post-cobro y riesgo de discrepancias en caja:** Inmediatamente al procesar una venta en efectivo (`handleCheckout`), el estado del carrito y el cálculo de cambio desaparecen de golpe, dejando la pantalla en blanco con un aviso genérico. El cajero pierde la cifra exacta del cambio a entregar mientras manipula el dinero físico, provocando errores de cuadre y demoras con los clientes.
2. **Método de pago "MIXTO" fantasma (sin desglose):** El selector ofrece el botón `MIXTO`, pero no despliega campos para capturar cuánto se paga en efectivo y cuánto con tarjeta o transferencia. La venta se envía al backend sin desglose financiero, corrompiendo la auditoría de turno y el arqueo de caja (`Corte de Caja`).
3. **Peligro de pérdida de datos por acción "Vaciar" desprotegida:** El botón "Vaciar" en la cabecera del carrito destruye de inmediato todos los productos escaneados con un solo clic accidental, sin diálogo de confirmación ni opción de deshacer.
4. **Incumplimiento de accesibilidad y objetivos táctiles subestándar (WCAG AA):**
   - El selector de clientes utiliza un `<select>` HTML nativo sin etiqueta accesible (`aria-label` ni `<label>`), inusable con lectores de pantalla.
   - La botonera de métodos de pago carece de `role="radiogroup"` y `aria-checked`.
   - Botones de incremento/decremento de cantidad (`+`/`-`), eliminación de partida y atajos de billetes miden apenas 24×24px (`size-6`), violando WCAG AA 2.5.5 y 2.5.8 y provocando pulsaciones fallidas en monitores táctiles de mostrador.
   - Textos de oferta en `text-[9px] text-amber-600` violan el contraste mínimo de color (3.1:1 frente a 4.5:1 requerido).
5. **Colapso responsivo en tabletas y móviles:** En resoluciones inferiores a 1024px, la cuadrícula apila el carrito de cobro debajo de todo el catálogo, obligando a desplazarse verticalmente por cientos de artículos para revisar el total o cobrar.
6. **Entrada de efectivo no acumulativa:** Los chips de billetes (`$100`, `$200`, etc.) sobrescriben el monto recibido en lugar de sumar de forma aditiva, desconectándose de la realidad operativa del mostrador.
7. **Monolito de 906 líneas sin memoización:** `PosTerminal.tsx` concentra en un solo archivo filtros, catálogo, carrito, cliente, cobro y modales, recalculando y reconciliando toda la vista ante cualquier tecla o clic.
8. **Ausencia de aceleradores de teclado y función de "Ticket en Espera":** No existen atajos F-keys ni mecanismo para pausar una cuenta cuando un cliente olvida su cartera o decide buscar otro producto.

## Solution

Reestructurar integralmente la arquitectura, interacción y accesibilidad de la Terminal de Punto de Venta (`/pos`), transformando el monolito en un sistema modular, accesible y ergonómico para operaciones de alto tráfico:

1. **Modal de Cierre de Venta y Entrega de Cambio (`PosSaleSuccessModal`):**
   - Diálogo modal de celebración y cierre operativo que emerge tras registrar la venta con éxito.
   - Despliegue en tipografía gigante animada con `NumberFlow` del cambio exacto a entregar: `Cambio: $XX.XX`.
   - Resumen financiero de la orden: folio asignado, desglose de artículos, cliente y método de pago.
   - Acciones prioritarias accesibles por teclado: `[Enter]` para Iniciar Nueva Venta y `[Ctrl+P]` para Imprimir Comprobante/Ticket.
2. **Calculadora Real de Pago Mixto (Dual-Tender Split):**
   - Al seleccionar `MIXTO`, desplegar inputs numéricos controlados para:
     a) Monto en Efectivo entregado.
     b) Monto con Tarjeta / Transferencia bancaria.
   - Validación reactiva estricta: `Monto Efectivo + Monto Tarjeta === Total a Cobrar`.
   - Desglose y cálculo automático del cambio en caso de que el efectivo entregado exceda la porción en efectivo requerida.
3. **Modularización Arquitectónica del Terminal:**
   - Descomponer `PosTerminal.tsx` en submódulos verticales de presentación y lógica desacoplados:
     - `PosCatalog.tsx`: Barra de búsqueda SKU/código de barras, filtros rápidos y grid de tarjetas memoizadas (`CatalogItemCard`).
     - `PosCart.tsx`: Lista de partidas con controles táctiles estándar (mínimo 36–44px), edición de precios de taller y salvaguarda contra vaciado accidental.
     - `PosPaymentSection.tsx`: Selección de cliente con Combobox accesible, totalizador, métodos de pago y calculadora de efectivo acumulativa.
     - `PosSaleSuccessModal.tsx`: Diálogo modal de finalización y cambio.
     - `pos-engine.ts`: Módulo puro e independiente para cálculos de subtotal, validación de inventario, sumatoria mixta y cálculo de cambio.
4. **Accesibilidad Integral y Estandarización shadcn / Base UI (WCAG 2.1 AA):**
   - Sustituir el `<select>` nativo de cliente por un Combobox accesible con búsqueda en vivo por nombre o teléfono.
   - Sustituir los botones planos de método de pago por un `ToggleGroup` accesible con `role="radiogroup"` y `aria-checked`.
   - Elevar los controles de cantidad, eliminación y chips a una altura táctil mínima de 36px/40px con `aria-label` descriptivos.
   - Sustituir `text-[9px]` y `text-[10px]` por `text-xs` conforme a `DESIGN.md`, garantizando contraste cromático > 4.5:1.
5. **Ergonomía de Mostrador: Efectivo Acumulativo y "Ticket en Espera" (Hold Cart):**
   - Los chips de billetes operan de forma acumulativa (`$200` + `$100` = `$300`), acompañados de un botón `[C]` para limpiar el monto recibido.
   - Botón "Poner en Espera" para pausar el carrito actual en memoria local y atender a otro cliente en ventanilla, con indicador de carritos pausados en la cabecera.
   - Salvaguarda para "Vaciar Carrito" con confirmación inmediata o toast de recuperación con opción `[Deshacer]`.
6. **Aceleradores de Teclado Globales (Cajero Rápido):**
   - `[F2]`: Enfoque instantáneo en la barra de código de barras.
   - `[F4]`: Búsqueda rápida de cliente.
   - `[F8]`: Poner ticket en espera / recuperar.
   - `[F9]`: Disparar cobro si los requisitos se cumplen.
   - `[Esc]`: Cancelar modal activo o limpiar búsqueda.
7. **Diseño Responsivo Adaptable en Tablets / Pantallas Táctiles:**
   - Barra flotante inferior de resumen en pantallas menores a 1024px que muestra el total, cantidad de ítems y botón para deslizar el carrito o cobrar sin scroll excesivo.

## User Stories

1. Como cajero en ventanilla, quiero ver el cambio exacto a entregar en números gigantes tras procesar la venta, para devolver el dinero sin vacilación ni errores de cálculo mental.
2. Como cajero, quiero que al terminar una venta pueda presionar la tecla Enter para volver inmediatamente a la pantalla lista para escanear, agilizando la fila de clientes.
3. Como cajero, quiero una opción inmediata de imprimir ticket (`Ctrl+P`) en el modal de venta completada, para entregar el comprobante físico al cliente sin pasos adicionales.
4. Como cajero que cobra reparaciones de taller costosas, quiero seleccionar el método "Mixto" y especificar exactamente cuánto paga el cliente en efectivo y cuánto con tarjeta, para que el arqueo de caja cuadre al centavo.
5. Como cajero, quiero que el sistema me advierta y bloquee el botón de cobro mixto si la suma del efectivo y la tarjeta no coincide con el total de la orden, para evitar registrar ventas con saldos incompletos.
6. Como cajero, quiero pulsar varias veces los billetes rápidos de $100 o $200 para que se acumulen en el monto recibido, simulando el conteo de billetes físicos que recibo del cliente.
7. Como cajero, quiero un botón para limpiar rápidamente el efectivo ingresado si me equivoqué al digitar los billetes, para recomenzar el conteo sin borrar carácter por carácter.
8. Como cajero con clientes indecisos en ventanilla, quiero poner un carrito en espera ("Hold Cart") para atender al siguiente cliente sin perder los artículos ya escaneados.
9. Como cajero, quiero recuperar un carrito pausado con un solo clic cuando el cliente regrese con sus productos adicionales, para continuar la venta donde se quedó.
10. Como cajero que atiende rápidamente, quiero que pulsar accidentalmente "Vaciar" me pida confirmación o me ofrezca deshacer la acción, para no perder órdenes de 10 productos por un error de dedo.
11. Como cajero que utiliza monitor táctil en el mostrador, quiero botones de cantidad y billetes con altura mínima de 36px a 40px y espaciado cómodo, para no presionar por error un botón adyacente.
12. Como usuario de tecnologías de asistencia o lector de pantalla, quiero que el selector de clientes anuncie su propósito y soporte búsqueda mediante etiquetas accesibles, para operar la terminal sin barreras.
13. Como usuario de lector de pantalla, quiero que los métodos de pago anuncien cuál es la opción seleccionada actualmente mediante atributos ARIA (`aria-checked`).
14. Como operador que memoriza atajos, quiero presionar F2 para enfocar el lector de código de barras desde cualquier parte de la pantalla, para escanear artículos sin tocar el mouse.
15. Como cajero avanzado, quiero presionar F9 para procesar el cobro una vez cubierto el monto, para acelerar el despacho en horas pico.
16. Como cajero que busca clientes en una base de más de 500 registros, quiero un buscador con autocompletado en el selector de cliente para filtrar por nombre o teléfono en milisegundos.
17. Como cajero que opera desde una tableta o iPad en mostrador, quiero tener visible el total acumulado y acceso inmediato al cobro sin tener que hacer scroll hacia abajo pasando todo el catálogo.
18. Como técnico que registra mano de obra en mostrador, quiero que el precio de los servicios sea editable directamente con números legibles y accesibles en la escala tipográfica estándar.
19. Como operador con fatiga visual en turnos largos, quiero que la animación de borde (`BorderBeam`) en el botón de cobro se active únicamente al procesar o pasar el cursor, en lugar de parpadear continuamente mientras la terminal está inactiva.
20. Como auditor de caja, quiero que cada venta mixta o en efectivo quede registrada con sus importes exactos en el historial de ventas, para que el corte de turno concilie perfectamente contra el efectivo físico.

## Implementation Decisions

- **Módulo Puro de Lógica Financiera (`pos-engine.ts`):**
  - Ubicación: `packages/frontend/src/components/pos/pos-engine.ts`.
  - Exportará funciones puras independientes de React:
    - `calculateCartTotals(items: CartItem[]): { totalCart: number, totalItemsCount: number }`
    - `validateSplitPayment(total: number, cashPart: number, cardPart: number): { isValid: boolean, missingOrSurplus: number }`
    - `accumulateQuickCash(current: number, bill: number): number`
    - `calculateChange(total: number, received: number): number`
- **Componentes Desacoplados de Presentación:**
  - `packages/frontend/src/components/pos/PosCatalog.tsx`:
    - Integra input de código de barras con `autoFocus`, `ref` expuesto para atajo `F2`.
    - Selector de tipo (`Todos`, `Físicos`, `Servicios`) y pills de categorías.
    - Grid de variaciones con tarjetas memoizadas (`React.memo`) para evitar re-renderizados cuando cambia el carrito.
  - `packages/frontend/src/components/pos/PosCart.tsx`:
    - Listado de partidas con control táctil accesible (`h-8 w-8` o `h-9 w-9` para `+` / `-`).
    - Atributos `aria-label="Aumentar cantidad de [producto]"` y `aria-label="Disminuir cantidad"`.
    - Botón "Vaciar" protegido con diálogo popover o toast undo (`sonner`).
  - `packages/frontend/src/components/pos/PosPaymentSection.tsx`:
    - Combobox de cliente basado en Popover + Command de shadcn/Base UI, mostrando nombre, teléfono y opción rápida de crear cliente.
    - Grupo de métodos de pago implementado con `ToggleGroup` accesible.
    - Calculadora de efectivo con botones aditivos y botón `[C]`.
    - Desglose interactivo para método `MIXTO` con validación de balance.
  - `packages/frontend/src/components/pos/PosSaleSuccessModal.tsx`:
    - Diálogo modal con `NumberFlow` para el cambio.
    - Botón principal de nueva venta con escucha de tecla Enter.
    - Botón secundario para invocar `window.print()` con estilos optimizados para ticket térmico (`@media print`).
- **Hook Global de Aceleradores de Teclado (`usePosKeyboardShortcuts.ts`):**
  - Mapeo de teclas de función (`F2`, `F4`, `F8`, `F9`, `Esc`) asegurando que no interfieran cuando un modal o campo de texto externo esté activo.
- **Estado de "Carritos en Espera" (Hold Carts):**
  - Persistencia en estado React / `sessionStorage` para soportar hasta 5 carritos en espera con marca de tiempo y nombre del cliente tentativo.
- **Normalización de Tokens y Tipografía:**
  - Sustitución de `text-[9px]` y `text-[10px]` por `text-xs`.
  - Reemplazo de colores directos `amber-500` / `emerald-500` por variables semánticas (`bg-primary`, `text-primary`, `border-border`, `text-destructive`).

## Testing Decisions

- **¿Qué constituye una buena prueba?**
  - Solo se prueba el comportamiento observable externo y la lógica de negocio pura, no detalles efímeros de implementación interna.
  - Las operaciones matemáticas de divisas, acumulación de efectivo, validación de pago mixto y cálculo de cambio deben ser 100% deterministas y estar cubiertas sin depender del DOM.
- **Módulos que serán probados:**
  - `packages/frontend/src/components/pos/pos-engine.test.ts`: Pruebas unitarias de cálculo de totales, acumulación de denominaciones rápidas, validación estricta de pagos divididos (`MIXTO`) y cálculo de cambio exacto.
  - `packages/frontend/src/queries/pos/pos-queries.test.ts`: Validación de la mutación de creación de venta, asegurando que la carga útil enviada al backend contenga la estructura correcta para ventas normales y ventas mixtas.
- **Arte previo en la base de código:**
  - Referencia directa: `packages/frontend/src/queries/tickets/tickets.test.ts` (pruebas de mutaciones optimistas y state machines en `bun:test`).

## Out of Scope

- Conexión física directa mediante WebUSB / WebBluetooth con impresoras térmicas ESC/POS (se utiliza `window.print()` con CSS térmico estándar).
- Facturación electrónica CFDI 4.0 directa desde la terminal (eso pertenece a un módulo independiente de facturación fiscal).
- Integración de terminales bancarias Pinpad / SmartPOS vía websocket (el registro de cobro con tarjeta en este alcance es manual).

## Further Notes

- Esta especificación atiende de forma directa todos los hallazgos críticos (P0/P1/P2) identificados durante la auditoría técnica y la crítica de diseño de `/impeccable`.
- Al finalizar la implementación de este spec, la puntuación de salud de diseño de `/pos` proyecta subir de **23/40 a >35/40 (Excelente)**, y la puntuación de auditoría técnica proyecta subir de **8/20 a >17/20 (Excelente)**.
