# Spec: Corrección de Escala Visual, Legibilidad y Ergonomía Táctil (Desktop y Mobile)

Status: ready-for-agent

## Problem Statement

Los operadores de mostrador, técnicos de taller y administradores perciben toda la aplicación demasiado pequeña tanto en escritorio como en dispositivos móviles:

1. **Escala tipográfica comprimida:** La mayor parte de las vistas usa tamaños micro (`11px`–`12px` e incluso `10px`) para textos operativos, etiquetas, pestañas y tarjetas, dejando títulos de tarjeta en `14px` y encabezados principales en `16px`.
2. **Compresión de lectura global:** El cuerpo de la aplicación aplica un tracking negativo global (`-0.25px`) sobre la fuente base, apretando visualmente caracteres que ya son pequeños.
3. **Controles y objetivos táctiles subdimensionados:** Las primitivas base ya son compactas y muchas pantallas las reducen aún más con variantes extra-pequeñas (`24px`–`28px` de altura e iconos de `12px`–`14px`). En pantallas táctiles y móviles esto dificulta pulsar botones, pestañas e inputs sin errores.
4. **Valores fijos en píxeles que bloquean el escalado proporcional:** Varios textos usan medidas fijas en píxeles en lugar de unidades relativas (`rem`), lo que impide que escalen de forma uniforme al ajustar la base del documento.

## Solution

Aumentar la escala visual y ergonómica de toda la interfaz de forma proporcional y mínima (enfoque de cambio mínimo completo):

1. **Escala raíz en `rem`:** Elevar el tamaño base de fuente del documento raíz (diferenciado para escritorio y móvil si es necesario para comodidad de lectura) y eliminar el tracking negativo global en el texto de cuerpo para dar aire a toda la tipografía, espaciados y alturas basadas en `rem`.
2. **Normalización de textos en píxeles fijos:** Sustituir las clases tipográficas fijas en píxeles (`10px`, `11px`) por clases relativas de la escala estándar para que respondan al tamaño raíz y mantengan legibilidad mínima.
3. **Ergonomía de controles e inputs:** Elevar las alturas e iconos por defecto de los controles interactivos (en especial en móvil/pantallas táctiles y barras de herramientas) para garantizar objetivos táctiles cómodos sin deformar el diseño de barra superior o tarjetas.
4. **Preservación de diseño responsivo:** Mantener el flujo de escritorio de alta densidad operativa sin provocar desbordes horizontales, cortes de texto ni saltos de línea rotos en barras superiores, pestañas o tarjetas de trabajo.

## User Stories

1. Como técnico de taller en escritorio, quiero que los folios, fallas reportadas y datos del cliente en las tarjetas de trabajo se lean cómodamente sin forzar la vista, para revisar la cola de reparación con rapidez.
2. Como técnico de taller en móvil o tablet, quiero que los botones de avance de estado y los controles de filtro tengan un área táctil cómoda, para cambiar estados con el dedo sin pulsaciones accidentales.
3. Como cajero en Punto de Venta (POS) en escritorio, quiero que el buscador de SKU, los nombres de producto, precios y totales del carrito tengan una jerarquía clara y legible a distancia de mostrador, para cobrar sin errores.
4. Como cajero en móvil, quiero que los botones de agregar producto, ajustar cantidad y finalizar cobro sean fáciles de pulsar y no se vean diminutos ni amontonados, para atender ventas rápidas desde un teléfono o tablet.
5. Como administrador en Inventario, quiero que los filtros de estado, categoría y búsqueda, junto con las métricas de resumen, usen textos y controles proporcionales, para auditar el stock sin fatiga visual.
6. Como encargado de mostrador en Corte de Caja, quiero que las denominaciones, saldos calculados y botones de arqueo se lean con nitidez tanto en monitor como en pantalla móvil, para cuadrar el turno con seguridad.
7. Como operador en cualquier vista, quiero que la barra superior contextual (título de ruta, indicador de turno activo, cambio de tema y bloqueo rápido) mantenga proporciones cómodas sin recortar texto ni desbordar en pantallas pequeñas.
8. Como operador, quiero que el menú lateral de navegación y su cajón móvil muestren etiquetas, iconos y badges con tamaño legible y área táctil holgada, para cambiar de módulo sin esfuerzo.
9. Como operador que llena formularios en modales o paneles laterales (recepción de ticket, creación/edición de producto, apertura y cierre de caja), quiero que las etiquetas de campo, entradas de texto y mensajes de error sean cómodos de leer y tocar en ambos formatos.
10. Como usuario de iOS o Android en navegador móvil, quiero que los campos de entrada mantengan un tamaño de fuente suficiente al enfocar, para evitar que el navegador haga zoom automático molesto al escribir.
11. Como operador en pantallas de historial de ventas o detalle de ticket, quiero que las tablas, bitácoras y resúmenes no tengan textos comprimidos con interlineado o tracking negativo apretado, para inspeccionar transacciones pasadas con claridad.
12. Como operador que usa pantalla de bloqueo por PIN, quiero que el teclado numérico y los avisos de sesión tengan botones amplios y fáciles de presionar, para desbloquear la estación rápidamente en cambios de turno.
13. Como diseñador o desarrollador del proyecto, quiero que la escala tipográfica dependa de la raíz en `rem` y de las primitivas compartidas en lugar de sobrescrituras aisladas por pantalla, para evitar regresiones y mantener consistencia futura.
14. Como operador en escritorio o móvil, quiero que al aumentar la escala no aparezca scroll horizontal no deseado en la vista principal, en las pestañas ni en las tarjetas.

