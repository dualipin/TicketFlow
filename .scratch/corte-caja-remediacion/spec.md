# Spec: Remediación Integral de Arqueo Ciego, Conteo por Denominaciones, Salvaguardas de Cierre y Comprobante Corte Z (`/corte-caja`)

Status: ready-for-agent

## Problem Statement

El personal de mostrador, técnicos y administradores enfrentan vulnerabilidades operativas, financieras y técnicas en el módulo de Corte de Caja y Arqueo (`/corte-caja`):

1. **Sesgo de anclaje y riesgo de manipulación por arqueo expuesto:** La interfaz muestra en todo momento el `Efectivo Esperado` en tipografía destacada justo al lado del campo de captura antes de que el cajero ingrese su conteo físico. Esto provoca que el operador ajuste su conteo al número en pantalla o detecte sobrantes no registrados antes de reportarlos.
2. **Carga cognitiva excesiva por captura escalar sin desglose de denominaciones:** El conteo de efectivo se limita a un único `<Input type="number">`. El cajero se ve obligado a utilizar una calculadora externa o papel para multiplicar y sumar billetes (`$1000`, `$500`, `$200`, `$100`, `$50`, `$20`) y monedas (`$10`, `$5`, `$2`, `$1`, `$0.50`), generando errores de transcripción, lentitud en el cambio de turno y ausencia de rastro auditable de qué denominaciones integraban la gaveta.
3. **Cierre irreversible en un solo clic sin umbrales de tolerancia ni salvaguardas (P0):** Pulsar "Cerrar Turno de Caja" ejecuta inmediatamente la mutación de cierre definitivo sin diálogo de confirmación, incluso si existe un faltante crítico de `-$1,500.00` por un error de dedo. No existen bandas de tolerancia financiera que distingan entre un redondeo menor (`<= $20 MXN`), un descuadre moderado que exige justificación escrita (`$20 - $100 MXN`) y un descuadre crítico (`> $100 MXN`) que requiere autorización o marca de auditoría.
4. **Ausencia de comprobante físico de entrega ("Ticket de Corte Z") y ruptura de cadena de custodia:** Al cerrar el turno, el sistema solo muestra un aviso fugaz en pantalla y borra el formulario. No se genera una tira contable imprimible (`Corte Z` para impresora térmica de 80mm/58mm o PDF) con líneas de firma para el sobre de valores, ni se vincula el cierre anterior como referencia verificable al abrir el siguiente turno en `AbrirCajaModal` (el cual hoy precarga `$500` de forma estática).
5. **Opacidad en el historial de auditoría:** La tabla de historial de turnos cerrados no permite inspeccionar el detalle de un corte pasado, ver las notas de justificación ni reimprimir su comprobante de Corte Z.
6. **Deuda técnica, accesibilidad (WCAG AA) y desviaciones del Design System:**
   - 11 violaciones verificadas de tamaño tipográfico fuera de escala (`text-[10px]` y `text-[11px]`).
   - Falta de asociación semántica (`htmlFor` / `id`) entre `<FieldLabel>` y controles de formulario.
   - Uso de wrappers manuales `relative/absolute` en lugar de primitivas `InputGroup`, tarjeta vacía artesanal en lugar de `<Empty>`, botones con `rounded-full` fuera de estándar y omisión de `<NumberFlow />` en cifras monetarias.
   - El estado de escritura en el formulario de arqueo reside en la raíz de `CorteCajaView`, provocando el re-renderizado completo de la tabla histórica en cada pulsación de tecla.

## Solution

Transformar `/corte-caja` de un formulario plano en una estación de conciliación de efectivo de grado industrial, estructurada en seis pilares operativos y técnicos:

