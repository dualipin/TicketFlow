import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  addVariacionSchema,
  createCategoriaSchema,
  createProductoSchema,
  productoIdParamSchema,
  searchCategoriasQuerySchema,
  searchProductosQuerySchema,
  searchVariacionesQuerySchema,
  updateStockSchema,
  variacionIdParamSchema,
} from "./inventario.schema.ts";
import { inventarioService } from "./inventario.service.ts";

export const inventarioRoutes = new Hono();

// --- Categorías ---
inventarioRoutes.get(
  "/categorias",
  zValidator("query", searchCategoriasQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const categorias = await inventarioService.listCategorias(query);
    return c.json(categorias);
  }
);

inventarioRoutes.post(
  "/categorias",
  zValidator("json", createCategoriaSchema),
  async (c) => {
    const body = c.req.valid("json");
    const categoria = await inventarioService.createCategoria(body);
    return c.json(categoria, 201);
  }
);

// --- Productos ---
inventarioRoutes.get(
  "/productos",
  zValidator("query", searchProductosQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const productos = await inventarioService.listProductos(query);
    return c.json(productos);
  }
);

inventarioRoutes.get(
  "/productos/:id",
  zValidator("param", productoIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const producto = await inventarioService.getProductoById(id);
    return c.json(producto);
  }
);

inventarioRoutes.post(
  "/productos",
  zValidator("json", createProductoSchema),
  async (c) => {
    const body = c.req.valid("json");
    const producto = await inventarioService.createProducto(body);
    return c.json(producto, 201);
  }
);

// --- Variaciones ---
inventarioRoutes.get(
  "/variaciones",
  zValidator("query", searchVariacionesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const variaciones = await inventarioService.listVariaciones(query);
    return c.json(variaciones);
  }
);

inventarioRoutes.post(
  "/productos/:id/variaciones",
  zValidator("param", productoIdParamSchema),
  zValidator("json", addVariacionSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const variacion = await inventarioService.addVariacion(id, body);
    return c.json(variacion, 201);
  }
);

inventarioRoutes.patch(
  "/variaciones/:id/stock",
  zValidator("param", variacionIdParamSchema),
  zValidator("json", updateStockSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const updated = await inventarioService.updateStock(id, body.stock);
    return c.json(updated);
  }
);
