/**
 * Domain-shaped query keys hierarchy for Corte de Caja.
 */
export const corteCajaKeys = {
  all: ['corte-caja'] as const,
  activo: () => [...corteCajaKeys.all, 'activo'] as const,
  lists: () => [...corteCajaKeys.all, 'list'] as const,
  list: () => [...corteCajaKeys.lists()] as const,
  details: () => [...corteCajaKeys.all, 'detail'] as const,
  detail: (id: number) => [...corteCajaKeys.details(), id] as const,
};
