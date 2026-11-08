import { Hono } from "hono";
import { adjuntosService } from "../modules/adjuntos/index.ts";
import { db } from "../prisma/db.ts";

export const tallerRoutes = new Hono();

// Helper para generar el siguiente folio TK-XXXX
async function generarSiguienteFolio(): Promise<string> {
  const allTickets = await db.orm.Ticket.select("id", "folio").all();
  if (allTickets.length === 0) {
    return "TK-1001";
  }

  let maxNum = 1000;
  for (const t of allTickets) {
    const match = t.folio.match(/TK-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return `TK-${maxNum + 1}`;
}

// GET /api/taller/tickets - Listar tickets con filtros
tallerRoutes.get("/tickets", async (c) => {
  const estado = c.req.query("estado");
  const q = c.req.query("q")?.trim().toLowerCase();
  const tecnicoId = c.req.query("tecnicoId");
  const conSaldo = c.req.query("conSaldo"); // "1" para mostrar solo los que tienen saldo pendiente ("deudores")

  const tickets = await db.orm.Ticket
    .include("cliente")
    .include("tecnico")
    .include("adjuntos")
    .include("bitacora")
    .include("historialPagos")
    .all();

  let filtered = tickets;

  if (estado) {
    filtered = filtered.filter((t) => t.estado.toUpperCase() === estado.toUpperCase());
  }

  if (tecnicoId) {
    const id = Number(tecnicoId);
    filtered = filtered.filter((t) => t.tecnicoId === id);
  }

  if (conSaldo === "1") {
    filtered = filtered.filter((t) => t.saldoPendiente > 0);
  }

  if (q) {
    filtered = filtered.filter(
      (t) =>
        t.folio.toLowerCase().includes(q) ||
        t.dispositivo.toLowerCase().includes(q) ||
        t.falla.toLowerCase().includes(q) ||
        t.cliente.nombre.toLowerCase().includes(q) ||
        t.cliente.telefono.includes(q)
    );
  }

  // Ordenar por más reciente primero
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return c.json(filtered);
});

// GET /api/taller/tickets/:id - Detalle completo de un ticket
tallerRoutes.get("/tickets/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const ticket = await db.orm.Ticket
    .where({ id })
    .include("cliente")
    .include("tecnico")
    .include("adjuntos")
    .include("bitacora")
    .include("historialPagos")
    .first();

  if (!ticket) {
    return c.json({ error: "Ticket no encontrado" }, 404);
  }

  return c.json(ticket);
});

// POST /api/taller/tickets - Recepción de un equipo (Creación de Ticket)
tallerRoutes.post("/tickets", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Datos no proporcionados" }, 400);

  // Validación de cliente: se puede enviar clienteId o los datos del cliente para crearlo si no existe
  let clienteId = body.clienteId ? Number(body.clienteId) : null;
  if (!clienteId) {
    if (!body.nombreCliente || !body.telefonoCliente) {
      return c.json({ error: "Se requiere clienteId o (nombreCliente y telefonoCliente)" }, 400);
    }

    const telefono = String(body.telefonoCliente).trim().replace(/\s+/g, "");
    let cliente = await db.orm.Cliente.where({ telefono }).first();
    if (!cliente) {
      cliente = await db.orm.Cliente.create({
        nombre: String(body.nombreCliente).trim(),
        telefono,
        notas: body.notasCliente ? String(body.notasCliente).trim() : null,
      });
    }
    clienteId = cliente.id;
  }

  if (!body.dispositivo || !body.falla) {
    return c.json({ error: "Dispositivo y falla reportada son obligatorios" }, 400);
  }

  const folio = await generarSiguienteFolio();
  const costoTotal = Math.max(0, Number(body.costoTotal ?? 0));
  const anticipo = Math.max(0, Number(body.anticipo ?? 0));
  const saldoPendiente = Math.max(0, costoTotal - anticipo);

  const ticket = await db.orm.Ticket.create({
    folio,
    clienteId,
    tecnicoId: body.tecnicoId ? Number(body.tecnicoId) : null,
    estado: "RECIBIDO",
    dispositivo: String(body.dispositivo).trim(),
    falla: String(body.falla).trim(),
    contrasena: body.contrasena ? String(body.contrasena).trim() : null,
    accesorios: body.accesorios ? String(body.accesorios).trim() : null,
    fotoRecepcion: body.fotoRecepcion ? String(body.fotoRecepcion).trim() : null,
    fotoAccesorios: body.fotoAccesorios ? String(body.fotoAccesorios).trim() : null,
    costoTotal,
    saldoPendiente,
  });

  // Si hubo un anticipo en la recepción, registrarlo en el Historial de Pagos
  if (anticipo > 0 && body.usuarioId) {
    const activeCorte = await db.orm.CorteCaja.where({ estado: "ABIERTO" }).first();
    const metodoPago = body.metodoPago && ["EFECTIVO", "TARJETA", "TRANSFERENCIA"].includes(body.metodoPago)
      ? body.metodoPago
      : "EFECTIVO";

    await db.orm.HistorialPago.create({
      ticketId: ticket.id,
      usuarioId: Number(body.usuarioId),
      corteCajaId: activeCorte ? activeCorte.id : null,
      monto: anticipo,
      metodoPago,
      notas: "Anticipo de recepción",
    });
  }

  // Si se envió una nota inicial de recepción, crear la entrada en la Bitácora
  if (body.notaInicial && body.usuarioId) {
    await db.orm.Bitacora.create({
      ticketId: ticket.id,
      usuarioId: Number(body.usuarioId),
      nota: String(body.notaInicial).trim(),
      esPrivada: body.notaEsPrivada ? 1 : 0,
    });
  }

  // Si se enviaron IDs de evidencias multimedia pre-subidas, vincularlas al ticket recién creado
  if (Array.isArray(body.adjuntoIds) && body.adjuntoIds.length > 0) {
    const validIds = body.adjuntoIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => !Number.isNaN(id) && id > 0);
    await adjuntosService.vincularATicket(ticket.id, validIds);
  }

  const createdFull = await db.orm.Ticket
    .where({ id: ticket.id })
    .include("cliente")
    .include("tecnico")
    .include("adjuntos")
    .include("bitacora")
    .include("historialPagos")
    .first();

  return c.json(createdFull, 201);
});