1. **Protocolo de Arqueo Ciego Progresivo en Dos Fases (Two-Stage Blind Count):**
   - **Fase 1 (Captura Ciega):** Para operadores de mostrador/taller (`rol !== 'ADMIN'`), los montos de `Ventas PdV (Ef.)`, `Pagos Taller (Ef.)` y `Efectivo Esperado` permanecen enmascarados (`••••••`) mientras se realiza el conteo físico, manteniendo visible únicamente el `Fondo Inicial` y el conteo de operaciones. Los usuarios `ADMIN` disponen de un interruptor explícito para revelar u ocultar el saldo esperado en cualquier momento.
   - **Fase 2 (Verificación y Derecho a 1 Reconteo):** Al pulsar "Verificar Arqueo", el sistema revela el `Efectivo Esperado` y la `Diferencia` resultante, habilitando una oportunidad de "Recontar Gaveta" antes de proceder al sellado definitivo.
2. **Bandeja Interactiva de Conteo por Denominaciones (MXN Bill & Coin Tray):**
   - Conmutador entre dos modos de entrada sincronizados: **"Por Denominación (Recomendado)"** y **"Conteo Rápido (Total directo)"**.
   - Cuadrícula ergonómica de denominaciones mexicanas:
     - Billetes: `$1,000`, `$500`, `$200`, `$100`, `$50`, `$20`.
     - Monedas / Morralla: `$10`, `$5`, `$2`, `$1`, `$0.50`.
   - Multiplicación en tiempo real (`cantidad × denominación = subtotal`) y sumatoria automática hacia el `montoReal`, con navegación fluida por teclado (`Enter` o `Tab` avanza a la siguiente denominación) y botón para limpiar conteo.
3. **Motor de Bandas de Tolerancia Financiera y Diálogo de Confirmación de Cierre:**
   - Ningún cierre se ejecuta sin pasar por un modal de confirmación (`ConfirmarCierreModal`) gobernado por tres bandas de tolerancia sobre `|diferencia|`:
     - **Banda 1 — Tolerancia Operativa (`|diferencia| <= $20.00 MXN`):** Confirmación ágil de cierre cuadrado o con variación menor de redondeo.
     - **Banda 2 — Descuadre Moderado (`$20.00 < |diferencia| <= $100.00 MXN`):** Exige obligatoriamente una nota de justificación de al menos 10 caracteres explicando la diferencia antes de habilitar la confirmación.
     - **Banda 3 — Descuadre Crítico (`|diferencia| > $100.00 MXN`):** Exige nota de justificación obligatoria **más** una casilla de confirmación explícita de responsabilidad bajo auditoría (`"Confirmo que he recontado físicamente la gaveta y asumo el registro de esta discrepancia para auditoría de administración"`).
4. **Comprobante Imprimible de "Corte Z" y Cadena de Custodia entre Turnos:**
   - **Modal de Ticket de Corte Z (`CorteZTicketModal`):** Se despliega automáticamente tras cerrar un turno y también puede abrirse desde cualquier fila cerrada de la tabla de historial. Incluye diseño de tira contable optimizada para impresión térmica (`@media print` para 80mm/58mm y exportación PDF), folio del corte, horarios de apertura/cierre, operador, tabla de resumen financiero, desglose de denominaciones (si se capturó), notas de cierre y bloques de firma física (*"Entregó Cajero"* / *"Recibió Supervisor"*).
   - **Cadena de Custodia en `AbrirCajaModal`:** Elimina el valor hardcodeado `'500'` y la nota `'Apertura de turno'`. En su lugar, muestra como referencia informativa el cierre inmediato anterior (folio, operador y monto real reportado) con un botón opcional para "Usar monto del cierre anterior" o ingresar un fondo nuevo contado desde cero.
5. **Modularización y Rendimiento de Renderizado:**
   - Extraer un motor puro de lógica de arqueo (`corte-caja-engine.ts`) independiente de React para cálculos de denominaciones, evaluación de bandas de tolerancia, formateo monetario con separadores de miles (`es-MX`) y generación de resumen de Corte Z.
   - Aislar el formulario de arqueo y el historial en subcomponentes independientes (`ArqueoCajaForm`, `HistorialCortesTable`, `CorteZTicketModal`, `ConfirmarCierreModal`) para que el tecleo de cantidades no re-renderice la tabla de historial.
