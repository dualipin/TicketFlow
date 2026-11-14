# 02: Estandarización de Insignias de Inventario y Alineación de Tipos en `Spinner`

**What to build:**
El catálogo de inventario distingue visualmente los registros de tipo `Servicio` y los niveles de existencias (`Agotado`, stock crítico de `1` a `3` unidades y stock suficiente `> 3`) utilizando las variantes canónicas de la primitiva `Badge` (`outline` con tokens cromáticos semánticos compatibles con modo claro/oscuro y `destructive`), mientras que el indicador de carga `Spinner` basado en `HugeiconsIcon` acepta propiedades estándar de SVG sin conflictos de tipos en `strokeWidth`, permitiendo que la compilación estricta de TypeScript y el empaquetado de producción finalicen con cero errores.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] La primitiva base `Badge` mantiene únicamente las variantes estándar del sistema de diseño (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`).
- [x] En el catálogo de inventario, la etiqueta de tipo `Servicio` utiliza la variante `outline` con estilo semántico `sky`, y el indicador de stock total utiliza `destructive` para agotados (`<= 0`), `outline` con estilo semántico `amber` para bajo stock (`1` a `3`) y `outline` con estilo semántico `emerald` para stock normal (`> 3`).
- [x] El componente `Spinner` conserva `HugeiconsIcon` (`Loading03Icon`) y define su contrato de propiedades omitiendo la definición conflictiva de `strokeWidth` del estándar SVG para tiparla opcionalmente como `number`, soportando `className`, `data-icon` y atributos de accesibilidad sin errores de compilación.
- [x] La verificación completa de tipos y bundle de producción (`tsc -b && vite build`) y la suite de pruebas del frontend (`bun test`) finalizan con código de salida `0`.
