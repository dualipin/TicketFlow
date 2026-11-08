import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { Venta, VentaFilters } from '../../api/types.ts';
import { posKeys } from './keys.ts';

export async function fetchVentas(
  filters?: VentaFilters,
  init?: { signal?: AbortSignal }
): Promise<Venta[]> {
  const params = new URLSearchParams();
  if (filters?.corteCajaId !== undefined) {
    params.set('corteCajaId', String(filters.corteCajaId));
  }
  if (filters?.usuarioId !== undefined) {
    params.set('usuarioId', String(filters.usuarioId));
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Venta[]>(`/pos/ventas${query}`, {
    signal: init?.signal,
  });
}

export async function fetchVentaById(
  id: number,
  init?: { signal?: AbortSignal }
): Promise<Venta> {
  return apiFetch<Venta>(`/pos/ventas/${id}`, {
    signal: init?.signal,
  });
}

export const posQueries = {
  list: (filters?: VentaFilters) =>
    queryOptions({
      queryKey: posKeys.list(filters),
      queryFn: ({ signal }) => fetchVentas(filters, { signal }),
      staleTime: 1000 * 20, // 20s
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: posKeys.detail(id),
      queryFn: ({ signal }) => fetchVentaById(id, { signal }),
      enabled: Number.isFinite(id) && id > 0,
      staleTime: 1000 * 60, // 1 min for specific sales receipt
    }),
};

export function useVentas(filters?: VentaFilters) {
  return useQuery(posQueries.list(filters));
}

export function useVenta(id: number) {
  return useQuery(posQueries.detail(id));
}
