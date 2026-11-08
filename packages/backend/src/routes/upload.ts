import { Hono } from "hono";
import { join } from "path";
import { mkdir } from "fs/promises";

export const uploadRoutes = new Hono();

const UPLOADS_DIR = join(process.cwd(), "uploads", "tickets");

// POST /api/upload/ticket-foto - Subida de fotografía local para tickets (recepción / accesorios)
uploadRoutes.post("/ticket-foto", async (c) => {
  const body = await c.req.parseBody().catch(() => null);
  if (!body || !body.foto) {
    return c.json({ error: "No se proporcionó ningún archivo en el campo 'foto'" }, 400);
  }

  const file = body.foto;
  if (!(file instanceof File)) {
    return c.json({ error: "El archivo enviado no es válido" }, 400);
  }

  // Validar tipos permitidos de imagen
  const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedMime.includes(file.type)) {
    return c.json({ error: "Formato de imagen no permitido. Utilice JPG, PNG o WEBP." }, 400);
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const ext = file.name.split(".").pop() || "jpg";
  const uniqueName = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = join(UPLOADS_DIR, uniqueName);

  const buffer = await file.arrayBuffer();
  await Bun.write(filePath, buffer);

  const relativeUrl = `/uploads/tickets/${uniqueName}`;

  return c.json({
    mensaje: "Fotografía guardada localmente",
    url: relativeUrl,
    filename: uniqueName,
    size: file.size,
  }, 201);
});
