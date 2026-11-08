import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { Cliente, CreateClienteInput } from '../../api/types.ts';
import { clientesKeys } from './keys.ts';

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClienteInput) => {
      return apiFetch<Cliente>('/clientes', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSettled: () => {
      // Targeted invalidation: only clients list queries
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
    },
  });
}