6. **Alineación Total con `DESIGN.md`, `AGENTS.md` y WCAG 2.1 AA:**
   - Eliminar las 11 instancias de `text-[10px]` y `text-[11px]`, estandarizando a `text-xs`.
   - Reemplazar la tarjeta vacía manual por la primitiva canónica `<Empty>` (`EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`).
   - Reemplazar los inputs con icono absoluto por `<InputGroup>`, `<InputGroupInput>` e `<InputGroupAddon>`.
   - Vincular cada `<FieldLabel htmlFor="...">` con el `id` de su respectivo control, añadir `scope="col"` y `caption`/`aria-label` a la tabla de historial, normalizar radios de botón y animar las cifras con `<NumberFlow />` y `tabular-nums`.

## User Stories

1. Como dueño del negocio, quiero que el saldo esperado permanezca oculto para los cajeros durante la captura del conteo físico ("Arqueo Ciego"), para prevenir que ajusten artificialmente las cifras o retengan sobrantes no registrados.
2. Como administrador en turno (`ADMIN`), quiero poder alternar la visibilidad del efectivo esperado en cualquier momento, para supervisar la caja en tiempo real sin restricciones.
3. Como cajero al final de mi jornada, quiero ingresar cuántos billetes de $1,000, $500, $200, $100, $50, $20 y cuántas monedas tengo en cada compartimento de la gaveta, para que el sistema multiplique y sume automáticamente el total sin usar la calculadora del celular.
4. Como cajero experimentado, quiero poder presionar `Enter` en un campo de denominación para saltar inmediatamente al siguiente billete hacia abajo, completando todo el conteo con una sola mano en el teclado numérico.
5. Como cajero en un día de pocas operaciones, quiero poder alternar a "Conteo Rápido" si ya conozco el total exacto de efectivo, teniendo flexibilidad según la situación del mostrador.
6. Como cajero, quiero pulsar "Verificar Arqueo" una vez capturado mi conteo para descubrir si mi suma cuadra con el sistema y tener la opción de "Recontar Gaveta" antes de cerrar definitivamente, por si conté mal un fajo de billetes.
7. Como cajero, quiero que el botón "Cerrar Turno de Caja" nunca cierre el turno de golpe sin antes mostrarme un diálogo de confirmación claro, para no sellar un turno por accidente.
8. Como cajero con una diferencia menor de cambio (ej. ±$10 pesos por redondeo de monedas), quiero poder confirmar el cierre de forma ágil dentro de la banda de tolerancia operativa (`<= $20 MXN`).
9. Como encargado de tienda, quiero que cualquier descuadre superior a $20 MXN exija obligatoriamente escribir una nota explicativa de al menos 10 caracteres antes de permitir el cierre, para que ningún faltante o sobrante quede sin contexto en la bitácora.
10. Como dueño del taller, quiero que cualquier descuadre crítico superior a $100 MXN muestre una advertencia severa y exija confirmación explícita de auditoría antes de sellar el corte, para responsabilizar formalmente al operador en turno.
11. Como cajero saliente, quiero que al completarse el cierre se despliegue automáticamente el comprobante de "Corte Z" listo para imprimir (`Ctrl+P` / botón Imprimir), para firmarlo y meterlo en el sobre de entrega de efectivo.
12. Como supervisor que recibe el sobre de dinero, quiero que el ticket impreso de Corte Z incluya el desglose de billetes declarados, el balance esperado contra el real, la diferencia y las líneas de firma de entrega y recepción.
13. Como auditor o propietario que revisa turnos pasados en la tabla de historial, quiero poder hacer clic en cualquier turno cerrado para ver sus notas de arqueo y reimprimir su comprobante de Corte Z en cualquier momento.
14. Como cajero entrante que abre el turno de la mañana, quiero que el modal de apertura (`AbrirCajaModal`) no tenga $500 prellenados a ciegas, sino que me muestre con cuánto cerró el turno anterior y me obligue a confirmar o digitar el fondo real que recibo.
15. Como usuario de tecnologías de asistencia o teclado, quiero que todos los campos de monto, denominaciones y notas tengan etiquetas semánticas vinculadas (`htmlFor` / `id`), para navegar el formulario sin ambigüedad.
16. Como operador en monitor táctil, quiero controles de entrada y botones con tamaño y contraste conformes a WCAG AA y `DESIGN.md`, sin micro-textos ilegibles de 10px o 11px.
17. Como operador del sistema, quiero que las cifras monetarias utilicen formato local con separadores de miles (`$12,450.00`) y transiciones numéricas suaves (`<NumberFlow />`) con `tabular-nums`, para leer montos grandes sin esfuerzo visual.
18. Como usuario de la aplicación, quiero que escribir rápido en la calculadora de denominaciones sea instantáneo y no provoque lentitud por re-renderizar innecesariamente el historial de turnos.

