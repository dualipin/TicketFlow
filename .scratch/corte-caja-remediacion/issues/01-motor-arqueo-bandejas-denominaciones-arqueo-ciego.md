# 01: Motor de Dominio de Arqueo, Bandeja de Denominaciones MXN y Flujo de Arqueo Ciego Progresivo

**What to build:**
Al realizar el arqueo de un turno activo en `/corte-caja`, el operador cuenta con una bandeja interactiva de denominaciones mexicanas (billetes de `$1,000`, `$500`, `$200`, `$100`, `$50`, `$20` y monedas de `$10`, `$5`, `$2`, `$1`, `$0.50`) que multiplica y suma automáticamente el efectivo físico en tiempo real, permitiendo alternar con el modo de "Conteo Rápido" y avanzar entre denominaciones con la tecla `Enter`. Para prevenir sesgos de anclaje y retención de sobrantes, los operadores no administradores realizan la captura bajo **Arqueo Ciego** (con los saldos esperados ocultos tras `••••••`) hasta pulsar **"Verificar Arqueo"**, momento en que se revela el balance esperado y la diferencia con opción de **"Recontar Gaveta"**. Toda la lógica financiera reside en un motor puro testeado y el formulario se aísla en su propio subcomponente para no re-renderizar el historial en cada pulsación.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Módulo puro `corte-caja-engine.ts` implementado con cálculo exacto de denominaciones (`calcularTotalDenominaciones`), formateador de desglose (`formatearDesgloseDenominaciones`), formateador de moneda local (`formatCurrencyMxn`) y evaluador de bandas de tolerancia (`evaluarArqueo`).
- [x] Suite de pruebas unitarias `corte-caja-engine.test.ts` en `bun:test` verificando sumatorias con decimales (`$0.50`), fronteras exactas de tolerancia (`$20.00`, `$20.01`, `$100.00`, `$100.01`) y reglas de bloqueo.
- [x] Subcomponente `DenominacionesTray` y formulario `ArqueoCajaForm` extraídos con estado local aislado para que teclear cantidades no provoque re-renderizados en la tabla de historial.
- [x] Conmutador funcional entre modo **"Por Denominación"** y **"Conteo Rápido (Total directo)"**, utilizando las primitivas `<InputGroup>`, `<InputGroupInput>`, `<InputGroupAddon>` y `<FieldLabel htmlFor="...">` vinculadas semánticamente.
- [x] Protocolo de **Arqueo Ciego Progresivo** activo: oculta `Ventas PdV (Ef.)`, `Pagos Taller (Ef.)` y `Efectivo Esperado` durante la captura para roles operativos, incluye botón de alternancia de visibilidad para `ADMIN`, y revela la conciliación al pulsar **"Verificar Arqueo"** con opción de **"Recontar Gaveta"**.
