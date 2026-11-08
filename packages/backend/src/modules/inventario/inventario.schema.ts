import { z } from "zod";

// --- Categorías ---
export const createCategoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre de la categoría es obligatorio"),
});

export const searchCategoriasQuerySchema = z.object({
  q: z.string().trim().optional(),
});

// --- Variaciones ---
export const createProductoVariacionSchema = z.object({
  codigo: z.string().trim().min(1, "El código SKU es obligatorio"),
  nombre: z.string().trim().min(1, "El nombre de la variante es obligatorio").default("Estándar"),
  precioBase: z.number().min(0, "El precio no puede ser negativo").default(0),
  stock: z.number().int().min(0, "El stock no puede ser negativo").default(0),
});

export const addVariacionSchema = z.object({
  codigo: z.string().trim().min(1, "El código SKU es obligatorio"),
  nombre: z.string().trim().min(1, "El nombre de la variación es obligatorio"),
  precioBase: z.number().min(0, "El precio no puede ser negativo").default(0),
  stock: z.number().int().min(0, "El stock no puede ser negativo").default(0),
});

export const updateStockSchema = z.object({
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
});

export const variacionIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID de la variación debe ser numérico").transform(Number),
});

export const searchVariacionesQuerySchema = z.object({
  codigo: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

// --- Productos ---
export const productoIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID del producto debe ser numérico").transform(Number),
});

export const searchProductosQuerySchema = z.object({
  esServicio: z
    .string()
    .regex(/^[01]$/, "esServicio debe ser 0 o 1")
    .transform(Number)
    .optional(),
  categoriaId: z
    .string()
    .regex(/^\d+$/, "categoriaId debe ser numérico")
    .transform(Number)
    .optional(),
  q: z.string().trim().optional(),
});

export const createProductoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre del producto es obligatorio"),
  categoriaId: z.number().int().positive("La categoría es obligatoria"),
  descripcion: z.string().trim().optional().nullable(),
  esServicio: z
    .union([z.boolean(), z.number().int().min(0).max(1)])
    .transform((val) => (val ? 1 : 0))
    .default(0),
  // Campos para producto simple (cuando no se envían múltiples variaciones explícitas)
  codigo: z.string().trim().optional(),
  nombreVariacion: z.string().trim().optional(),
  precioBase: z.number().min(0, "El precio no puede ser negativo").optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional(),
  // O lista explícita de variaciones
  variaciones: z.array(createProductoVariacionSchema).optional(),
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type SearchCategoriasQuery = z.infer<typeof searchCategoriasQuerySchema>;
export type CreateProductoInput = z.infer<typeof createProductoSchema>;
export type CreateProductoVariacionInput = z.infer<typeof createProductoVariacionSchema>;
export type SearchProductosQuery = z.infer<typeof searchProductosQuerySchema>;
export type AddVariacionInput = z.infer<typeof addVariacionSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
