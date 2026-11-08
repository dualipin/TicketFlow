import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { inventarioRoutes } from "./inventario.routes.ts";
import { AppError } from "../../lib/errors.ts";

const app = new Hono();
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message, details: err.details }, err.statusCode as any);
  }
  return c.json({ error: "Internal server error" }, 500);
});
app.route("/api/inventario", inventarioRoutes);

describe("Inventario Module - Categorías", () => {
  it("GET /api/inventario/categorias returns categories list", async () => {
    const res = await app.request("/api/inventario/categorias");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/inventario/categorias creates a new unique category", async () => {
    const testName = `Test Cat ${Date.now()}`;
    const res = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: testName }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.nombre).toBe(testName);

    // Duplicate creation returns 409 Conflict
    const dupRes = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: testName }),
    });
    expect(dupRes.status).toBe(409);
    const dupData = await dupRes.json();
    expect(dupData.error).toContain("ya existe");
  });

  it("POST /api/inventario/categorias validates required name", async () => {
    const res = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "   " }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/inventario/productos creates a simple physical product", async () => {
    const catRes = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: `Cat Prod ${Date.now()}` }),
    });
    const cat = await catRes.json();

    const uniqueSku = `SKU-TEST-${Date.now()}`;
    const res = await app.request("/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaId: cat.id,
        nombre: "Cable USB-C Reforzado",
        descripcion: "Cable de 2 metros carga rápida",
        esServicio: 0,
        codigo: uniqueSku,
        precioBase: 120.5,
        stock: 15,
      }),
    });

    expect(res.status).toBe(201);
    const prod = await res.json();
    expect(prod).toHaveProperty("id");
    expect(prod.nombre).toBe("Cable USB-C Reforzado");
    expect(prod.esServicio).toBe(0);
    expect(prod.variaciones.length).toBe(1);
    expect(prod.variaciones[0].codigo).toBe(uniqueSku);
    expect(prod.variaciones[0].precioBase).toBe(120.5);
    expect(prod.variaciones[0].stock).toBe(15);
  });

  it("POST /api/inventario/productos creates a service with zero stock", async () => {
    const catRes = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: `Cat Serv ${Date.now()}` }),
    });
    const cat = await catRes.json();

    const uniqueSku = `SRV-TEST-${Date.now()}`;
    const res = await app.request("/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaId: cat.id,
        nombre: "Mantenimiento Preventivo",
        descripcion: "Limpieza interna y cambio de pasta térmica",
        esServicio: 1,
        codigo: uniqueSku,
        precioBase: 350,
        stock: 50, // Should be forced to 0 because it's a service
      }),
    });

    expect(res.status).toBe(201);
    const prod = await res.json();
    expect(prod.esServicio).toBe(1);
    expect(prod.variaciones[0].stock).toBe(0);
  });

  it("POST /api/inventario/productos rejects duplicate SKU with 409 Conflict", async () => {
    const catRes = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: `Cat Dup ${Date.now()}` }),
    });
    const cat = await catRes.json();

    const uniqueSku = `SKU-DUP-${Date.now()}`;
    await app.request("/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaId: cat.id,
        nombre: "Original",
        esServicio: 0,
        codigo: uniqueSku,
        precioBase: 100,
        stock: 5,
      }),
    });

    const dupRes = await app.request("/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaId: cat.id,
        nombre: "Duplicate SKU product",
        esServicio: 0,
        codigo: uniqueSku,
        precioBase: 200,
        stock: 2,
      }),
    });

    expect(dupRes.status).toBe(409);
    const err = await dupRes.json();
    expect(err.error).toContain("ya está registrado");
  });

  it("POST /api/inventario/productos creates a multi-variant product with unique SKUs", async () => {
    const catRes = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: `Cat Multi ${Date.now()}` }),
    });
    const cat = await catRes.json();

    const sku1 = `SKU-OLED-${Date.now()}`;
    const sku2 = `SKU-INC-${Date.now()}`;

    const res = await app.request("/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaId: cat.id,
        nombre: "Pantalla iPhone 12 Pro",
        descripcion: "Pantallas de repuesto varias calidades",
        esServicio: 0,
        variaciones: [
          {
            nombre: "Calidad OLED Premium",
            codigo: sku1,
            precioBase: 1450,
            stock: 4,
          },
          {
            nombre: "Calidad Incell Genérica",
            codigo: sku2,
            precioBase: 850,
            stock: 8,
          },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const prod = await res.json();
    expect(prod.variaciones.length).toBe(2);
    expect(prod.variaciones[0].codigo).toBe(sku1);
    expect(prod.variaciones[0].precioBase).toBe(1450);
    expect(prod.variaciones[1].codigo).toBe(sku2);
    expect(prod.variaciones[1].stock).toBe(8);
  });

  it("POST /api/inventario/productos rejects duplicate SKUs within the same multi-variant payload", async () => {
    const catRes = await app.request("/api/inventario/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: `Cat DupPayload ${Date.now()}` }),
    });
    const cat = await catRes.json();

    const dupSku = `SKU-SAME-${Date.now()}`;

    const res = await app.request("/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaId: cat.id,
        nombre: "Producto con SKU interno duplicado",
        esServicio: 0,
        variaciones: [
          { nombre: "Var A", codigo: dupSku, precioBase: 100, stock: 1 },
          { nombre: "Var B", codigo: dupSku, precioBase: 100, stock: 1 },
        ],
      }),
    });

    expect(res.status).toBe(409);
    const err = await res.json();
    expect(err.error).toContain("duplicados");
  });
});
