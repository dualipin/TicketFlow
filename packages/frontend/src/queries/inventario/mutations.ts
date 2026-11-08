import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type {
  Categoria,
  CreateCategoriaInput,
  CreateProductoInput,
  ProductoWithDetails,
} from '../../api/types.ts';
import { inventarioKeys } from './keys.ts';

/**
 * Mutation for creating a new product category.
 * Performs targeted invalidation on the categories query cache.
 */
export function useCreateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoriaInput): Promise<Categoria> => {
      return apiFetch<Categoria>('/inventario/categorias', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventarioKeys.categorias(),
      });
    },
  });
}

/**
 * Mutation for creating a new product (simple or multi-variant / service).
 * Invalidates products, variations, and category queries on success.
 */
export function useCreateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductoInput): Promise<ProductoWithDetails> => {
      return apiFetch<ProductoWithDetails>('/inventario/productos', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventarioKeys.productos(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioKeys.variaciones(),
      });
      queryClient.invalidateQueries({
        queryKey: inventarioKeys.categorias(),
      });
    },
  });
}
