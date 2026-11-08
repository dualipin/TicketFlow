import type { CartItem, Cliente, MetodoPagoVenta, VariacionWithProducto } from '../../api/types.ts';

/**
 * Calcula los totales globales del carrito de compra de manera determinista.
 */
export function calculateCartTotals(cart: CartItem[]): {
  totalCart: number;
  totalItemsCount: number;
} {
  const totalCart = cart.reduce(
    (acc, item) => acc + item.precioUnit * item.cantidad,
    0
  );
  const totalItemsCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return {
    totalCart: Math.round(totalCart * 100) / 100,
    totalItemsCount,
  };
}

/**
 * Agrega una variación al carrito validando stock para productos físicos.
 * Los servicios de taller (esServicio) no restringen existencias.
 */
export function addItemToCart(
  cart: CartItem[],
  v: VariacionWithProducto
): CartItem[] {
  const esServicio = Boolean(v.producto.esServicio);

  // Si es producto físico y no tiene inventario, rechazar adición
  if (!esServicio && v.stock <= 0) {
    return cart;
  }

  const existingIndex = cart.findIndex((item) => item.variacionId === v.id);

  if (existingIndex >= 0) {
    const item = cart[existingIndex];
    // No superar existencias para productos físicos
    if (!esServicio && item.cantidad >= v.stock) {
      return cart;
    }

    const updated = [...cart];
    updated[existingIndex] = {
      ...item,
      cantidad: item.cantidad + 1,
    };
    return updated;
  }

  // Nueva partida
  const newItem: CartItem = {
    variacionId: v.id,
    productoId: v.productoId,
    productoNombre: v.producto.nombre,
    variacionNombre: v.nombre,
    codigo: v.codigo,
    esServicio,
    precioBase: v.precioBase,
    precioUnit: v.precioBase,
    cantidad: 1,
    stockActual: v.stock,
    isOfferPrice: false,
  };

  return [...cart, newItem];
}

/**
 * Modifica la cantidad de una partida existente.
 * Si la cantidad llega a 0 o menor, se remueve la partida.
 * No permite exceder el inventario físico disponible.
 */
export function updateItemQuantity(
  cart: CartItem[],
  variacionId: number,
  delta: number
): CartItem[] {
  return cart
    .map((item) => {
      if (item.variacionId === variacionId) {
        const newQty = item.cantidad + delta;
        if (newQty <= 0) return null;
        if (!item.esServicio && newQty > item.stockActual) return item;
        return { ...item, cantidad: newQty };
      }
      return item;
    })
    .filter(Boolean) as CartItem[];
}

/**
 * Actualiza el precio unitario pactado para una partida.
 * Clampa a 0 y activa la bandera isOfferPrice si difiere del precio base.
 */
export function updateItemPrice(
  cart: CartItem[],
  variacionId: number,
  newPrice: number
): CartItem[] {
  const clamped = Number.isNaN(newPrice) ? 0 : Math.max(0, newPrice);

  return cart.map((item) => {
    if (item.variacionId === variacionId) {
      return {
        ...item,
        precioUnit: clamped,
        isOfferPrice: clamped !== item.precioBase,
      };
    }
    return item;
  });
}

/**
 * Acumula denominaciones de billetes físicos de forma aditiva.
 */
export function accumulateQuickCash(current: number, bill: number): number {
  const validCurrent = Number.isNaN(current) ? 0 : Math.max(0, current);
  const validBill = Number.isNaN(bill) ? 0 : Math.max(0, bill);
  return validCurrent + validBill;
}

/**
 * Calcula el cambio a entregar o faltante en efectivo.
 */
export function calculateChange(total: number, received: number): number {
  const validTotal = Number.isNaN(total) ? 0 : total;
  const validReceived = Number.isNaN(received) ? 0 : received;
  return Math.round((validReceived - validTotal) * 100) / 100;
}

/**
 * Valida un desglose de pago mixto (Efectivo + Tarjeta/Transferencia).
 */
export function validateSplitPayment(
  total: number,
  cashPart: number,
  cardPart: number
): {
  isValid: boolean;
  diff: number;
  changeOwed: number;
} {
  if (
    Number.isNaN(total) ||
    Number.isNaN(cashPart) ||
    Number.isNaN(cardPart) ||
    cashPart < 0 ||
    cardPart < 0 ||
    total <= 0
  ) {
    return { isValid: false, diff: total, changeOwed: 0 };
  }

  const combined = cashPart + cardPart;
  const diff = Math.round((total - combined) * 100) / 100;

  if (diff > 0) {
    // Falta dinero para cubrir el total
    return { isValid: false, diff, changeOwed: 0 };
  }

  // Si el efectivo entregado supera la porción requerida
  const changeOwed = Math.max(0, Math.round((combined - total) * 100) / 100);
  return { isValid: true, diff: 0, changeOwed };
}


export interface HeldCart {
  id: string;
  timestamp: string;
  label: string;
  items: CartItem[];
  selectedCliente: Cliente | null;
  metodoPago: MetodoPagoVenta;
  notasVenta: string;
  total: number;
}

/**
 * Pone en espera el carrito actual y limita el historial de espera a un máximo de 5 carritos.
 */
export function holdCurrentCart(
  heldCarts: HeldCart[],
  currentCart: CartItem[],
  cliente: Cliente | null,
  metodoPago: MetodoPagoVenta,
  notasVenta: string
): {
  newHeldCarts: HeldCart[];
  newHeldItem: HeldCart;
} {
  const { totalCart, totalItemsCount } = calculateCartTotals(currentCart);
  const clienteName = cliente ? cliente.nombre : 'Público en General';
  const id = `hold_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newHeldItem: HeldCart = {
    id,
    timestamp: now.toISOString(),
    label: `${clienteName} (${totalItemsCount} arts • $${totalCart.toFixed(2)}) - ${timeStr}`,
    items: [...currentCart],
    selectedCliente: cliente ? { ...cliente } : null,
    metodoPago,
    notasVenta,
    total: totalCart,
  };

  const newHeldCarts = [newHeldItem, ...heldCarts].slice(0, 5);
  return { newHeldCarts, newHeldItem };
}

/**
 * Recupera un carrito en espera por ID y lo remueve de la lista de espera.
 */
export function restoreHeldCart(
  heldCarts: HeldCart[],
  holdId: string
): {
  remainingCarts: HeldCart[];
  restored: HeldCart | null;
} {
  const found = heldCarts.find((c) => c.id === holdId) || null;
  const remainingCarts = heldCarts.filter((c) => c.id !== holdId);
  return { remainingCarts, restored: found };
}

/**
 * Elimina un carrito en espera sin restaurarlo.
 */
export function deleteHeldCart(
  heldCarts: HeldCart[],
  holdId: string
): HeldCart[] {
  return heldCarts.filter((c) => c.id !== holdId);
}
