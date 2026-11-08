import React, { useState } from 'react';
import { useTicket } from '../../queries/tickets/queries.ts';
import {
  useAddBitacoraNota,
  useUpdateTicketCosto,
  useUpdateTicketStatus,
} from '../../queries/tickets/mutations.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusChanger } from './TicketStatusChanger.tsx';
import { Button } from '../ui/button.tsx';
import { StaleDataIndicator } from '../query-states/StaleDataIndicator.tsx';
import { BackgroundRefetchIndicator } from '../query-states/BackgroundRefetchIndicator.tsx';
import { QueryLoadingState } from '../query-states/QueryLoadingState.tsx';
import { QueryErrorState } from '../query-states/QueryErrorState.tsx';
import {
  X,
  Smartphone,
  KeyRound,
  Package,
  Clock,
  Lock,
  Send,
  DollarSign,
} from 'lucide-react';

interface TicketDetailDrawerProps {
  ticketId: number;
  onClose: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticketId,
  onClose,
}) => {
  // Read server state exclusively from TanStack Query
  const ticketQuery = useTicket(ticketId);

  // Optimistic mutations
  const addNotaMutation = useAddBitacoraNota();
  const updateCostoMutation = useUpdateTicketCosto();
  const updateStatusMutation = useUpdateTicketStatus();

  // Local form UI states (strictly client state, not server data copies!)
  const [newNotaText, setNewNotaText] = useState('');
  const [isNotaPrivada, setIsNotaPrivada] = useState(false);
  const [isEditingCosto, setIsEditingCosto] = useState(false);
  const [costoInput, setCostoInput] = useState('');

  const { data: ticket, isPending, isError, error, isFetching, isStale, dataUpdatedAt, refetch } =
    ticketQuery;

  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotaText.trim() || addNotaMutation.isPending) return;

    addNotaMutation.mutate({
      ticketId,
      usuarioId: 2, // Daniel (Técnico)
      nota: newNotaText.trim(),
      esPrivada: isNotaPrivada,
    });

    setNewNotaText('');
  };

  const handleUpdateCosto = (e: React.FormEvent) => {
    e.preventDefault();
    const newCost = Number(costoInput);
    if (Number.isNaN(newCost) || newCost < 0) return;

    updateCostoMutation.mutate(
      {
        id: ticketId,
        costoTotal: newCost,
        usuarioId: 2,
      },
      {
        onSuccess: () => {
          setIsEditingCosto(false);
        },
      }
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-background/95 backdrop-blur-md shadow-2xl border-l border-border transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-bold text-foreground">
                {ticket?.folio ?? `Ticket #${ticketId}`}
              </h2>
              {ticket && <TicketStatusBadge estado={ticket.estado} size="sm" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detalle técnico y seguimiento del equipo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BackgroundRefetchIndicator
            isFetching={isFetching}
            isPending={isPending}
            label="Actualizando..."
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Cerrar panel"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Query cache freshness status */}
      <div className="border-b border-border/40 bg-muted/10 px-5 py-2">
        <StaleDataIndicator
          isStale={isStale}
          dataUpdatedAt={dataUpdatedAt}
          isFetching={isFetching}
          onRefetch={() => refetch()}
          queryKeySummary={`tickets, detail, ${ticketId}`}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {isPending && (
          <QueryLoadingState count={3} message="Cargando ficha del ticket..." />
        )}

        {isError && (
          <QueryErrorState
            error={error}
            title="Error al cargar el detalle del ticket"
            onRetry={() => refetch()}
          />
        )}

        {ticket && (
          <>
            {/* Quick Actions Bar */}
            <div className="rounded-lg border border-border/70 bg-card p-3 shadow-2xs space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Transición rápida de estado
              </span>
              <TicketStatusChanger
                ticketId={ticket.id}
                currentStatus={ticket.estado}
              />
              {updateStatusMutation.isPending && (
                <p className="text-[10px] text-primary animate-pulse">
                  Aplicando cambio de estado optimista en segundo plano...
                </p>
              )}
            </div>

            {/* General Information Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 text-card-foreground shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Smartphone className="size-4" />
                <span>{ticket.dispositivo}</span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Falla reportada por el cliente:
                </span>
                <p className="mt-0.5 text-xs text-foreground bg-muted/40 p-2.5 rounded-md border border-border/30">
                  {ticket.falla}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-start gap-2">
                  <KeyRound className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Contraseña / Patrón:
                    </span>
                    <span className="font-mono font-medium">
                      {ticket.contrasena || 'Sin contraseña'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Package className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Accesorios dejados:
                    </span>
                    <span className="font-medium">
                      {ticket.accesorios || 'Ninguno'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer summary */}
              <div className="mt-3 pt-3 border-t border-border/40 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Cliente:</span>
                  <span className="font-medium text-foreground">{ticket.cliente?.nombre}</span>
                </div>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {ticket.cliente?.telefono}
                </span>
              </div>
            </div>

            {/* Financial Status & Dynamic Budget */}
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Finanzas y Presupuesto
                </h3>
                {!isEditingCosto && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setCostoInput(String(ticket.costoTotal));
                      setIsEditingCosto(true);
                    }}
                    className="text-[11px] h-6 px-2 text-primary"
                  >
                    Ajustar presupuesto
                  </Button>
                )}
              </div>

              {isEditingCosto ? (
                <form onSubmit={handleUpdateCosto} className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={costoInput}
                    onChange={(e) => setCostoInput(e.target.value)}
                    className="h-7 w-28 rounded-md border border-input bg-background px-2 text-xs font-medium focus:ring-1 focus:ring-primary"
                    placeholder="Total $"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="xs"
                    disabled={updateCostoMutation.isPending}
                    className="text-[11px] h-7"
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsEditingCosto(false)}
                    className="text-[11px] h-7"
                  >
                    Cancelar
                  </Button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-muted/30 p-2.5 border border-border/30">
                    <span className="text-[10px] text-muted-foreground block">
                      Costo Total Cotizado:
                    </span>
                    <span className="text-base font-bold text-foreground">
                      ${ticket.costoTotal.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`rounded-lg p-2.5 border ${
                      ticket.saldoPendiente > 0
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    <span className="text-[10px] block opacity-80">
                      Saldo Pendiente:
                    </span>
                    <span className="text-base font-bold">
                      ${ticket.saldoPendiente.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payments History */}
              <div className="mt-2 pt-2 border-t border-border/30">
                <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                  Historial de pagos / anticipos:
                </span>
                {(!ticket.historialPagos || ticket.historialPagos.length === 0) ? (
                  <p className="text-[11px] text-muted-foreground italic">
                    Sin pagos registrados en recepción.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {ticket.historialPagos.map((pago) => (
                      <div
                        key={pago.id}
                        className="flex items-center justify-between text-[11px] bg-muted/20 px-2 py-1.5 rounded"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            +${pago.monto.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({pago.metodoPago})
                          </span>
                          {pago.notas && (
                            <span className="text-muted-foreground text-[10px]">
                              - {pago.notas}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(pago.fecha).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bitácora / Timeline */}
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  Bitácora de Seguimiento
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  {ticket.bitacora?.length || 0} notas
                </span>
              </div>

              {/* Form to Add Note Optimistically */}
              <form onSubmit={handleAddNota} className="space-y-2">
                <textarea
                  value={newNotaText}
                  onChange={(e) => setNewNotaText(e.target.value)}
                  placeholder="Escribir nota técnica o actualización para el cliente..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isNotaPrivada}
                      onChange={(e) => setIsNotaPrivada(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary size-3.5"
                    />
                    <Lock className="size-3" />
                    <span>Nota privada interna (no visible al cliente)</span>
                  </label>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newNotaText.trim() || addNotaMutation.isPending}
                    className="gap-1 text-xs"
                  >
                    <Send className="size-3" />
                    {addNotaMutation.isPending ? 'Guardando...' : 'Agregar nota'}
                  </Button>
                </div>
              </form>

              {/* Bitácora Entries List */}
              <div className="mt-4 space-y-2.5">
                {(!ticket.bitacora || ticket.bitacora.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic text-center py-3">
                    Aún no hay notas registradas en este ticket.
                  </p>
                ) : (
                  ticket.bitacora.map((item) => {
                    const isOptimistic = item.id < 0;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg p-3 text-xs border transition-all ${
                          isOptimistic
                            ? 'border-primary/40 bg-primary/5 animate-pulse'
                            : item.esPrivada === 1
                            ? 'border-purple-500/20 bg-purple-500/5 text-purple-950 dark:text-purple-200'
                            : 'border-border/60 bg-muted/20 text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <div className="flex items-center gap-1.5">
                            {item.esPrivada === 1 ? (
                              <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 font-semibold">
                                <Lock className="size-2.5" />
                                Nota Técnica Privada
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-medium">
                                Nota Pública / WhatsApp
                              </span>
                            )}
                            {isOptimistic && (
                              <span className="text-primary font-semibold">
                                (Guardando de forma optimista...)
                              </span>
                            )}
                          </div>

                          <span>
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {item.nota}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/80 px-5 py-3 bg-muted/10 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-mono">
          Ticket ID: {ticketId}
        </span>
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Cerrar
        </Button>
      </div>
    </div>
  );
};
