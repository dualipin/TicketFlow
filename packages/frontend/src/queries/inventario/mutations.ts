import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type {
  Categoria,
  CreateCategoriaInput,
  CreateProductoInput,
  DeleteProductoResult,
  ProductoWithDetails,
  UpdateProductoInput,
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

/**
 * Mutation for updating an existing product and its variations.
 */
export function useUpdateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: UpdateProductoInput;
    }): Promise<ProductoWithDetails> => {
      return apiFetch<ProductoWithDetails>(`/inventario/productos/${id}`, {
        method: 'PUT',
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

/**
 * Mutation for deleting or archiving a product (conditional delete).
 */
export function useDeleteProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<DeleteProductoResult> => {
      return apiFetch<DeleteProductoResult>(`/inventario/productos/${id}`, {
        method: 'DELETE',
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

/**
 * Mutation for reactivating an archived product.
 */
export function useReactivarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ProductoWithDetails> => {
      return apiFetch<ProductoWithDetails>(`/inventario/productos/${id}/reactivar`, {
        method: 'PATCH',
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
