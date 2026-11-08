# 01: Búsqueda con Debounce, Memoización del Feed y Consistencia Optimista de Pestañas

**What to build:**
Al buscar un ticket o filtrar en `/taller`, el sistema aplica un debounce de 300 ms en lugar de disparar una petición de red con cada tecla presionada, protegiendo el backend y manteniendo el feed reactivo. Además, las tarjetas del feed se memoizan evitando re-renders innecesarios de toda la cuadrícula al escribir o seleccionar un ticket, y las mutaciones optimistas de cambio de estado descuentan de inmediato el ticket de la pestaña activa si ya no cumple con el estado filtrado (ej. si estoy en "Recibidos" y cambio a "En Reparación", el ticket desaparece de la vista filtrada sin esperar la invalidación del servidor).

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Hook `useDebounce` creado en `packages/frontend/src/hooks/useDebounce.ts` e integrado en `TallerView.tsx`.
- [x] Escribir en el input de búsqueda de `/taller` no dispara consultas de red instantáneas por cada tecla; se aplaza la actualización de la query key hasta transcurridos 300ms de inactividad.
- [x] `TicketCard` memoizado con `React.memo` con callback de selección estable para evitar renders en cascada del feed completo.
- [x] Mutación optimista en `mutations.ts` (`useUpdateTicketStatus`) filtra la lista en caché si el ticket actualizado ya no coincide con el `estado` de la pestaña activa.
- [x] Pruebas unitarias de debounce y consistencia de caché en `packages/frontend/src/queries/tickets/tickets.test.ts` pasando al 100%.
- [x] Compilación TypeScript (`tsc -b`) limpia sin errores.
