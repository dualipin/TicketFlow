import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const inventarioRoutes = new Hono();

// GET /api/inventario/categorias - Listar categorías
inventarioRoutes.get("/categorias", async (c) => {
  const categorias = await db.orm.Categoria.include("productos").all();
  return c.json(categorias);
});

// POST /api/inventario/categorias - Crear categoría
inventarioRoutes.post("/categorias", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.nombre) return c.json({ error: "El nombre es obligatorio" }, 400);

  const nombre = String(body.nombre).trim();
  const existing = await db.orm.Categoria.where({ nombre }).first();
  if (existing) return c.json({ error: "La categoría ya existe", categoria: existing }, 409);

  const cat = await db.orm.Categoria.create({ nombre });
  return c.json(cat, 201);
});

// GET /api/inventario/productos - Listar productos con sus variaciones y categoría
inventarioRoutes.get("/productos", async (c) => {
  const esServicioParam = c.req.query("esServicio");
  const q = c.req.query("q")?.trim().toLowerCase();

  const productos = await db.orm.Producto
    .include("categoria")
    .include("variaciones")
    .all();

  let filtered = productos;
  if (esServicioParam !== undefined) {
    const esServicio = Number(esServicioParam);
    filtered = filtered.filter((p) => p.esServicio === esServicio);
  }

  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
        p.variaciones.some((v) => v.codigo.toLowerCase().includes(q) || v.nombre.toLowerCase().includes(q))
    );
  }

  return c.json(filtered);
});

// POST /api/inventario/productos - Crear producto con variación inicial
inventarioRoutes.post("/productos", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.nombre || !body.categoriaId) {
    return c.json({ error: "Nombre y categoriaId son requeridos" }, 400);
  }

  const categoriaId = Number(body.categoriaId);
  const cat = await db.orm.Categoria.where({ id: categoriaId }).first();
  if (!cat) return c.json({ error: "Categoría no encontrada" }, 404);

  const esServicio = body.esServicio ? 1 : 0;

  const producto = await db.orm.Producto.create({
    categoriaId,
    nombre: String(body.nombre).trim(),
    descripcion: body.descripcion ? String(body.descripcion).trim() : null,
    esServicio,
  });

  // Si incluye variaciones iniciales
  const variacionesInput = Array.isArray(body.variaciones) && body.variaciones.length > 0
    ? body.variaciones
    : [
        {
          codigo: body.codigo || `SKU-${Date.now()}`,
          nombre: body.nombreVariacion || (esServicio ? "Servicio Estándar" : "Estándar"),
          precioBase: Number(body.precioBase ?? 0),
          stock: esServicio ? 0 : Number(body.stock ?? 0),
        },
      ];

  const variacionesCreadas = [];
  for (const v of variacionesInput) {
    const varCreada = await db.orm.Variacion.create({
      productoId: producto.id,
      codigo: String(v.codigo).trim().toUpperCase(),
      nombre: String(v.nombre || "Estándar").trim(),
      precioBase: Number(v.precioBase ?? 0),
      stock: esServicio ? 0 : Number(v.stock ?? 0),
    });
    variacionesCreadas.push(varCreada);
  }

  return c.json({ ...producto, variaciones: variacionesCreadas }, 201);
});

// GET /api/inventario/variaciones - Buscar variación por SKU / código o nombre (para escáner de código de barras en POS)
inventarioRoutes.get("/variaciones", async (c) => {
  const codigo = c.req.query("codigo")?.trim().toUpperCase();
  const q = c.req.query("q")?.trim().toLowerCase();

  if (codigo) {
    const variacion = await db.orm.Variacion.where({ codigo }).include("producto").first();
    return c.json(variacion ? [variacion] : []);
  }

  const variaciones = await db.orm.Variacion.include("producto").all();
  if (!q) return c.json(variaciones);

  const filtered = variaciones.filter(
    (v) =>
      v.codigo.toLowerCase().includes(q) ||
      v.nombre.toLowerCase().includes(q) ||
      v.producto.nombre.toLowerCase().includes(q)
  );

  return c.json(filtered);
});

// POST /api/inventario/productos/:id/variaciones - Agregar variación a producto existente
inventarioRoutes.post("/productos/:id/variaciones", async (c) => {
  const productoId = Number(c.req.param("id"));
  if (Number.isNaN(productoId)) return c.json({ error: "ID inválido" }, 400);

  const producto = await db.orm.Producto.where({ id: productoId }).first();
  if (!producto) return c.json({ error: "Producto no encontrado" }, 404);

  const body = await c.req.json().catch(() => null);
  if (!body || !body.codigo || !body.nombre) {
    return c.json({ error: "Código SKU y nombre son requeridos" }, 400);
  }

  const codigo = String(body.codigo).trim().toUpperCase();
  const existingVar = await db.orm.Variacion.where({ codigo }).first();
  if (existingVar) return c.json({ error: "El código SKU ya existe" }, 409);

  const variacion = await db.orm.Variacion.create({
    productoId,
    codigo,
    nombre: String(body.nombre).trim(),
    precioBase: Number(body.precioBase ?? 0),
    stock: producto.esServicio ? 0 : Number(body.stock ?? 0),
  });

  return c.json(variacion, 201);
});

// PATCH /api/inventario/variaciones/:id/stock - Ajuste de inventario físico
inventarioRoutes.patch("/variaciones/:id/stock", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.stock !== "number") {
    return c.json({ error: "Se requiere la nueva cantidad de stock como número" }, 400);
  }

  const variacion = await db.orm.Variacion.where({ id }).include("producto").first();
  if (!variacion) return c.json({ error: "Variación no encontrada" }, 404);

  if (variacion.producto.esServicio) {
    return c.json({ error: "No se puede asignar stock a un servicio" }, 400);
  }

  const nuevoStock = Math.max(0, Math.floor(body.stock));
  const updated = await db.orm.Variacion.where({ id }).update({ stock: nuevoStock });

  return c.json(updated);
});
