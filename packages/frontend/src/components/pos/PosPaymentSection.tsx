import React from 'react';
import NumberFlow from '@number-flow/react';
import { BorderBeam } from 'border-beam';
import type { Cliente, MetodoPagoVenta } from '../../api/types.ts';
import { CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { User, UserPlus, DollarSign, CreditCard, Banknote, Split, CheckCircle2, AlertCircle } from 'lucide-react';

interface PosPaymentSectionProps {
  clientes: Cliente[] | undefined;
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente | null) => void;
  onOpenCreateCliente: () => void;
  totalCart: number;
  metodoPago: MetodoPagoVenta;
  onSelectMetodoPago: (m: MetodoPagoVenta) => void;
  montoRecibido: string;
  onMontoRecibidoChange: (val: string) => void;
  onSetQuickCash: (amount: number) => void;
  cambio: number;
  isCajaAbierta: boolean;
  efectivoSuficiente: boolean;
  isCheckoutPending: boolean;
  onCheckout: (e: React.FormEvent) => void;
  cartLength: number;
  // Campos de Pago Mixto
  montoEfectivoMixto: string;
  onMontoEfectivoMixtoChange: (val: string) => void;
  montoTarjetaMixto: string;
  onMontoTarjetaMixtoChange: (val: string) => void;
  isSplitValid: boolean;
  splitDiff: number;
  splitChangeOwed: number;
  onSplitFiftyFifty: () => void;
  onFillRemainingCard: () => void;
}

export const PosPaymentSection: React.FC<PosPaymentSectionProps> = ({
  clientes,
  selectedCliente,
  onSelectCliente,
  onOpenCreateCliente,
  totalCart,
  metodoPago,
  onSelectMetodoPago,
  montoRecibido,
  onMontoRecibidoChange,
  onSetQuickCash,
  cambio,
  isCajaAbierta,
  efectivoSuficiente,
  isCheckoutPending,
  onCheckout,
  cartLength,
  montoEfectivoMixto,
  onMontoEfectivoMixtoChange,
  montoTarjetaMixto,
  onMontoTarjetaMixtoChange,
  isSplitValid,
  splitDiff,
  splitChangeOwed,
  onSplitFiftyFifty,
  onFillRemainingCard,
}) => {
  const isMixto = metodoPago === 'MIXTO';
  const canProceedCheckout =
    cartLength > 0 &&
    isCajaAbierta &&
    !isCheckoutPending &&
    (isMixto ? isSplitValid : efectivoSuficiente);

  return (
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
            onClick={onOpenCreateCliente}
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
                onSelectCliente(null);
              } else {
                const found = clientes?.find((c) => c.id === Number(val));
                onSelectCliente(found || null);
              }
            }}
            aria-label="Seleccionar cliente para la venta"
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

      {/* Totales y Métodos de Pago */}
      <div className="pt-3 border-t border-border/50 flex flex-col gap-3">
        {/* Total a Cobrar */}
        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Total a Cobrar</span>
          <span className="text-2xl font-bold tracking-tight text-primary">
            <NumberFlow value={totalCart} format={{ style: 'currency', currency: 'USD' }} />
          </span>
        </div>

        {/* Selector de Método de Pago */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground">Método de Pago</span>
          <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Método de pago">
            {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO'] as MetodoPagoVenta[]).map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={metodoPago === m}
                  onClick={() => {
                    onSelectMetodoPago(m);
                    if (m === 'EFECTIVO' && !montoRecibido) {
                      onMontoRecibidoChange(String(totalCart));
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

        {/* Calculadora de Efectivo Normal */}
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
                onChange={(e) => onMontoRecibidoChange(e.target.value)}
                placeholder="Monto entregado por cliente..."
                className="pl-8 text-base font-bold h-10"
                aria-label="Monto de efectivo entregado por el cliente"
              />
              <DollarSign className="absolute left-2.5 top-3 size-4.5 text-muted-foreground" />
            </div>

            {/* Botones de denominaciones rápidas */}
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSetQuickCash(totalCart)}
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
                  onClick={() => onSetQuickCash(amt)}
                  className="text-xs h-7.5 flex-1 border-border/70"
                >
                  ${amt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Calculadora Dual-Tender para PAGO MIXTO */}
        {isMixto && totalCart > 0 && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Split className="size-3.5 text-primary" />
                Desglose de Pago Dividido
              </span>
              {isSplitValid ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Cubierto 100%
                </span>
              ) : splitDiff > 0 ? (
                <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  Faltan: ${splitDiff.toFixed(2)}
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  Excede: ${Math.abs(splitDiff).toFixed(2)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Campo Efectivo */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Banknote className="size-3 text-primary" />
                  Efectivo ($)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="10"
                    min="0"
                    value={montoEfectivoMixto}
                    onChange={(e) => onMontoEfectivoMixtoChange(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 text-sm font-bold h-9"
                    aria-label="Porción en efectivo del pago mixto"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-semibold">
                    $
                  </span>
                </div>
              </div>

              {/* Campo Tarjeta / Transferencia */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <CreditCard className="size-3 text-primary" />
                  Tarjeta / Transf. ($)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="10"
                    min="0"
                    value={montoTarjetaMixto}
                    onChange={(e) => onMontoTarjetaMixtoChange(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 text-sm font-bold h-9"
                    aria-label="Porción en tarjeta o transferencia del pago mixto"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-semibold">
                    $
                  </span>
                </div>
              </div>
            </div>

            {/* Atajos de división rápida */}
            <div className="flex items-center gap-1.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSplitFiftyFifty}
                className="text-xs h-7 flex-1 border-border/70"
              >
                50% / 50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFillRemainingCard}
                className="text-xs h-7 flex-1 border-border/70"
              >
                Restante en Tarjeta
              </Button>
            </div>

            {/* Si el efectivo entregado supera la parte en efectivo, mostrar cambio */}
            {isSplitValid && splitChangeOwed > 0 && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>Cambio en efectivo a entregar:</span>
                <span className="font-mono font-bold text-sm">
                  ${splitChangeOwed.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Botón de Cobro Final */}
        <BorderBeam
          size="pulse-inner"
          active={isCheckoutPending || canProceedCheckout}
          theme="auto"
          className="w-full rounded-full"
        >
          <Button
            type="button"
            size="lg"
            onClick={onCheckout}
            disabled={!canProceedCheckout}
            className="w-full gap-2 font-semibold rounded-full h-11 text-sm shadow-none"
          >
            {isCheckoutPending && (
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
              {isMixto && isSplitValid && (
                <span className="opacity-80 text-xs font-normal">
                  (Mixto)
                </span>
              )}
            </span>
          </Button>
        </BorderBeam>
      </div>
    </CardContent>
  );
};
