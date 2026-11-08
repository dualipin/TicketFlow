import { ConflictError, NotFoundError } from "../../lib/errors.ts";
import { db } from "../../prisma/db.ts";
import type { CreateClienteInput, SearchClientesQuery, UpdateClienteInput } from "./clientes.schema.ts";

export const clientesService = {
  async list(query: SearchClientesQuery = {}) {
    const { q, telefono } = query;

    if (telefono) {
      const cliente = await db.orm.Cliente.where({ telefono }).first();
      return cliente ? [cliente] : [];
    }

    const clientes = await db.orm.Cliente.all();
    if (!q) {
      return clientes;
    }

    const lowerQ = q.toLowerCase();
    return clientes.filter(
      (cl) =>
        cl.nombre.toLowerCase().includes(lowerQ) ||
        cl.telefono.toLowerCase().includes(lowerQ)
    );
  },

  async getById(id: number) {
    const cliente = await db.orm.Cliente.where({ id })
      .include("tickets")
      .include("ventas")
      .first();

    if (!cliente) {
      throw new NotFoundError(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  },

  async create(input: CreateClienteInput) {
    const existing = await db.orm.Cliente.where({ telefono: input.telefono }).first();
    if (existing) {
      throw new ConflictError("Ya existe un cliente registrado con este número telefónico", {
        clienteId: existing.id,
      });
    }

    return await db.orm.Cliente.create({
      nombre: input.nombre,
      telefono: input.telefono,
      notas: input.notas ?? null,
    });
  },

  async update(id: number, input: UpdateClienteInput) {
    const existing = await db.orm.Cliente.where({ id }).first();
    if (!existing) {
      throw new NotFoundError(`Cliente con ID ${id} no encontrado`);
    }

    const updateData: Record<string, unknown> = {};

    if (input.nombre !== undefined) {
      updateData.nombre = input.nombre;
    }

    if (input.telefono !== undefined && input.telefono !== existing.telefono) {
      const duplicate = await db.orm.Cliente.where({ telefono: input.telefono }).first();
      if (duplicate) {
        throw new ConflictError("El teléfono ya pertenece a otro cliente", {
          clienteId: duplicate.id,
        });
      }
      updateData.telefono = input.telefono;
    }

    if (input.notas !== undefined) {
      updateData.notas = input.notas ?? null;
    }

    return await db.orm.Cliente.where({ id }).update(updateData);
  },
};
