import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { CreateVentaInput, Venta } from '../../api/types.ts';
import { corteCajaKeys } from '../corte-caja/keys.ts';
import { inventarioKeys } from '../inventario/keys.ts';
import { posKeys } from './keys.ts';

export function useCreateVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVentaInput) => {
      return apiFetch<{ mensaje: string; venta: Venta }>('/pos/ventas', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSettled: (data) => {
      // 1. Invalidate sales history lists
      queryClient.invalidateQueries({ queryKey: posKeys.lists() });

      // 2. Invalidate active cash drawer to refresh cash totals and included sales
      queryClient.invalidateQueries({ queryKey: corteCajaKeys.activo() });

      // 3. Invalidate inventory and variations so stock decreases in real time
      queryClient.invalidateQueries({ queryKey: inventarioKeys.variaciones() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.productos() });

      // Cache the newly created sale detail directly
      if (data?.venta?.id) {
        queryClient.setQueryData(posKeys.detail(data.venta.id), data.venta);
      }
    },
  });
}