## Implementation Decisions

- **Raíz tipográfica y espaciado entre letras (hoja de estilos global):**
  - Incrementar el tamaño de fuente raíz del documento para escalar proporcionalmente todos los textos, alturas, márgenes, radios y paddings definidos en `rem` en Tailwind.
  - Eliminar el `letter-spacing` negativo global sobre el cuerpo del documento para mejorar la legibilidad de fuentes medianas y pequeñas.
- **Eliminación de tamaños rígidos en píxeles:**
  - Reemplazar usos explícitos de tamaños micro en píxeles (`10px`, `11px`) en los módulos de interfaz por tokens relativos estándar (`text-xs` o `text-sm` según jerarquía), de modo que todo el texto herede la nueva escala raíz.
- **Ajuste mínimo de primitivas de interfaz y controles compactos:**
  - Revisar las primitivas base de botón, entrada de texto, pestañas y selectores para asegurar alturas mínimas cómodas en escritorio y móvil, evitando forzar variantes extra-pequeñas (`xs` / alturas sub-`32px`) en acciones principales y controles táctiles de barra de herramientas o tarjetas.
  - Mantener en entradas de formulario un tamaño mínimo que evite zoom automático en navegadores móviles al enfocar.
- **Criterio de mínimo cambio:**
  - Priorizar los ajustes en la raíz global y en las primitivas compartidas antes que modificar maquetaciones pantalla por pantalla; solo ajustar vistas concretas donde haya clases fijas en píxeles, overrides demasiado pequeños o riesgo de desborde tras el escalado.

## Testing Decisions

- **Seam único de verificación:**
  - La aplicación frontend compilada y renderizada end-to-end en navegador real, inspeccionada en viewport de escritorio (`>= 1280px`) y móvil (`~375px`).
- **Qué constituye una verificación válida (comportamiento externo observable):**
  - El build de producción del frontend (`tsc -b` y empaquetado de producción) compila sin errores ni advertencias de tipos.
  - El tamaño computado raíz y los textos de lectura en vistas principales (`/taller`, `/pos`, `/inventario`, `/corte-caja`, `/pos/historial`) reflejan el aumento de escala esperado respecto al estado previo.
  - Los controles interactivos principales (botones de acción, pestañas, inputs, gatillos de barra superior) alcanzan dimensiones táctiles cómodas sin superposición, truncamiento crítico ni desbordamiento horizontal en escritorio y móvil.
- **Antecedentes en el repositorio:**
  - El paquete frontend no cuenta con librerías de renderizado DOM ni E2E instaladas (las pruebas unitarias existentes como las de contexto de tema validan lógica pura con `bun test`), por lo que no se introducirán dependencias nuevas ni pruebas frágiles acopladas a nombres de clases CSS.

## Out of Scope

- Rediseño estructural de layouts, reordenamiento de columnas o cambio de flujos de negocio en Taller, POS, Inventario o Corte de Caja.
- Introducción de un selector manual de "nivel de zoom" o densidad en la interfaz de usuario.
- Instalación de nuevos frameworks de pruebas E2E o DOM (`Playwright`, `Testing Library`) solo para este ajuste visual.
- Modificaciones en el backend, contratos de API o estilos de impresión de ticket térmico (`@media print`).

## Further Notes

- El ajuste en la raíz (`html` `font-size`) afecta también las consultas por `rem` o espaciados globales de sidebar y modales; al implementar se debe revisar especialmente la barra superior contextual en móvil (`~375px`) para que el título, el indicador de turno y los botones de tema/bloqueo convivan sin romperse.
- Se debe mantener alineada la documentación de diseño del frontend si se altera el tracking base o la escala documentada.
