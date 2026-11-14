import React, { useRef } from 'react';
import {
  type ConteoDenominaciones,
  type DenominacionMxn,
  formatCurrencyMxn,
} from './corte-caja-engine.ts';
import { Button } from '../ui/button.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import { InputGroup, InputGroupInput, InputGroupAddon } from '../ui/input-group.tsx';
import { RotateCcw } from 'lucide-react';

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
      } else {
        inputsRef.current[currentIndex]?.blur();
      }
    }
  };

  const hasItems = Object.values(conteo).some((q) => typeof q === 'number' && q > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Sección Billetes */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Billetes
          </span>
          {hasItems && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw data-icon="inline-start" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {BILLETES.map((denom, index) => {
            const qty = conteo[denom] || 0;
            const subtotal = denom * qty;
            const globalIndex = index;

            return (
              <Field key={denom} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <FieldLabel
                    htmlFor={`denom-${denom}`}
                    className="font-semibold text-foreground/90"
                  >
                    ${denom}
                  </FieldLabel>
                  <span className={`font-mono text-xs tabular-nums ${subtotal > 0 ? 'text-foreground/80 font-medium' : 'text-muted-foreground/60'}`}>
                    {subtotal > 0 ? formatCurrencyMxn(subtotal) : '—'}
                  </span>
                </div>
                <InputGroup className="h-9">
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
                    className="h-9 text-center font-mono font-semibold"
                  />
                  <InputGroupAddon align="inline-end" className="pr-2 text-xs text-muted-foreground/70">
                    pz
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            );
          })}
        </div>
      </div>

      {/* Sección Monedas */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Monedas & Morralla
        </span>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {MONEDAS.map((denom, index) => {
            const qty = conteo[denom] || 0;
            const subtotal = Math.round(denom * qty * 100) / 100;
            const globalIndex = BILLETES.length + index;
            const labelStr = denom === 0.5 ? '$0.50' : `$${denom}`;

            return (
              <Field key={denom} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <FieldLabel
                    htmlFor={`denom-${denom}`}
                    className="font-semibold text-foreground/90"
                  >
                    {labelStr}
                  </FieldLabel>
                  <span className={`font-mono text-xs tabular-nums ${subtotal > 0 ? 'text-foreground/80 font-medium' : 'text-muted-foreground/60'}`}>
                    {subtotal > 0 ? formatCurrencyMxn(subtotal) : '—'}
                  </span>
                </div>
                <InputGroup className="h-9">
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
                    className="h-9 text-center font-mono font-semibold"
                  />
                  <InputGroupAddon align="inline-end" className="pr-1.5 text-xs text-muted-foreground/70">
                    pz
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
