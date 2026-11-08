import { db } from "./db.ts";
import { seed } from "./seed.ts";

export { db };

export async function listUsers(limit = 50) {
  await seed();
  const users = await db.orm.Usuario
    .select("id", "nombre", "rol", "pin", "activo", "createdAt")
    .limit(limit)
    .all();

  return users.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    rol: user.rol,
    pin: user.pin,
    activo: user.activo,
    createdAt: user.createdAt?.toISOString() ?? null,
  }));
}

export type StarterUser = Awaited<ReturnType<typeof listUsers>>[number];
