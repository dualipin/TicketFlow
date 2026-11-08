import { Hono } from "hono";
import { db } from "../prisma/db.ts";

export const authRoutes = new Hono();

// ============================================================================
// Rate Limiting en memoria para protección contra fuerza bruta
// ============================================================================
interface RateLimitEntry {
  attempts: number;
  lockedUntil?: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutos de bloqueo

function checkRateLimit(key: string): { isLocked: boolean; remainingSeconds: number } {
  const entry = rateLimitMap.get(key);
  if (!entry) return { isLocked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  if (entry.lockedUntil && entry.lockedUntil <= now) {
    rateLimitMap.delete(key);
    return { isLocked: false, remainingSeconds: 0 };
  }

  return { isLocked: false, remainingSeconds: 0 };
}

function recordFailedAttempt(key: string): { isLocked: boolean; attemptsLeft: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { attempts: 0 };
  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    rateLimitMap.set(key, entry);
    return { isLocked: true, attemptsLeft: 0 };
  }

  rateLimitMap.set(key, entry);
  return { isLocked: false, attemptsLeft: MAX_ATTEMPTS - entry.attempts };
}

function clearRateLimit(key: string) {
  rateLimitMap.delete(key);
}

async function verifySecret(provided: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const trimmed = provided.trim();
  if (stored.startsWith("$argon2") || stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
    return await Bun.password.verify(trimmed, stored);
  }
  return trimmed === stored;
}

// ============================================================================
// Endpoints de Autenticación
// ============================================================================

// POST /api/auth/login-pin - Inicio rápido de sesión mediante selección de usuario + PIN
authRoutes.post("/login-pin", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.pin || (typeof body.pin !== "string" && typeof body.pin !== "number")) {
    return c.json({ error: "El PIN es obligatorio" }, 400);
  }

  const pinStr = String(body.pin).trim();
  const usuarioId = Number(body.usuarioId);

  if (!usuarioId || Number.isNaN(usuarioId)) {
    return c.json({ error: "Debe seleccionar un usuario (usuarioId es obligatorio)" }, 400);
  }

  const rateKey = `pin:${usuarioId}`;
  const rateStatus = checkRateLimit(rateKey);
  if (rateStatus.isLocked) {
    return c.json(
      { error: `Usuario bloqueado temporalmente por demasiados intentos. Intente en ${rateStatus.remainingSeconds} segundos.` },
      429
    );
  }

  const user = await db.orm.Usuario.where({ id: usuarioId, activo: 1 }).first();
  if (!user) {
    return c.json({ error: "Usuario no encontrado o inactivo" }, 401);
  }

  if (!user.pin) {
    return c.json({ error: "Este usuario no tiene un PIN de mostrador configurado. Ingrese con contraseña." }, 400);
  }

  const isValid = await verifySecret(pinStr, user.pin);
  if (!isValid) {
    const { isLocked, attemptsLeft } = recordFailedAttempt(rateKey);
    if (isLocked) {
      return c.json(
        { error: "PIN incorrecto. Usuario bloqueado durante 5 minutos por exceso de intentos." },
        429
      );
    }
    return c.json({ error: `PIN incorrecto. ${attemptsLeft} intentos restantes.` }, 401);
  }

  clearRateLimit(rateKey);

  // Auto-upgrade si el PIN antiguo aún estaba en texto plano
  if (!user.pin.startsWith("$argon2")) {
    const hashed = await Bun.password.hash(pinStr);
    await db.orm.Usuario.where({ id: user.id }).update({ pin: hashed });
  }

  return c.json({
    message: `Bienvenido, ${user.nombre}`,
    user: {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    },
  });
});

