import React from 'react';
import NumberFlow from '@number-flow/react';
import type { CartItem } from '../../api/types.ts';
import type { HeldCart } from './pos-engine.ts';
import { CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../ui/popover.tsx';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../ui/empty.tsx';
import { ShoppingCart, Minus, Plus, Trash2, Tag, Clock, Play, X } from 'lucide-react';

interface PosCartProps {
  cart: CartItem[];
  totalItemsCount: number;
  onClearCart: () => void;
  onRemoveItem: (variacionId: number) => void;
  onUpdateQuantity: (variacionId: number, delta: number) => void;
  onUpdatePrice: (variacionId: number, newPrice: number) => void;
  onToggleOfferMode: (variacionId: number) => void;
  heldCarts: HeldCart[];
  onHoldCart: () => void;
  onRestoreHeldCart: (holdId: string) => void;
  onDeleteHeldCart: (holdId: string) => void;
}

export const PosCart: React.FC<PosCartProps> = ({
  cart,
  totalItemsCount,
  onClearCart,
  onRemoveItem,
  onUpdateQuantity,
  onUpdatePrice,
  onToggleOfferMode,
  heldCarts,
  onHoldCart,
  onRestoreHeldCart,
  onDeleteHeldCart,
}) => {
  return (
    <>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                Carrito de Venta
              </CardTitle>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <NumberFlow value={totalItemsCount} />{' '}
                {totalItemsCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Indicador y Popover de Cuentas en Espera */}
            {heldCarts.length > 0 && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                      title="Ver tickets en espera"
                      aria-label={`Ver ${heldCarts.length} tickets en espera`}
                    >
                      <Clock className="size-3.5" data-icon="inline-start" />
                      <span>Espera ({heldCarts.length})</span>
                    </Button>
                  }
                />
                <PopoverContent align="end" className="w-80 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      Tickets en Espera
                    </span>
                    <Badge variant="secondary" className="text-xs py-0 h-4 px-1.5">
                      {heldCarts.length} / 5
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 max-h-60 overflow-y-auto">
                    {heldCarts.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-xs text-foreground block truncate">
                              {h.selectedCliente?.nombre || 'Público en General'}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {h.items.length} arts • <strong className="font-mono text-foreground">${h.total.toFixed(2)}</strong>
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDeleteHeldCart(h.id)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            title="Descartar ticket en espera"
                            aria-label={`Descartar ticket en espera de ${h.selectedCliente?.nombre || 'Público en General'}`}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onRestoreHeldCart(h.id)}
                          className="h-8 text-xs font-semibold gap-1 text-primary hover:bg-primary/10 w-full"
                          aria-label={`Recuperar carrito de ${h.selectedCliente?.nombre || 'Público en General'}`}
                        >
                          <Play className="size-3" data-icon="inline-start" />
                          <span>Recuperar a Caja</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {cart.length > 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onHoldCart}
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  title="Pausar venta actual para atender a otro cliente [F8]"
                  aria-label="Poner venta actual en espera"
                >
                  <Clock className="size-3.5" data-icon="inline-start" />
                  <span className="hidden sm:inline">Pausar</span>
                  <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs font-mono rounded bg-muted text-muted-foreground border border-border/60">
                    F8
                  </kbd>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearCart}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  title="Vaciar carrito"
                  aria-label="Vaciar todos los artículos del carrito"
                >
                  Vaciar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Lista de Ítems del Carrito */}
      {cart.length === 0 ? (
        <Empty className="my-4 py-10 border-0 bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingCart className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>El carrito está vacío</EmptyTitle>
            <EmptyDescription>
              Agrega productos o servicios del catálogo o escanea con el lector.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 bg-primary/10 text-primary border-primary/20 h-5"
                      >
                        Servicio
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.variacionId)}
                  className="size-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  title="Eliminar del carrito"
                  aria-label={`Eliminar ${item.productoNombre} del carrito`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {/* Fila 2: Cantidades, Edición de Precio y Subtotal */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                {/* Control de cantidad con dimensiones táctiles >= 36px */}
                <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/20">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.variacionId, -1)}
                    className="size-9 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Disminuir cantidad de ${item.productoNombre}`}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold text-foreground">
                    {item.cantidad}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.variacionId, 1)}
                    disabled={!item.esServicio && item.cantidad >= item.stockActual}
                    className="size-9 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Aumentar cantidad de ${item.productoNombre}`}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {/* Manejo de Precio: Servicio directo, Físico protegido con toggle oferta */}
                <div className="flex items-center gap-1.5">
                  {item.esServicio ? (
                    /* Servicio: editable directo */
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-semibold">$</span>
                      <input
                        type="number"
                        step="10"
                        min="0"
                        value={item.precioUnit}
                        onChange={(e) =>
                          onUpdatePrice(item.variacionId, Number(e.target.value))
                        }
                        className="w-20 h-9 text-base md:text-xs font-semibold px-2 rounded-md border border-border/70 bg-background text-right"
                        title="Precio de servicio editable"
                        aria-label={`Precio unitario para servicio ${item.productoNombre}`}
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
                              onUpdatePrice(item.variacionId, Number(e.target.value))
                            }
                            className="w-20 h-9 text-base md:text-xs font-semibold px-2 rounded-md border border-amber-500/60 bg-amber-500/10 text-foreground text-right"
                            title="Precio especial de oferta"
                            aria-label={`Precio especial para ${item.productoNombre}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleOfferMode(item.variacionId)}
                            className="size-9 p-0 text-amber-600"
                            title="Cerrar ajuste de precio"
                            aria-label="Cerrar ajuste de precio"
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
                            size="sm"
                            onClick={() => onToggleOfferMode(item.variacionId)}
                            className="size-9 p-0 text-muted-foreground hover:text-amber-500"
                            title="Aplicar precio especial u oferta"
                            aria-label={`Aplicar precio especial u oferta para ${item.productoNombre}`}
                          >
                            <Tag className="size-3.5" />
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
                    <span className="text-xs text-amber-600 block leading-tight font-medium">
                      Oferta
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
