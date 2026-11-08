import type { TicketFilters } from '../../api/types.ts';

/**
 * Domain-shaped query keys hierarchy for Tickets.
 * 
 * Hierarchy:
 * - ['tickets'] (all ticket queries)
 *   ├── ['tickets', 'list'] (all list queries)
 *   │     └── ['tickets', 'list', filters] (specific filtered list)
 *   └── ['tickets', 'detail'] (all detail queries)
 *         └── ['tickets', 'detail', id] (specific ticket)
 *               └── ['tickets', 'detail', id, 'bitacora'] (ticket timeline)
 */
export const ticketsKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketsKeys.all, 'list'] as const,
  list: (filters?: TicketFilters) =>
    [...ticketsKeys.lists(), filters ? { ...filters } : {}] as const,
  details: () => [...ticketsKeys.all, 'detail'] as const,
  detail: (id: number) => [...ticketsKeys.details(), id] as const,
  timeline: (id: number) => [...ticketsKeys.detail(id), 'bitacora'] as const,
};
