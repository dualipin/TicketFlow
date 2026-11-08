import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const posRoutes = new Hono();

// POST /api/pos/ventas - Registrar una venta de mostrador
posRoutes.post("/ventas", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.usuarioId || !Array.isArray(body.items) || body.items.length === 0) {
    return c.json({ error: "usuarioId e items (lista de productos) son obligatorios" }, 400);
  }

  const usuarioId = Number(body.usuarioId);
  const usuario = await db.orm.Usuario.where({ id: usuarioId }).first();
  if (!usuario) return c.json({ error: "Usuario cobrador no encontrado" }, 404);

  const activeCorte = await db.orm.CorteCaja.where({ estado: "ABIERTO" }).first();

  const metodoPago = body.metodoPago && ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "MIXTO"].includes(body.metodoPago)
    ? body.metodoPago
    : "EFECTIVO";

  let clienteId: number | null = null;
  if (body.clienteId) {
    const cl = await db.orm.Cliente.where({ id: Number(body.clienteId) }).first();
    if (cl) clienteId = cl.id;
  }

  // Validar items y calcular subtotales y total
  let totalCalculado = 0;
  const itemsProcesados: {
    variacionId: number;
    cantidad: number;
    precioUnit: number;
    subtotal: number;
    esServicio: boolean;
    stockActual: number;
  }[] = [];

  for (const item of body.items) {
    const variacionId = Number(item.variacionId);
    const cantidad = Math.max(1, Math.floor(Number(item.cantidad || 1)));

    const variacion = await db.orm.Variacion.where({ id: variacionId }).include("producto").first();
    if (!variacion) {
      return c.json({ error: `La variación con ID ${variacionId} no existe` }, 404);
    }

    // Regla de Negocio: precio acordado dinámico o precio base de catálogo
    const precioUnit = item.precioUnit !== undefined ? Number(item.precioUnit) : variacion.precioBase;
    const subtotal = precioUnit * cantidad;
    totalCalculado += subtotal;

    const esServicio = Boolean(variacion.producto.esServicio);

    // Si es producto físico, validar existencias
    if (!esServicio && variacion.stock < cantidad) {
      return c.json(
        {
          error: `Stock insuficiente para '${variacion.producto.nombre} (${variacion.nombre})'. Disponible: ${variacion.stock}, Solicitado: ${cantidad}`,
        },
        400
      );
    }

    itemsProcesados.push({
      variacionId,
      cantidad,
      precioUnit,
      subtotal,
      esServicio,
      stockActual: variacion.stock,
    });
  }

  // Transacción: crear venta, crear detalles y descontar inventario de físicos
  const nuevaVenta = await db.transaction(async (tx) => {
    const venta = await tx.orm.Venta.create({
      corteCajaId: activeCorte ? activeCorte.id : null,
      clienteId,
      usuarioId,
      total: totalCalculado,
      metodoPago,
      notas: body.notas ? String(body.notas).trim() : null,
    });

    const detalles = [];
    for (const item of itemsProcesados) {
      const detalle = await tx.orm.VentaDetalle.create({
        ventaId: venta.id,
        variacionId: item.variacionId,
        cantidad: item.cantidad,
        precioUnit: item.precioUnit,
        subtotal: item.subtotal,
      });
      detalles.push(detalle);

      // Descontar inventario solo si es producto físico (esServicio === false)
      if (!item.esServicio) {
        await tx.orm.Variacion.where({ id: item.variacionId }).update({
          stock: item.stockActual - item.cantidad,
        });
      }
    }

    return venta;
  });

  const fullVenta = await db.orm.Venta
    .where({ id: nuevaVenta.id })
    .include("detalles")
    .include("cliente")
    .include("usuario")
    .first();

  return c.json(
    {
      mensaje: "Venta registrada exitosamente",
      venta: fullVenta,
    },
    201
  );
});

// GET /api/pos/ventas - Historial de ventas
posRoutes.get("/ventas", async (c) => {
  const corteCajaId = c.req.query("corteCajaId");
  const usuarioId = c.req.query("usuarioId");

  const ventas = await db.orm.Venta
    .include("detalles")
    .include("cliente")
    .include("usuario")
    .all();

  let filtered = ventas;
  if (corteCajaId) {
    const cid = Number(corteCajaId);
    filtered = filtered.filter((v) => v.corteCajaId === cid);
  }
  if (usuarioId) {
    const uid = Number(usuarioId);
    filtered = filtered.filter((v) => v.usuarioId === uid);
  }

  // Ordenar de más reciente a más antiguo
  filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return c.json(filtered);
});

// GET /api/pos/ventas/:id - Detalle de ticket de venta para impresión
posRoutes.get("/ventas/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const venta = await db.orm.Venta
    .where({ id })
    .include("detalles")
    .include("cliente")
    .include("usuario")
    .first();

  if (!venta) return c.json({ error: "Venta no encontrada" }, 404);

  // Cargar información de variaciones y productos para cada detalle
  const detallesConProducto = [];
  for (const d of venta.detalles) {
    const variacion = await db.orm.Variacion.where({ id: d.variacionId }).include("producto").first();
    detallesConProducto.push({
      ...d,
      variacion,
    });
  }

  return c.json({
    ...venta,
    detalles: detallesConProducto,
  });
});
