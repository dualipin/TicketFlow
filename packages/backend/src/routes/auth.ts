import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const authRoutes = new Hono();

// POST /api/auth/login-pin - Cambio rápido de usuario mediante PIN
authRoutes.post("/login-pin", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.pin !== "string") {
    return c.json({ error: "El PIN es obligatorio y debe ser texto" }, 400);
  }

  const pin = body.pin.trim();
  const user = await db.orm.Usuario.where({ pin, activo: 1 }).first();

  if (!user) {
    return c.json({ error: "PIN incorrecto o usuario inactivo" }, 401);
  }

  return c.json({
    message: `Bienvenido, ${user.nombre}`,
    user: {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    },
  });
});

// GET /api/auth/usuarios - Lista de usuarios para selección o administración
authRoutes.get("/usuarios", async (c) => {
  const usuarios = await db.orm.Usuario.all();
  return c.json(
    usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      rol: u.rol,
      activo: Boolean(u.activo),
      createdAt: u.createdAt,
    }))
  );
});

// POST /api/auth/usuarios - Crear nuevo usuario
authRoutes.post("/usuarios", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.nombre || !body.pin) {
    return c.json({ error: "Nombre y PIN son obligatorios" }, 400);
  }

  const rol = body.rol && ["ADMIN", "TECNICO", "MOSTRADOR"].includes(body.rol)
    ? body.rol
    : "TECNICO";

  const nuevo = await db.orm.Usuario.create({
    nombre: String(body.nombre).trim(),
    rol,
    pin: String(body.pin).trim(),
    activo: 1,
  });

  return c.json(
    {
      id: nuevo.id,
      nombre: nuevo.nombre,
      rol: nuevo.rol,
      activo: Boolean(nuevo.activo),
    },
    201
  );
});

// PATCH /api/auth/usuarios/:id - Modificar usuario
authRoutes.patch("/usuarios/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "ID inválido" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Datos no proporcionados" }, 400);

  const existing = await db.orm.Usuario.where({ id }).first();
  if (!existing) {
    return c.json({ error: "Usuario no encontrado" }, 404);
  }

  const updateData: Record<string, any> = {};
  if (body.nombre) updateData.nombre = String(body.nombre).trim();
  if (body.rol && ["ADMIN", "TECNICO", "MOSTRADOR"].includes(body.rol)) updateData.rol = body.rol;
  if (body.pin) updateData.pin = String(body.pin).trim();
  if (typeof body.activo === "boolean" || typeof body.activo === "number") {
    updateData.activo = body.activo ? 1 : 0;
  }

  const updated = await db.orm.Usuario.where({ id }).update(updateData);
  return c.json({
    id: updated.id,
    nombre: updated.nombre,
    rol: updated.rol,
    activo: Boolean(updated.activo),
  });
});
