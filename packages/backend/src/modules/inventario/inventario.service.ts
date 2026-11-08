import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors.ts";
import { db } from "../../prisma/db.ts";
import type {
  AddVariacionInput,
  CreateCategoriaInput,
  CreateProductoInput,
  SearchCategoriasQuery,
  SearchProductosQuery,
} from "./inventario.schema.ts";

export const inventarioService = {
  // --- Categorías ---
  async listCategorias(query: SearchCategoriasQuery = {}) {
    const categorias = await db.orm.Categoria.include("productos").all();
    if (!query.q) {
      return categorias;
    }
    const lowerQ = query.q.toLowerCase();
    return categorias.filter((c) => c.nombre.toLowerCase().includes(lowerQ));
  },

  async createCategoria(input: CreateCategoriaInput) {
    const nombre = input.nombre.trim();
    const existing = await db.orm.Categoria.where({ nombre }).first();
    if (existing) {
      throw new ConflictError("La categoría ya existe", { categoriaId: existing.id });
    }

    return await db.orm.Categoria.create({ nombre });
  },

  // --- Productos ---
  async listProductos(query: SearchProductosQuery = {}) {
    const { esServicio, categoriaId, q } = query;

    const productos = await db.orm.Producto
      .include("categoria")
      .include("variaciones")
      .all();

    let filtered = productos;

    if (esServicio !== undefined) {
      filtered = filtered.filter((p) => p.esServicio === esServicio);
    }

    if (categoriaId !== undefined) {
      filtered = filtered.filter((p) => p.categoriaId === categoriaId);
    }

    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(lowerQ) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(lowerQ)) ||
          p.variaciones.some(
            (v) =>
              v.codigo.toLowerCase().includes(lowerQ) ||
              v.nombre.toLowerCase().includes(lowerQ)
          )
      );
    }

    return filtered;
  },

  async getProductoById(id: number) {
    const producto = await db.orm.Producto.where({ id })
      .include("categoria")
      .include("variaciones")
      .first();

    if (!producto) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  },

  async createProducto(input: CreateProductoInput) {
    const cat = await db.orm.Categoria.where({ id: input.categoriaId }).first();
    if (!cat) {
      throw new NotFoundError("Categoría no encontrada");
    }

    const esServicio = input.esServicio ? 1 : 0;

    // Normalizar lista de variaciones
    let variacionesInput: Array<{
      codigo: string;
      nombre: string;
      precioBase: number;
      stock: number;
    }>;

    if (Array.isArray(input.variaciones) && input.variaciones.length > 0) {
      const codes = input.variaciones.map((v) => v.codigo.trim().toUpperCase());
      const uniqueCodes = new Set(codes);
      if (uniqueCodes.size !== codes.length) {
        throw new ConflictError("No se permiten códigos SKU duplicados en las variaciones");
      }

      for (const codigo of codes) {
        const existing = await db.orm.Variacion.where({ codigo }).first();
        if (existing) {
          throw new ConflictError(`El código SKU '${codigo}' ya está registrado`);
        }
      }

      variacionesInput = input.variaciones.map((v) => ({
        codigo: v.codigo.trim().toUpperCase(),
        nombre: v.nombre.trim() || (esServicio ? "Servicio Estándar" : "Estándar"),
        precioBase: Number(v.precioBase ?? 0),
        stock: esServicio ? 0 : Math.max(0, Math.floor(v.stock ?? 0)),
      }));
    } else {
      const codigo = (input.codigo?.trim() || `SKU-${Date.now()}`).toUpperCase();
      const existing = await db.orm.Variacion.where({ codigo }).first();
      if (existing) {
        throw new ConflictError(`El código SKU '${codigo}' ya está registrado`);
      }

      variacionesInput = [
        {
          codigo,
          nombre: input.nombreVariacion?.trim() || (esServicio ? "Servicio Estándar" : "Estándar"),
          precioBase: Number(input.precioBase ?? 0),
          stock: esServicio ? 0 : Math.max(0, Math.floor(input.stock ?? 0)),
        },
      ];
    }

    const producto = await db.orm.Producto.create({
      categoriaId: input.categoriaId,
      nombre: input.nombre.trim(),
      descripcion: input.descripcion ? input.descripcion.trim() : null,
      esServicio,
    });

    const variacionesCreadas = [];
    for (const v of variacionesInput) {
      const varCreada = await db.orm.Variacion.create({
        productoId: producto.id,
        codigo: v.codigo,
        nombre: v.nombre,
        precioBase: v.precioBase,
        stock: v.stock,
      });
      variacionesCreadas.push(varCreada);
    }

    return {
      ...producto,
      categoria: cat,
      variaciones: variacionesCreadas,
    };
  },

  // --- Variaciones ---
  async listVariaciones(query: { codigo?: string; q?: string } = {}) {
    const { codigo, q } = query;

    if (codigo) {
      const variacion = await db.orm.Variacion.where({
        codigo: codigo.toUpperCase(),
      })
        .include("producto")
        .first();
      return variacion ? [variacion] : [];
    }

    const variaciones = await db.orm.Variacion.include("producto").all();
    if (!q) {
      return variaciones;
    }

    const lowerQ = q.toLowerCase();
    return variaciones.filter(
      (v) =>
        v.codigo.toLowerCase().includes(lowerQ) ||
        v.nombre.toLowerCase().includes(lowerQ) ||
        v.producto.nombre.toLowerCase().includes(lowerQ)
    );
  },

  async addVariacion(productoId: number, input: AddVariacionInput) {
    const producto = await db.orm.Producto.where({ id: productoId }).first();
    if (!producto) {
      throw new NotFoundError(`Producto con ID ${productoId} no encontrado`);
    }

    const codigo = input.codigo.trim().toUpperCase();
    const existing = await db.orm.Variacion.where({ codigo }).first();
    if (existing) {
      throw new ConflictError(`El código SKU '${codigo}' ya existe`);
    }

    return await db.orm.Variacion.create({
      productoId,
      codigo,
      nombre: input.nombre.trim(),
      precioBase: Number(input.precioBase ?? 0),
      stock: producto.esServicio ? 0 : Math.max(0, Math.floor(input.stock ?? 0)),
    });
  },

  async updateStock(variacionId: number, stock: number) {
    const variacion = await db.orm.Variacion.where({ id: variacionId })
      .include("producto")
      .first();

    if (!variacion) {
      throw new NotFoundError(`Variación con ID ${variacionId} no encontrada`);
    }

    if (variacion.producto.esServicio) {
      throw new BadRequestError("No se puede asignar stock a un servicio");
    }

    const nuevoStock = Math.max(0, Math.floor(stock));
    return await db.orm.Variacion.where({ id: variacionId }).update({
      stock: nuevoStock,
    });
  },
};
