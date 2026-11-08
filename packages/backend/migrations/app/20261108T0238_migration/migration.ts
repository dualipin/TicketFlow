#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/e083cee53eca2247d48e30b624abe38075c5036bdd5b7685ac936876a933680a/contract';
import endContract from '../../snapshots/e083cee53eca2247d48e30b624abe38075c5036bdd5b7685ac936876a933680a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, sql, unique } from '@prisma/orm-sqlite/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: 'Bitacora',
        columns: [
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('esPrivada', 'INTEGER', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('nota', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('ticketId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
          col('usuarioId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
        ],
      }),
      this.createTable({
        table: 'Categoria',
        columns: [
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('nombre', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
        ],
        constraints: [unique(['nombre'])],
      }),
      this.createTable({
        table: 'Cliente',
        columns: [
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('nombre', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('notas', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('telefono', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
        ],
        constraints: [unique(['telefono'])],
      }),
      this.createTable({
        table: 'CorteCaja',
        columns: [
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('diferencia', 'REAL', { codecRef: { codecId: 'sqlite/real@1' } }),
          col('estado', 'TEXT', {
            notNull: true,
            default: lit('ABIERTO'),
            codecRef: { codecId: 'sqlite/text@1' },
          }),
          col('fechaApertura', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('fechaCierre', 'TEXT', { codecRef: { codecId: 'sqlite/datetime@1' } }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('montoCalculado', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('montoInicial', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('montoReal', 'REAL', { codecRef: { codecId: 'sqlite/real@1' } }),
          col('notas', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
          col('usuarioId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
        ],
      }),
      this.createTable({
        table: 'HistorialPago',
        columns: [
          col('corteCajaId', 'INTEGER', { codecRef: { codecId: 'sqlite/integer@1' } }),
          col('fecha', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('metodoPago', 'TEXT', {
            notNull: true,
            default: lit('EFECTIVO'),
            codecRef: { codecId: 'sqlite/text@1' },
          }),
          col('monto', 'REAL', { notNull: true, codecRef: { codecId: 'sqlite/real@1' } }),
          col('notas', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('ticketId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
          col('usuarioId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
        ],
      }),
      this.createTable({
        table: 'Producto',
        columns: [
          col('categoriaId', 'INTEGER', {
            notNull: true,
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('descripcion', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('esServicio', 'INTEGER', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('nombre', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
        ],
      }),
      this.createTable({
        table: 'Ticket',
        columns: [
          col('accesorios', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('clienteId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
          col('contrasena', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('costoTotal', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('dispositivo', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('estado', 'TEXT', {
            notNull: true,
            default: lit('RECIBIDO'),
            codecRef: { codecId: 'sqlite/text@1' },
          }),
          col('falla', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('folio', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('fotoAccesorios', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('fotoRecepcion', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('saldoPendiente', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('tecnicoId', 'INTEGER', { codecRef: { codecId: 'sqlite/integer@1' } }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
        ],
        constraints: [unique(['folio'])],
      }),
      this.createTable({
        table: 'Usuario',
        columns: [
          col('activo', 'INTEGER', {
            notNull: true,
            default: lit('1'),
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('nombre', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('pin', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('rol', 'TEXT', {
            notNull: true,
            default: lit('TECNICO'),
            codecRef: { codecId: 'sqlite/text@1' },
          }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
        ],
      }),
      this.createTable({
        table: 'Variacion',
        columns: [
          col('codigo', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('createdAt', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('nombre', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/text@1' } }),
          col('precioBase', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('productoId', 'INTEGER', {
            notNull: true,
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('stock', 'INTEGER', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('updatedAt', 'TEXT', { notNull: true, codecRef: { codecId: 'sqlite/datetime@1' } }),
        ],
        constraints: [unique(['codigo'])],
      }),
      this.createTable({
        table: 'Venta',
        columns: [
          col('clienteId', 'INTEGER', { codecRef: { codecId: 'sqlite/integer@1' } }),
          col('corteCajaId', 'INTEGER', { codecRef: { codecId: 'sqlite/integer@1' } }),
          col('fecha', 'TEXT', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'sqlite/datetime@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('metodoPago', 'TEXT', {
            notNull: true,
            default: lit('EFECTIVO'),
            codecRef: { codecId: 'sqlite/text@1' },
          }),
          col('notas', 'TEXT', { codecRef: { codecId: 'sqlite/text@1' } }),
          col('total', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('usuarioId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
        ],
      }),
      this.createTable({
        table: 'VentaDetalle',
        columns: [
          col('cantidad', 'INTEGER', {
            notNull: true,
            default: lit('1'),
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('id', 'INTEGER PRIMARY KEY AUTOINCREMENT'),
          col('precioUnit', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('subtotal', 'REAL', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'sqlite/real@1' },
          }),
          col('variacionId', 'INTEGER', {
            notNull: true,
            codecRef: { codecId: 'sqlite/integer@1' },
          }),
          col('ventaId', 'INTEGER', { notNull: true, codecRef: { codecId: 'sqlite/integer@1' } }),
        ],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
