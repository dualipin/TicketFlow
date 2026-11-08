import { describe, expect, it, beforeAll } from 'bun:test';
import { Hono } from 'hono';
import { posRoutes } from './pos.ts';
import { calcularMontoEfectivoVenta } from './corte-caja.ts';
import { db } from '../prisma/db.ts';

const app = new Hono();
app.route('/api/pos', posRoutes);

let sampleVariacionId = 1;
let sampleUsuarioId = 2;

beforeAll(async () => {
  const existingVar = await db.orm.Variacion.first();
  if (existingVar) {
    sampleVariacionId = existingVar.id;
  }
  const existingUser = await db.orm.Usuario.first();
  if (existingUser) {
    sampleUsuarioId = existingUser.id;
  }
});

describe('POS & Corte de Caja - Flujo de Pago Mixto (Dual-Tender)', () => {
  describe('calcularMontoEfectivoVenta', () => {
    it('returns full amount for pure EFECTIVO sales', () => {
      const v = { total: 500, metodoPago: 'EFECTIVO', notas: null };
      expect(calcularMontoEfectivoVenta(v)).toBe(500);
    });

    it('returns 0 for pure TARJETA or TRANSFERENCIA sales', () => {
      expect(calcularMontoEfectivoVenta({ total: 700, metodoPago: 'TARJETA', notas: null })).toBe(0);
      expect(calcularMontoEfectivoVenta({ total: 300, metodoPago: 'TRANSFERENCIA', notas: null })).toBe(0);
    });

    it('extracts exact cash portion from MIXTO sale notes', () => {
      const v = {
        total: 1200,
        metodoPago: 'MIXTO',
        notas: '[Pago Mixto: efectivo=$450.50, tarjeta=$749.50] Cliente pagó anticipo en efectivo',
      };
      expect(calcularMontoEfectivoVenta(v)).toBe(450.5);
    });

    it('returns 0 if MIXTO sale note is malformed or missing', () => {
      expect(calcularMontoEfectivoVenta({ total: 500, metodoPago: 'MIXTO', notas: null })).toBe(0);
      expect(calcularMontoEfectivoVenta({ total: 500, metodoPago: 'MIXTO', notas: 'Nota sin tag' })).toBe(0);
    });
  });

  describe('POST /api/pos/ventas - Validación de Pago Mixto', () => {
    it('rejects MIXTO payment when montoEfectivo or montoTarjeta are missing', async () => {
      const res = await app.request('/api/pos/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: sampleUsuarioId,
          metodoPago: 'MIXTO',
          items: [{ variacionId: sampleVariacionId, cantidad: 1, precioUnit: 100 }],
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('montoEfectivo');
    });

    it('rejects MIXTO payment when cash + card does not match total', async () => {
      const res = await app.request('/api/pos/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: sampleUsuarioId,
          metodoPago: 'MIXTO',
          montoEfectivo: 40,
          montoTarjeta: 50, // Sum = 90, Total = 100
          items: [{ variacionId: sampleVariacionId, cantidad: 1, precioUnit: 100 }],
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('no coincide con el total');
    });
  });
});
