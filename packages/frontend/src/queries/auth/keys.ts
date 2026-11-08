/**
 * Domain-shaped query keys hierarchy for Auth and Usuarios.
 */
export const authKeys = {
  all: ['auth'] as const,
  usuarios: () => [...authKeys.all, 'usuarios'] as const,
};
