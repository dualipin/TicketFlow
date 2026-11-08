import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { Usuario } from '../../api/types.ts';
import { authKeys } from './keys.ts';

export async function fetchUsuarios(init?: { signal?: AbortSignal }): Promise<Usuario[]> {
  return apiFetch<Usuario[]>('/auth/usuarios', { signal: init?.signal });
}

export const authQueries = {
  usuarios: () =>
    queryOptions({
      queryKey: authKeys.usuarios(),
      queryFn: ({ signal }) => fetchUsuarios({ signal }),
      staleTime: 1000 * 60 * 5, // 5 minutes fresh time
    }),
};

export function useUsuarios() {
  return useQuery(authQueries.usuarios());
}
