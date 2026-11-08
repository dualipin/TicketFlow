import { readFile, stat } from "node:fs/promises";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { AppError } from "./lib/errors.ts";
import { adjuntosRoutes } from "./modules/adjuntos/index.ts";
import { clientesRoutes } from "./modules/clientes/index.ts";
import { inventarioRoutes } from "./modules/inventario/index.ts";
import { seed } from "./prisma/seed.ts";
import { authRoutes } from "./routes/auth.ts";
import { corteCajaRoutes } from "./routes/corte-caja.ts";
import { posRoutes } from "./routes/pos.ts";
import { tallerRoutes } from "./routes/taller.ts";
import { whatsappRoutes } from "./routes/whatsapp.ts";

const app = new Hono();

// Middlewares
app.use("*", logger());

// Manejo global y centralizado de errores
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        error: err.message,
        details: err.details,
      },
      err.statusCode as any
    );
  }

  console.error("Unhandled error:", err);
  return c.json({ error: "Error interno del servidor" }, 500);
});

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-pin"],
  })
);

function guessMimeType(pathStr: string): string {
  const ext = pathStr.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    webm: "video/webm",
    mp4: "video/mp4",
    mov: "video/quicktime",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
    wav: "audio/wav",
    aac: "audio/aac",
  };
  return map[ext] ?? "application/octet-stream";
}

// Servir archivos estáticos subidos localmente (fotografías, audios y videos de tickets con soporte Range)
app.get("/uploads/*", async (c) => {
  const filePath = "." + c.req.path;
  const info = await stat(filePath).catch(() => null);
  if (!info || !info.isFile()) {
    return c.text("Archivo no encontrado", 404);
  }

  const totalSize = info.size;
  const contentType = guessMimeType(filePath);
  const rangeHeader = c.req.header("range");

  if (typeof Bun !== "undefined") {
    const file = Bun.file(filePath);
    if (rangeHeader && totalSize > 0) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        const clampedStart = Math.max(0, Math.min(start, totalSize - 1));
        const clampedEnd = Math.max(clampedStart, Math.min(end, totalSize - 1));
        const chunkLength = clampedEnd - clampedStart + 1;

        return new Response(file.slice(clampedStart, clampedEnd + 1), {
          status: 206,
          headers: {
            "Content-Range": `bytes ${clampedStart}-${clampedEnd}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkLength),
            "Content-Type": contentType,
          },
        });
      }
    }

    return new Response(file, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(totalSize),
        "Content-Type": contentType,
      },
    });
  }

  const buffer = await readFile(filePath);
  return new Response(buffer, {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(totalSize),
      "Content-Type": contentType,
    },
  });
});

// Rutas de API organizadas según Architecture.md
app.route("/api/auth", authRoutes);
app.route("/api/clientes", clientesRoutes);
app.route("/api/inventario", inventarioRoutes);
app.route("/api/taller", tallerRoutes);
app.route("/api/pos", posRoutes);
app.route("/api/corte-caja", corteCajaRoutes);
app.route("/api/upload", adjuntosRoutes);
app.route("/api/whatsapp", whatsappRoutes);

// Health check y documentación de endpoints
app.get("/", (c) => {
  return c.json({
    nombre: "TicketFlow Backend API",
    estado: "Online",
    version: "1.0.0",
    modulos: [
      "/api/auth",
      "/api/clientes",
      "/api/inventario",
      "/api/taller",
      "/api/pos",
      "/api/corte-caja",
      "/api/upload",
      "/api/whatsapp",
    ],
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auto-seed en el arranque si la base de datos está vacía
seed().catch((err) => {
  console.error("Error al ejecutar seed inicial:", err);
});

const rawPort = (process.env.PORT ?? "").trim();
const parsedPort = rawPort.length > 0 ? Number(rawPort) : Number.NaN;
const port =
  Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65535 ? parsedPort : 3000;

if (typeof Bun === "undefined") {
  serve({
    fetch: app.fetch,
    port,
  });
}

console.log(`🚀 TicketFlow Backend corriendo en http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
