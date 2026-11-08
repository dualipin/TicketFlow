import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const corteCajaRoutes = new Hono();

// GET /api/corte-caja/activo - Obtiene el corte de caja actualmente abierto (si existe)
corteCajaRoutes.get("/activo", async (c) => {
  const corte = await db.orm.CorteCaja
    .where({ estado: "ABIERTO" })
    .include("usuario")
    .include("ventas")
    .include("pagosCobrados")
    .first();

  if (!corte) {
    return c.json({ activo: false, corte: null });
  }

  // Calcular ventas en efectivo y pagos en efectivo
  const ventasEfectivo = corte.ventas
    .filter((v) => v.metodoPago === "EFECTIVO")
    .reduce((acc, v) => acc + (v.total || 0), 0);

  const pagosEfectivo = corte.pagosCobrados
    .filter((p) => p.metodoPago === "EFECTIVO")
    .reduce((acc, p) => acc + (p.monto || 0), 0);

  const totalCalculado = corte.montoInicial + ventasEfectivo + pagosEfectivo;

  return c.json({
    activo: true,
    corte: {
      ...corte,
      ventasEfectivo,
      pagosEfectivo,
      montoCalculado: totalCalculado,
    },
  });
});

// POST /api/corte-caja/abrir - Abrir nuevo turno / corte de caja
corteCajaRoutes.post("/abrir", async (c) => {
  const activo = await db.orm.CorteCaja.where({ estado: "ABIERTO" }).first();
  if (activo) {
    return c.json({ error: "Ya existe un corte de caja abierto. Ciérrelo antes de abrir uno nuevo.", corte: activo }, 409);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || !body.usuarioId) {
    return c.json({ error: "usuarioId es obligatorio para abrir caja" }, 400);
  }

  const usuarioId = Number(body.usuarioId);
  const usuario = await db.orm.Usuario.where({ id: usuarioId }).first();
  if (!usuario) return c.json({ error: "Usuario no encontrado" }, 404);

  const montoInicial = Math.max(0, Number(body.montoInicial ?? 0));

  const corte = await db.orm.CorteCaja.create({
    usuarioId,
    montoInicial,
    montoCalculado: montoInicial,
    estado: "ABIERTO",
    notas: body.notas ? String(body.notas).trim() : null,
  });

  return c.json(corte, 201);
});

// POST /api/corte-caja/:id/cerrar - Realizar arqueo y cierre de caja con dinero físico real
corteCajaRoutes.post("/:id/cerrar", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const corte = await db.orm.CorteCaja
    .where({ id })
    .include("ventas")
    .include("pagosCobrados")
    .first();

  if (!corte) return c.json({ error: "Corte no encontrado" }, 404);
  if (corte.estado === "CERRADO") {
    return c.json({ error: "El corte ya fue cerrado previamente" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  if (!body || body.montoReal === undefined) {
    return c.json({ error: "Se requiere el montoReal (dinero físico contado)" }, 400);
  }

  const montoReal = Number(body.montoReal);
  const ventasEfectivo = corte.ventas
    .filter((v) => v.metodoPago === "EFECTIVO")
    .reduce((acc, v) => acc + (v.total || 0), 0);

  const pagosEfectivo = corte.pagosCobrados
    .filter((p) => p.metodoPago === "EFECTIVO")
    .reduce((acc, p) => acc + (p.monto || 0), 0);

  const montoCalculado = corte.montoInicial + ventasEfectivo + pagosEfectivo;
  const diferencia = montoReal - montoCalculado; // Positivo = sobrante, Negativo = faltante

  const now = new Date();
  const cerrado = await db.orm.CorteCaja.where({ id }).update({
    estado: "CERRADO",
    fechaCierre: now,
    montoCalculado,
    montoReal,
    diferencia,
    notas: body.notas ? String(body.notas).trim() : corte.notas,
  });

  return c.json({
    mensaje: "Corte de caja cerrado exitosamente",
    resumen: {
      id: cerrado.id,
      montoInicial: cerrado.montoInicial,
      ventasEfectivo,
      pagosEfectivo,
      montoCalculado,
      montoReal,
      diferencia,
      resultado: diferencia === 0 ? "Cuadrado exacto" : diferencia > 0 ? `Sobrante de $${diferencia.toFixed(2)}` : `Faltante de $${Math.abs(diferencia).toFixed(2)}`,
    },
    corte: cerrado,
  });
});

// GET /api/corte-caja - Historial de cortes
corteCajaRoutes.get("/", async (c) => {
  const cortes = await db.orm.CorteCaja
    .include("usuario")
    .include("ventas")
    .include("pagosCobrados")
    .all();

  return c.json(cortes);
});
