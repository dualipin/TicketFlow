# 02: Diálogo de Confirmación de Cierre y Salvaguardas por Bandas de Tolerancia Financiera (P0)

**What to build:**
Eliminar el riesgo crítico (P0) de cerrar un turno de forma accidental e irreversible con un solo clic. Cuando el operador verifica su arqueo y solicita cerrar el turno, el sistema intercepta la acción con un diálogo modal de confirmación (`ConfirmarCierreModal`) gobernado por las tres bandas de tolerancia financiera de la industria (`<= $20 MXN`, `$20.01–$100 MXN` y `> $100 MXN`). Si existe un descuadre moderado o crítico, el sistema exige justificación escrita obligatoria (mínimo 10 caracteres) y, en descuadres críticos (`> $100 MXN`), exige marcar explícitamente una declaración de responsabilidad para auditoría antes de habilitar el cierre definitivo.

**Blocked by:** 01: Motor de Dominio de Arqueo, Bandeja de Denominaciones MXN y Flujo de Arqueo Ciego Progresivo

**Status:** completed

- [x] Componente `ConfirmarCierreModal` implementado con primitivas accesibles de `Dialog` (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`).
- [x] **Banda 1 (`|diferencia| <= $20.00 MXN`):** Permite confirmar el cierre de forma directa mostrando el resumen de cuadre exacto o variación menor de cambio.
- [x] **Banda 2 (`$20.00 < |diferencia| <= $100.00 MXN`):** Bloquea el botón de cierre definitivo hasta que el operador ingrese una nota de justificación de al menos 10 caracteres explicando el motivo del faltante o sobrante.
- [x] **Banda 3 (`|diferencia| > $100.00 MXN`):** Muestra alerta de severidad alta, exige la nota de justificación (>= 10 caracteres) y requiere activar la casilla explícita de responsabilidad bajo auditoría administrativa.
- [x] Al confirmar el cierre, si se utilizó la bandeja de denominaciones, el desglose compacto de billetes/monedas se adjunta automáticamente a las notas enviadas en la mutación `useCerrarCorte`.
