import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { seed } from "./prisma/seed.ts";
import { authRoutes } from "./routes/auth.ts";
import { clientesRoutes } from "./modules/clientes/index.ts";
import { AppError } from "./lib/errors.ts";
import { inventarioRoutes } from "./routes/inventario.ts";
import { tallerRoutes } from "./routes/taller.ts";
import { posRoutes } from "./routes/pos.ts";
import { corteCajaRoutes } from "./routes/corte-caja.ts";
import { uploadRoutes } from "./routes/upload.ts";
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

// Servir archivos estáticos subidos localmente (fotografías de tickets)
app.get("/uploads/*", async (c) => {
  const filePath = "." + c.req.path;
  const file = Bun.file(filePath);
  if (await file.exists()) {
    return new Response(file);
  }
  return c.text("Archivo no encontrado", 404);
});

// Rutas de API organizadas según Architecture.md
app.route("/api/auth", authRoutes);
app.route("/api/clientes", clientesRoutes);
app.route("/api/inventario", inventarioRoutes);
app.route("/api/taller", tallerRoutes);
app.route("/api/pos", posRoutes);
app.route("/api/corte-caja", corteCajaRoutes);
app.route("/api/upload", uploadRoutes);
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
