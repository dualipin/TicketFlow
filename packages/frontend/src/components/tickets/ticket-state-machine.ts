import type { TicketEstado } from '../../api/types.ts';

export interface NextStepConfig {
  nextStatus: TicketEstado;
  label: string;
}

export interface AlternativeStepConfig {
  status: TicketEstado;
  label: string;
}

const ALL_STATUS_LABELS: Record<TicketEstado, string> = {
  RECIBIDO: 'Recibido',
  DIAGNOSTICO: 'En Diagnóstico',
  EN_REPARACION: 'En Reparación',
  LISTO: 'Listo para Entrega',
  ENTREGADO: 'Entregado a Cliente',
  CANCELADO: 'Cancelado',
};

const NEXT_STEP_MAP: Record<TicketEstado, NextStepConfig | null> = {
  RECIBIDO: {
    nextStatus: 'DIAGNOSTICO',
    label: 'Iniciar Diagnóstico',
  },
  DIAGNOSTICO: {
    nextStatus: 'EN_REPARACION',
    label: 'Comenzar Reparación',
  },
  EN_REPARACION: {
    nextStatus: 'LISTO',
    label: 'Marcar Listo',
  },
  LISTO: {
    nextStatus: 'ENTREGADO',
    label: 'Entregar a Cliente',
  },
  ENTREGADO: null,
  CANCELADO: null,
};

/**
 * Returns the primary forward-step in the repair lifecycle, or null if terminal.
 */
export function getNextTicketStep(currentStatus: TicketEstado): NextStepConfig | null {
  return NEXT_STEP_MAP[currentStatus] ?? null;
}

/**
 * Returns alternative transition options (skips current and immediate next linear step).
 */
export function getAlternativeTicketSteps(currentStatus: TicketEstado): AlternativeStepConfig[] {
  const next = getNextTicketStep(currentStatus);
  const excluded = new Set<TicketEstado>([currentStatus]);
  if (next) {
    excluded.add(next.nextStatus);
  }

  const allStatuses: TicketEstado[] = [
    'RECIBIDO',
    'DIAGNOSTICO',
    'EN_REPARACION',
    'LISTO',
    'ENTREGADO',
    'CANCELADO',
  ];

  return allStatuses
    .filter((s) => !excluded.has(s))
    .map((s) => ({
      status: s,
      label: s === 'CANCELADO' ? 'Cancelar orden' : `Cambiar a ${ALL_STATUS_LABELS[s]}`,
    }));
}
