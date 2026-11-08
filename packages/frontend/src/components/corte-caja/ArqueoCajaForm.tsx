import React, { useState } from 'react';
import type { CorteCajaActivo } from '../../api/types.ts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
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
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

interface ArqueoCajaFormProps {
  corte: CorteCajaActivo;
  isAdmin: boolean;
  isBlindCountActive: boolean;
  adminShowExpected: boolean;
  onToggleAdminShowExpected: () => void;
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
  isAdmin,
  isBlindCountActive,
  adminShowExpected,
  onToggleAdminShowExpected,
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

  // Monto contado según el modo activo
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
    <div className="flex flex-col gap-4">
      <Card className="rounded-xl border border-border bg-card">
        <CardHeader className="border-b border-border/50 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Lock className="size-4 text-primary" />
                Arqueo & Conciliación de Efectivo
              </CardTitle>
              <CardDescription className="text-xs">
                Cuenta el dinero físico en gaveta para contrastar contra el saldo esperado del sistema.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={onToggleAdminShowExpected}
                  className="text-xs"
                >
                  {adminShowExpected ? (
                    <>
                      <EyeOff data-icon="inline-start" />
                      Ocultar Esperado (Admin)
                    </>
                  ) : (
                    <>
                      <Eye data-icon="inline-start" />
                      Revelar Esperado (Admin)
                    </>
                  )}
                </Button>
              )}

              {isBlindCountActive && (
                <Badge
                  variant="outline"
                  className="h-6 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-semibold gap-1"
                >
                  <ShieldCheck className="size-3" />
                  Arqueo Ciego Activo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 flex flex-col gap-4">
          {/* Conmutador de Modo de Conteo */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/30 p-1">
              <Button
                type="button"
                variant={modoConteo === 'denominacion' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => handleCambiarModo('denominacion')}
                className="text-xs font-medium"
              >
                <Coins data-icon="inline-start" />
                Por Denominación (Recomendado)
              </Button>
              <Button
                type="button"
                variant={modoConteo === 'rapido' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => handleCambiarModo('rapido')}
                className="text-xs font-medium"
              >
                <Calculator data-icon="inline-start" />
                Conteo Rápido (Total directo)
              </Button>
            </div>

            {montoContado !== null && montoContado > 0 && (
              <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                Total Contado:{' '}
                <NumberFlow
                  value={montoContado}
                  format={{ style: 'currency', currency: 'MXN' }}
                />
              </span>
            )}
          </div>

          <form onSubmit={handleAbrirConfirmacion} className="flex flex-col gap-4">
            {/* Modo 1: Bandeja de Billetes y Monedas */}
            {modoConteo === 'denominacion' ? (
              <DenominacionesTray
                conteo={conteoDenom}
                onChange={setConteoDenom}
                onReset={() => setConteoDenom({})}
              />
            ) : (
              /* Modo 2: Conteo Rápido Directo */
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
                    placeholder="Ingresa total contado en gaveta..."
                    className="font-mono text-sm font-bold"
                    required
                  />
                </InputGroup>
              </Field>
            )}

            {/* Fase de Verificación: Al pulsar Verificar Arqueo */}
            {isVerificado && diferencia !== null && (
              <div
                className={`flex flex-col gap-1.5 rounded-xl border p-3 transition-all ${
                  diferencia === 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                    : diferencia > 0
                    ? 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    {diferencia === 0 ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : diferencia > 0 ? (
                      <ArrowUpRight className="size-4 text-sky-500" />
                    ) : (
                      <ArrowDownRight className="size-4 text-destructive" />
                    )}
                    {diferencia === 0
                      ? 'Cuadre Exacto de Caja'
                      : diferencia > 0
                      ? 'Sobrante en Gaveta'
                      : 'Faltante en Gaveta'}
                  </span>
                  <span className="font-mono text-sm font-black tabular-nums">
                    {diferencia > 0
                      ? `+${formatCurrencyMxn(diferencia)}`
                      : formatCurrencyMxn(diferencia)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs opacity-90 font-mono">
                  <span>Esperado: {formatCurrencyMxn(montoEsperado)}</span>
                  <span>Contado: {formatCurrencyMxn(montoContado ?? 0)}</span>
                </div>
              </div>
            )}

            {/* Botonera de Acción según fase de verificación */}
            <div className="flex items-center gap-2 pt-1">
              {!isVerificado ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onVerificarArqueo}
                  disabled={montoContado === null || montoContado < 0}
                  className="w-full gap-1.5"
                >
                  <CheckCircle2 data-icon="inline-start" />
                  <span>Verificar Arqueo contra Sistema</span>
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
                    <span>Recontar Gaveta</span>
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={isPending}
                    className="flex-1 gap-1.5"
                  >
                    <Lock data-icon="inline-start" />
                    <span>Proceder al Cierre de Turno</span>
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
