#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/40bbfd6228e7bbee6cb4000790b7d1b01aadb662a0ff0ab9e6b977057a981237/contract';
import endContract from '../../snapshots/40bbfd6228e7bbee6cb4000790b7d1b01aadb662a0ff0ab9e6b977057a981237/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e083cee53eca2247d48e30b624abe38075c5036bdd5b7685ac936876a933680a/contract';
import startContract from '../../snapshots/e083cee53eca2247d48e30b624abe38075c5036bdd5b7685ac936876a933680a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-sqlite/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.recreateTable({
        tableName: 'Usuario',
        contractTable: {
          columns: [
            {
              name: 'activo',
              typeSql: 'INTEGER',
              default: { kind: 'literal', value: '1' },
              codecRef: { codecId: 'sqlite/integer@1' },
              nullable: false,
            },
            {
              name: 'createdAt',
              typeSql: 'TEXT',
              default: { kind: 'function', expression: sql`now()` },
              codecRef: { codecId: 'sqlite/datetime@1' },
              nullable: false,
            },
            {
              name: 'id',
              typeSql: 'INTEGER',
              nullable: false,
              inlineAutoincrementPrimaryKey: true,
            },
            {
              name: 'nombre',
              typeSql: 'TEXT',
              codecRef: { codecId: 'sqlite/text@1' },
              nullable: false,
            },
            {
              name: 'password',
              typeSql: 'TEXT',
              codecRef: { codecId: 'sqlite/text@1' },
              nullable: true,
            },
            {
              name: 'pin',
              typeSql: 'TEXT',
              codecRef: { codecId: 'sqlite/text@1' },
              nullable: true,
            },
            {
              name: 'rol',
              typeSql: 'TEXT',
              default: { kind: 'literal', value: 'TECNICO' },
              codecRef: { codecId: 'sqlite/text@1' },
              nullable: false,
            },
            {
              name: 'updatedAt',
              typeSql: 'TEXT',
              codecRef: { codecId: 'sqlite/datetime@1' },
              nullable: false,
            },
          ],
          primaryKey: { columns: ['id'] },
          uniques: [],
          foreignKeys: [],
        },
        schemaColumnNames: ['activo', 'createdAt', 'id', 'nombre', 'pin', 'rol', 'updatedAt'],
        indexes: [],
        summary:
          'Recreates table Usuario to apply schema changes: database/Usuario/column:pin; database/Usuario/column:password',
        postchecks: [
          {
            description: 'verify "pin" nullability on "Usuario"',
            sql: `SELECT COUNT(*) > 0 FROM pragma_table_info('Usuario') WHERE name = 'pin' AND "notnull" = 0`,
          },
          {
            description: 'verify "password" nullability on "Usuario"',
            sql: `SELECT COUNT(*) > 0 FROM pragma_table_info('Usuario') WHERE name = 'password' AND "notnull" = 0`,
          },
        ],
        operationClass: 'widening',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
