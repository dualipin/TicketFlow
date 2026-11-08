import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { authRoutes } from "./auth.ts";

const app = new Hono();
app.route("/api/auth", authRoutes);

describe("Auth Routes (PIN & Password Authentication)", () => {
  it("GET /api/auth/usuarios returns safe list without exposing hashes or raw secrets", async () => {
    const res = await app.request("/api/auth/usuarios");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    const firstUser = data[0];
    expect(firstUser).toHaveProperty("id");
    expect(firstUser).toHaveProperty("nombre");
    expect(firstUser).toHaveProperty("rol");
    expect(firstUser).toHaveProperty("activo");
    expect(firstUser).toHaveProperty("hasPin");
    expect(firstUser).toHaveProperty("hasPassword");

    // CRITICAL: Ensure pin and password fields are never exposed
    expect(firstUser).not.toHaveProperty("pin");
    expect(firstUser).not.toHaveProperty("password");
  });

  it("POST /api/auth/login-pin fails when usuarioId is missing", async () => {
    const res = await app.request("/api/auth/login-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "1234" }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("usuarioId");
  });

  it("POST /api/auth/login-pin fails with incorrect PIN", async () => {
    const res = await app.request("/api/auth/login-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: 3, pin: "9999" }), // Daniel's PIN is 2222
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("PIN incorrecto");
  });

  it("POST /api/auth/login-pin succeeds for technician with correct 4-digit PIN", async () => {
    const res = await app.request("/api/auth/login-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: 3, pin: "2222" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.id).toBe(3);
    expect(data.user.rol).toBe("TECNICO");
    expect(data.user.nombre).toContain("Daniel");
  });

  it("POST /api/auth/login-pin succeeds for Admin with 6-digit counter PIN", async () => {
    const res = await app.request("/api/auth/login-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: 2, pin: "123456" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.id).toBe(2);
    expect(data.user.rol).toBe("ADMIN");
  });

  it("POST /api/auth/login-password succeeds for Admin with robust remote password", async () => {
    const res = await app.request("/api/auth/login-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: 2, password: "Admin1234!" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.id).toBe(2);
    expect(data.user.rol).toBe("ADMIN");
  });

  it("POST /api/auth/login-password fails with incorrect password", async () => {
    const res = await app.request("/api/auth/login-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: 2, password: "WrongPassword999!" }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Contraseña incorrecta");
  });
});
