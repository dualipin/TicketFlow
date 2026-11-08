import React, { useState } from 'react';
import { useCorteActivo, useCortes } from '../../queries/corte-caja/queries.ts';
import { useCerrarCorte } from '../../queries/corte-caja/mutations.ts';
import { AbrirCajaModal } from './AbrirCajaModal.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { toast } from '../ui/sonner.tsx';
import {
  DollarSign,
  Landmark,
  Coins,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Plus,
  Store,
  Wrench,
  Clock,
  User,
} from 'lucide-react';

export const CorteCajaView: React.FC = () => {
  const { data: corteActivoData, isLoading: isLoadingActivo } = useCorteActivo();
  const { data: cortesHistory, isLoading: isLoadingHistory } = useCortes();
  const cerrarCorte = useCerrarCorte();

  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [montoRealInput, setMontoRealInput] = useState('');
  const [notasCierre, setNotasCierre] = useState('');
  const [cierreSuccess, setCierreSuccess] = useState<string | null>(null);
  const [cierreError, setCierreError] = useState<string | null>(null);

  const activo = corteActivoData?.activo;
  const corte = corteActivoData?.corte;

  // Calculos en vivo para el arqueo
  const montoReal = montoRealInput.trim() !== '' ? Number(montoRealInput) : null;
  const montoEsperado = corte ? corte.montoCalculado : 0;
  const diferencia = montoReal !== null ? montoReal - montoEsperado : null;

  const handleCerrarTurno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corte || montoReal === null || Number.isNaN(montoReal)) return;

    setCierreError(null);
    setCierreSuccess(null);

    cerrarCorte.mutate(
      {
        id: corte.id,
        input: {
          montoReal,
          notas: notasCierre.trim() || undefined,
        },
      },
      {
        onSuccess: (res) => {
          const msg = `Turno #${res.corte.id} cerrado con éxito. ${res.resumen.resultado}`;
          setCierreSuccess(msg);
          toast.success(`Turno #${res.corte.id} cerrado`, {
            description: res.resumen.resultado,
          });
          setMontoRealInput('');
          setNotasCierre('');
        },
        onError: (err: any) => {
          const msg = err?.message || 'Error al cerrar el turno de caja.';
          setCierreError(msg);
          toast.error('Error al cerrar turno', { description: msg });
        },
      }
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header de la sección */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="size-6 text-primary" />
            Corte de Caja & Arqueo de Turno
          </h1>
          <p className="text-xs text-muted-foreground">
            Control de efectivo en gaveta, conciliación de ventas PdV y cobros de taller.
          </p>
        </div>

        {!activo && (
          <Button
            size="sm"
            onClick={() => setIsAbrirModalOpen(true)}
            className="gap-1.5 rounded-full"
          >
            <Plus className="size-3.5" data-icon="inline-start" />
            <span>Abrir Nuevo Turno</span>
          </Button>
        )}
      </div>

      {cierreSuccess && (
        <Alert variant="default" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <AlertTitle className="text-xs font-semibold">Cierre Completado</AlertTitle>
          <AlertDescription className="text-xs">{cierreSuccess}</AlertDescription>
        </Alert>
      )}

      {cierreError && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-xs font-semibold">Error al Cerrar</AlertTitle>
          <AlertDescription className="text-xs">{cierreError}</AlertDescription>
        </Alert>
      )}

      {/* Panel de Turno Activo */}
      {isLoadingActivo ? (
        <Card className="p-8 flex items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </Card>
      ) : activo && corte ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna Izquierda/Central: Desglose de Dinero Esperado */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="rounded-xl border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-xs">
                      TURNO ACTIVO #{corte.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      Abierto: {formatDate(corte.fechaApertura)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <User className="size-3" />
                    Responsable: <span className="text-foreground font-semibold">{corte.usuario?.nombre || 'Operador'}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex flex-col gap-4">
                {/* 4 Cards de Totales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Landmark className="size-3 text-muted-foreground" />
                      Fondo Inicial
                    </span>
                    <span className="text-base font-bold text-foreground">
                      ${corte.montoInicial.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Store className="size-3 text-emerald-500" />
                      Ventas PdV (Ef.)
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      +${(corte.ventasEfectivo || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Wrench className="size-3 text-sky-500" />
                      Pagos Taller (Ef.)
                    </span>
                    <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                      +${(corte.pagosEfectivo || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-1">
                    <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                      <DollarSign className="size-3" />
                      Efectivo Esperado
                    </span>
                    <span className="text-base font-black text-primary">
                      ${montoEsperado.toFixed(2)}
                    </span>
                  </div>
                </div>

                {corte.notas && (
                  <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    <span className="font-semibold text-foreground">Notas de apertura:</span> {corte.notas}
                  </p>
                )}

                {/* Resumen rápido de transacciones en este corte */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <span>
                      <strong className="text-foreground">{corte.ventas?.length || 0}</strong> ventas registradas
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-foreground">{corte.pagosCobrados?.length || 0}</strong> cobros de taller
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Formulario de Arqueo y Cierre */}
          <div className="flex flex-col gap-4">
            <Card className="rounded-xl border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Lock className="size-4 text-primary" />
                  Arqueo y Cierre de Turno
                </CardTitle>
                <CardDescription className="text-xs">
                  Cuenta el dinero físico en caja e ingrésalo para conciliar diferencias.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleCerrarTurno} className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold">
                      Efectivo Físico Contado ($)
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={montoRealInput}
                        onChange={(e) => setMontoRealInput(e.target.value)}
                        placeholder="Ingresa total contado..."
                        required
                        className="pl-8 text-sm font-bold"
                      />
                      <DollarSign className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    </div>
                  </Field>

                  {/* Indicador en vivo de diferencia */}
                  {diferencia !== null && (
                    <div
                      className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                        diferencia === 0
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : diferencia > 0
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-300'
                          : 'bg-destructive/10 border-destructive/30 text-destructive'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          {diferencia === 0 ? (
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                          ) : diferencia > 0 ? (
                            <ArrowUpRight className="size-3.5 text-sky-500" />
                          ) : (
                            <ArrowDownRight className="size-3.5 text-destructive" />
                          )}
                          {diferencia === 0
                            ? 'Cuadre Exacto'
                            : diferencia > 0
                            ? 'Sobrante en Caja'
                            : 'Faltante en Caja'}
                        </span>
                        <span>
                          {diferencia > 0 ? `+$${diferencia.toFixed(2)}` : `$${diferencia.toFixed(2)}`}
                        </span>
                      </div>
                      <span className="text-[10px] opacity-80">
                        Esperado: ${montoEsperado.toFixed(2)} | Contado: ${montoReal?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <Field>
                    <FieldLabel className="text-xs font-semibold">Notas de Cierre</FieldLabel>
                    <Textarea
                      value={notasCierre}
                      onChange={(e) => setNotasCierre(e.target.value)}
                      placeholder="Observaciones de arqueo o discrepancias..."
                      rows={2}
                      className="text-xs resize-none"
                    />
                  </Field>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={montoReal === null || cerrarCorte.isPending}
                    className="w-full gap-1.5 rounded-full"
                  >
                    {cerrarCorte.isPending && (
                      <Spinner className="size-3.5" data-icon="inline-start" />
                    )}
                    <Lock className="size-3.5" data-icon="inline-start" />
                    <span>Cerrar Turno de Caja</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Estado cuando no hay caja abierta */
        <Card className="p-8 text-center flex flex-col items-center justify-center gap-3 border-dashed border-border/80 bg-muted/10">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Lock className="size-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">No hay un turno de caja abierto</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
              Para registrar ventas de mostrador y conciliar cobros en efectivo, debes iniciar un nuevo turno de caja.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAbrirModalOpen(true)}
            className="gap-1.5 mt-2"
          >
            <Plus className="size-3.5" data-icon="inline-start" />
            <span>Abrir Turno Ahora</span>
          </Button>
        </Card>
      )}

      {/* Historial de Cortes de Caja Previos */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <History className="size-4 text-primary" />
            Historial de Turnos y Arqueos Cerrados
          </h2>
          {cortesHistory && (
            <Badge variant="secondary" className="text-[11px]">
              {cortesHistory.length} turnos
            </Badge>
          )}
        </div>

        <Card className="overflow-hidden rounded-xl border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Turno</th>
                  <th className="px-4 py-2.5">Operador</th>
                  <th className="px-4 py-2.5">Apertura</th>
                  <th className="px-4 py-2.5">Cierre</th>
                  <th className="px-4 py-2.5 text-right">Fondo Inicial</th>
                  <th className="px-4 py-2.5 text-right">Calculado</th>
                  <th className="px-4 py-2.5 text-right">Real Contado</th>
                  <th className="px-4 py-2.5 text-center">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Spinner className="size-5 text-primary mx-auto" />
                    </td>
                  </tr>
                ) : !cortesHistory || cortesHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      No hay registros de cortes de caja en el historial.
                    </td>
                  </tr>
                ) : (
                  cortesHistory.map((c) => {
                    const diff = c.diferencia ?? 0;
                    const isOpen = c.estado === 'ABIERTO';

                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          #{c.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {c.usuario?.nombre || `Usuario #${c.usuarioId}`}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(c.fechaApertura)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {isOpen ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold">
                              EN CURSO
                            </Badge>
                          ) : (
                            formatDate(c.fechaCierre)
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${c.montoInicial.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          ${c.montoCalculado.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {c.montoReal !== null ? `$${c.montoReal.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isOpen ? (
                            <span className="text-muted-foreground text-[11px]">-</span>
                          ) : diff === 0 ? (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                              Cuadrado
                            </Badge>
                          ) : diff > 0 ? (
                            <Badge variant="secondary" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px]">
                              +${diff.toFixed(2)}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              -${Math.abs(diff).toFixed(2)}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal para Abrir Caja */}
      <AbrirCajaModal
        isOpen={isAbrirModalOpen}
        onClose={() => setIsAbrirModalOpen(false)}
      />
    </div>
  );
};
