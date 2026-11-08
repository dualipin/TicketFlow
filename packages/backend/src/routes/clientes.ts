import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const clientesRoutes = new Hono();

// GET /api/clientes - Búsqueda por teléfono, nombre o listado general
clientesRoutes.get("/", async (c) => {
  const q = c.req.query("q")?.trim();
  const telefono = c.req.query("telefono")?.trim();

  if (telefono) {
    const cliente = await db.orm.Cliente.where({ telefono }).first();
    return c.json(cliente ? [cliente] : []);
  }

  const clientes = await db.orm.Cliente.all();
  if (!q) {
    return c.json(clientes);
  }

  const lowerQ = q.toLowerCase();
  const filtered = clientes.filter(
    (cl) =>
      cl.nombre.toLowerCase().includes(lowerQ) ||
      cl.telefono.toLowerCase().includes(lowerQ)
  );

  return c.json(filtered);
});

// GET /api/clientes/:id - Detalle de cliente con sus tickets e historial
clientesRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const cliente = await db.orm.Cliente.where({ id })
    .include("tickets")
    .include("ventas")
    .first();

  if (!cliente) {
    return c.json({ error: "Cliente no encontrado" }, 404);
  }

  return c.json(cliente);
});

// POST /api/clientes - Registrar cliente
clientesRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.nombre || !body.telefono) {
    return c.json({ error: "Nombre y teléfono son obligatorios" }, 400);
  }

  const telefono = String(body.telefono).trim().replace(/\s+/g, "");
  const existing = await db.orm.Cliente.where({ telefono }).first();
  if (existing) {
    return c.json({ error: "Ya existe un cliente registrado con este número telefónico", cliente: existing }, 409);
  }

  const cliente = await db.orm.Cliente.create({
    nombre: String(body.nombre).trim(),
    telefono,
    notas: body.notas ? String(body.notas).trim() : null,
  });

  return c.json(cliente, 201);
});

// PUT /api/clientes/:id - Actualizar datos del cliente
clientesRoutes.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Datos no proporcionados" }, 400);

  const existing = await db.orm.Cliente.where({ id }).first();
  if (!existing) return c.json({ error: "Cliente no encontrado" }, 404);

  const updateData: Record<string, any> = {};
  if (body.nombre) updateData.nombre = String(body.nombre).trim();
  if (body.telefono) {
    const telefono = String(body.telefono).trim().replace(/\s+/g, "");
    if (telefono !== existing.telefono) {
      const duplicate = await db.orm.Cliente.where({ telefono }).first();
      if (duplicate) return c.json({ error: "El teléfono ya pertenece a otro cliente" }, 409);
      updateData.telefono = telefono;
    }
  }
  if (body.notas !== undefined) {
    updateData.notas = body.notas ? String(body.notas).trim() : null;
  }

  const updated = await db.orm.Cliente.where({ id }).update(updateData);
  return c.json(updated);
});
