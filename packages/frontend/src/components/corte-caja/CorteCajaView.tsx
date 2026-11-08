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
import { toast } from '../ui/sonner.tsx';
import NumberFlow from '@number-flow/react';
import { formatCurrencyMxn, formatFechaCorte } from './corte-caja-engine.ts';
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
  EyeOff,
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

  // Estado del protocolo de arqueo ciego y verificación
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

          // Desplegar automáticamente el ticket de Corte Z con los totales consolidados
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

      {/* Panel de Turno Activo */}
      {isLoadingActivo ? (
        <Card className="p-8 flex items-center justify-center">
          <Spinner className="size-6 text-primary" />
        </Card>
      ) : activo && corte ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna Izquierda/Central: Desglose de Dinero Esperado */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="rounded-xl border border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-xs h-5 px-1.5"
                    >
                      TURNO ACTIVO #{corte.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      Abierto: {formatFechaCorte(corte.fechaApertura)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <User className="size-3" />
                    Responsable: <span className="text-foreground font-semibold">{corte.usuario?.nombre || 'Operador'}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex flex-col gap-4">
                {/* 4 Cards de Totales con NumberFlow & Enmascaramiento de Arqueo Ciego */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Landmark className="size-3 text-muted-foreground" />
                      Fondo Inicial
                    </span>
                    <span className="text-base font-bold text-foreground font-mono tabular-nums">
                      <NumberFlow
                        value={corte.montoInicial}
                        format={{ style: 'currency', currency: 'MXN' }}
                      />
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Store className="size-3 text-emerald-500" />
                      Ventas PdV (Ef.)
                    </span>
                    {isBlindCountActive ? (
                      <span className="text-base font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                        <EyeOff className="size-3.5 opacity-60" />
                        ••••••
                      </span>
                    ) : (
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        +
                        <NumberFlow
                          value={corte.ventasEfectivo || 0}
                          format={{ style: 'currency', currency: 'MXN' }}
                        />
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Wrench className="size-3 text-sky-500" />
                      Pagos Taller (Ef.)
                    </span>
                    {isBlindCountActive ? (
                      <span className="text-base font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                        <EyeOff className="size-3.5 opacity-60" />
                        ••••••
                      </span>
                    ) : (
                      <span className="text-base font-bold text-sky-600 dark:text-sky-400 font-mono tabular-nums">
                        +
                        <NumberFlow
                          value={corte.pagosEfectivo || 0}
                          format={{ style: 'currency', currency: 'MXN' }}
                        />
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-1">
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      <DollarSign className="size-3" />
                      Efectivo Esperado
                    </span>
                    {isBlindCountActive ? (
                      <span className="text-base font-bold text-primary tracking-widest flex items-center gap-1">
                        <EyeOff className="size-3.5 opacity-60" />
                        ••••••
                      </span>
                    ) : (
                      <span className="text-base font-black text-primary font-mono tabular-nums">
                        <NumberFlow
                          value={corte.montoCalculado}
                          format={{ style: 'currency', currency: 'MXN' }}
                        />
                      </span>
                    )}
                  </div>
                </div>

                {corte.notas && (
                  <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    <span className="font-semibold text-foreground">Notas de apertura:</span> {corte.notas}
                  </p>
                )}

                {/* Resumen de transacciones */}
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
                  <span className="font-mono text-xs">
                    {isBlindCountActive ? (
                      <span className="italic text-muted-foreground">Arqueo Ciego: balance oculto</span>
                    ) : (
                      `Balance teórico: ${formatCurrencyMxn(corte.montoCalculado)}`
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Formulario de Arqueo Ciego y Denominaciones */}
          <div className="flex flex-col gap-4">
            <ArqueoCajaForm
              corte={corte}
              isAdmin={isAdmin}
              isBlindCountActive={isBlindCountActive}
              adminShowExpected={adminShowExpected}
              onToggleAdminShowExpected={() => setAdminShowExpected(!adminShowExpected)}
              isVerificado={isVerificado}
              onVerificarArqueo={() => setIsVerificado(true)}
              onRecontar={() => setIsVerificado(false)}
              onSolicitarCierre={handleSolicitarCierre}
              isPending={cerrarCorte.isPending}
            />
          </div>
        </div>
      ) : (
        /* Estado cuando no hay caja abierta usando la primitiva canónica Empty */
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

      {/* Historial de Cortes de Caja Previos */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <History className="size-4 text-primary" />
            Historial de Turnos y Arqueos Cerrados
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
