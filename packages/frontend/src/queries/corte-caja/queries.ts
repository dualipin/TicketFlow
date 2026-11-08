import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { CorteCaja, CorteCajaActivoResponse } from '../../api/types.ts';
import { corteCajaKeys } from './keys.ts';

export async function fetchCorteActivo(init?: {
  signal?: AbortSignal;
}): Promise<CorteCajaActivoResponse> {
  return apiFetch<CorteCajaActivoResponse>('/corte-caja/activo', {
    signal: init?.signal,
  });
}

export async function fetchCortes(init?: {
  signal?: AbortSignal;
}): Promise<CorteCaja[]> {
  return apiFetch<CorteCaja[]>('/corte-caja', {
    signal: init?.signal,
  });
}

export const corteCajaQueries = {
  activo: () =>
    queryOptions({
      queryKey: corteCajaKeys.activo(),
      queryFn: ({ signal }) => fetchCorteActivo({ signal }),
      staleTime: 1000 * 10, // 10s fresh time for active register
    }),
  list: () =>
    queryOptions({
      queryKey: corteCajaKeys.list(),
      queryFn: ({ signal }) => fetchCortes({ signal }),
      staleTime: 1000 * 30, // 30s fresh time for history
    }),
};

export function useCorteActivo() {
  return useQuery(corteCajaQueries.activo());
}

export function useCortes() {
  return useQuery(corteCajaQueries.list());
}
