import React, { useState } from 'react';
import type { CorteCajaActivo } from '../../api/types.ts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Field, FieldLabel, FieldDescription } from '../ui/field.tsx';
import { InputGroup, InputGroupInput, InputGroupAddon } from '../ui/input-group.tsx';
import { DenominacionesTray } from './DenominacionesTray.tsx';
import NumberFlow from '@number-flow/react';
import {
  type ConteoDenominaciones,
  calcularTotalDenominaciones,
  formatearDesgloseDenominaciones,
  formatCurrencyMxn,
  evaluarArqueo,
} from './corte-caja-engine.ts';
import {
  Lock,
  DollarSign,
  RotateCcw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
} from 'lucide-react';

interface ArqueoCajaFormProps {
  corte: CorteCajaActivo;
  isVerificado: boolean;
  onVerificarArqueo: () => void;
  onRecontar: () => void;
  onSolicitarCierre: (data: {
    montoReal: number;
    desgloseTexto: string;
  }) => void;
  isPending: boolean;
}

export const ArqueoCajaForm: React.FC<ArqueoCajaFormProps> = ({
  corte,
  isVerificado,
  onVerificarArqueo,
  onRecontar,
  onSolicitarCierre,
  isPending,
}) => {
  const [modoConteo, setModoConteo] = useState<'denominacion' | 'rapido'>('denominacion');
  const [conteoDenom, setConteoDenom] = useState<ConteoDenominaciones>({});
  const [montoRapidoInput, setMontoRapidoInput] = useState('');

  const montoEsperado = corte.montoCalculado;

  const montoContado =
    modoConteo === 'denominacion'
      ? calcularTotalDenominaciones(conteoDenom)
      : montoRapidoInput.trim() !== ''
      ? Number(montoRapidoInput)
      : null;

  const evalResult = evaluarArqueo({
    montoEsperado,
    montoReal: montoContado,
  });

  const diferencia = evalResult.diferencia;

  const handleCambiarModo = (nuevoModo: 'denominacion' | 'rapido') => {
    if (nuevoModo === 'rapido' && modoConteo === 'denominacion') {
      const sum = calcularTotalDenominaciones(conteoDenom);
      if (sum > 0) setMontoRapidoInput(String(sum));
    }
    setModoConteo(nuevoModo);
  };

  const handleAbrirConfirmacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (montoContado === null || Number.isNaN(montoContado)) return;

    const desgloseTexto =
      modoConteo === 'denominacion' ? formatearDesgloseDenominaciones(conteoDenom) : '';

    onSolicitarCierre({
      montoReal: montoContado,
      desgloseTexto,
    });
  };

  return (
    <Card className="rounded-xl border border-border bg-card">
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Coins className="size-4 text-primary" />
            Conteo Físico en Gaveta
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Conmutador de Modo */}
            <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
              <Button
                type="button"
                variant={modoConteo === 'denominacion' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleCambiarModo('denominacion')}
                className="text-xs font-medium"
              >
                Bandeja de Billetes
              </Button>
              <Button
                type="button"
                variant={modoConteo === 'rapido' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleCambiarModo('rapido')}
                className="text-xs font-medium"
              >
                Total Directo
              </Button>
            </div>

            {/* Total Contado en Vivo */}
            <div className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-mono font-medium text-foreground/90 tabular-nums border border-border/50">
              Contado:{' '}
              <NumberFlow
                value={montoContado ?? 0}
                format={{ style: 'currency', currency: 'MXN' }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4">
        <form onSubmit={handleAbrirConfirmacion} className="flex flex-col gap-4">
          {modoConteo === 'denominacion' ? (
            <DenominacionesTray
              conteo={conteoDenom}
              onChange={setConteoDenom}
              onReset={() => setConteoDenom({})}
            />
          ) : (
            <div className="max-w-md flex flex-col gap-1.5 py-1">
              <Field>
                <FieldLabel htmlFor="monto-real-input" className="text-xs font-semibold">
                  Efectivo Físico Contado ($ MXN)
                </FieldLabel>
                <InputGroup className="h-9">
                  <InputGroupAddon align="inline-start">
                    <DollarSign className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="monto-real-input"
                    type="number"
                    step="0.5"
                    min="0"
                    value={montoRapidoInput}
                    onChange={(e) => setMontoRapidoInput(e.target.value)}
                    placeholder="Total contado en gaveta..."
                    className="font-mono text-sm font-bold"
                    required
                  />
                </InputGroup>
                <FieldDescription className="text-xs text-muted-foreground">
                  Ingresa el importe total acumulado si ya realizaste el conteo fuera del sistema.
                </FieldDescription>
              </Field>
            </div>
          )}

          {/* Resultado de Verificación */}
          {isVerificado && diferencia !== null && (
            <div
              className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                diferencia === 0
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                  : diferencia > 0
                  ? 'border-sky-500/20 bg-sky-500/5 text-sky-700 dark:text-sky-300'
                  : 'border-destructive/20 bg-destructive/5 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                {diferencia === 0 ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                ) : diferencia > 0 ? (
                  <ArrowUpRight className="size-4 text-sky-600 dark:text-sky-400" />
                ) : (
                  <ArrowDownRight className="size-4 text-destructive" />
                )}
                <span>
                  {diferencia === 0
                    ? 'Cuadre Exacto'
                    : diferencia > 0
                    ? 'Sobrante en Gaveta'
                    : 'Faltante en Gaveta'}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  ({diferencia > 0 ? `+${formatCurrencyMxn(diferencia)}` : formatCurrencyMxn(diferencia)})
                </span>
              </div>

              <div className="text-xs font-mono text-muted-foreground">
                Esperado: {formatCurrencyMxn(montoEsperado)}
              </div>
            </div>
          )}

          {/* Botonera de Acción */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
            {!isVerificado ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onVerificarArqueo}
                disabled={montoContado === null || montoContado < 0}
                className="gap-1.5"
              >
                <CheckCircle2 data-icon="inline-start" />
                <span>Verificar Arqueo</span>
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRecontar}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <RotateCcw data-icon="inline-start" />
                  <span>Recontar</span>
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <Lock data-icon="inline-start" />
                  <span>Proceder al Cierre</span>
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
