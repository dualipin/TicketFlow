import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type {
  AbrirCorteInput,
  CerrarCorteInput,
  CerrarCorteResponse,
  CorteCaja,
} from '../../api/types.ts';
import { corteCajaKeys } from './keys.ts';

export function useAbrirCorte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AbrirCorteInput) => {
      return apiFetch<CorteCaja>('/corte-caja/abrir', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: corteCajaKeys.all });
    },
  });
}

export function useCerrarCorte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: CerrarCorteInput;
    }) => {
      return apiFetch<CerrarCorteResponse>(`/corte-caja/${id}/cerrar`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: corteCajaKeys.all });
    },
  });
}
