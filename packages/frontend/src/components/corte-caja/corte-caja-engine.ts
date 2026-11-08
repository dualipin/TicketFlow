/**
 * Motor de Dominio para Corte de Caja y Arqueo de Turno (TicketFlow)
 *
 * Contiene la lógica pura e independiente de React para:
 * - Conteo y sumatoria de denominaciones mexicanas (billetes y monedas).
 * - Clasificación y evaluación de bandas de tolerancia financiera (3 niveles).
 * - Formateo de desglose de efectivo, fechas y moneda local.
 */

export const DENOMINACIONES_MXN = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5] as const;
export type DenominacionMxn = (typeof DENOMINACIONES_MXN)[number];

export type ConteoDenominaciones = Partial<Record<DenominacionMxn, number>>;

export type BandaTolerancia = 'CUADRADO_O_TOLERANCIA' | 'DESCUADRE_MODERADO' | 'DESCUADRE_CRITICO';

export interface EvaluacionArqueo {
  montoEsperado: number;
  montoReal: number | null;
  diferencia: number | null;
  absDiferencia: number | null;
  banda: BandaTolerancia | null;
  requiereNotaJustificacion: boolean;
  requiereConfirmacionCritica: boolean;
  puedeCerrar: boolean;
  motivoBloqueo: string | null;
}

/**
 * Calcula la suma total en pesos ($ MXN) de las denominaciones contadas.
 * Aplica redondeo de precisión bancaria a 2 decimales para evitar artefactos de punto flotante.
 */
export function calcularTotalDenominaciones(conteo: ConteoDenominaciones): number {
  let total = 0;

  for (const denom of DENOMINACIONES_MXN) {
    const qty = conteo[denom];
    if (typeof qty === 'number' && Number.isFinite(qty) && qty > 0) {
      total += denom * Math.floor(qty);
    }
  }

  return Math.round(total * 100) / 100;
}

/**
 * Formatea un conteo de denominaciones en un texto compacto ordenado de mayor a menor.
 * Ejemplo: "2×$500, 1×$100, 4×$0.50"
 */
export function formatearDesgloseDenominaciones(conteo: ConteoDenominaciones): string {
  const parts: string[] = [];

  for (const denom of DENOMINACIONES_MXN) {
    const qty = conteo[denom];
    if (typeof qty === 'number' && Number.isFinite(qty) && qty > 0) {
      const denomLabel = denom === 0.5 ? '$0.50' : `$${denom}`;
      parts.push(`${Math.floor(qty)}×${denomLabel}`);
    }
  }

  return parts.join(', ');
}

/**
 * Formatea una cifra numérica a moneda local mexicana (MXN).
 */
export function formatCurrencyMxn(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const sharedDateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Formateo determinista de fechas para tablas y recibos térmicos.
 */
export function formatFechaCorte(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    return sharedDateFormatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Calcula el desglose de efectivo de ventas y pagos cobrados para un corte.
 */
export function calcularDesgloseEfectivoCorte(corte: any): { ventasEf: number; pagosEf: number } {
  if (!corte) return { ventasEf: 0, pagosEf: 0 };

  const ventasEf =
    typeof corte.ventasEfectivo === 'number'
      ? corte.ventasEfectivo
      : Array.isArray(corte.ventas)
      ? corte.ventas
          .filter((v: any) => v.metodoPago === 'EFECTIVO' || v.metodoPago === 'MIXTO')
          .reduce((acc: number, v: any) => acc + (v.total || 0), 0)
      : 0;

  const pagosEf =
    typeof corte.pagosEfectivo === 'number'
      ? corte.pagosEfectivo
      : Array.isArray(corte.pagosCobrados)
      ? corte.pagosCobrados
          .filter((p: any) => p.metodoPago === 'EFECTIVO')
          .reduce((acc: number, p: any) => acc + (p.monto || 0), 0)
      : 0;

  return { ventasEf, pagosEf };
}

/**
 * Evalúa las condiciones de cierre y clasifica la diferencia en las 3 bandas de la industria:
 * - Banda 1 (Tolerancia Operativa): |diferencia| <= $20.00 MXN -> Cierre directo.
 * - Banda 2 (Descuadre Moderado): $20.00 < |diferencia| <= $100.00 MXN -> Requiere nota de justificación (>= 10 caracteres).
 * - Banda 3 (Descuadre Crítico): |diferencia| > $100.00 MXN -> Requiere nota (>= 10 car.) + confirmación explícita de responsabilidad.
 */
export function evaluarArqueo(params: {
  montoEsperado: number;
  montoReal: number | null;
  notas?: string;
  confirmacionCriticaAceptada?: boolean;
}): EvaluacionArqueo {
  const { montoEsperado, montoReal, notas = '', confirmacionCriticaAceptada = false } = params;

  if (montoReal === null || Number.isNaN(montoReal)) {
    return {
      montoEsperado,
      montoReal: null,
      diferencia: null,
      absDiferencia: null,
      banda: null,
      requiereNotaJustificacion: false,
      requiereConfirmacionCritica: false,
      puedeCerrar: false,
      motivoBloqueo: 'Ingresa o cuenta el efectivo físico en caja.',
    };
  }

  const diferencia = Math.round((montoReal - montoEsperado) * 100) / 100;
  const absDiferencia = Math.abs(diferencia);
  const notasLimpias = notas.trim();

  // Banda 1: Cuadre exacto o tolerancia operativa (hasta $20 pesos de diferencia por redondeo)
  if (absDiferencia <= 20) {
    return {
      montoEsperado,
      montoReal,
      diferencia,
      absDiferencia,
      banda: 'CUADRADO_O_TOLERANCIA',
      requiereNotaJustificacion: false,
      requiereConfirmacionCritica: false,
      puedeCerrar: true,
      motivoBloqueo: null,
    };
  }

  // Banda 2: Descuadre moderado ($20.01 a $100.00)
  if (absDiferencia <= 100) {
    const tieneNotaSuficiente = notasLimpias.length >= 10;
    return {
      montoEsperado,
      montoReal,
      diferencia,
      absDiferencia,
      banda: 'DESCUADRE_MODERADO',
      requiereNotaJustificacion: true,
      requiereConfirmacionCritica: false,
      puedeCerrar: tieneNotaSuficiente,
      motivoBloqueo: tieneNotaSuficiente
        ? null
        : 'Se requiere una nota de justificación de al menos 10 caracteres explicando el motivo del descuadre.',
    };
  }

  // Banda 3: Descuadre crítico (> $100.00)
  const tieneNotaSuficiente = notasLimpias.length >= 10;
  const cumpleTodo = tieneNotaSuficiente && confirmacionCriticaAceptada;

  let motivo: string | null = null;
  if (!tieneNotaSuficiente) {
    motivo = 'Se requiere una nota de justificación detallada (mínimo 10 caracteres) por el descuadre superior a $100 MXN.';
  } else if (!confirmacionCriticaAceptada) {
    motivo = 'Debes aceptar la declaración de responsabilidad y auditoría para cerrar con un descuadre crítico.';
  }

  return {
    montoEsperado,
    montoReal,
    diferencia,
    absDiferencia,
    banda: 'DESCUADRE_CRITICO',
    requiereNotaJustificacion: true,
    requiereConfirmacionCritica: true,
    puedeCerrar: cumpleTodo,
    motivoBloqueo: motivo,
  };
}
