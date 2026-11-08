import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BadRequestError, NotFoundError } from "../../lib/errors.ts";
import { db } from "../../prisma/db.ts";
import {
  ADJUNTO_LIMITS,
  ALLOWED_MIME_TYPES,
  type TipoAdjunto,
} from "./adjuntos.schema.ts";

const UPLOADS_DIR = join(process.cwd(), "uploads", "tickets");

function normalizeMimeType(rawMime: string): string {
  return rawMime.split(";")[0]?.trim().toLowerCase() ?? "";
}

export interface UploadAdjuntoParams {
  file: File;
  ticketId?: number;
  duracionSegundos?: number;
}

export const adjuntosService = {
  async listByTicket(ticketId: number) {
    const ticket = await db.orm.Ticket.where({ id: ticketId }).first();
    if (!ticket) {
      throw new NotFoundError(`Ticket con ID ${ticketId} no encontrado`);
    }

    return await db.orm.TicketAdjunto.where({ ticketId }).all();
  },

  async upload({ file, ticketId, duracionSegundos }: UploadAdjuntoParams) {
    const cleanMime = normalizeMimeType(file.type);
    const mimeConfig = ALLOWED_MIME_TYPES[cleanMime];

    if (!mimeConfig) {
      throw new BadRequestError(
        `Formato de archivo no soportado (${file.type || "desconocido"}). Use imágenes (JPG, PNG, WEBP), audio (WEBM, MP4, MP3, WAV) o video (WEBM, MP4).`
      );
    }

    const { tipo, defaultExt } = mimeConfig;

    // Validar tamaño según tipo
    if (tipo === "IMAGEN" && file.size > ADJUNTO_LIMITS.MAX_IMAGE_BYTES) {
      throw new BadRequestError("La imagen excede el límite máximo de 10 MB.");
    }
    if (tipo === "AUDIO" && file.size > ADJUNTO_LIMITS.MAX_AUDIO_BYTES) {
      throw new BadRequestError("El archivo de audio excede el límite máximo de 15 MB.");
    }
    if (tipo === "VIDEO" && file.size > ADJUNTO_LIMITS.MAX_VIDEO_BYTES) {
      throw new BadRequestError("El archivo de video excede el límite máximo de 25 MB.");
    }

    // Validar duración si fue reportada
    if (duracionSegundos !== undefined && !Number.isNaN(duracionSegundos)) {
      if (tipo === "AUDIO" && duracionSegundos > ADJUNTO_LIMITS.MAX_AUDIO_SECONDS) {
        throw new BadRequestError("La grabación de audio no puede superar los 2 minutos.");
      }
      if (tipo === "VIDEO" && duracionSegundos > ADJUNTO_LIMITS.MAX_VIDEO_SECONDS) {
        throw new BadRequestError("El clip de video no puede superar los 60 segundos.");
      }
    }

    // Si ya viene asociado a un ticket existente, verificar cuotas del ticket
    if (ticketId !== undefined) {
      const ticket = await db.orm.Ticket.where({ id: ticketId }).first();
      if (!ticket) {
        throw new NotFoundError(`Ticket con ID ${ticketId} no encontrado`);
      }

      const existentes = await db.orm.TicketAdjunto.where({ ticketId }).all();
      if (tipo === "IMAGEN") {
        const totalImagenes = existentes.filter((a) => a.tipo === "IMAGEN").length;
        if (totalImagenes >= ADJUNTO_LIMITS.MAX_IMAGES_PER_TICKET) {
          throw new BadRequestError(
            `Se alcanzó el límite máximo de ${ADJUNTO_LIMITS.MAX_IMAGES_PER_TICKET} imágenes por ticket.`
          );
        }
      }
    }

    await mkdir(UPLOADS_DIR, { recursive: true });

    const prefix = tipo.toLowerCase();
    const uniqueName = `ticket_${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${defaultExt}`;
    const filePath = join(UPLOADS_DIR, uniqueName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const relativeUrl = `/uploads/tickets/${uniqueName}`;

    return await db.orm.TicketAdjunto.create({
      ticketId: ticketId ?? null,
      tipo: tipo as TipoAdjunto,
      url: relativeUrl,
      nombreOriginal: file.name || uniqueName,
      mimeType: cleanMime,
      tamanoBytes: file.size,
      duracionSegundos:
        duracionSegundos !== undefined && !Number.isNaN(duracionSegundos)
          ? Math.round(duracionSegundos * 10) / 10
          : null,
    });
  },

  async vincularATicket(ticketId: number, adjuntoIds: number[]) {
    if (!adjuntoIds || adjuntoIds.length === 0) return [];

    const vinculados = [];
    for (const id of adjuntoIds) {
      const existing = await db.orm.TicketAdjunto.where({ id }).first();
      if (existing) {
        const updated = await db.orm.TicketAdjunto.where({ id }).update({ ticketId });
        vinculados.push(updated);
      }
    }
    return vinculados;
  },

  async remove(id: number) {
    const existing = await db.orm.TicketAdjunto.where({ id }).first();
    if (!existing) {
      throw new NotFoundError(`Adjunto con ID ${id} no encontrado`);
    }

    const filename = existing.url.split("/").pop();
    if (filename) {
      const filePath = join(UPLOADS_DIR, filename);
      await unlink(filePath).catch(() => {
        // Ignorar si el archivo físico ya no existe
      });
    }

    await db.orm.TicketAdjunto.where({ id }).delete();
    return { deleted: true, id };
  },
};
