import { describe, expect, it } from 'bun:test';
import type { CartItem, VariacionWithProducto } from '../../api/types.ts';
import {
  calculateCartTotals,
  addItemToCart,
  updateItemQuantity,
  updateItemPrice,
  accumulateQuickCash,
  calculateChange,
  validateSplitPayment,
  holdCurrentCart,
  restoreHeldCart,
  deleteHeldCart,
} from './pos-engine.ts';

const mockPhysicalVariacion: VariacionWithProducto = {
  id: 10,
  productoId: 1,
  codigo: 'DISP-IP12-OLED',
  nombre: 'Pantalla OLED Premium',
  precioBase: 1200,
  stock: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  producto: {
    id: 1,
    categoriaId: 1,
    nombre: 'Pantalla iPhone 12',
    descripcion: null,
    esServicio: 0,
    activo: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const mockOutOfStockVariacion: VariacionWithProducto = {
  ...mockPhysicalVariacion,
  id: 11,
  codigo: 'BATT-IP12-OEM',
  stock: 0,
};

const mockServiceVariacion: VariacionWithProducto = {
  id: 20,
  productoId: 2,
  codigo: 'SRV-DIAG-01',
  nombre: 'Revisión y Limpieza Ultrasónica',
  precioBase: 250,
  stock: 0, // Services can have 0 stock
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  producto: {
    id: 2,
    categoriaId: 2,
    nombre: 'Servicio Técnico Especializado',
    descripcion: null,
    esServicio: 1,
    activo: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe('POS Engine - Financial & Cart Domain Rules', () => {
  describe('calculateCartTotals', () => {
    it('returns zero totals for an empty cart', () => {
      const result = calculateCartTotals([]);
      expect(result).toEqual({ totalCart: 0, totalItemsCount: 0 });
    });

    it('correctly calculates subtotal and item count for multiple items', () => {
      const items: CartItem[] = [
        {
          variacionId: 1,
          productoId: 1,
          productoNombre: 'Funda',
          variacionNombre: 'Negra',
          codigo: 'FND-01',
          esServicio: false,
          precioBase: 100,
          precioUnit: 100,
          cantidad: 2,
          stockActual: 10,
          isOfferPrice: false,
        },
        {
          variacionId: 2,
          productoId: 2,
          productoNombre: 'Instalación',
          variacionNombre: 'Mano de Obra',
          codigo: 'SRV-01',
          esServicio: true,
          precioBase: 150,
          precioUnit: 120, // Discounted
          cantidad: 1,
          stockActual: 0,
          isOfferPrice: true,
        },
      ];

      const result = calculateCartTotals(items);
      expect(result.totalCart).toBe(320); // 2*100 + 1*120
      expect(result.totalItemsCount).toBe(3);
    });
  });

  describe('addItemToCart', () => {
    it('adds a new physical item when stock is available', () => {
      const initialCart: CartItem[] = [];
      const updated = addItemToCart(initialCart, mockPhysicalVariacion);

      expect(updated).toHaveLength(1);
      expect(updated[0]).toMatchObject({
        variacionId: 10,
        cantidad: 1,
        precioUnit: 1200,
        precioBase: 1200,
        esServicio: false,
        stockActual: 3,
        isOfferPrice: false,
      });
    });

    it('rejects adding physical item with zero stock', () => {
      const initialCart: CartItem[] = [];
      const updated = addItemToCart(initialCart, mockOutOfStockVariacion);
      expect(updated).toHaveLength(0);
    });

    it('increments quantity when existing physical item is under stock limit', () => {
      const initialCart: CartItem[] = [
        {
          variacionId: 10,
          productoId: 1,
          productoNombre: 'Pantalla iPhone 12',
          variacionNombre: 'Pantalla OLED Premium',
          codigo: 'DISP-IP12-OLED',
          esServicio: false,
          precioBase: 1200,
          precioUnit: 1200,
          cantidad: 2,
          stockActual: 3,
          isOfferPrice: false,
        },
      ];

      const updated = addItemToCart(initialCart, mockPhysicalVariacion);
      expect(updated).toHaveLength(1);
      expect(updated[0].cantidad).toBe(3);
    });

    it('prevents adding physical item beyond available stock', () => {
      const initialCart: CartItem[] = [
        {
          variacionId: 10,
          productoId: 1,
          productoNombre: 'Pantalla iPhone 12',
          variacionNombre: 'Pantalla OLED Premium',
          codigo: 'DISP-IP12-OLED',
          esServicio: false,
          precioBase: 1200,
          precioUnit: 1200,
          cantidad: 3,
          stockActual: 3,
          isOfferPrice: false,
        },
      ];

      const updated = addItemToCart(initialCart, mockPhysicalVariacion);
      expect(updated[0].cantidad).toBe(3); // Did not exceed 3
    });

    it('allows service items to be added regardless of stock count', () => {
      const initialCart: CartItem[] = [];
      const updated = addItemToCart(initialCart, mockServiceVariacion);
      expect(updated).toHaveLength(1);
      expect(updated[0].esServicio).toBe(true);
      expect(updated[0].cantidad).toBe(1);

      // Increment service
      const secondAdd = addItemToCart(updated, mockServiceVariacion);
      expect(secondAdd[0].cantidad).toBe(2);
    });
  });

  describe('updateItemQuantity', () => {
    const baseCart: CartItem[] = [
      {
        variacionId: 10,
        productoId: 1,
        productoNombre: 'Item 10',
        variacionNombre: 'V10',
        codigo: 'C10',
        esServicio: false,
        precioBase: 100,
        precioUnit: 100,
        cantidad: 2,
        stockActual: 3,
        isOfferPrice: false,
      },
    ];

    it('increments quantity within stock limits', () => {
      const updated = updateItemQuantity(baseCart, 10, 1);
      expect(updated[0].cantidad).toBe(3);
    });

    it('does not exceed stock limit for physical items', () => {
      const updated = updateItemQuantity(baseCart, 10, 5);
      expect(updated[0].cantidad).toBe(2); // Preserves existing because delta would breach stock
    });

    it('decrements quantity', () => {
      const updated = updateItemQuantity(baseCart, 10, -1);
      expect(updated[0].cantidad).toBe(1);
    });

    it('removes item when quantity reaches zero or negative', () => {
      const updated = updateItemQuantity(baseCart, 10, -2);
      expect(updated).toHaveLength(0);
    });
  });

  describe('updateItemPrice', () => {
    const baseCart: CartItem[] = [
      {
        variacionId: 10,
        productoId: 1,
        productoNombre: 'Item 10',
        variacionNombre: 'V10',
        codigo: 'C10',
        esServicio: false,
        precioBase: 100,
        precioUnit: 100,
        cantidad: 1,
        stockActual: 5,
        isOfferPrice: false,
      },
    ];

    it('updates price and marks isOfferPrice true when different from precioBase', () => {
      const updated = updateItemPrice(baseCart, 10, 80);
      expect(updated[0].precioUnit).toBe(80);
      expect(updated[0].isOfferPrice).toBe(true);
    });

    it('restores isOfferPrice false when price equals precioBase', () => {
      const updated = updateItemPrice(baseCart, 10, 100);
      expect(updated[0].precioUnit).toBe(100);
      expect(updated[0].isOfferPrice).toBe(false);
    });

    it('clamps negative prices to zero', () => {
      const updated = updateItemPrice(baseCart, 10, -50);
      expect(updated[0].precioUnit).toBe(0);
    });
  });

  describe('accumulateQuickCash', () => {
    it('adds physical bill denomination to current received amount', () => {
      expect(accumulateQuickCash(0, 100)).toBe(100);
      expect(accumulateQuickCash(100, 200)).toBe(300);
      expect(accumulateQuickCash(300, 500)).toBe(800);
      expect(accumulateQuickCash(800, 1000)).toBe(1800);
    });

    it('handles floating point or NaN inputs gracefully', () => {
      expect(accumulateQuickCash(Number.NaN, 100)).toBe(100);
    });
  });

  describe('calculateChange', () => {
    it('calculates positive change when cash received exceeds total', () => {
      expect(calculateChange(450, 500)).toBe(50);
    });

    it('calculates zero change on exact cash', () => {
      expect(calculateChange(500, 500)).toBe(0);
    });

    it('calculates negative difference (shortfall) when received cash is insufficient', () => {
      expect(calculateChange(500, 300)).toBe(-200);
    });
  });

  describe('validateSplitPayment (MIXTO)', () => {
    it('validates true when cash + card equals total', () => {
      const res = validateSplitPayment(1000, 400, 600);
      expect(res.isValid).toBe(true);
      expect(res.diff).toBe(0);
    });

    it('validates false when combined payment is less than total', () => {
      const res = validateSplitPayment(1000, 400, 500);
      expect(res.isValid).toBe(false);
      expect(res.diff).toBe(100); // 100 missing
    });

    it('handles surplus cash while matching required split', () => {
      // Customer pays 600 card, but gives 500 in cash for a 400 cash obligation
      const res = validateSplitPayment(1000, 500, 600);
      expect(res.isValid).toBe(true);
      expect(res.changeOwed).toBe(100);
    });

    it('rejects negative or NaN amounts', () => {
      expect(validateSplitPayment(1000, -100, 1100).isValid).toBe(false);
      expect(validateSplitPayment(1000, Number.NaN, 500).isValid).toBe(false);
    });
  });

  describe('Hold Cart (Carritos en Espera)', () => {
    const sampleItem: CartItem = {
      variacionId: 10,
      productoId: 1,
      productoNombre: 'Item 10',
      variacionNombre: 'V10',
      codigo: 'C10',
      esServicio: false,
      precioBase: 100,
      precioUnit: 100,
      cantidad: 2,
      stockActual: 5,
      isOfferPrice: false,
    };

    it('parks active cart and limits maximum held carts to 5', () => {
      let heldList: any[] = [];
      for (let i = 1; i <= 6; i++) {
        const { newHeldCarts } = holdCurrentCart(
          heldList,
          [sampleItem],
          { id: i, nombre: `Cliente ${i}`, telefono: '123', notas: null, createdAt: '', updatedAt: '' },
          'EFECTIVO',
          `Nota ${i}`
        );
        heldList = newHeldCarts;
      }

      // Max 5 items capped
      expect(heldList).toHaveLength(5);
      expect(heldList[0].label).toContain('Cliente 6');
    });

    it('restores held cart by id and removes it from held list', () => {
      const { newHeldCarts, newHeldItem } = holdCurrentCart(
        [],
        [sampleItem],
        null,
        'TARJETA',
        'Notas'
      );

      const { remainingCarts, restored } = restoreHeldCart(newHeldCarts, newHeldItem.id);
      expect(remainingCarts).toHaveLength(0);
      expect(restored).not.toBeNull();
      expect(restored?.items).toHaveLength(1);
      expect(restored?.items[0].variacionId).toBe(10);
      expect(restored?.metodoPago).toBe('TARJETA');
    });

    it('deletes held cart without restoring', () => {
      const { newHeldCarts, newHeldItem } = holdCurrentCart(
        [],
        [sampleItem],
        null,
        'EFECTIVO',
        ''
      );

      const remaining = deleteHeldCart(newHeldCarts, newHeldItem.id);
      expect(remaining).toHaveLength(0);
    });
  });
});
