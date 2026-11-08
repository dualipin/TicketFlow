import type { VentaFilters } from '../../api/types.ts';

/**
 * Domain-shaped query keys hierarchy for POS (Ventas).
 */
export const posKeys = {
  all: ['pos'] as const,
  ventas: () => [...posKeys.all, 'ventas'] as const,
  lists: () => [...posKeys.ventas(), 'list'] as const,
  list: (filters?: VentaFilters) =>
    [...posKeys.lists(), filters ?? {}] as const,
  details: () => [...posKeys.ventas(), 'detail'] as const,
  detail: (id: number) => [...posKeys.details(), id] as const,
};