// PATCH /api/taller/tickets/:id/estado - Transición de estado del equipo
// Estados permitidos: 'RECIBIDO', 'DIAGNOSTICO', 'EN_REPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'
tallerRoutes.patch("/tickets/:id/estado", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json().catch(() => null);
  if (!body || !body.estado) {
    return c.json({ error: "El nuevo estado es requerido" }, 400);
  }

  const nuevoEstado = String(body.estado).toUpperCase();
  const estadosValidos = ["RECIBIDO", "DIAGNOSTICO", "EN_REPARACION", "LISTO", "ENTREGADO", "CANCELADO"];
  if (!estadosValidos.includes(nuevoEstado)) {
    return c.json({ error: `Estado no válido. Opciones: ${estadosValidos.join(", ")}` }, 400);
  }

  const ticket = await db.orm.Ticket.where({ id }).first();
  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  // Actualizar estado del ticket
  const updated = await db.orm.Ticket.where({ id }).update({ estado: nuevoEstado });

  // Si se envió nota o usuarioId, registrar automáticamente la transición en la bitácora
  if (body.usuarioId) {
    const textoNota = body.nota
      ? String(body.nota).trim()
      : `Cambio de estado: ${ticket.estado} ➔ ${nuevoEstado}`;

    await db.orm.Bitacora.create({
      ticketId: id,
      usuarioId: Number(body.usuarioId),
      nota: textoNota,
      esPrivada: body.esPrivada ? 1 : 0,
    });
  }

  const full = await db.orm.Ticket
    .where({ id })
    .include("cliente")
    .include("tecnico")
    .include("adjuntos")
    .include("bitacora")
    .include("historialPagos")
    .first();

  return c.json({
    mensaje: `Estado actualizado a ${nuevoEstado}`,
    aviso: nuevoEstado === "ENTREGADO" && full.saldoPendiente > 0
      ? `Aviso: El equipo fue entregado manteniendo un saldo deudor de $${full.saldoPendiente.toFixed(2)} ("fiado por confianza").`
      : undefined,
    ticket: full,
  });
});

