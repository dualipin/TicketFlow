# 02: Flujo Contextual de "Siguiente Estado" y Ergonomía de Navegación en Tarjetas

**What to build:**
Sustituir la saturada botonera de 6 estados de cada tarjeta en el feed de `/taller` por un botón de acción primaria contextual que propone el siguiente paso lógico en el ciclo de vida del taller (*Recibido* → *Iniciar Diagnóstico* → *Comenzar Reparación* → *Marcar Listo* → *Entregar a Cliente*), acompañado de un menú de opciones secundarias (`...`) para saltos no lineales o cancelación. Además, hacer que toda la tarjeta sea seleccionable con clic o teclado (`Enter`/`Space`) para abrir el drawer de detalle, reduciendo drásticamente los tab-stops de navegación de 6 por tarjeta a solo 2.

**Blocked by:** 01: Búsqueda con Debounce, Memoización del Feed y Consistencia Optimista de Pestañas

**Status:** completed

- [x] Función de máquina de estados de taller implementada (`getNextTicketState`, etiquetas contextuales y estados terminales).
- [x] `TicketCard` reemplaza la fila de 6 botones de estado por: (1) Botón de acción contextual primario accesible, y (2) Menú o botón secundario para cambios alternativos/cancelación (`TicketStatusWorkflow`).
- [x] Toda la tarjeta cuenta con `role="article"`, `tabIndex={0}`, y atajos de teclado (`Enter`, `Space`) para abrir el drawer de detalle de forma intuitiva.
- [x] Selector completo de 6 estados preservado exclusivamente dentro de `TicketDetailDrawer` con semántica accesible `role="radiogroup"` y `aria-checked`.
- [x] Reducción drástica del ruido visual y prevención de saltos de línea irregulares en tarjetas en resoluciones medias (`md`).
- [x] Pruebas unitarias de la máquina de estados y transiciones en `tickets.test.ts`.
- [x] Compilación TypeScript limpia sin errores.
