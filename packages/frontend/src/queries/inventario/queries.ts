import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type {
  Categoria,
  ProductoWithDetails,
  VariacionWithProducto,
} from '../../api/types.ts';
import { inventarioKeys } from './keys.ts';

export async function fetchCategorias(init?: {
  signal?: AbortSignal;
}): Promise<Categoria[]> {
  return apiFetch<Categoria[]>('/inventario/categorias', {
    signal: init?.signal,
  });
}

export async function fetchProductos(
  filters?: { esServicio?: number; q?: string },
  init?: { signal?: AbortSignal }
): Promise<ProductoWithDetails[]> {
  const params = new URLSearchParams();
  if (filters?.esServicio !== undefined) {
    params.set('esServicio', String(filters.esServicio));
  }
  if (filters?.q?.trim()) {
    params.set('q', filters.q.trim());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<ProductoWithDetails[]>(`/inventario/productos${query}`, {
    signal: init?.signal,
  });
}

export async function fetchVariaciones(
  filters?: { codigo?: string; q?: string },
  init?: { signal?: AbortSignal }
): Promise<VariacionWithProducto[]> {
  const params = new URLSearchParams();
  if (filters?.codigo?.trim()) {
    params.set('codigo', filters.codigo.trim());
  }
  if (filters?.q?.trim()) {
    params.set('q', filters.q.trim());
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<VariacionWithProducto[]>(`/inventario/variaciones${query}`, {
    signal: init?.signal,
  });
}

export const inventarioQueries = {
  categorias: () =>
    queryOptions({
      queryKey: inventarioKeys.categorias(),
      queryFn: ({ signal }) => fetchCategorias({ signal }),
      staleTime: 1000 * 60 * 5, // 5 min for categories
    }),
  productos: (filters?: { esServicio?: number; q?: string }) =>
    queryOptions({
      queryKey: inventarioKeys.productosList(filters),
      queryFn: ({ signal }) => fetchProductos(filters, { signal }),
      staleTime: 1000 * 30, // 30 sec for products
    }),
  variaciones: (filters?: { codigo?: string; q?: string }) =>
    queryOptions({
      queryKey: inventarioKeys.variacionesList(filters),
      queryFn: ({ signal }) => fetchVariaciones(filters, { signal }),
      staleTime: 1000 * 30, // 30 sec for variations
    }),
};

export function useCategorias() {
  return useQuery(inventarioQueries.categorias());
}

export function useProductos(filters?: { esServicio?: number; q?: string }) {
  return useQuery(inventarioQueries.productos(filters));
}

export function useVariaciones(filters?: { codigo?: string; q?: string }) {
  return useQuery(inventarioQueries.variaciones(filters));
}
