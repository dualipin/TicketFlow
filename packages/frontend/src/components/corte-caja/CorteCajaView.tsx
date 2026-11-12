import React, { useState } from 'react';
import type { CorteCaja, CorteCajaActivo } from '../../api/types.ts';
import { useCorteActivo, useCortes } from '../../queries/corte-caja/queries.ts';
import { useCerrarCorte } from '../../queries/corte-caja/mutations.ts';
import { useAuth } from '../../lib/auth-context.tsx';
import { AbrirCajaModal } from './AbrirCajaModal.tsx';
import { ArqueoCajaForm } from './ArqueoCajaForm.tsx';
import { ConfirmarCierreModal } from './ConfirmarCierreModal.tsx';
import { CorteZTicketModal } from './CorteZTicketModal.tsx';
import { HistorialCortesTable } from './HistorialCortesTable.tsx';
import { Card, CardHeader, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '../ui/empty.tsx';
import { toast } from 'sonner';
import NumberFlow from '@number-flow/react';
import { formatFechaCorte } from './corte-caja-engine.ts';
import {
  DollarSign,
  Landmark,
  Coins,
  History,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Store,
  Wrench,
  Clock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export const CorteCajaView: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.rol === 'ADMIN';

  const { data: corteActivoData, isLoading: isLoadingActivo } = useCorteActivo();
  const { data: cortesHistory, isLoading: isLoadingHistory } = useCortes();
  const cerrarCorte = useCerrarCorte();

  // Modales
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [isConfirmarModalOpen, setIsConfirmarModalOpen] = useState(false);
  const [isCorteZModalOpen, setIsCorteZModalOpen] = useState(false);

  // Estado de arqueo ciego y verificación
  const [isVerificado, setIsVerificado] = useState(false);
  const [adminShowExpected, setAdminShowExpected] = useState(isAdmin);

  // Estados de cierre y comprobante
  const [datosCierrePendiente, setDatosCierrePendiente] = useState<{
    montoReal: number;
    desgloseTexto: string;
  } | null>(null);

  const [corteParaTicket, setCorteParaTicket] = useState<CorteCaja | CorteCajaActivo | null>(null);
  const [cierreSuccessMsg, setCierreSuccessMsg] = useState<string | null>(null);
  const [cierreErrorMsg, setCierreErrorMsg] = useState<string | null>(null);

  const activo = corteActivoData?.activo;
  const corte = corteActivoData?.corte;

  const isBlindCountActive = !isAdmin ? !isVerificado : !adminShowExpected && !isVerificado;
  const ultimoCorteCerrado = cortesHistory?.find((c) => c.estado === 'CERRADO') ?? null;

  const handleSolicitarCierre = (data: {
    montoReal: number;
    desgloseTexto: string;
  }) => {
    setDatosCierrePendiente(data);
    setIsConfirmarModalOpen(true);
  };

  const handleConfirmarCierreFinal = (notasFinales: string) => {
    if (!corte || !datosCierrePendiente) return;

    setCierreErrorMsg(null);
    setCierreSuccessMsg(null);

    cerrarCorte.mutate(
      {
        id: corte.id,
        input: {
          montoReal: datosCierrePendiente.montoReal,
          notas: notasFinales || undefined,
        },
      },
      {
        onSuccess: (res) => {
          const msg = `Turno #${res.corte.id} cerrado con éxito. ${res.resumen.resultado}`;
          setCierreSuccessMsg(msg);
          toast.success(`Turno #${res.corte.id} cerrado`, {
            description: res.resumen.resultado,
          });

          setIsConfirmarModalOpen(false);
          setDatosCierrePendiente(null);

          // Desplegar automáticamente el ticket de Corte Z
          setCorteParaTicket({
            ...res.corte,
            ventasEfectivo: res.resumen.ventasEfectivo,
            pagosEfectivo: res.resumen.pagosEfectivo,
          });
          setIsCorteZModalOpen(true);
        },
        onError: (err: any) => {
          const msg = err?.message || 'Error al cerrar el turno de caja.';
          setCierreErrorMsg(msg);
          toast.error('Error al cerrar turno', { description: msg });
        },
      }
    );
  };

  const handleSelectCorteZ = (corteItem: CorteCaja) => {
    setCorteParaTicket(corteItem);
    setIsCorteZModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header de la sección */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="size-6 text-primary" />
            Corte de Caja
          </h1>
          <p className="text-xs text-muted-foreground">
            Control de efectivo en gaveta, conciliación de ventas PdV y cobros de taller.
          </p>
        </div>

        {!activo && (
          <Button
            size="sm"
            onClick={() => setIsAbrirModalOpen(true)}
            className="gap-1.5"
          >
            <Plus data-icon="inline-start" />
            <span>Abrir Nuevo Turno</span>
          </Button>
        )}
      </div>

      {cierreSuccessMsg && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="text-xs font-semibold">Cierre Completado</AlertTitle>
          <AlertDescription className="text-xs">{cierreSuccessMsg}</AlertDescription>
        </Alert>
      )}

      {cierreErrorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-xs font-semibold">Error al Cerrar</AlertTitle>
          <AlertDescription className="text-xs">{cierreErrorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Vista Operativa de Turno Activo */}
      {isLoadingActivo ? (
        <Card className="p-8 flex items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </Card>
      ) : activo && corte ? (
        <div className="flex flex-col gap-5">
          {/* Tira Resumen de Telemetría */}
          <Card className="rounded-xl border border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant="secondary"
                    className="h-5 border border-border/60 px-2 text-xs font-medium text-foreground/85"
                  >
                    Turno #{corte.id}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatFechaCorte(corte.fechaApertura)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <User className="size-3" />
                    {corte.usuario?.nombre || 'Operador'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setAdminShowExpected(!adminShowExpected)}
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
                      className="h-6 border-border/80 bg-muted/40 text-muted-foreground text-xs font-medium gap-1.5"
                    >
                      <ShieldCheck className="size-3 text-muted-foreground" />
                      Arqueo Ciego
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-3">
              {/* Tira Métrica Unificada con Divisores Hairline Sub-píxel 2x2 en móvil y 4x1 en desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 rounded-xl border border-border/70 overflow-hidden">
                <div className="bg-card p-3.5 flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Landmark className="size-3.5 text-muted-foreground" />
                    Fondo Inicial
                  </span>
                  <span className="text-sm font-semibold text-foreground font-mono tabular-nums">
                    <NumberFlow
                      value={corte.montoInicial}
                      format={{ style: 'currency', currency: 'MXN' }}
                    />
                  </span>
                </div>

                <div className="bg-card p-3.5 flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Store className="size-3.5 text-muted-foreground" />
                    Ventas PdV (Ef.)
                  </span>
                  {isBlindCountActive ? (
                    <span className="text-sm font-semibold text-muted-foreground tracking-widest flex items-center gap-1">
                      <EyeOff className="size-3.5 opacity-60" />
                      ••••••
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-foreground font-mono tabular-nums">
                      +
                      <NumberFlow
                        value={corte.ventasEfectivo || 0}
                        format={{ style: 'currency', currency: 'MXN' }}
                      />
                    </span>
                  )}
                </div>

                <div className="bg-card p-3.5 flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Wrench className="size-3.5 text-muted-foreground" />
                    Pagos Taller (Ef.)
                  </span>
                  {isBlindCountActive ? (
                    <span className="text-sm font-semibold text-muted-foreground tracking-widest flex items-center gap-1">
                      <EyeOff className="size-3.5 opacity-60" />
                      ••••••
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-foreground font-mono tabular-nums">
                      +
                      <NumberFlow
                        value={corte.pagosEfectivo || 0}
                        format={{ style: 'currency', currency: 'MXN' }}
                      />
                    </span>
                  )}
                </div>

                <div className="bg-muted/40 p-3.5 flex flex-col gap-0.5">
                  <span className="text-xs text-foreground font-semibold flex items-center gap-1">
                    <DollarSign className="size-3.5 text-primary" />
                    Efectivo Esperado
                  </span>
                  {isBlindCountActive ? (
                    <span className="text-sm font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                      <EyeOff className="size-3.5 opacity-60" />
                      ••••••
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-foreground font-mono tabular-nums">
                      <NumberFlow
                        value={corte.montoCalculado}
                        format={{ style: 'currency', currency: 'MXN' }}
                      />
                    </span>
                  )}
                </div>
              </div>

              {/* Conteo de operaciones */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-foreground">{corte.ventas?.length || 0}</strong> ventas
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-foreground">{corte.pagosCobrados?.length || 0}</strong> cobros de taller
                  </span>
                </div>
                {corte.notas && (
                  <span className="truncate max-w-sm">
                    <span className="font-semibold text-foreground">Apertura:</span> {corte.notas}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Conteo de Gaveta y Arqueo (Full Width) */}
          <ArqueoCajaForm
            corte={corte}
            isVerificado={isVerificado}
            onVerificarArqueo={() => setIsVerificado(true)}
            onRecontar={() => setIsVerificado(false)}
            onSolicitarCierre={handleSolicitarCierre}
            isPending={cerrarCorte.isPending}
          />
        </div>
      ) : (
        /* Estado vacío canónico */
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock className="size-5 text-amber-500" />
            </EmptyMedia>
            <EmptyTitle>No hay un turno de caja abierto</EmptyTitle>
            <EmptyDescription>
              Para registrar ventas de mostrador y cobros de taller en efectivo, debes iniciar un nuevo turno de caja.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              size="sm"
              onClick={() => setIsAbrirModalOpen(true)}
              className="gap-1.5"
            >
              <Plus data-icon="inline-start" />
              <span>Abrir Turno Ahora</span>
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Historial de Turnos */}
      <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <History className="size-4 text-primary" />
            Historial de Turnos Cerrados
          </h2>
          {cortesHistory && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {cortesHistory.length} turnos
            </Badge>
          )}
        </div>

        <HistorialCortesTable
          cortes={cortesHistory}
          isLoading={isLoadingHistory}
          onSelectCorteZ={handleSelectCorteZ}
        />
      </div>

      {/* Modales */}
      <AbrirCajaModal
        isOpen={isAbrirModalOpen}
        onClose={() => setIsAbrirModalOpen(false)}
        ultimoCorteCerrado={ultimoCorteCerrado}
      />

      {activo && corte && datosCierrePendiente && (
        <ConfirmarCierreModal
          isOpen={isConfirmarModalOpen}
          onClose={() => setIsConfirmarModalOpen(false)}
          onConfirm={handleConfirmarCierreFinal}
          isPending={cerrarCorte.isPending}
          corteId={corte.id}
          montoEsperado={corte.montoCalculado}
          montoReal={datosCierrePendiente.montoReal}
          desgloseTexto={datosCierrePendiente.desgloseTexto}
        />
      )}

      <CorteZTicketModal
        isOpen={isCorteZModalOpen}
        onClose={() => setIsCorteZModalOpen(false)}
        corte={corteParaTicket}
      />
    </div>
  );
};
