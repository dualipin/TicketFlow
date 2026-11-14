import React, { useRef } from 'react';
import NumberFlow from '@number-flow/react';
import { BorderBeam } from 'border-beam';
import type { Cliente, MetodoPagoVenta } from '../../api/types.ts';
import { CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { PosCustomerCombobox } from './PosCustomerCombobox.tsx';
import { DollarSign, CreditCard, Banknote, Split, CheckCircle2, AlertCircle } from 'lucide-react';

interface PosPaymentSectionProps {
  clientes: Cliente[] | undefined;
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente | null) => void;
  onOpenCreateCliente: () => void;
  isCustomerComboboxOpen?: boolean;
  onCustomerComboboxOpenChange?: (open: boolean) => void;
  totalCart: number;
  metodoPago: MetodoPagoVenta;
  onSelectMetodoPago: (m: MetodoPagoVenta) => void;
  montoRecibido: string;
  onMontoRecibidoChange: (val: string) => void;
  onSetExactCash: (amount: number) => void;
  onAddCash: (amount: number) => void;
  onClearCash: () => void;
  cambio: number;
  isCajaAbierta: boolean;
  efectivoSuficiente: boolean;
  isCheckoutPending: boolean;
  onCheckout: (e?: React.FormEvent) => void;
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

const PAYMENT_METHODS: Array<{ id: MetodoPagoVenta; label: string }> = [
  { id: 'EFECTIVO', label: 'Efectivo' },
  { id: 'TARJETA', label: 'Tarjeta' },
  { id: 'TRANSFERENCIA', label: 'Transf.' },
  { id: 'MIXTO', label: 'Mixto' },
];

export const PosPaymentSection: React.FC<PosPaymentSectionProps> = ({
  clientes,
  selectedCliente,
  onSelectCliente,
  onOpenCreateCliente,
  isCustomerComboboxOpen,
  onCustomerComboboxOpenChange,
  totalCart,
  metodoPago,
  onSelectMetodoPago,
  montoRecibido,
  onMontoRecibidoChange,
  onSetExactCash,
  onAddCash,
  onClearCash,
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

  const radioGroupRef = useRef<HTMLDivElement>(null);

  const handleRadioKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % PAYMENT_METHODS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + PAYMENT_METHODS.length) % PAYMENT_METHODS.length;
    } else {
      return;
    }

    const nextMethod = PAYMENT_METHODS[nextIndex].id;
    onSelectMetodoPago(nextMethod);
    if (nextMethod === 'EFECTIVO' && !montoRecibido) {
      onMontoRecibidoChange(String(totalCart));
    }

    const buttons = radioGroupRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
    buttons?.[nextIndex]?.focus();
  };

  return (
    <CardContent className="pt-4 flex flex-col gap-4">
      {/* Combobox Accesible de Cliente */}
      <PosCustomerCombobox
        clientes={clientes}
        selectedCliente={selectedCliente}
        onSelectCliente={onSelectCliente}
        onOpenCreateCliente={onOpenCreateCliente}
        isOpen={isCustomerComboboxOpen}
        onOpenChange={onCustomerComboboxOpenChange}
      />

      {/* Totales y Métodos de Pago */}
      <div className="pt-3 border-t border-border/50 flex flex-col gap-3">
        {/* Total a Cobrar */}
        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Total a Cobrar</span>
          <span className="text-2xl font-bold tracking-tight text-primary">
            <NumberFlow value={totalCart} format={{ style: 'currency', currency: 'USD' }} />
          </span>
        </div>

        {/* Selector de Método de Pago Accesible */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground" id="payment-method-label">
            Método de Pago
          </span>
          <div
            ref={radioGroupRef}
            className="grid grid-cols-4 gap-1.5"
            role="radiogroup"
            aria-labelledby="payment-method-label"
          >
            {PAYMENT_METHODS.map((pm, idx) => {
              const isSelected = metodoPago === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onKeyDown={(e) => handleRadioKeyDown(e, idx)}
                  onClick={() => {
                    onSelectMetodoPago(pm.id);
                    if (pm.id === 'EFECTIVO' && !montoRecibido) {
                      onMontoRecibidoChange(String(totalCart));
                    }
                  }}
                  className={`h-10 px-2 rounded-lg border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pm.label}
                </button>
              );
            })}
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
              <DollarSign className="absolute left-2.5 top-3 size-4 text-muted-foreground" />
            </div>

            {/* Botones de denominaciones rápidas y acumulativas */}
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSetExactCash(totalCart)}
                className="text-xs h-9 flex-1 min-w-[54px] border-border/70"
                title="Pagar con monto exacto"
                aria-label="Asignar monto exacto"
              >
                Exacto
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearCash}
                className="text-xs h-9 px-2.5 border-border/70 text-muted-foreground hover:text-foreground font-mono"
                title="Limpiar efectivo recibido a cero"
                aria-label="Limpiar efectivo recibido"
              >
                C
              </Button>
              {[100, 200, 500, 1000].map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddCash(amt)}
                  className="text-xs h-9 flex-1 min-w-[48px] border-border/70 font-mono"
                  title={`Sumar billete de $${amt} al efectivo recibido`}
                  aria-label={`Sumar billete de ${amt} pesos`}
                >
                  +${amt}
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
                    className="pl-7 md:text-sm font-bold h-9"
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
                    className="pl-7 md:text-sm font-bold h-9"
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
                className="text-xs h-9 flex-1 border-border/70"
                aria-label="Dividir 50% en efectivo y 50% en tarjeta"
              >
                50% / 50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFillRemainingCard}
                className="text-xs h-9 flex-1 border-border/70"
                aria-label="Asignar monto restante a tarjeta o transferencia"
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
            aria-label={`Cobrar venta por ${totalCart} pesos`}
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
            <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-xs font-mono font-medium rounded bg-primary-foreground/20 text-primary-foreground">
              F9
            </kbd>
          </Button>
        </BorderBeam>
      </div>
    </CardContent>
  );
};
