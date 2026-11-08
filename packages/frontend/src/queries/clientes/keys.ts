/**
 * Domain-shaped query keys hierarchy for Clientes.
 */
export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (search?: string) =>
    [...clientesKeys.lists(), { search: search ?? '' }] as const,
  details: () => [...clientesKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientesKeys.details(), id] as const,
};
