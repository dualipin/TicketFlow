import { describe, expect, it } from 'bun:test';
import type { PosSaleSummary } from './PosSaleSuccessModal.tsx';
import type { CartItem } from '../../api/types.ts';
import { calculateChange } from './pos-engine.ts';

describe('PosSaleSuccessModal Logic & Contract', () => {
  it('correctly formats cash sale summary with change calculation', () => {
    const items: CartItem[] = [
      {
        variacionId: 1,
        productoId: 1,
        productoNombre: 'Cable USB-C',
        variacionNombre: '1m Blanco',
        codigo: 'CBL-01',
        esServicio: false,
        precioBase: 150,
        precioUnit: 150,
        cantidad: 2,
        stockActual: 10,
        isOfferPrice: false,
      },
    ];

    const total = 300;
    const montoRecibido = 500;
    const cambio = calculateChange(total, montoRecibido);

    const summary: PosSaleSummary = {
      ventaId: 42,
      total,
      cambio,
      metodoPago: 'EFECTIVO',
      clienteNombre: 'Carlos Santana',
      items,
      montoRecibido,
    };

    expect(summary.ventaId).toBe(42);
    expect(summary.total).toBe(300);
    expect(summary.cambio).toBe(200);
    expect(summary.metodoPago).toBe('EFECTIVO');
    expect(summary.items).toHaveLength(1);
    expect(summary.items[0].cantidad).toBe(2);
  });

  it('handles exact electronic payment without change', () => {
    const summary: PosSaleSummary = {
      ventaId: 43,
      total: 1250,
      cambio: 0,
      metodoPago: 'TARJETA',
      clienteNombre: null,
      items: [],
      montoRecibido: undefined,
    };

    expect(summary.cambio).toBe(0);
    expect(summary.clienteNombre).toBeNull();
    expect(summary.metodoPago).toBe('TARJETA');
  });
});
