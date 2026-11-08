import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type {
  AddBitacoraInput,
  Bitacora,
  CreateTicketInput,
  RegisterPagoInput,
  Ticket,
  UpdateTicketCostoInput,
  UpdateTicketStatusInput,
} from '../../api/types.ts';
import { clientesKeys } from '../clientes/keys.ts';
import { corteCajaKeys } from '../corte-caja/keys.ts';
import { ticketsKeys } from './keys.ts';

interface StatusMutationContext {
  previousDetail?: Ticket;
  previousLists?: [readonly unknown[], Ticket[] | undefined][];
}

interface BitacoraMutationContext {
  previousDetail?: Ticket;
}

interface CostoMutationContext {
  previousDetail?: Ticket;
  previousLists?: [readonly unknown[], Ticket[] | undefined][];
}

/**
 * Optimistic mutation for updating ticket status.
 * Updates both the individual ticket detail cache and any cached lists instantly,
 * rolls back automatically if the API request fails, and performs targeted
 * invalidation on settlement.
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTicketStatusInput) => {
      return apiFetch<{ mensaje: string; ticket: Ticket }>(
        `/taller/tickets/${input.id}/estado`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            estado: input.estado,
            usuarioId: input.usuarioId ?? 2, // Default technician ID if none selected
            nota: input.nota,
            esPrivada: input.esPrivada,
          }),
        }
      );
    },
    // Step 1: Optimistic Update
    onMutate: async (newStatusInput): Promise<StatusMutationContext> => {
      const ticketId = newStatusInput.id;

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ticketsKeys.detail(ticketId) });
      await queryClient.cancelQueries({ queryKey: ticketsKeys.lists() });

      // Snapshot previous state
      const previousDetail = queryClient.getQueryData<Ticket>(ticketsKeys.detail(ticketId));
      const previousLists = queryClient.getQueriesData<Ticket[]>({
        queryKey: ticketsKeys.lists(),
      });

      // Optimistically update the ticket detail cache
      if (previousDetail) {
        queryClient.setQueryData<Ticket>(ticketsKeys.detail(ticketId), {
          ...previousDetail,
          estado: newStatusInput.estado,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update every list query that contains this ticket
      queryClient.setQueriesData<Ticket[]>(
        { queryKey: ticketsKeys.lists() },
        (oldList) => {
          if (!oldList) return oldList;
          return oldList.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  estado: newStatusInput.estado,
                  updatedAt: new Date().toISOString(),
                }
              : ticket
          );
        }
      );

      // Return context with snapshots for potential rollback
      return { previousDetail, previousLists };
    },
    // Step 2: Rollback on failure
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(ticketsKeys.detail(variables.id), context.previousDetail);
      }
      if (context?.previousLists) {
        for (const [key, listData] of context.previousLists) {
          queryClient.setQueryData(key, listData);
        }
      }
    },
    // Step 3: Targeted invalidation after write settles
    onSettled: (_data, _error, variables) => {
      // Invalidate specifically the modified ticket detail and ticket lists
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
}

/**
 * Optimistic mutation for adding a bitácora note to a ticket.
 */
export function useAddBitacoraNota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddBitacoraInput) => {
      return apiFetch<Bitacora>(`/taller/tickets/${input.ticketId}/bitacora`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onMutate: async (newNoteInput): Promise<BitacoraMutationContext> => {
      const ticketId = newNoteInput.ticketId;
      await queryClient.cancelQueries({ queryKey: ticketsKeys.detail(ticketId) });

      const previousDetail = queryClient.getQueryData<Ticket>(ticketsKeys.detail(ticketId));

      if (previousDetail) {
        const optimisticNote: Bitacora = {
          id: -Date.now(), // temporary negative ID
          ticketId,
          usuarioId: newNoteInput.usuarioId,
          nota: newNoteInput.nota,
          esPrivada: newNoteInput.esPrivada ? 1 : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Ticket>(ticketsKeys.detail(ticketId), {
          ...previousDetail,
          bitacora: [optimisticNote, ...(previousDetail.bitacora || [])],
        });
      }

      return { previousDetail };
    },
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(ticketsKeys.detail(variables.ticketId), context.previousDetail);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Targeted invalidation: only this ticket's detail
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.ticketId) });
    },
  });
}

/**
 * Optimistic mutation for updating ticket cost / presupuesto
 */
export function useUpdateTicketCosto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTicketCostoInput) => {
      return apiFetch<Ticket>(`/taller/tickets/${input.id}/costo`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },
    onMutate: async (costoInput): Promise<CostoMutationContext> => {
      const ticketId = costoInput.id;
      await queryClient.cancelQueries({ queryKey: ticketsKeys.detail(ticketId) });
      await queryClient.cancelQueries({ queryKey: ticketsKeys.lists() });

      const previousDetail = queryClient.getQueryData<Ticket>(ticketsKeys.detail(ticketId));
      const previousLists = queryClient.getQueriesData<Ticket[]>({
        queryKey: ticketsKeys.lists(),
      });

      if (previousDetail) {
        const pagado = (previousDetail.historialPagos || []).reduce(
          (acc, p) => acc + p.monto,
          0
        );
        const nuevoSaldo = Math.max(0, costoInput.costoTotal - pagado);

        queryClient.setQueryData<Ticket>(ticketsKeys.detail(ticketId), {
          ...previousDetail,
          costoTotal: costoInput.costoTotal,
          saldoPendiente: nuevoSaldo,
        });
      }

      return { previousDetail, previousLists };
    },
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(ticketsKeys.detail(variables.id), context.previousDetail);
      }
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
}

/**
 * Mutation for recording a payment with targeted invalidation
 */
export function useRegisterPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterPagoInput) => {
      return apiFetch<{
        mensaje: string;
        saldoPendiente: number;
        liquidado: boolean;
      }>(`/taller/tickets/${input.ticketId}/pagos`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corteCajaKeys.activo() });
    },
  });
}

/**
 * Mutation for creating a new ticket with targeted invalidation
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      return apiFetch<Ticket>('/taller/tickets', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSettled: (createdTicket) => {
      // Invalidate ticket list queries so new ticket shows up
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corteCajaKeys.activo() });
      // Invalidate client queries since customer might have been created or had tickets updated
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });

      if (createdTicket?.id) {
        // Seed initial detail cache directly with the server response
        queryClient.setQueryData(ticketsKeys.detail(createdTicket.id), createdTicket);
      }
    },
  });
}
