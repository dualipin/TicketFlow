import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { Cliente } from '../../api/types.ts';
import { clientesKeys } from './keys.ts';

export async function fetchClientes(
  search?: string,
  init?: { signal?: AbortSignal }
): Promise<Cliente[]> {
  const query = search?.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
  return apiFetch<Cliente[]>(`/clientes${query}`, { signal: init?.signal });
}

export async function fetchClienteById(
  id: number,
  init?: { signal?: AbortSignal }
): Promise<Cliente> {
  return apiFetch<Cliente>(`/clientes/${id}`, { signal: init?.signal });
}

export const clientesQueries = {
  list: (search?: string) =>
    queryOptions({
      queryKey: clientesKeys.list(search),
      queryFn: ({ signal }) => fetchClientes(search, { signal }),
      staleTime: 1000 * 60, // 1 minute fresh time for clients
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: clientesKeys.detail(id),
      queryFn: ({ signal }) => fetchClienteById(id, { signal }),
      enabled: Number.isFinite(id) && id > 0,
      staleTime: 1000 * 60,
    }),
};

export function useClientes(search?: string) {
  return useQuery(clientesQueries.list(search));
}

export function useCliente(id: number) {
  return useQuery(clientesQueries.detail(id));
}