// POST /api/auth/login-password - Inicio de sesión tradicional para Dueño/ADMIN o acceso remoto
authRoutes.post("/login-password", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.password || typeof body.password !== "string") {
    return c.json({ error: "La contraseña es obligatoria" }, 400);
  }

  const passwordStr = body.password.trim();
  const usuarioId = body.usuarioId ? Number(body.usuarioId) : undefined;
  const nombre = body.nombre ? String(body.nombre).trim() : undefined;

  if (!usuarioId && !nombre) {
    return c.json({ error: "Debe indicar el usuarioId o el nombre de usuario" }, 400);
  }

  let user = null;
  if (usuarioId && !Number.isNaN(usuarioId)) {
    user = await db.orm.Usuario.where({ id: usuarioId, activo: 1 }).first();
  } else if (nombre) {
    user = await db.orm.Usuario.where({ nombre, activo: 1 }).first();
  }

  if (!user) {
    return c.json({ error: "Usuario no encontrado o inactivo" }, 401);
  }

  const rateKey = `pass:${user.id}`;
  const rateStatus = checkRateLimit(rateKey);
  if (rateStatus.isLocked) {
    return c.json(
      { error: `Cuenta bloqueada temporalmente. Intente en ${rateStatus.remainingSeconds} segundos.` },
      429
    );
  }

  if (!user.password) {
    return c.json({ error: "Este usuario no cuenta con contraseña tradicional configurada." }, 400);
  }

  const isValid = await verifySecret(passwordStr, user.password);
  if (!isValid) {
    const { isLocked, attemptsLeft } = recordFailedAttempt(rateKey);
    if (isLocked) {
      return c.json(
        { error: "Contraseña incorrecta. Cuenta bloqueada durante 5 minutos." },
        429
      );
    }
    return c.json({ error: `Contraseña incorrecta. ${attemptsLeft} intentos restantes.` }, 401);
  }

  clearRateLimit(rateKey);

  // Auto-upgrade a Argon2 si era texto plano
  if (!user.password.startsWith("$argon2")) {
    const hashed = await Bun.password.hash(passwordStr);
    await db.orm.Usuario.where({ id: user.id }).update({ password: hashed });
  }

  return c.json({
    message: `Bienvenido, ${user.nombre}`,
    user: {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    },
  });
});

// GET /api/auth/usuarios - Lista de usuarios para pantalla de bloqueo o administración
authRoutes.get("/usuarios", async (c) => {
  const usuarios = await db.orm.Usuario.all();
  return c.json(
    usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      rol: u.rol,
      activo: Boolean(u.activo),
      hasPin: Boolean(u.pin),
      hasPassword: Boolean(u.password),
      createdAt: u.createdAt,
    }))
  );
});

// POST /api/auth/usuarios - Crear nuevo usuario con PIN y/o contraseña hasheados
authRoutes.post("/usuarios", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.nombre || (!body.pin && !body.password)) {
    return c.json({ error: "El nombre y al menos un PIN o Contraseña son obligatorios" }, 400);
  }

  const rol = body.rol && ["ADMIN", "TECNICO", "MOSTRADOR"].includes(body.rol)
    ? body.rol
    : "TECNICO";

  const pinHash = body.pin ? await Bun.password.hash(String(body.pin).trim()) : undefined;
  const passwordHash = body.password ? await Bun.password.hash(String(body.password).trim()) : undefined;

  const nuevo = await db.orm.Usuario.create({
    nombre: String(body.nombre).trim(),
    rol,
    pin: pinHash,
    password: passwordHash,
    activo: 1,
  });

  return c.json(
    {
      id: nuevo.id,
      nombre: nuevo.nombre,
      rol: nuevo.rol,
      activo: Boolean(nuevo.activo),
      hasPin: Boolean(nuevo.pin),
      hasPassword: Boolean(nuevo.password),
    },
    201
  );
});

// PATCH /api/auth/usuarios/:id - Modificar usuario
authRoutes.patch("/usuarios/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ error: "ID inválido" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Datos no proporcionados" }, 400);

  const existing = await db.orm.Usuario.where({ id }).first();
  if (!existing) {
    return c.json({ error: "Usuario no encontrado" }, 404);
  }

  const updateData: Record<string, any> = {};
  if (body.nombre) updateData.nombre = String(body.nombre).trim();
  if (body.rol && ["ADMIN", "TECNICO", "MOSTRADOR"].includes(body.rol)) updateData.rol = body.rol;
  if (body.pin) updateData.pin = await Bun.password.hash(String(body.pin).trim());
  if (body.password) updateData.password = await Bun.password.hash(String(body.password).trim());
  if (typeof body.activo === "boolean" || typeof body.activo === "number") {
    updateData.activo = body.activo ? 1 : 0;
  }

  const updated = await db.orm.Usuario.where({ id }).update(updateData);
  return c.json({
    id: updated.id,
    nombre: updated.nombre,
    rol: updated.rol,
    activo: Boolean(updated.activo),
    hasPin: Boolean(updated.pin),
    hasPassword: Boolean(updated.password),
  });
});
