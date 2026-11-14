import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useCategorias, useVariaciones } from '../../queries/inventario/queries.ts';
import { useCorteActivo } from '../../queries/corte-caja/queries.ts';
import { useClientes } from '../../queries/clientes/queries.ts';
import { useCreateVenta } from '../../queries/pos/mutations.ts';
import { useAuth } from '../../lib/auth-context.tsx';
import type {
  CartItem,
  Cliente,
  MetodoPagoVenta,
  VariacionWithProducto,
} from '../../api/types.ts';
import {
  calculateCartTotals,
  addItemToCart,
  updateItemQuantity,
  updateItemPrice,
  calculateChange,
  validateSplitPayment,
  accumulateQuickCash,
  holdCurrentCart,
  restoreHeldCart,
  deleteHeldCart,
  type HeldCart,
} from './pos-engine.ts';
import { PosCatalog } from './PosCatalog.tsx';
import { PosCart } from './PosCart.tsx';
import { PosPaymentSection } from './PosPaymentSection.tsx';
import { PosMobileCartSheet } from './PosMobileCartSheet.tsx';
import { usePosKeyboardShortcuts } from './usePosKeyboardShortcuts.ts';
import { PosSaleSuccessModal, type PosSaleSummary } from './PosSaleSuccessModal.tsx';
import { AbrirCajaModal } from '../corte-caja/AbrirCajaModal.tsx';
import { CreateClienteModal } from './CreateClienteModal.tsx';
import { Card } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert.tsx';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: corteActivoData } = useCorteActivo();
  const { data: categorias } = useCategorias();
  const { data: variaciones, isLoading: isLoadingVars } = useVariaciones();
  const { data: clientes } = useClientes();
  const createVenta = useCreateVenta();

  // Estados de control de modales
  const [isAbrirCajaOpen, setIsAbrirCajaOpen] = useState(false);
  const [isCreateClienteOpen, setIsCreateClienteOpen] = useState(false);
  const [isSaleSuccessOpen, setIsSaleSuccessOpen] = useState(false);
  const [isCustomerComboboxOpen, setIsCustomerComboboxOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [saleSummary, setSaleSummary] = useState<PosSaleSummary | null>(null);

  // Filtros de catálogo
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | 'ALL'>('ALL');
  const [tipoFilter, setTipoFilter] = useState<'ALL' | 'FISICOS' | 'SERVICIOS'>('ALL');

  // Estado del Carrito (Client state)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPagoVenta>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [notasVenta, setNotasVenta] = useState<string>('');

  // Estados para Cuentas en Espera (Hold Cart) con persistencia de sesión
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() => {
    try {
      const stored = sessionStorage.getItem('ticketflow_pos_held_carts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('ticketflow_pos_held_carts', JSON.stringify(heldCarts));
    } catch {
      // Ignorar cuotas de storage
    }
  }, [heldCarts]);

  // Estados para Pago Mixto
  const [montoEfectivoMixto, setMontoEfectivoMixto] = useState<string>('');
  const [montoTarjetaMixto, setMontoTarjetaMixto] = useState<string>('');

  // Mensaje de éxito / error tras venta
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);
  const [saleErrorMessage, setSaleErrorMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCajaAbierta = Boolean(corteActivoData?.activo);

  // Totales del carrito delegados al motor puro
  const { totalCart, totalItemsCount } = useMemo(() => {
    return calculateCartTotals(cart);
  }, [cart]);

  // Validación de pago mixto
  const splitValidation = useMemo(() => {
    if (metodoPago !== 'MIXTO') {
      return { isValid: false, diff: 0, changeOwed: 0 };
    }
    const cash = montoEfectivoMixto.trim() !== '' ? Number(montoEfectivoMixto) : NaN;
    const card = montoTarjetaMixto.trim() !== '' ? Number(montoTarjetaMixto) : NaN;
    return validateSplitPayment(totalCart, cash, card);
  }, [metodoPago, totalCart, montoEfectivoMixto, montoTarjetaMixto]);

  // Cálculo de cambio en efectivo
  const efectivoNum = montoRecibido.trim() !== '' ? Number(montoRecibido) : 0;
  const cambio = useMemo(() => {
    if (metodoPago === 'EFECTIVO') {
      return calculateChange(totalCart, efectivoNum);
    }
    if (metodoPago === 'MIXTO' && splitValidation.isValid) {
      return splitValidation.changeOwed;
    }
    return 0;
  }, [metodoPago, totalCart, efectivoNum, splitValidation]);

  const efectivoSuficiente =
    metodoPago !== 'EFECTIVO' || (efectivoNum >= totalCart && totalCart > 0);

  const canProceedCheckout =
    cart.length > 0 &&
    isCajaAbierta &&
    !createVenta.isPending &&
    (metodoPago === 'MIXTO' ? splitValidation.isValid : efectivoSuficiente);

  // Catálogo filtrado
  const filteredVariaciones = useMemo(() => {
    if (!variaciones) return [];
    let list = variaciones;

    // Filtro por tipo
    if (tipoFilter === 'FISICOS') {
      list = list.filter((v) => !v.producto.esServicio);
    } else if (tipoFilter === 'SERVICIOS') {
      list = list.filter((v) => Boolean(v.producto.esServicio));
    }

    // Filtro por categoría
    if (selectedCategoriaId !== 'ALL') {
      list = list.filter((v) => v.producto.categoriaId === selectedCategoriaId);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.codigo.toLowerCase().includes(q) ||
          v.nombre.toLowerCase().includes(q) ||
          v.producto.nombre.toLowerCase().includes(q)
      );
    }

    return list;
  }, [variaciones, tipoFilter, selectedCategoriaId, searchQuery]);

  // Manejador para agregar ítem al carrito
  const handleAddToCart = useCallback((v: VariacionWithProducto) => {
    setSaleSuccessMessage(null);
    setSaleErrorMessage(null);
    setCart((prev) => addItemToCart(prev, v));
  }, []);

  // Lector de código de barras: auto-adición al presionar Enter con SKU exacto
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = searchQuery.trim().toUpperCase();
      if (!code || !variaciones) return;

      const matchedVar = variaciones.find(
        (v) => v.codigo.toUpperCase() === code
      );

      if (matchedVar) {
        handleAddToCart(matchedVar);
        setSearchQuery('');
      }
    }
  };

  // Modificar cantidad
  const handleUpdateQuantity = useCallback((variacionId: number, delta: number) => {
    setCart((prev) => updateItemQuantity(prev, variacionId, delta));
  }, []);

  // Eliminar ítem
  const handleRemoveItem = useCallback((variacionId: number) => {
    setCart((prev) => prev.filter((item) => item.variacionId !== variacionId));
  }, []);

  // Vaciar carrito con red de seguridad y opción Deshacer
  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;
    const snapshotCart = [...cart];
    const snapshotCliente = selectedCliente;
    const snapshotMetodo = metodoPago;
    const snapshotNotas = notasVenta;

    setCart([]);
    setMontoRecibido('');
    setMontoEfectivoMixto('');
    setMontoTarjetaMixto('');
    setNotasVenta('');

    toast('Carrito vaciado', {
      description: `${snapshotCart.length} artículos removidos`,
      action: {
        label: 'Deshacer',
        onClick: () => {
          setCart(snapshotCart);
          setSelectedCliente(snapshotCliente);
          setMetodoPago(snapshotMetodo);
          setNotasVenta(snapshotNotas);
          toast.success('Carrito restaurado');
        },
      },
    });
  }, [cart, selectedCliente, metodoPago, notasVenta]);

  // Pausar venta actual (Hold Cart)
  const handleHoldCart = useCallback(() => {
    if (cart.length === 0) return;
    const { newHeldCarts, newHeldItem } = holdCurrentCart(
      heldCarts,
      cart,
      selectedCliente,
      metodoPago,
      notasVenta
    );
    setHeldCarts(newHeldCarts);
    setCart([]);
    setSelectedCliente(null);
    setMontoRecibido('');
    setMontoEfectivoMixto('');
    setMontoTarjetaMixto('');
    setNotasVenta('');
    toast.info('Venta pausada en espera', {
      description: newHeldItem.label,
    });
  }, [cart, heldCarts, selectedCliente, metodoPago, notasVenta]);

  // Recuperar carrito en espera
  const handleRestoreHeldCart = useCallback(
    (holdId: string) => {
      const { remainingCarts, restored } = restoreHeldCart(heldCarts, holdId);
      if (!restored) return;

      if (cart.length > 0) {
        const autoHeld = holdCurrentCart(
          remainingCarts,
          cart,
          selectedCliente,
          metodoPago,
          notasVenta
        );
        setHeldCarts(autoHeld.newHeldCarts);
      } else {
        setHeldCarts(remainingCarts);
      }

      setCart(restored.items);
      setSelectedCliente(restored.selectedCliente);
      setMetodoPago(restored.metodoPago);
      setNotasVenta(restored.notasVenta || '');
      setMontoRecibido('');
      setMontoEfectivoMixto('');
      setMontoTarjetaMixto('');
      toast.success('Ticket recuperado a caja', {
        description: restored.label,
      });
    },
    [cart, heldCarts, selectedCliente, metodoPago, notasVenta]
  );

  // Descartar carrito en espera
  const handleDeleteHeldCart = useCallback((holdId: string) => {
    setHeldCarts((prev) => deleteHeldCart(prev, holdId));
    toast.info('Ticket en espera descartado');
  }, []);

  // Modificar precio unitario
  const handleUpdatePrice = useCallback((variacionId: number, newPrice: number) => {
    setCart((prev) => updateItemPrice(prev, variacionId, newPrice));
  }, []);

  // Toggle de precio oferta para físicos
  const handleToggleOfferMode = useCallback((variacionId: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.variacionId === variacionId) {
          return {
            ...item,
            isOfferPrice: !item.isOfferPrice,
          };
        }
        return item;
      })
    );
  }, []);

  // Denominaciones rápidas acumulativas de billetes
  const handleAddCash = useCallback((amount: number) => {
    setMontoRecibido((prev) => {
      const current = prev.trim() !== '' ? Number(prev) : 0;
      return String(accumulateQuickCash(current, amount));
    });
  }, []);

  const handleSetExactCash = useCallback((amount: number) => {
    setMontoRecibido(String(amount));
  }, []);

  const handleClearCash = useCallback(() => {
    setMontoRecibido('');
  }, []);

  // Cambiar método de pago e inicializar split si es MIXTO
  const handleSelectMetodoPago = useCallback((m: MetodoPagoVenta) => {
    setMetodoPago(m);
    if (m === 'MIXTO') {
      const half = Math.round((totalCart / 2) * 100) / 100;
      setMontoEfectivoMixto(String(half));
      setMontoTarjetaMixto(String(Math.round((totalCart - half) * 100) / 100));
    }
  }, [totalCart]);

  // Atajos para pago mixto
  const handleSplitFiftyFifty = useCallback(() => {
    const half = Math.round((totalCart / 2) * 100) / 100;
    setMontoEfectivoMixto(String(half));
    setMontoTarjetaMixto(String(Math.round((totalCart - half) * 100) / 100));
  }, [totalCart]);

  const handleFillRemainingCard = useCallback(() => {
    const cash = Number(montoEfectivoMixto || 0);
    const remainder = Math.max(0, Math.round((totalCart - cash) * 100) / 100);
    setMontoTarjetaMixto(String(remainder));
  }, [totalCart, montoEfectivoMixto]);

  // Cierre del modal de venta exitosa: limpiar carrito, cliente y devolver foco a búsqueda
  const handleCloseSaleSuccess = useCallback(() => {
    setIsSaleSuccessOpen(false);
    setSaleSummary(null);
    setCart([]);
    setMontoRecibido('');
    setMontoEfectivoMixto('');
    setMontoTarjetaMixto('');
    setNotasVenta('');
    setSelectedCliente(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  // Procesar Cobro
  const handleCheckout = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (cart.length === 0 || !isCajaAbierta) return;
    if (metodoPago === 'MIXTO' && !splitValidation.isValid) return;
    if (metodoPago !== 'MIXTO' && !efectivoSuficiente) return;

    setSaleErrorMessage(null);
    setSaleSuccessMessage(null);

    const usuarioId = currentUser?.id ?? 1;
    const itemsSnapshot = [...cart];
    const clienteSnapshot = selectedCliente;
    const cambioSnapshot = cambio;
    const efectivoSnapshot =
      metodoPago === 'EFECTIVO'
        ? efectivoNum
        : metodoPago === 'MIXTO'
        ? Number(montoEfectivoMixto)
        : undefined;

    const payload = {
      usuarioId,
      clienteId: clienteSnapshot ? clienteSnapshot.id : null,
      metodoPago,
      notas: notasVenta.trim() || undefined,
      montoEfectivo: metodoPago === 'MIXTO' ? Number(montoEfectivoMixto) : undefined,
      montoTarjeta: metodoPago === 'MIXTO' ? Number(montoTarjetaMixto) : undefined,
      items: itemsSnapshot.map((item) => ({
        variacionId: item.variacionId,
        cantidad: item.cantidad,
        precioUnit: item.precioUnit,
      })),
    };

    createVenta.mutate(payload, {
      onSuccess: (res) => {
        const successSummary: PosSaleSummary = {
          ventaId: res.venta.id,
          total: res.venta.total,
          cambio: cambioSnapshot,
          metodoPago,
          clienteNombre: clienteSnapshot ? clienteSnapshot.nombre : null,
          items: itemsSnapshot,
          montoRecibido: efectivoSnapshot,
        };

        setSaleSummary(successSummary);
        setIsSaleSuccessOpen(true);
        setIsMobileSheetOpen(false);
        setSaleSuccessMessage(
          `Venta #${res.venta.id} por $${res.venta.total.toFixed(2)} registrada exitosamente.`
        );
        toast.success(`Venta #${res.venta.id} completada`, {
          description: `Total: $${res.venta.total.toFixed(2)} (${res.venta.metodoPago})`,
        });
      },
      onError: (err: any) => {
        const msg = err?.message || 'Error al procesar la venta.';
        setSaleErrorMessage(msg);
        toast.error('No se pudo procesar la venta', { description: msg });
      },
    });
  };

  // Atajos de Teclado F-Keys (F2, F4, F8, F9, Esc)
  usePosKeyboardShortcuts({
    onFocusSearch: () => {
      searchInputRef.current?.focus();
    },
    onOpenCustomerSearch: () => {
      setIsCustomerComboboxOpen(true);
    },
    onHoldOrRestoreCart: () => {
      if (cart.length > 0) {
        handleHoldCart();
      } else if (heldCarts.length > 0) {
        handleRestoreHeldCart(heldCarts[0].id);
      }
    },
    onCheckout: () => {
      if (canProceedCheckout) {
        handleCheckout();
      }
    },
    onEscape: () => {
      setSearchQuery('');
      setIsCustomerComboboxOpen(false);
      setIsMobileSheetOpen(false);
    },
    canCheckout: canProceedCheckout,
    isModalOpen: isAbrirCajaOpen || isCreateClienteOpen || isSaleSuccessOpen,
  });

  const cartAndPaymentContent = (
    <>
      <PosCart
        cart={cart}
        totalItemsCount={totalItemsCount}
        onClearCart={handleClearCart}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdatePrice={handleUpdatePrice}
        onToggleOfferMode={handleToggleOfferMode}
        heldCarts={heldCarts}
        onHoldCart={handleHoldCart}
        onRestoreHeldCart={handleRestoreHeldCart}
        onDeleteHeldCart={handleDeleteHeldCart}
      />

      <PosPaymentSection
        clientes={clientes}
        selectedCliente={selectedCliente}
        onSelectCliente={setSelectedCliente}
        onOpenCreateCliente={() => setIsCreateClienteOpen(true)}
        isCustomerComboboxOpen={isCustomerComboboxOpen}
        onCustomerComboboxOpenChange={setIsCustomerComboboxOpen}
        totalCart={totalCart}
        metodoPago={metodoPago}
        onSelectMetodoPago={handleSelectMetodoPago}
        montoRecibido={montoRecibido}
        onMontoRecibidoChange={setMontoRecibido}
        onSetExactCash={handleSetExactCash}
        onAddCash={handleAddCash}
        onClearCash={handleClearCash}
        cambio={cambio}
        isCajaAbierta={isCajaAbierta}
        efectivoSuficiente={efectivoSuficiente}
        isCheckoutPending={createVenta.isPending}
        onCheckout={handleCheckout}
        cartLength={cart.length}
        montoEfectivoMixto={montoEfectivoMixto}
        onMontoEfectivoMixtoChange={setMontoEfectivoMixto}
        montoTarjetaMixto={montoTarjetaMixto}
        onMontoTarjetaMixtoChange={setMontoTarjetaMixto}
        isSplitValid={splitValidation.isValid}
        splitDiff={splitValidation.diff}
        splitChangeOwed={splitValidation.changeOwed}
        onSplitFiftyFifty={handleSplitFiftyFifty}
        onFillRemainingCard={handleFillRemainingCard}
      />
    </>
  );

  return (
    <div className="flex flex-col gap-5 pb-20 lg:pb-0">
      {/* Guardia de Turno de Caja Cerrada */}
      {!isCajaAbierta && (
        <Alert variant="destructive" className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <AlertTitle className="text-xs font-bold text-amber-900 dark:text-amber-100">
                Turno de Caja Cerrado
              </AlertTitle>
              <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
                Para registrar ventas de mostrador y conciliar dinero en efectivo, debes iniciar un turno de caja activo.
              </AlertDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAbrirCajaOpen(true)}
              className="shrink-0 text-xs gap-1.5 rounded-full"
            >
              <Lock className="size-3.5" data-icon="inline-start" />
              <span>Abrir Turno de Caja</span>
            </Button>
          </div>
        </Alert>
      )}

      {/* Avisos de Éxito / Error */}
      {saleSuccessMessage && (
        <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <AlertTitle className="text-xs font-bold">¡Venta Registrada!</AlertTitle>
          <AlertDescription className="text-xs">{saleSuccessMessage}</AlertDescription>
        </Alert>
      )}

      {saleErrorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-xs font-bold">No se pudo cobrar la venta</AlertTitle>
          <AlertDescription className="text-xs">{saleErrorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Layout Principal: Dos Columnas (Catálogo a la izquierda, Carrito a la derecha) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* COLUMNA IZQUIERDA: Catálogo de Variaciones y Servicios (7 cols) */}
        <div className="min-w-0 lg:col-span-7">
          <PosCatalog
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onBarcodeKeyDown={handleBarcodeKeyDown}
            tipoFilter={tipoFilter}
            onTipoFilterChange={setTipoFilter}
            categorias={categorias}
            selectedCategoriaId={selectedCategoriaId}
            onSelectCategoria={setSelectedCategoriaId}
            isLoading={isLoadingVars}
            variaciones={filteredVariaciones}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* COLUMNA DERECHA: Carrito de Compras & Cobro (5 cols en pantallas grandes) */}
        <div className="hidden min-w-0 lg:flex lg:col-span-5 flex-col gap-4">
          <Card className="rounded-xl border-border sticky top-28">
            {cartAndPaymentContent}
          </Card>
        </div>
      </div>

      {/* Barra Inferior y Drawer Deslizable para Móviles y Tabletas (<1024px) */}
      <PosMobileCartSheet
        isOpen={isMobileSheetOpen}
        onOpenChange={setIsMobileSheetOpen}
        totalCart={totalCart}
        totalItemsCount={totalItemsCount}
      >
        <Card className="rounded-xl border-border shadow-none">
          {cartAndPaymentContent}
        </Card>
      </PosMobileCartSheet>

      {/* Modal para Abrir Caja */}
      <AbrirCajaModal
        isOpen={isAbrirCajaOpen}
        onClose={() => setIsAbrirCajaOpen(false)}
      />

      {/* Modal para Crear Cliente rápido */}
      <CreateClienteModal
        isOpen={isCreateClienteOpen}
        onClose={() => setIsCreateClienteOpen(false)}
        onCreated={(newCl) => setSelectedCliente(newCl)}
      />

      {/* Modal de Cierre de Venta con Cambio y Comprobante */}
      <PosSaleSuccessModal
        isOpen={isSaleSuccessOpen}
        onClose={handleCloseSaleSuccess}
        summary={saleSummary}
      />
    </div>
  );
};
