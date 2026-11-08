# Spec: Remediación Integral de Calidad, Rendimiento y Ergonomía del Módulo de Taller (`/taller`)

Status: ready-for-agent

## Problem Statement

Los técnicos y encargados de mostrador enfrentan problemas críticos de ergonomía, riesgo financiero y rendimiento en la pantalla de Taller (`/taller`):
1. **Saturación y fatiga visual en tarjetas:** Cada tarjeta de ticket en la cola de trabajo renderiza una botonera completa de 6 estados (`TicketStatusChanger`), saturando la pantalla con más de 72 botones interactivos simultáneos en una vista estándar de 12 tickets. Esto ocasiona saltos de línea irregulares, fatiga visual y riesgo de pulsación accidental.
2. **Riesgo crítico de fugas financieras por entrega indebida:** Actualmente cualquier operador puede marcar un ticket como "Entregado" con un solo clic directamente desde la tarjeta, incluso si el cliente tiene saldo pendiente (`saldoPendiente > 0`), sin exigir el cobro previo en caja ni confirmación de crédito.
3. **Colapso de rendimiento por búsqueda sin debounce:** El campo de búsqueda utiliza `useDeferredValue` en lugar de una función de debounce de red, disparando ráfagas continuas de peticiones HTTP al backend por cada pulsación de tecla y sobrecargando el caché de TanStack Query.
4. **Barreras de accesibilidad y objetivos táctiles subestándar (WCAG AA):** Los botones de cambio de estado tienen una altura de apenas 22px (`h-5.5`), violando el criterio WCAG AA 2.5.8 (mínimo 24px) y dificultando el toque en pantallas táctiles de mostrador. Además, los campos de búsqueda, ajuste de costo y notas carecen de etiquetas accesibles (`aria-label` o `<label>`), y la navegación por teclado exige más de 120 tabulaciones para recorrer la lista.
5. **Falta de anclajes físicos del taller:** Los técnicos no pueden identificar rápidamente en qué estante, charola o gaveta física se encuentra almacenado el equipo ni cuál es la fecha límite de entrega comprometida (SLA).

## Solution

Reestructurar y optimizar integralmente la experiencia de la cola de trabajo de Taller (`/taller`) abordando rendimiento, ergonomía de estados, prevención de pérdidas y accesibilidad:

1. **Rendimiento de Búsqueda:** Incorporar un hook de debounce de ~300ms sobre el término de búsqueda de tickets, desacoplando la escritura inmediata del usuario en el input del disparo de peticiones de red hacia TanStack Query.
2. **Acción Contextual "Siguiente Estado" (Forward-Step Workflow):**
   - Reemplazar la botonera repetitiva de 6 botones en `TicketCard` por un botón de acción primaria contextual que promueva el ticket a su siguiente fase natural del flujo de trabajo (ej. *Recibido → Iniciar Diagnóstico*, *Diagnóstico → Pasar a Reparación*, *En Reparación → Marcar Listo*, *Listo → Entregar*).
   - Incluir un menú desplegable compacto (`...`) para saltos no lineales, devoluciones o cancelación.
   - Reservar la matriz completa de estados para el panel lateral de detalle (`TicketDetailDrawer`).
3. **Salvaguarda de Cobro Obligatorio para Deudores:**
   - Interceptar cualquier intento de transición al estado `ENTREGADO` cuando `ticket.saldoPendiente > 0`.
   - Si existe saldo deudor, abrir un modal de resolución financiera que ofrezca dos vías:
     a) Cobro inmediato del saldo en caja registradora vinculando al turno activo.
     b) Autorización expresa de entrega a crédito con registro del operador responsable.
   - Si no se liquida ni se autoriza crédito, la orden permanece en su estado actual, impidiendo la entrega accidental.
4. **Accesibilidad Integral (WCAG AA):**
   - Elevar todos los controles interactivos y botones táctiles a una altura mínima de 28px/32px (`h-7` o `h-8`).
   - Suministrar etiquetas accesibles explícitas (`aria-label`) al input de búsqueda, al ajuste de presupuesto y al campo de notas de la bitácora.
   - Proveer roles semánticos (`role="radiogroup"`, `aria-current="true"`, `aria-pressed`) en filtros y selectores de estado.
   - Permitir selección de la tarjeta al hacer clic en cualquier área del contenedor y habilitar navegación ágil por teclado reduciendo los tab-stops por tarjeta a máximo dos (selección de tarjeta y acción siguiente).
5. **Normalización Tipográfica y Semántica:**
   - Estandarizar todas las clases tipográficas arbitrarias (`text-[10px]`, `text-[11px]`) a la escala oficial de `DESIGN.md` (`text-xs` / 12px con tracking mecánico).
   - Sustituir clases de color directas (`purple-500`, `amber-500`) por tokens semánticos del sistema.
