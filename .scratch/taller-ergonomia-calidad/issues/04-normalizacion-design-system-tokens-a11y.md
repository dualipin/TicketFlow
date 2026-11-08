# 04: Normalización al Sistema de Diseño (`DESIGN.md`), Tokens Semánticos y Accesibilidad WCAG AA

**What to build:**
Llevar el código de `/taller` a 0 violaciones del detector de diseño de Impeccable: reemplazar los 28 usos de tipografías fuera de escala (`text-[10px]`, `text-[11px]`) por la escala estándar de `DESIGN.md` (`text-xs`), sustituir colores fijos (`purple-500`, `amber-500`, etc.) por variables semánticas, elevar las alturas táctiles a mínimo 28px/32px cumpliendo WCAG AA 2.5.8, añadir nombres accesibles (`aria-label`) a inputs y corregir la jerarquía de títulos de la vista.

**Blocked by:** 02: Flujo Contextual de "Siguiente Estado" y Ergonomía de Navegación en Tarjetas, 03: Salvaguarda de Cobro y Liquidación en Caja al Entregar Equipos con Saldo Pendiente

**Status:** completed

- [x] Todas las clases `text-[10px]` y `text-[11px]` en `TallerView`, `TicketCard`, `TicketStatusChanger` y `TicketDetailDrawer` reemplazadas por `text-xs` (12px) con tipografía mecánica consistente.
- [x] Colores hardcodeados en bitácora y estados reemplazados por tokens semánticos del sistema (`text-primary`, `bg-accent`, `border-border`, etc.).
- [x] Botones táctiles cumplen con una altura mínima de 28px (`h-7` o `h-8`), eliminando clases no accesibles como `h-5.5` (22px).
- [x] Input de búsqueda cuenta con `aria-label="Buscar tickets o folios"`.
- [x] Título de la vista incluye `<h1>` semántico respetando la jerarquía accesible.
- [x] Toggle de "Solo Deudores" cuenta con `aria-pressed`.
- [x] Ejecución de `impeccable detect` en `packages/frontend/src/components/tickets` arroja 0 advertencias de escala tipográfica (`[]`).
- [x] Tests de frontend y build general (`tsc -b && vite build`) pasan sin errores.