## Implementation Decisions

- **Motor Puro de Lógica de Arqueo y Conciliación (`corte-caja-engine.ts`):**
  - Se creará un módulo puro y sin dependencias de UI que encapsule todas las reglas matemáticas y de negocio del corte de caja:
    ```ts
    export const DENOMINACIONES_MXN = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5] as const;
    export type DenominacionMxn = (typeof DENOMINACIONES_MXN)[number];
    export type ConteoDenominaciones = Partial<Record<DenominacionMxn, number>>;

    export type BandaTolerancia = 'CUADRADO_O_TOLERANCIA' | 'DESCUADRE_MODERADO' | 'DESCUADRE_CRITICO';

    export interface EvaluacionArqueo {
      montoEsperado: number;
      montoReal: number;
      diferencia: number;
      absDiferencia: number;
      banda: BandaTolerancia;
      requiereNotaJustificacion: boolean;
      requiereConfirmacionCritica: boolean;
      puedeCerrar: boolean;
      motivoBloqueo: string | null;
    }
    ```
  - Funciones exportadas por `corte-caja-engine.ts`:
    - `calcularTotalDenominaciones(conteo: ConteoDenominaciones): number` — Calcula con precisión de centavos (`Math.round(sum * 100) / 100`) el total físico a partir del mapa de billetes y monedas.
    - `formatearDesgloseDenominaciones(conteo: ConteoDenominaciones): string` — Genera un resumen compacto y legible (ej. `[Desglose: 2×$500, 3×$100, 1×$50]`) para anexar o mostrar en las notas/comprobante de Corte Z sin requerir migraciones destructivas en la base de datos SQLite.
    - `evaluarArqueo(params: { montoEsperado: number; montoReal: number | null; notas: string; confirmacionCriticaAceptada: boolean }): EvaluacionArqueo` — Evalúa las tres bandas de la industria (`<= $20`, `$20 - $100`, `> $100`), determina si la nota cumple la longitud mínima (>= 10 caracteres cuando `absDiferencia > 20`) y si se requiere la casilla de confirmación crítica (`absDiferencia > 100`).
    - `formatCurrencyMxn(amount: number): string` — Formateador determinista con `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`.

- **Flujo de Arqueo Ciego Progresivo:**
  - En el estado inicial del turno activo, si el usuario autenticado (`useAuth().currentUser`) no tiene rol `'ADMIN'` y aún no ha pulsado `"Verificar Arqueo"`, las tarjetas de `Ventas PdV (Ef.)`, `Pagos Taller (Ef.)` y `Efectivo Esperado` muestran valores enmascarados (`••••••`) con un indicador `"Arqueo Ciego Activo"`.
  - Una vez que el operador ingresa su conteo (por denominaciones o directo) y pulsa `"Verificar Arqueo"`, la vista pasa al estado `verificado = true`, revelando el efectivo esperado, la diferencia exacta y los botones `"Recontar Gaveta"` (que permite corregir el conteo) y `"Proceder al Cierre"`.

