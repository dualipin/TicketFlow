/**
 * Domain-shaped query keys hierarchy for Inventario & Catálogo.
 */
export const inventarioKeys = {
  all: ['inventario'] as const,
  categorias: () => [...inventarioKeys.all, 'categorias'] as const,
  productos: () => [...inventarioKeys.all, 'productos'] as const,
  productosList: (filters?: { esServicio?: number; q?: string }) =>
    [...inventarioKeys.productos(), filters ?? {}] as const,
  variaciones: () => [...inventarioKeys.all, 'variaciones'] as const,
  variacionesList: (filters?: { codigo?: string; q?: string }) =>
    [...inventarioKeys.variaciones(), filters ?? {}] as const,
  lists: () => [...inventarioKeys.all, 'list'] as const,
};
