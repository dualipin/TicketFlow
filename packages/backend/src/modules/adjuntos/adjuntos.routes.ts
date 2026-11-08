import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BadRequestError } from "../../lib/errors.ts";
import {
  adjuntoIdParamSchema,
  ticketIdParamSchema,
} from "./adjuntos.schema.ts";
import { adjuntosService } from "./adjuntos.service.ts";

export const adjuntosRoutes = new Hono();

// POST /api/upload/ticket-adjuntos - Subida de evidencia multimedia (Imagen, Audio o Video)
adjuntosRoutes.post("/ticket-adjuntos", async (c) => {
  const body = await c.req.parseBody().catch(() => null);
  const rawFile = body?.archivo ?? body?.file ?? body?.foto;

  if (!rawFile || !(rawFile instanceof File)) {
    throw new BadRequestError("No se proporcionó un archivo válido en el campo 'archivo'");
  }

  const rawTicketId = body?.ticketId ? Number(body.ticketId) : undefined;
  const ticketId =
    rawTicketId !== undefined && !Number.isNaN(rawTicketId) && rawTicketId > 0
      ? rawTicketId
      : undefined;

  const rawDuracion = body?.duracionSegundos ? Number(body.duracionSegundos) : undefined;
  const duracionSegundos =
    rawDuracion !== undefined && !Number.isNaN(rawDuracion) && rawDuracion >= 0
      ? rawDuracion
      : undefined;

  const adjunto = await adjuntosService.upload({
    file: rawFile,
    ticketId,
    duracionSegundos,
  });

  return c.json(adjunto, 201);
});

// POST /api/upload/ticket-foto - Endpoint legacy retrocompatible
adjuntosRoutes.post("/ticket-foto", async (c) => {
  const body = await c.req.parseBody().catch(() => null);
  const rawFile = body?.foto ?? body?.archivo;

  if (!rawFile || !(rawFile instanceof File)) {
    throw new BadRequestError("No se proporcionó ningún archivo en el campo 'foto'");
  }

  const adjunto = await adjuntosService.upload({ file: rawFile });
  return c.json(
    {
      mensaje: "Fotografía guardada localmente",
      url: adjunto.url,
      filename: adjunto.nombreOriginal,
      size: adjunto.tamanoBytes,
      adjunto,
    },
    201
  );
});

// GET /api/upload/ticket/:ticketId - Listar adjuntos de un ticket
adjuntosRoutes.get(
  "/ticket/:ticketId",
  zValidator("param", ticketIdParamSchema),
  async (c) => {
    const { ticketId } = c.req.valid("param");
    const adjuntos = await adjuntosService.listByTicket(ticketId);
    return c.json(adjuntos);
  }
);

// DELETE /api/upload/adjuntos/:id - Eliminar adjunto por ID (temporal o vinculado)
adjuntosRoutes.delete(
  "/adjuntos/:id",
  zValidator("param", adjuntoIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await adjuntosService.remove(id);
    return c.json(result);
  }
);
