import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  clienteIdParamSchema,
  createClienteSchema,
  searchClientesQuerySchema,
  updateClienteSchema,
} from "./clientes.schema.ts";
import { clientesService } from "./clientes.service.ts";

export const clientesRoutes = new Hono();

clientesRoutes.get(
  "/",
  zValidator("query", searchClientesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const clientes = await clientesService.list(query);
    return c.json(clientes);
  }
);

clientesRoutes.get(
  "/:id",
  zValidator("param", clienteIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const cliente = await clientesService.getById(id);
    return c.json(cliente);
  }
);

clientesRoutes.post(
  "/",
  zValidator("json", createClienteSchema),
  async (c) => {
    const body = c.req.valid("json");
    const cliente = await clientesService.create(body);
    return c.json(cliente, 201);
  }
);

clientesRoutes.put(
  "/:id",
  zValidator("param", clienteIdParamSchema),
  zValidator("json", updateClienteSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const updated = await clientesService.update(id, body);
    return c.json(updated);
  }
);
