import { z } from "zod";

export const clienteIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser numérico").transform(Number),
});

export const searchClientesQuerySchema = z.object({
  q: z.string().trim().optional(),
  telefono: z.string().trim().optional(),
});

export const createClienteSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  telefono: z
    .string()
    .trim()
    .min(8, "El teléfono debe contener al menos 8 dígitos")
    .transform((val) => val.replace(/\s+/g, "")),
  notas: z.string().trim().optional().nullable(),
});

export const updateClienteSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío").optional(),
  telefono: z
    .string()
    .trim()
    .min(8, "El teléfono debe contener al menos 8 dígitos")
    .transform((val) => val.replace(/\s+/g, ""))
    .optional(),
  notas: z.string().trim().optional().nullable(),
});

export type SearchClientesQuery = z.infer<typeof searchClientesQuerySchema>;
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
