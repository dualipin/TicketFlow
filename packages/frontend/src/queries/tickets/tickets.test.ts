import { describe, expect, it } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import { ticketsKeys } from './keys.ts';
import type { Ticket, TicketFilters } from '../../api/types.ts';

const mockTicketRecibido: Ticket = {
  id: 101,
  folio: 'TK-101',
  clienteId: 1,
  tecnicoId: null,
  estado: 'RECIBIDO',
  dispositivo: 'iPhone 12',
  falla: 'Batería inflada',
  contrasena: null,
  accesorios: null,
  fotoRecepcion: null,
  fotoAccesorios: null,
  costoTotal: 850,
  saldoPendiente: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cliente: {
    id: 1,
    nombre: 'Ana López',
    telefono: '5512345678',
    notas: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  tecnico: null,
  bitacora: [],
  historialPagos: [],
};

describe('Ticket Queries & Optimistic Mutation Logic', () => {
  it('optimistically evicts ticket from a filtered list when the new status does not match the filter', () => {
    const queryClient = new QueryClient();

    const filterRecibidos: TicketFilters = { estado: 'RECIBIDO' };
    const keyRecibidos = ticketsKeys.list(filterRecibidos);
    const keyAll = ticketsKeys.list();

    queryClient.setQueryData<Ticket[]>(keyRecibidos, [mockTicketRecibido]);
    queryClient.setQueryData<Ticket[]>(keyAll, [mockTicketRecibido]);

    // Simulate updateStatus optimistic handler
    const targetTicketId = 101;
    const newEstado = 'DIAGNOSTICO';

    // Apply filter-aware updater across all lists
    const queryCache = queryClient.getQueryCache();
    const listQueries = queryCache.findAll({ queryKey: ticketsKeys.lists() });

    for (const query of listQueries) {
      const filters = (query.queryKey[2] || {}) as TicketFilters;
      queryClient.setQueryData<Ticket[]>(query.queryKey, (oldList) => {
        if (!oldList) return oldList;

        // If the query filters by a specific estado and it no longer matches, remove it
        if (filters.estado && filters.estado !== newEstado) {
          return oldList.filter((t) => t.id !== targetTicketId);
        }

        // Otherwise update in place
        return oldList.map((t) =>
          t.id === targetTicketId ? { ...t, estado: newEstado } : t
        );
      });
    }

    // Assert: In keyRecibidos (filter estado='RECIBIDO'), ticket 101 MUST be evicted
    const recibidosAfter = queryClient.getQueryData<Ticket[]>(keyRecibidos);
    expect(recibidosAfter).toEqual([]);

    // Assert: In keyAll (unfiltered), ticket 101 is updated with new state
    const allAfter = queryClient.getQueryData<Ticket[]>(keyAll);
    expect(allAfter?.[0].estado).toBe('DIAGNOSTICO');
  });

  it('determines the correct next linear step and actions in workshop lifecycle', async () => {
    const { getNextTicketStep, getAlternativeTicketSteps } = await import(
      '../../components/tickets/ticket-state-machine.ts'
    );

    expect(getNextTicketStep('RECIBIDO')).toEqual({
      nextStatus: 'DIAGNOSTICO',
      label: 'Iniciar Diagnóstico',
    });

    expect(getNextTicketStep('DIAGNOSTICO')).toEqual({
      nextStatus: 'EN_REPARACION',
      label: 'Comenzar Reparación',
    });

    expect(getNextTicketStep('EN_REPARACION')).toEqual({
      nextStatus: 'LISTO',
      label: 'Marcar Listo',
    });

    expect(getNextTicketStep('LISTO')).toEqual({
      nextStatus: 'ENTREGADO',
      label: 'Entregar a Cliente',
    });

    expect(getNextTicketStep('ENTREGADO')).toBeNull();
    expect(getNextTicketStep('CANCELADO')).toBeNull();

    // Alternatives should not include current state or immediate next state
    const recibidosAlternatives = getAlternativeTicketSteps('RECIBIDO');
    expect(recibidosAlternatives.map((a) => a.status)).toContain('CANCELADO');
    expect(recibidosAlternatives.map((a) => a.status)).not.toContain('RECIBIDO');
    expect(recibidosAlternatives.map((a) => a.status)).not.toContain('DIAGNOSTICO');

    // Terminal states should allow reopening
    const canceladoAlternatives = getAlternativeTicketSteps('CANCELADO');
    expect(canceladoAlternatives.map((a) => a.status)).toContain('RECIBIDO');
  });

  it('identifies when delivery transition requires financial debt resolution guard', () => {
    function shouldTriggerEntregaGuard(targetStatus: string, saldoPendiente: number): boolean {
      return targetStatus === 'ENTREGADO' && saldoPendiente > 0;
    }

    // Debtor tickets must trigger guard
    expect(shouldTriggerEntregaGuard('ENTREGADO', 450)).toBe(true);
    expect(shouldTriggerEntregaGuard('ENTREGADO', 0.5)).toBe(true);

    // Paid in full tickets pass directly
    expect(shouldTriggerEntregaGuard('ENTREGADO', 0)).toBe(false);

    // Other status transitions with debt do not trigger delivery guard
    expect(shouldTriggerEntregaGuard('LISTO', 450)).toBe(false);
    expect(shouldTriggerEntregaGuard('DIAGNOSTICO', 450)).toBe(false);
  });
});