// PATCH /api/taller/tickets/:id/costo - Ajustar costo total (presupuesto / cotización dinámica)
tallerRoutes.patch("/tickets/:id/costo", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.costoTotal !== "number") {
    return c.json({ error: "costoTotal debe ser un número" }, 400);
  }

  const ticket = await db.orm.Ticket.where({ id }).include("historialPagos").first();
  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  const nuevoCosto = Math.max(0, body.costoTotal);
  const totalPagado = ticket.historialPagos.reduce((acc, p) => acc + p.monto, 0);
  const nuevoSaldo = Math.max(0, nuevoCosto - totalPagado);

  const updated = await db.orm.Ticket.where({ id }).update({
    costoTotal: nuevoCosto,
    saldoPendiente: nuevoSaldo,
  });

  if (body.usuarioId) {
    await db.orm.Bitacora.create({
      ticketId: id,
      usuarioId: Number(body.usuarioId),
      nota: `Actualización de costo: $${ticket.costoTotal} ➔ $${nuevoCosto}. Saldo restante: $${nuevoSaldo}`,
      esPrivada: 0,
    });
  }

  return c.json(updated);
});

// POST /api/taller/tickets/:id/bitacora - Agregar nota técnica o pública
tallerRoutes.post("/tickets/:id/bitacora", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json().catch(() => null);
  if (!body || !body.nota || !body.usuarioId) {
    return c.json({ error: "nota y usuarioId son obligatorios" }, 400);
  }

  const ticket = await db.orm.Ticket.where({ id }).first();
  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  const bitacora = await db.orm.Bitacora.create({
    ticketId: id,
    usuarioId: Number(body.usuarioId),
    nota: String(body.nota).trim(),
    esPrivada: body.esPrivada ? 1 : 0,
  });

  return c.json(bitacora, 201);
});

// POST /api/taller/tickets/:id/pagos - Registrar pago parcial o liquidación de reparación
tallerRoutes.post("/tickets/:id/pagos", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json().catch(() => null);
  if (!body || !body.monto || !body.usuarioId) {
    return c.json({ error: "monto y usuarioId son obligatorios" }, 400);
  }

  const monto = Number(body.monto);
  if (monto <= 0) return c.json({ error: "El monto debe ser mayor a 0" }, 400);

  const ticket = await db.orm.Ticket.where({ id }).first();
  if (!ticket) return c.json({ error: "Ticket no encontrado" }, 404);

  const usuarioId = Number(body.usuarioId);
  const activeCorte = await db.orm.CorteCaja.where({ estado: "ABIERTO" }).first();

  const metodoPago = body.metodoPago && ["EFECTIVO", "TARJETA", "TRANSFERENCIA"].includes(body.metodoPago)
    ? body.metodoPago
    : "EFECTIVO";

  const pago = await db.orm.HistorialPago.create({
    ticketId: id,
    usuarioId,
    corteCajaId: activeCorte ? activeCorte.id : null,
    monto,
    metodoPago,
    notas: body.notas ? String(body.notas).trim() : null,
  });

  // Recalcular saldo pendiente
  const nuevoSaldo = Math.max(0, ticket.saldoPendiente - monto);
  await db.orm.Ticket.where({ id }).update({ saldoPendiente: nuevoSaldo });

  // Nota automática en bitácora
  await db.orm.Bitacora.create({
    ticketId: id,
    usuarioId,
    nota: `Pago registrado: $${monto.toFixed(2)} (${metodoPago}). Saldo restante: $${nuevoSaldo.toFixed(2)}`,
    esPrivada: 0,
  });

  return c.json(
    {
      mensaje: "Pago registrado exitosamente",
      pago,
      saldoPendiente: nuevoSaldo,
      liquidado: nuevoSaldo === 0,
    },
    201
  );
});
