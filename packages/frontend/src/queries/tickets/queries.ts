import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { Ticket, TicketFilters } from '../../api/types.ts';
import { ticketsKeys } from './keys.ts';

// Colocated fetcher functions with AbortSignal cancellation support
export async function fetchTickets(
  filters?: TicketFilters,
  init?: { signal?: AbortSignal }
): Promise<Ticket[]> {
  const params = new URLSearchParams();

  if (filters?.estado && filters.estado !== 'ALL') {
    params.set('estado', filters.estado);
  }
  if (filters?.q?.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters?.tecnicoId) {
    params.set('tecnicoId', String(filters.tecnicoId));
  }
  if (filters?.conSaldo) {
    params.set('conSaldo', '1');
  }

  const queryString = params.toString();
  const endpoint = `/taller/tickets${queryString ? `?${queryString}` : ''}`;

  return apiFetch<Ticket[]>(endpoint, { signal: init?.signal });
}

export async function fetchTicketById(
  id: number,
  init?: { signal?: AbortSignal }
): Promise<Ticket> {
  return apiFetch<Ticket>(`/taller/tickets/${id}`, { signal: init?.signal });
}

/**
 * Colocated queryOptions for Tickets.
 * These provide strongly-typed query configurations usable with useQuery,
 * prefetchQuery, and queryClient cache inspection.
 */
export const ticketsQueries = {
  list: (filters?: TicketFilters) =>
    queryOptions({
      queryKey: ticketsKeys.list(filters),
      queryFn: ({ signal }) => fetchTickets(filters, { signal }),
      staleTime: 1000 * 20, // 20s fresh time for lists
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ticketsKeys.detail(id),
      queryFn: ({ signal }) => fetchTicketById(id, { signal }),
      enabled: Number.isFinite(id) && id > 0,
      staleTime: 1000 * 30, // 30s fresh time for details
    }),
};

/**
 * Custom hooks wrapping the colocated queryOptions
 */
export function useTickets(filters?: TicketFilters) {
  return useQuery(ticketsQueries.list(filters));
}

export function useTicket(id: number) {
  return useQuery(ticketsQueries.detail(id));
}
