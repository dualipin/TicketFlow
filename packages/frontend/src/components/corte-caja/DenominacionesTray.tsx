import React, { useRef } from 'react';
import {
  type ConteoDenominaciones,
  type DenominacionMxn,
  calcularTotalDenominaciones,
  formatCurrencyMxn,
} from './corte-caja-engine.ts';
import { Button } from '../ui/button.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import { InputGroup, InputGroupInput, InputGroupAddon } from '../ui/input-group.tsx';
import NumberFlow from '@number-flow/react';
import { RotateCcw, Banknote, Coins } from 'lucide-react';

interface DenominacionesTrayProps {
  conteo: ConteoDenominaciones;
  onChange: (conteo: ConteoDenominaciones) => void;
  onReset: () => void;
}

const BILLETES: DenominacionMxn[] = [1000, 500, 200, 100, 50, 20];
const MONEDAS: DenominacionMxn[] = [10, 5, 2, 1, 0.5];

export const DenominacionesTray: React.FC<DenominacionesTrayProps> = ({
  conteo,
  onChange,
  onReset,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleQtyChange = (denom: DenominacionMxn, rawValue: string) => {
    const cleanStr = rawValue.replace(/\D/g, '');
    const qty = cleanStr === '' ? 0 : parseInt(cleanStr, 10);
    onChange({
      ...conteo,
      [denom]: Math.max(0, qty),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < inputsRef.current.length && inputsRef.current[nextIndex]) {
        inputsRef.current[nextIndex]?.focus();
        inputsRef.current[nextIndex]?.select();
      }
    }
  };

  const totalCalculado = calcularTotalDenominaciones(conteo);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 sm:p-4">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Banknote className="size-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">
            Bandeja de Conteo Físico
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw data-icon="inline-start" />
            Limpiar
          </Button>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary tabular-nums">
            Total:{' '}
            <NumberFlow
              value={totalCalculado}
              format={{ style: 'currency', currency: 'MXN' }}
            />
          </span>
        </div>
      </div>

      {/* Sección Billetes */}
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Banknote className="size-3.5" />
          Billetes
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BILLETES.map((denom, index) => {
            const qty = conteo[denom] || 0;
            const subtotal = denom * qty;
            const globalIndex = index;

            return (
              <Field
                key={denom}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <FieldLabel
                    htmlFor={`denom-${denom}`}
                    className="font-bold text-foreground"
                  >
                    ${denom}
                  </FieldLabel>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {subtotal > 0 ? formatCurrencyMxn(subtotal) : '$0.00'}
                  </span>
                </div>
                <InputGroup className="h-8">
                  <InputGroupInput
                    id={`denom-${denom}`}
                    ref={(el) => {
                      inputsRef.current[globalIndex] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qty === 0 ? '' : String(qty)}
                    onChange={(e) => handleQtyChange(denom, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                    placeholder="0"
                    className="h-8 text-center font-mono text-xs font-semibold"
                  />
                  <InputGroupAddon align="inline-end" className="pr-2 text-xs">
                    pza{qty !== 1 ? 's' : ''}
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            );
          })}
        </div>
      </div>

      {/* Sección Monedas y Morralla */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Coins className="size-3.5" />
          Monedas & Morralla
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {MONEDAS.map((denom, index) => {
            const qty = conteo[denom] || 0;
            const subtotal = Math.round(denom * qty * 100) / 100;
            const globalIndex = BILLETES.length + index;
            const labelStr = denom === 0.5 ? '$0.50' : `$${denom}`;

            return (
              <Field
                key={denom}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <FieldLabel
                    htmlFor={`denom-${denom}`}
                    className="font-bold text-foreground"
                  >
                    {labelStr}
                  </FieldLabel>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {subtotal > 0 ? formatCurrencyMxn(subtotal) : '$0.00'}
                  </span>
                </div>
                <InputGroup className="h-8">
                  <InputGroupInput
                    id={`denom-${denom}`}
                    ref={(el) => {
                      inputsRef.current[globalIndex] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qty === 0 ? '' : String(qty)}
                    onChange={(e) => handleQtyChange(denom, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                    placeholder="0"
                    className="h-8 text-center font-mono text-xs font-semibold"
                  />
                  <InputGroupAddon align="inline-end" className="pr-1.5 text-xs">
                    pza
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            );
          })}
        </div>
      </div>
    </div>
  );
};
