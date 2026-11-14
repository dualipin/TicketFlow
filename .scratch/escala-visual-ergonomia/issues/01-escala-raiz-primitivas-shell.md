# 01: Escala raíz global, legibilidad de cuerpo y ergonomía en primitivas y shell

**What to build:** Al abrir la aplicación en escritorio o móvil, toda la interfaz se percibe con una escala cómoda y legible: el documento raíz adopta un tamaño base en `rem` más amplio y elimina el espaciado negativo apretado del texto de cuerpo; las primitivas compartidas (botones, campos de entrada, pestañas y selectores) ofrecen alturas e iconos cómodos al tacto sin exigir zoom automático en móviles; y el shell principal (barra superior contextual, barra lateral/cajón móvil y pantalla de bloqueo por PIN) mantiene todos sus controles accesibles, legibles y sin desbordes horizontales ni cortes en viewports de escritorio (`>= 1280px`) y móvil (`~375px`).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] La base tipográfica del documento escala proporcionalmente textos, espaciados y alturas en `rem` tanto en escritorio como en móvil, y desaparece el tracking negativo comprimido del texto de cuerpo.
- [x] Las primitivas compartidas de botón, entrada de texto, pestañas y selectores ofrecen objetivos táctiles cómodos en escritorio y móvil, conservando un tamaño de texto en inputs que evita zoom automático al enfocar en navegadores móviles.
- [x] En la barra superior contextual, el menú lateral de navegación (y su cajón móvil) y la pantalla de bloqueo por PIN, los textos rígidos micro en píxeles (`10px`/`11px`) se reemplazan por escala relativa y los controles clave evitan variantes subdimensionadas.
- [x] La compilación de producción del frontend pasa sin errores de TypeScript ni de empaquetado.
- [x] En inspección en navegador real (desktop `>= 1280px` y mobile `~375px`), el shell y las vistas principales se renderizan sin scroll horizontal no deseado, sin solapamientos y sin rotura de la barra superior.

## Answer

Implementado en `feat/escala-visual-ergonomia` (`17px` móvil / `18px` `>= 768px` en raíz, `letter-spacing` normal en `body`, primitivas `button`/`input-group`/`sidebar`/`theme-toggle` y shell `SiteHeader`/`AppSidebar`/`DashboardLayout`/`LockScreen`). Verificado en navegador real (`1280x800` y `375x812`) con `scrollDelta = 0`, botones de cabecera `>= 34px` e inputs móviles a `17px`.