- **Subcomponentes Modulares de Presentación:**
  - `DenominacionesTray`: Cuadrícula compacta dividida en Billetes (`$1,000` a `$20`) y Monedas (`$10` a `$0.50`) con inputs numéricos accesibles, navegación con tecla `Enter` al siguiente input, subtotal por fila y botón `"Limpiar conteo"`.
  - `ConfirmarCierreModal`: Diálogo modal que presenta el resumen del arqueo, aplica las reglas de `evaluarArqueo`, exige nota justificativa en descuadres `> $20` y casilla de responsabilidad en descuadres `> $100` antes de disparar la mutación `useCerrarCorte`.
  - `CorteZTicketModal`: Diálogo modal imprimible con estilos `@media print` que muestra el comprobante oficial de Corte Z (encabezado del taller, folio `#CORTE-{id}`, fechas de apertura y cierre, operador responsable, desglose contable, resultado de conciliación, notas y líneas de firma física). Se abre automáticamente al concluir el cierre y también al seleccionar `"Ver / Imprimir Corte Z"` en cualquier fila cerrada del historial.
  - `HistorialCortesTable`: Tabla memoizada con cabeceras accesibles (`scope="col"`), visualización de notas de cierre y botón de acción para inspeccionar/imprimir el Corte Z de cada turno cerrado.

- **Mejoras en `AbrirCajaModal` (Cadena de Custodia):**
  - El campo de fondo inicial inicia vacío (`''`) en lugar de `'500'` y las notas inician vacías (`''`) para obligar a una entrada consciente.
  - Recibe opcionalmente los datos del último turno cerrado (`ultimoCorteCerrado`) para mostrar una tarjeta informativa con el saldo final reportado en el turno previo y un botón rápido `"Usar fondo anterior ($X,XXX.XX)"`.

- **Migración Arquitectónica de Backend (Opcional / Compatible):**
  - El contrato HTTP existente de `/api/corte-caja` (`GET /activo`, `POST /abrir`, `POST /:id/cerrar`, `GET /`) se mantiene 100% retrocompatible. Si se enriquece la validación en backend, se respetará la firma actual de respuestas JSON consumida por `queries/corte-caja`.

## Testing Decisions

- **¿Qué constituye una buena prueba?**
  - Las pruebas deben verificar comportamiento observable y reglas de negocio financieras (cálculo exacto de denominaciones incluyendo monedas de `$0.50`, fronteras exactas de las bandas de tolerancia en `$20.00` y `$100.00`, bloqueo de cierre cuando falta justificación o confirmación crítica, y formateo de resumen de Corte Z), sin acoplarse a detalles internos de implementación de componentes.
- **Costuras (Seams) y Módulos a Probar:**
  - **Seam primario (Motor de Dominio de Corte de Caja — `corte-caja-engine.test.ts`):** Pruebas unitarias exhaustivas en `bun:test` para `calcularTotalDenominaciones`, `evaluarArqueo` (cubriendo cuadre exacto, diferencias de `±$20`, `±$20.01`, `±$100`, `±$100.01`, validación de longitud de nota justificativa y bandera de confirmación de auditoría) y `formatearDesgloseDenominaciones`.
  - **Seam secundario (Integración de Estado y Queries — `corte-caja-queries.test.ts`):** Verificación del contrato de queries y mutaciones de apertura y cierre de turno.
- **Arte Previo en el Repositorio:**
  - `packages/frontend/src/queries/server-state.test.ts` y `packages/frontend/src/queries/tickets/tickets.test.ts` usando `bun:test`.

## Out of Scope

- Integración por hardware serial/USB para disparo eléctrico del cajón de dinero (kick-out RJ11 via ESC/POS binario directo); la impresión del Corte Z utiliza el flujo estándar del navegador (`window.print()`) con hoja de estilos térmica dedicada.
- Conciliación automática contra APIs bancarias externas (los montos de tarjeta/transferencia del turno se consultan desde las ventas registradas en el sistema).
- Creación de nuevas tablas en la base de datos SQLite que requieran regeneración destructiva del contrato Prisma.

## Further Notes

- Esta especificación incorpora las mejores prácticas de la industria retail/POS (Two-Stage Blind Count, Three-Tier Variance Thresholds y Z-Report Thermal Slip con cadena de custodia) y resuelve el 100% de los hallazgos P0, P1, P2 y P3 detectados en el audit y critique de `/impeccable`.
