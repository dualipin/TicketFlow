# 04: Normalización del Design System (`DESIGN.md`), Primitiva `<Empty>`, `<NumberFlow />` y Accesibilidad WCAG AA

**What to build:**
Alinear al 100% el módulo `/corte-caja` con las reglas del sistema de diseño de TicketFlow (`DESIGN.md` y `AGENTS.md`) y los estándares de accesibilidad WCAG 2.1 AA. Se eliminan todas las clases tipográficas fuera de escala (`text-[10px]` y `text-[11px]`), se reemplaza la tarjeta vacía improvisada por la primitiva oficial `<Empty>`, se integran transiciones numéricas mecánicas con `<NumberFlow />` y `tabular-nums`, se corrigen los contrastes de color en modo claro/oscuro y se optimiza la tabla de historial con cabeceras semánticas y formateo de fechas memoizado.

**Blocked by:** 01: Motor de Dominio de Arqueo, Bandeja de Denominaciones MXN y Flujo de Arqueo Ciego Progresivo

**Status:** completed

- [x] El detector determinista `.agents\skills\impeccable\scripts\impeccable.cmd detect --json packages/frontend/src/components/corte-caja` retorna **0 hallazgos** (todas las instancias de `text-[10px]` y `text-[11px]` normalizadas a `text-xs`).
- [x] El estado sin turno activo utiliza la primitiva canónica `<Empty>` (`EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`) de `components/ui/empty.tsx`.
- [x] Todas las cifras monetarias de las tarjetas de resumen y balance utilizan `<NumberFlow />` con `tabular-nums` y formato de moneda con separador de miles.
- [x] Los botones de acción respetan el radio estándar del sistema de diseño (eliminando `rounded-full` arbitrarios) y las insignias/alertas cumplen con un contraste mínimo de 4.5:1 tanto en tema claro como oscuro.
- [x] `HistorialCortesTable` extraído y memoizado con `React.memo`, empleando `Intl.DateTimeFormat` instanciado a nivel de módulo, atributo `aria-label` en la tabla y `scope="col"` en todas las celdas `<th>`.