6. **Anclaje Físico y Compromiso de Entrega:**
   - Añadir campos de `ubicacionFisica` (ej. "Gaveta B-12") y `fechaPromesa` (fecha/hora compromiso de entrega) tanto en el modal de recepción como visibles en la tarjeta del ticket.

## User Stories

1. Como técnico de taller, quiero que la interfaz responda con fluidez mientras busco un folio o cliente sin congelamientos de red, para localizar órdenes sin demoras.
2. Como cajero o técnico, quiero que escribir rápido en la barra de búsqueda no dispare múltiples peticiones por letra al servidor, para proteger el ancho de banda y la estabilidad del sistema.
3. Como técnico de banco de trabajo, quiero ver una acción clara y destacada de "Siguiente estado" en cada tarjeta, para avanzar la orden de trabajo con un solo clic según el flujo operativo regular.
4. Como técnico, quiero contar con un menú de opciones secundarias en la tarjeta para casos excepcionales (como cancelar o reabrir diagnóstico), para tener flexibilidad sin saturar la vista principal de botones.
5. Como cajero en mostrador, quiero que el sistema me impida entregar un equipo a un cliente si tiene saldo pendiente sin antes exigir el cobro o una autorización, para evitar fugas de dinero en la tienda.
6. Como cajero, quiero que al intentar entregar un equipo con saldo pendiente se me presente una opción rápida para registrar el pago restante en el turno de caja actual, para liquidar la cuenta en el mismo instante.
7. Como operador que utiliza pantalla táctil en mostrador, quiero botones de al menos 28px a 36px de altura y espaciado cómodo, para no pulsar opciones incorrectas con el dedo.
8. Como usuario de lector de pantalla o teclado, quiero que la barra de búsqueda anuncie su propósito mediante una etiqueta accesible, para saber exactamente qué información puedo ingresar.
9. Como usuario de teclado, quiero poder recorrer la cola de tickets presionando Tab pocas veces por elemento, para no sufrir fatiga al auditar decenas de órdenes de trabajo.
10. Como operador, quiero poder hacer clic en cualquier parte de la tarjeta del ticket para abrir su detalle completo, para no tener que apuntar milimétricamente al botón "Ver detalle".
11. Como técnico, quiero ver en la tarjeta del ticket la ubicación física del dispositivo (ej. estante, caja o gaveta asignada), para localizar el aparato físico en menos de cinco segundos.
12. Como encargado de taller, quiero ver la fecha y hora compromiso de entrega en la tarjeta, para priorizar primero los equipos con vencimiento inminente o retrasados.
13. Como operador con discapacidad visual o usuario de tecnologías de asistencia, quiero que los selectores de estado anuncien claramente cuál es el estado activo actual mediante atributos ARIA semánticos.
14. Como técnico, quiero que el campo de presupuesto y notas de la bitácora cuenten con descripciones accesibles para tecnologías asistivas.
15. Como diseñador del sistema, quiero que todos los textos del módulo de taller utilicen la escala oficial de tokens tipográficos documentada en `DESIGN.md`, para asegurar una jerarquía visual homogénea.
16. Como técnico de mostrador, quiero que las notas internas de taller y las notas públicas para el cliente mantengan una distinción cromática semántica clara y accesible en modos claro y oscuro.
17. Como cajero, quiero que el filtro de "Solo Deudores con Saldo" informe su estado activo/inactivo a tecnologías de accesibilidad mediante `aria-pressed`.
18. Como técnico, quiero que los contadores de adjuntos multimedia (fotos, audios, videos) tengan un espaciado visual equilibrado que no compita visualmente con el teléfono del cliente.
19. Como operador de recepción, quiero que el formulario de creación de ticket no tenga montos prellenados arbitrarios, para evitar crear órdenes con cotizaciones falsas por error.
20. Como encargado de mostrador, quiero que las transiciones de estado reflejen de inmediato los filtros aplicados en la pestaña activa, para evitar ver tickets en pestañas que ya no les corresponden.

## Implementation Decisions

- **Manejo de Búsqueda y Debounce:**
  - Crear un hook de utilidad reutilizable `useDebounce<T>(value: T, delayMs: number)` en `packages/frontend/src/hooks/useDebounce.ts`.
  - Conectar el valor debounceado al objeto `activeFilters` de `useTickets(...)`, fijando un retraso estándar de 300ms.
