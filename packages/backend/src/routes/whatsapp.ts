import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const whatsappRoutes = new Hono();

// GET /api/whatsapp/consultar/:telefono - Consulta del estado de tickets para un cliente por su WhatsApp
whatsappRoutes.get("/consultar/:telefono", async (c) => {
  const rawTelefono = c.req.param("telefono");
  const cleanPhone = rawTelefono.replace(/\D/g, "");

  // Buscar cliente por coincidencia exacta o terminación de teléfono
  const clientes = await db.orm.Cliente.all();
  const cliente = clientes.find((cl) => {
    const clDigits = cl.telefono.replace(/\D/g, "");
    return (
      clDigits === cleanPhone ||
      cleanPhone.endsWith(clDigits) ||
      clDigits.endsWith(cleanPhone)
    );
  });

  if (!cliente) {
    return c.json({
      encontrado: false,
      mensaje: "No encontramos reparaciones registradas con este número de teléfono.",
      tickets: [],
    });
  }

  const tickets = await db.orm.Ticket
    .where({ clienteId: cliente.id })
    .include("bitacora")
    .include("historialPagos")
    .all();

  // Regla de Negocio de Architecture.md:
  // La bitácora tiene `esPrivada`. El bot de WhatsApp solo debe exponer las notas públicas (`esPrivada === 0`),
  // ocultando las notas técnicas internas o privadas.
  const ticketsPublicos = tickets.map((t) => {
    const bitacoraPublica = t.bitacora
      .filter((b) => b.esPrivada === 0)
      .map((b) => ({
        fecha: b.createdAt,
        nota: b.nota,
      }));

    const totalPagado = t.historialPagos.reduce((acc, p) => acc + p.monto, 0);

    return {
      folio: t.folio,
      dispositivo: t.dispositivo,
      falla: t.falla,
      estado: t.estado,
      costoTotal: t.costoTotal,
      totalPagado,
      saldoPendiente: t.saldoPendiente,
      estaListo: t.estado === "LISTO" || t.estado === "ENTREGADO",
      bitacora: bitacoraPublica,
      fechaRecepcion: t.createdAt,
    };
  });

  return c.json({
    encontrado: true,
    cliente: {
      id: cliente.id,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
    },
    tickets: ticketsPublicos,
  });
});

// GET /api/whatsapp/status - Estado del servicio del bot de WhatsApp
whatsappRoutes.get("/status", (c) => {
  return c.json({
    activo: true,
    geminiConfigurado: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});
