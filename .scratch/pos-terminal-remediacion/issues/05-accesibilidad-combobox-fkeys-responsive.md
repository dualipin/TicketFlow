Created At: 2026-11-08T16:44:05-06:00
Completed At: 2026-11-08T16:51:00-06:00

# 05: Accesibilidad WCAG AA, Combobox de Clientes, Aceleradores F-Keys y Barra Móvil

**What to build:**
Llevar la terminal `/pos` al estándar completo de accesibilidad WCAG 2.1 AA, velocidad por teclado y adaptabilidad táctil. Reemplazar el `<select>` nativo de clientes por un Combobox accesible con filtrado instantáneo por nombre o teléfono; convertir la selección de método de pago en un grupo de botones con semántica de radio (`role="radiogroup"` y `aria-checked`); ampliar todos los controles táctiles a un mínimo de 36–44px con etiquetas `aria-label`; eliminar tamaños tipográficos fuera de escala (`text-[9px]`, `text-[10px]`) y colores fijos; activar atajos globales de teclado (`F2`, `F4`, `F8`, `F9`, `Esc`); e incorporar una barra inferior flotante en pantallas menores a 1024px para consultar el total y cobrar sin desplazarse por todo el catálogo.

**Blocked by:** 02: Cierre de Venta sin Amnesia — Modal de Éxito, Cambio Gigante e Impresión de Ticket, 03: Calculadora de Pago Mixto (Dual-Tender Split) y Conciliación en Corte de Caja, 04: Ergonomía de Mostrador — Efectivo Acumulativo, Carritos en Espera (Hold Cart) y Guardrail de Vaciado

**Status:** completed

- [x] El selector de clientes permite buscar en tiempo real por nombre o número telefónico mediante un Combobox accesible con etiqueta semántica y opción rápida para dar de alta un nuevo cliente.
- [x] El selector de método de pago expone `role="radiogroup"` y cada opción informa su estado activo mediante `aria-checked` o `aria-pressed`, soportando navegación con teclado.
- [x] Todos los botones interactivos de carrito (incrementar, disminuir, eliminar, oferta) y atajos de billetes tienen dimensiones táctiles accesibles (mínimo 36px) y cuentan con `aria-label` descriptivos.
- [x] Atajos de teclado operativos en la vista: `F2` enfoca el buscador de código de barras, `F4` abre el buscador de clientes, `F8` pone en espera o recupera un carrito, `F9` ejecuta el cobro cuando es válido y `Esc` limpia o cierra diálogos, con indicadores visuales discretos de cada atajo.
- [x] En resoluciones móviles y de tableta (`<1024px`), una barra inferior persistente muestra el conteo de artículos, el total acumulado y un botón directo para saltar al carrito o cobrar.
- [x] El escaneo del detector de diseño (`impeccable detect --json`) sobre los componentes del módulo `/pos` arroja 0 advertencias tipográficas o de tokens, y tanto el build de frontend como el de backend finalizan sin errores.