- **Rediseño de Estados en `TicketCard`:**
  - Definir una función pura de máquina de estados para el avance lineal estándar:
    - `RECIBIDO` → `DIAGNOSTICO` (Etiqueta: "Iniciar Diagnóstico")
    - `DIAGNOSTICO` → `EN_REPARACION` (Etiqueta: "Comenzar Reparación")
    - `EN_REPARACION` → `LISTO` (Etiqueta: "Marcar Listo")
    - `LISTO` → `ENTREGADO` (Etiqueta: "Entregar a Cliente")
    - `ENTREGADO` / `CANCELADO` → Estado final (sin avance lineal; opción de reabrir en menú desplegable).
  - Componente `TicketCard`: tarjeta interactiva con `onClick` en el contenedor principal para abrir detalle, manteniendo `role="article"` y accesibilidad de teclado (`onKeyDown` para Enter/Espacio).
  - Botón de avance principal con altura accesible (`size="sm"`, `h-8`), complementado con un `DropdownMenu` o botón de acciones secundarias (`...`) para saltos a estados alternativos o cancelación.
- **Salvaguarda de Cobro en Entrega:**
  - Crear un modal de validación de entrega (`ConfirmEntregaDialog` o integrado en `TicketStatusChanger`) que se active cuando la transición solicitada sea hacia `ENTREGADO` y `ticket.saldoPendiente > 0`.
  - El diálogo presentará:
    - Folio y resumen del adeudo pendiente.
    - Botón primario: "Cobrar y Entregar" (abre el flujo rápido de liquidación de saldo).
    - Botón secundario: "Autorizar Entrega a Crédito" (registra la nota en bitácora con el operador actual y permite la transición).
    - Botón de cancelación: regresa al estado previo sin modificar el ticket.
- **Campos de Ubicación Física y Fecha Compromiso:**
  - Extender el modelo de ticket con los campos opcionales `ubicacionFisica?: string` y `fechaPromesa?: string` en tipos y formulario de recepción (`CreateTicketModal`).
  - Mostrar insignias compactas en `TicketCard`: icono de caja/ubicación con la gaveta asignada y badge con la fecha de promesa.
- **Limpieza de Tipografía y Clases Directas:**
  - Reemplazar todas las ocurrencias de `text-[10px]` y `text-[11px]` por `text-xs` (12px) con `font-medium` o `tracking-tight` según corresponda.
  - Eliminar clases fijas de colores (`purple-500`, `amber-500`, `emerald-500`) en favor de variables del sistema (`text-primary`, `bg-accent`, `text-muted-foreground`, o variantes semánticas de `Badge`).
- **Accesibilidad:**
  - Agregar `aria-label="Buscar por folio, cliente, teléfono o falla"` al input de búsqueda.
  - Envolver el selector de estados en `TicketDetailDrawer` con `role="radiogroup"` y `aria-label="Estado del ticket"`, marcando el estado actual con `aria-checked="true"`.
  - Asegurar un tamaño mínimo de objetivo táctil de 28px en todos los botones de acción rápida.

## Testing Decisions

- **Criterio de Buen Test:**
  - Evaluar el comportamiento externo y observable desde la perspectiva del técnico o cajero, sin depender de detalles internos efímeros de React.
  - Validar que el debounce retrase efectivamente la invocación de la query key hasta cumplirse el lapso de inactividad de escritura.
  - Verificar que la máquina de transición de estados proponga el estado siguiente correcto y detenga la entrega si existe saldo pendiente sin confirmación.
  - Verificar la coherencia de las query keys y las invalidaciones de cache ante cambios de estado y liquidaciones de saldo.
- **Módulos a Probar:**
  - Hook de debounce y queries de tickets (`useDebounce`, `ticketsKeys`, `useTickets`).
  - Lógica de transición de estados y salvaguarda de saldo pendiente (`ticket-state-machine` / validaciones de entrega).
- **Arte Previo en el Repositorio:**
  - Pruebas existentes con `bun:test` en `packages/frontend/src/queries/server-state.test.ts` y `packages/frontend/src/lib/theme-context.test.ts`.

## Out of Scope

- Cambios estructurales en el schema de base de datos de Prisma en esta fase (los campos nuevos se manejan opcionalmente con soporte en backend existente).
- Rediseño de la pantalla de Punto de Venta (`/pos`) o Corte de Caja (`/corte-caja`).
- Reemplazo completo de `SectionCards` en la cabecera general (la adaptación de KPIs específicos de taller se abordará en una fase posterior).

## Further Notes

- Esta especificación atiende directamente los hallazgos de severidad P0 y P1 identificados en la auditoría y crítica realizada con Impeccable.
- La ejecución de esta spec dejará el módulo de `/taller` preparado para una certificación de calidad de grado de producción.
