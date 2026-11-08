import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors.ts";
import { db } from "../../prisma/db.ts";
import type {
  AddVariacionInput,
  CreateCategoriaInput,
  CreateProductoInput,
  SearchCategoriasQuery,
  SearchProductosQuery,
  UpdateProductoInput,
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

    if (query.activo === "0") {
      filtered = filtered.filter((p) => p.activo === 0);
    } else if (query.activo === "ALL") {
      // incluir todos sin filtrar
    } else {
      // default: activo === 1
      filtered = filtered.filter((p) => p.activo === 1);
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

  async updateProducto(id: number, input: UpdateProductoInput) {
    const existing = await db.orm.Producto.where({ id })
      .include("categoria")
      .include("variaciones")
      .first();

    if (!existing) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    if (input.categoriaId !== undefined && input.categoriaId !== existing.categoriaId) {
      const cat = await db.orm.Categoria.where({ id: input.categoriaId }).first();
      if (!cat) {
        throw new NotFoundError("Categoría no encontrada");
      }
    }

    const esServicio = input.esServicio !== undefined ? input.esServicio : existing.esServicio;

    // Actualizar campos base del producto
    const updateData: Record<string, unknown> = {};
    if (input.nombre !== undefined) updateData.nombre = input.nombre.trim();
    if (input.descripcion !== undefined) updateData.descripcion = input.descripcion ? input.descripcion.trim() : null;
    if (input.categoriaId !== undefined) updateData.categoriaId = input.categoriaId;
    if (input.esServicio !== undefined) updateData.esServicio = esServicio;

    if (Object.keys(updateData).length > 0) {
      await db.orm.Producto.where({ id }).update(updateData);
    }

    // Gestionar variaciones si se envían
    if (Array.isArray(input.variaciones) && input.variaciones.length > 0) {
      const inputCodes = input.variaciones.map((v) => v.codigo.trim().toUpperCase());
      const uniqueCodes = new Set(inputCodes);
      if (uniqueCodes.size !== inputCodes.length) {
        throw new ConflictError("No se permiten códigos SKU duplicados en las variaciones");
      }

      // Validar unicidad en la base de datos contra otros productos
      for (const v of input.variaciones) {
        const codigo = v.codigo.trim().toUpperCase();
        const existingCode = await db.orm.Variacion.where({ codigo }).first();
        if (existingCode && existingCode.productoId !== id) {
          throw new ConflictError(`El código SKU '${codigo}' ya pertenece a otro producto`);
        }
      }

      const inputVarIds = new Set(
        input.variaciones.map((v) => v.id).filter((vid): vid is number => vid !== undefined)
      );

      // Eliminar variaciones que se removieron en la interfaz (solo si no tienen ventas)
      for (const currentVar of existing.variaciones) {
        if (!inputVarIds.has(currentVar.id)) {
          const ventas = await db.orm.VentaDetalle.where({ variacionId: currentVar.id }).all();
          if (ventas.length > 0) {
            throw new ConflictError(
              `No se puede eliminar la variante '${currentVar.nombre}' (${currentVar.codigo}) porque ya tiene ventas registradas en el Punto de Venta.`
            );
          }
          await db.orm.Variacion.where({ id: currentVar.id }).delete();
        }
      }

      // Actualizar o crear variaciones
      for (const v of input.variaciones) {
        const codigo = v.codigo.trim().toUpperCase();
        const nombre = v.nombre.trim() || (esServicio ? "Servicio Estándar" : "Estándar");
        const precioBase = Number(v.precioBase ?? 0);
        const stock = esServicio ? 0 : Math.max(0, Math.floor(v.stock ?? 0));

        if (v.id) {
          await db.orm.Variacion.where({ id: v.id }).update({
            codigo,
            nombre,
            precioBase,
            stock,
          });
        } else {
          await db.orm.Variacion.create({
            productoId: id,
            codigo,
            nombre,
            precioBase,
            stock,
          });
        }
      }
    } else if (input.codigo !== undefined || input.precioBase !== undefined || input.stock !== undefined) {
      // Producto simple actualizado mediante campos planos
      if (existing.variaciones.length === 1) {
        const singleVar = existing.variaciones[0];
        const updateVar: Record<string, unknown> = {};
        if (input.codigo) {
          const codigo = input.codigo.trim().toUpperCase();
          const existingCode = await db.orm.Variacion.where({ codigo }).first();
          if (existingCode && existingCode.id !== singleVar.id) {
            throw new ConflictError(`El código SKU '${codigo}' ya está registrado`);
          }
          updateVar.codigo = codigo;
        }
        if (input.nombreVariacion) updateVar.nombre = input.nombreVariacion.trim();
        if (input.precioBase !== undefined) updateVar.precioBase = Number(input.precioBase);
        if (input.stock !== undefined) updateVar.stock = esServicio ? 0 : Math.max(0, Math.floor(input.stock));

        if (Object.keys(updateVar).length > 0) {
          await db.orm.Variacion.where({ id: singleVar.id }).update(updateVar);
        }
      }
    }

    return await this.getProductoById(id);
  },

  async deleteProducto(id: number) {
    const existing = await db.orm.Producto.where({ id })
      .include("variaciones")
      .first();

    if (!existing) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    // Verificar si alguna variante tiene ventas registradas
    let tieneVentas = false;
    for (const v of existing.variaciones) {
      const ventas = await db.orm.VentaDetalle.where({ variacionId: v.id }).all();
      if (ventas.length > 0) {
        tieneVentas = true;
        break;
      }
    }

    if (tieneVentas) {
      // Soft delete: archivo suave para preservar histórico contable
      await db.orm.Producto.where({ id }).update({ activo: 0 });
      return {
        id,
        eliminado: false,
        archivado: true,
        mensaje: `El producto "${existing.nombre}" ha sido archivado para preservar su historial de ventas.`,
      };
    }

    // Hard delete: eliminación completa de variaciones y producto
    for (const v of existing.variaciones) {
      await db.orm.Variacion.where({ id: v.id }).delete();
    }
    await db.orm.Producto.where({ id }).delete();

    return {
      id,
      eliminado: true,
      archivado: false,
      mensaje: `El producto "${existing.nombre}" ha sido eliminado definitivamente.`,
    };
  },

  async reactivarProducto(id: number) {
    const existing = await db.orm.Producto.where({ id }).first();
    if (!existing) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    await db.orm.Producto.where({ id }).update({ activo: 1 });
    return await this.getProductoById(id);
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
      return variacion && variacion.producto?.activo === 1 ? [variacion] : [];
    }

    const variaciones = await db.orm.Variacion.include("producto").all();
    const activas = variaciones.filter((v) => !v.producto || v.producto.activo === 1);

    if (!q) {
      return activas;
    }

    const lowerQ = q.toLowerCase();
    return activas.filter(
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
