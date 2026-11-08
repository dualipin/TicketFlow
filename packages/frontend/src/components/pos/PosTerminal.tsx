import React, { useState, useMemo, useRef } from 'react';
import NumberFlow from '@number-flow/react';
import { BorderBeam } from 'border-beam';
import { toast } from '../ui/sonner.tsx';
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
import { AbrirCajaModal } from '../corte-caja/AbrirCajaModal.tsx';
import { CreateClienteModal } from './CreateClienteModal.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Input } from '../ui/input.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group.tsx';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  User,
  UserPlus,
  Lock,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Store,
  Wrench,
} from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: corteActivoData } = useCorteActivo();
  const { data: categorias } = useCategorias();
  const { data: variaciones, isLoading: isLoadingVars } = useVariaciones();
  const { data: clientes } = useClientes();
  const createVenta = useCreateVenta();

  // Estados de control
  const [isAbrirCajaOpen, setIsAbrirCajaOpen] = useState(false);
  const [isCreateClienteOpen, setIsCreateClienteOpen] = useState(false);

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

  // Mensaje de éxito / error tras venta
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);
  const [saleErrorMessage, setSaleErrorMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCajaAbierta = Boolean(corteActivoData?.activo);

  // Totales del carrito
  const totalCart = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.precioUnit * item.cantidad, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.cantidad, 0);
  }, [cart]);

  // Cálculo de cambio en efectivo
  const efectivoNum = montoRecibido.trim() !== '' ? Number(montoRecibido) : 0;
  const cambio = metodoPago === 'EFECTIVO' ? efectivoNum - totalCart : 0;
  const efectivoSuficiente = metodoPago !== 'EFECTIVO' || (efectivoNum >= totalCart && totalCart > 0);

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
  const handleAddToCart = (v: VariacionWithProducto) => {
    setSaleSuccessMessage(null);
    setSaleErrorMessage(null);

    const esServicio = Boolean(v.producto.esServicio);

    // Si es físico y no tiene stock, no permitir
    if (!esServicio && v.stock <= 0) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.variacionId === v.id);

      if (existingIndex >= 0) {
        const item = prevCart[existingIndex];
        // Validar no exceder existencias si es físico
        if (!esServicio && item.cantidad >= v.stock) {
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIndex] = {
          ...item,
          cantidad: item.cantidad + 1,
        };
        return updated;
      }

      // Nuevo ítem
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
      return [...prevCart, newItem];
    });
  };

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
  const handleUpdateQuantity = (variacionId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variacionId === variacionId) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            if (!item.esServicio && newQty > item.stockActual) return item;
            return { ...item, cantidad: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Eliminar ítem
  const handleRemoveItem = (variacionId: number) => {
    setCart((prev) => prev.filter((item) => item.variacionId !== variacionId));
  };

  // Vaciar carrito
  const handleClearCart = () => {
    setCart([]);
    setMontoRecibido('');
    setNotasVenta('');
  };

  // Modificar precio unitario
  const handleUpdatePrice = (variacionId: number, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.variacionId === variacionId) {
          const clamped = Math.max(0, newPrice);
          return {
            ...item,
            precioUnit: clamped,
            isOfferPrice: clamped !== item.precioBase,
          };
        }
        return item;
      })
    );
  };

  // Toggle de precio oferta para físicos
  const handleToggleOfferMode = (variacionId: number) => {
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
  };

  // Atajos rápidos de billetes
  const handleSetQuickCash = (amount: number) => {
    setMontoRecibido(String(amount));
  };

  // Procesar Cobro
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !isCajaAbierta || !efectivoSuficiente) return;

    setSaleErrorMessage(null);
    setSaleSuccessMessage(null);

    const usuarioId = currentUser?.id ?? 1;

    createVenta.mutate(
      {
        usuarioId,
        clienteId: selectedCliente ? selectedCliente.id : null,
        metodoPago,
        notas: notasVenta.trim() || undefined,
        items: cart.map((item) => ({
          variacionId: item.variacionId,
          cantidad: item.cantidad,
          precioUnit: item.precioUnit,
        })),
      },
      {
        onSuccess: (res) => {
          setSaleSuccessMessage(
            `Venta #${res.venta.id} por $${res.venta.total.toFixed(2)} registrada exitosamente.`
          );
          toast.success(`Venta #${res.venta.id} completada`, {
            description: `Total: $${res.venta.total.toFixed(2)} (${res.venta.metodoPago})`,
          });
          handleClearCart();
          setSelectedCliente(null);
        },
        onError: (err: any) => {
          const msg = err?.message || 'Error al procesar la venta.';
          setSaleErrorMessage(msg);
          toast.error('No se pudo procesar la venta', { description: msg });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-5">
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
        {/* =================================================================== */}
        {/* COLUMNA IZQUIERDA: Catálogo de Variaciones y Servicios (7 cols)    */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-4 rounded-xl gap-3">
            <CardContent className="p-0 flex flex-col gap-3">
              {/* Buscador con soporte de escáner de código de barras */}
              <div className="flex items-center gap-2">
                <InputGroup className="h-10 flex-1">
                  <InputGroupAddon align="inline-start">
                    <Barcode className="size-4.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                    placeholder="Escanear código SKU o buscar por nombre (presiona Enter para agregar)..."
                    className="text-sm"
                    autoFocus
                  />
                  {searchQuery && (
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setSearchQuery('')}
                        className="size-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>

              {/* Filtro de Tipo: Todos, Físicos, Servicios */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={tipoFilter === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setTipoFilter('ALL')}
                    className="text-xs h-7.5 px-3"
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={tipoFilter === 'FISICOS' ? 'default' : 'outline'}
                    onClick={() => setTipoFilter('FISICOS')}
                    className="text-xs h-7.5 px-3 gap-1.5"
                  >
                    <Store className="size-3.5" data-icon="inline-start" />
                    <span>Productos Físicos</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={tipoFilter === 'SERVICIOS' ? 'default' : 'outline'}
                    onClick={() => setTipoFilter('SERVICIOS')}
                    className="text-xs h-7.5 px-3 gap-1.5"
                  >
                    <Wrench className="size-3.5" data-icon="inline-start" />
                    <span>Servicios de Taller</span>
                  </Button>
                </div>

                <span className="text-xs text-muted-foreground">
                  {filteredVariaciones.length} artículos
                </span>
              </div>

              {/* Categorías Pills */}
              {categorias && categorias.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedCategoriaId === 'ALL' ? 'secondary' : 'ghost'}
                    onClick={() => setSelectedCategoriaId('ALL')}
                    className="text-xs h-7.5 px-3 shrink-0"
                  >
                    Todas las Categorías
                  </Button>
                  {categorias.map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      size="sm"
                      variant={selectedCategoriaId === cat.id ? 'secondary' : 'ghost'}
                      onClick={() => setSelectedCategoriaId(cat.id)}
                      className="text-xs h-7.5 px-3 shrink-0"
                    >
                      {cat.nombre}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grid de Artículos */}
          {isLoadingVars ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <Spinner className="size-6 text-primary" />
              <span className="text-xs text-muted-foreground">Cargando catálogo...</span>
            </div>
          ) : filteredVariaciones.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No se encontraron artículos con los criterios seleccionados.
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredVariaciones.map((v) => {
                const esServicio = Boolean(v.producto.esServicio);
                const agotado = !esServicio && v.stock <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleAddToCart(v)}
                    disabled={agotado}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group relative ${
                      agotado
                        ? 'opacity-50 cursor-not-allowed bg-muted/20 border-border/40'
                        : 'bg-card hover:border-primary/50 active:scale-[0.98] cursor-pointer border-border'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className="text-xs font-mono text-muted-foreground truncate">
                          {v.codigo}
                        </span>
                        {esServicio ? (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20 shrink-0 font-semibold h-5"
                          >
                            Servicio
                          </Badge>
                        ) : agotado ? (
                          <Badge variant="destructive" className="text-xs px-2 py-0 shrink-0 h-5">
                            Agotado
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0 text-muted-foreground shrink-0 h-5"
                          >
                            {v.stock} disp.
                          </Badge>
                        )}
                      </div>

                      <div className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {v.producto.nombre}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {v.nombre}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                      <span className="text-base font-black text-foreground">
                        ${v.precioBase.toFixed(2)}
                      </span>
                      <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Plus className="size-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* COLUMNA DERECHA: Carrito de Compras & Cobro (5 cols)               */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="rounded-xl border-border sticky top-28">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingCart className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight">Carrito de Venta</CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <NumberFlow value={totalItemsCount} /> {totalItemsCount === 1 ? 'artículo' : 'artículos'}
                    </span>
                  </div>
                </div>

                {cart.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Vaciar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-4">
              {/* Selector de Cliente */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <User className="size-4 text-primary" />
                    Cliente
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateClienteOpen(true)}
                    className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 px-2"
                  >
                    <UserPlus className="size-3.5" data-icon="inline-start" />
                    <span>+ Nuevo</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCliente ? String(selectedCliente.id) : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setSelectedCliente(null);
                      } else {
                        const found = clientes?.find((c) => c.id === Number(val));
                        setSelectedCliente(found || null);
                      }
                    }}
                    className="w-full text-sm rounded-lg border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Público en General</option>
                    {clientes?.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.nombre} {cl.telefono ? `(${cl.telefono})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Ítems del Carrito */}
              {cart.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <ShoppingCart className="size-8 opacity-30 text-muted-foreground" />
                  <span>El carrito está vacío. Agrega productos o servicios del catálogo.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.variacionId}
                      className="p-3 rounded-xl border border-border/60 bg-card flex flex-col gap-2"
                    >
                      {/* Fila 1: Título, SKU y eliminar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">
                            {item.productoNombre}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{item.variacionNombre}</span>
                            <span>•</span>
                            <span className="font-mono text-xs">{item.codigo}</span>
                            {item.esServicio && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0 bg-primary/10 text-primary border-primary/20 h-5">
                                Servicio
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => handleRemoveItem(item.variacionId)}
                          className="size-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {/* Fila 2: Cantidades, Edición de Precio y Subtotal */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                        {/* Control de cantidad */}
                        <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/20">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleUpdateQuantity(item.variacionId, -1)}
                            className="size-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-7 text-center text-sm font-bold text-foreground">
                            {item.cantidad}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleUpdateQuantity(item.variacionId, 1)}
                            disabled={!item.esServicio && item.cantidad >= item.stockActual}
                            className="size-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>

                        {/* Manejo de Precio: Servicio directo, Físico protegido con toggle oferta */}
                        <div className="flex items-center gap-1.5">
                          {item.esServicio ? (
                            /* Servicio: editable directo */
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground font-semibold">$</span>
                              <input
                                type="number"
                                step="10"
                                min="0"
                                value={item.precioUnit}
                                onChange={(e) =>
                                  handleUpdatePrice(item.variacionId, Number(e.target.value))
                                }
                                className="w-16 h-7 text-xs font-semibold px-1.5 rounded-md border border-border/70 bg-background text-right"
                                title="Precio de servicio editable"
                              />
                            </div>
                          ) : (
                            /* Físico: botón de oferta para editar */
                            <div className="flex items-center gap-1">
                              {item.isOfferPrice ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="5"
                                    min="0"
                                    value={item.precioUnit}
                                    onChange={(e) =>
                                      handleUpdatePrice(item.variacionId, Number(e.target.value))
                                    }
                                    className="w-16 h-7 text-xs font-semibold px-1.5 rounded-md border border-amber-500/60 bg-amber-500/10 text-foreground text-right"
                                    title="Precio especial de oferta"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => handleToggleOfferMode(item.variacionId)}
                                    className="size-6 p-0 text-amber-600"
                                    title="Cerrar ajuste de precio"
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-semibold text-foreground">
                                    ${item.precioUnit.toFixed(2)}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => handleToggleOfferMode(item.variacionId)}
                                    className="size-6 p-0 text-muted-foreground hover:text-amber-500"
                                    title="Aplicar precio especial u oferta"
                                  >
                                    <Tag className="size-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Subtotal del renglón */}
                        <div className="text-right">
                          <span className="text-xs font-black text-foreground">
                            ${(item.precioUnit * item.cantidad).toFixed(2)}
                          </span>
                          {item.isOfferPrice && (
                            <span className="text-[9px] text-amber-600 block leading-tight font-medium">
                              Oferta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totales y Métodos de Pago */}
              <div className="pt-3 border-t border-border/50 flex flex-col gap-3">
                {/* Total */}
                <div className="p-4 rounded-[14px] bg-card border border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total a Cobrar</span>
                  <span className="text-2xl font-bold tracking-tight text-primary">
                    <NumberFlow value={totalCart} format={{ style: 'currency', currency: 'USD' }} />
                  </span>
                </div>

                {/* Selector de Método de Pago */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Método de Pago</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO'] as MetodoPagoVenta[]).map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMetodoPago(m);
                            if (m === 'EFECTIVO' && !montoRecibido) {
                              setMontoRecibido(String(totalCart));
                            }
                          }}
                          className={`py-2 px-1 rounded-lg border text-xs font-semibold transition-all ${
                            metodoPago === m
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {m === 'EFECTIVO'
                            ? 'Efectivo'
                            : m === 'TARJETA'
                            ? 'Tarjeta'
                            : m === 'TRANSFERENCIA'
                            ? 'Transf.'
                            : 'Mixto'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Calculadora de Efectivo */}
                {metodoPago === 'EFECTIVO' && totalCart > 0 && (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        Efectivo Recibido
                      </span>
                      {cambio >= 0 ? (
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          Cambio: <NumberFlow value={cambio} format={{ style: 'currency', currency: 'USD' }} />
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-destructive flex items-center gap-1">
                          Faltan: <NumberFlow value={Math.abs(cambio)} format={{ style: 'currency', currency: 'USD' }} />
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        step="10"
                        min="0"
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                        placeholder="Monto entregado por cliente..."
                        className="pl-8 text-base font-bold h-10"
                      />
                      <DollarSign className="absolute left-2.5 top-3 size-4.5 text-muted-foreground" />
                    </div>

                    {/* Botones de denominaciones rápidas */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetQuickCash(totalCart)}
                        className="text-xs h-7.5 flex-1 border-border/70"
                      >
                        Exacto
                      </Button>
                      {[100, 200, 500, 1000].map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetQuickCash(amt)}
                          className="text-xs h-7.5 flex-1 border-border/70"
                        >
                          ${amt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de Cobro Final */}
                <BorderBeam
                  size="pulse-inner"
                  active={createVenta.isPending || (cart.length > 0 && isCajaAbierta && efectivoSuficiente)}
                  theme="auto"
                  className="w-full rounded-full"
                >
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={
                      cart.length === 0 ||
                      !isCajaAbierta ||
                      !efectivoSuficiente ||
                      createVenta.isPending
                    }
                    className="w-full gap-2 font-semibold rounded-full h-11 text-sm shadow-none"
                  >
                    {createVenta.isPending && (
                      <Spinner className="size-4" data-icon="inline-start" />
                    )}
                    <DollarSign className="size-4" data-icon="inline-start" />
                    <span className="flex items-center gap-1.5">
                      Cobrar <NumberFlow value={totalCart} format={{ style: 'currency', currency: 'USD' }} />
                      {metodoPago === 'EFECTIVO' && cambio > 0 && (
                        <span className="opacity-80">
                          (Cambio: <NumberFlow value={cambio} format={{ style: 'currency', currency: 'USD' }} />)
                        </span>
                      )}
                    </span>
                  </Button>
                </BorderBeam>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  );
};
