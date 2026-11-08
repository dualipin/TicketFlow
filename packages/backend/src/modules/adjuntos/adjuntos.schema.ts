import { z } from "zod";

export const tipoAdjuntoEnum = z.enum(["IMAGEN", "AUDIO", "VIDEO"]);

export type TipoAdjunto = z.infer<typeof tipoAdjuntoEnum>;

export const adjuntoIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID del adjunto debe ser numérico").transform(Number),
});

export const ticketIdParamSchema = z.object({
  ticketId: z.string().regex(/^\d+$/, "El ID del ticket debe ser numérico").transform(Number),
});

export const vincularAdjuntosSchema = z.object({
  ticketId: z.number().int().positive(),
  adjuntoIds: z.array(z.number().int().positive()),
});

export const ADJUNTO_LIMITS = {
  MAX_IMAGES_PER_TICKET: 10,
  MAX_IMAGE_BYTES: 10 * 1024 * 1024, // 10 MB
  MAX_AUDIO_BYTES: 15 * 1024 * 1024, // 15 MB
  MAX_VIDEO_BYTES: 25 * 1024 * 1024, // 25 MB
  MAX_AUDIO_SECONDS: 125, // 2 minutos (+5s margen)
  MAX_VIDEO_SECONDS: 65, // 60 segundos (+5s margen)
} as const;

export const ALLOWED_MIME_TYPES: Record<string, { tipo: TipoAdjunto; defaultExt: string }> = {
  "image/jpeg": { tipo: "IMAGEN", defaultExt: "jpg" },
  "image/jpg": { tipo: "IMAGEN", defaultExt: "jpg" },
  "image/png": { tipo: "IMAGEN", defaultExt: "png" },
  "image/webp": { tipo: "IMAGEN", defaultExt: "webp" },
  "image/heic": { tipo: "IMAGEN", defaultExt: "heic" },
  "audio/webm": { tipo: "AUDIO", defaultExt: "webm" },
  "audio/mp4": { tipo: "AUDIO", defaultExt: "m4a" },
  "audio/x-m4a": { tipo: "AUDIO", defaultExt: "m4a" },
  "audio/aac": { tipo: "AUDIO", defaultExt: "aac" },
  "audio/mpeg": { tipo: "AUDIO", defaultExt: "mp3" },
  "audio/mp3": { tipo: "AUDIO", defaultExt: "mp3" },
  "audio/ogg": { tipo: "AUDIO", defaultExt: "ogg" },
  "audio/wav": { tipo: "AUDIO", defaultExt: "wav" },
  "video/webm": { tipo: "VIDEO", defaultExt: "webm" },
  "video/mp4": { tipo: "VIDEO", defaultExt: "mp4" },
  "video/quicktime": { tipo: "VIDEO", defaultExt: "mov" },
};

export type VincularAdjuntosInput = z.infer<typeof vincularAdjuntosSchema>;
