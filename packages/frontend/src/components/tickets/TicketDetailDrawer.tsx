import React, { useState, useId } from 'react';
import type { Ticket } from '../../api/types.ts';
import { cn,  } from '../../lib/utils.ts';
import { useTicket } from '../../queries/tickets/queries.ts';
import {
  useAddBitacoraNota,
  useUpdateTicketCosto,
} from '../../queries/tickets/mutations.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusWorkflow } from './TicketStatusWorkflow.tsx';
import { TicketMediaCapture } from './TicketMediaCapture.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Badge } from '../ui/badge.tsx';
import { Checkbox } from '../ui/checkbox.tsx';
import { Separator } from '../ui/separator.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../ui/sheet.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import { useAuth } from '../../lib/auth-context.tsx';
import { StaleDataIndicator } from '../query-states/StaleDataIndicator.tsx';
import { BackgroundRefetchIndicator } from '../query-states/BackgroundRefetchIndicator.tsx';
import { QueryLoadingState } from '../query-states/QueryLoadingState.tsx';
import { QueryErrorState } from '../query-states/QueryErrorState.tsx';
import {
  Smartphone,
  KeyRound,
  Package,
  Clock,
  Lock,
  Send,
  DollarSign,
  Camera,
} from 'lucide-react';

interface TicketDetailDrawerProps {
  ticketId: number;
  onClose: () => void;
  onRequestEntregaGuard?: (ticket: Ticket) => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticketId,
  onClose,
  onRequestEntregaGuard,
}) => {
  const { currentUser } = useAuth();
  const ticketQuery = useTicket(ticketId);

  const addNotaMutation = useAddBitacoraNota();
  const updateCostoMutation = useUpdateTicketCosto();

  const [newNotaText, setNewNotaText] = useState('');
  const [isNotaPrivada, setIsNotaPrivada] = useState(false);
  const [isEditingCosto, setIsEditingCosto] = useState(false);
  const [costoInput, setCostoInput] = useState('');
  const notaPrivadaId = useId();

  const { data: ticket, isPending, isError, error, isFetching, isStale, dataUpdatedAt, refetch } =
    ticketQuery;

  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotaText.trim() || addNotaMutation.isPending) return;

    addNotaMutation.mutate({
      ticketId,
      usuarioId: currentUser?.id ?? 2,
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
        usuarioId: currentUser?.id ?? 2,
      },
      {
        onSuccess: () => {
          setIsEditingCosto(false);
        },
      }
    );
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background/95 backdrop-blur-md"
      >
        {/* Top Header */}
        <SheetHeader className="px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="font-mono text-base font-semibold text-foreground tracking-tight">
                  {ticket?.folio ?? `Ticket #${ticketId}`}
                </SheetTitle>
                {ticket && <TicketStatusBadge estado={ticket.estado} size="sm" />}
              </div>
              <SheetDescription className="text-xs text-muted-foreground text-pretty">
                Detalle operativo y seguimiento de servicio
              </SheetDescription>
            </div>

            <div className="flex items-center gap-2 pr-6">
              <BackgroundRefetchIndicator
                isFetching={isFetching}
                isPending={isPending}
                label="Actualizando..."
              />
            </div>
          </div>
        </SheetHeader>

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
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
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
              {/* Guided Service Transition Bar */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground tracking-tight">
                    Ciclo de Servicio
                  </span>
                  <span className="text-xs text-muted-foreground text-pretty">
                    Avance de estado guiado según diagnóstico
                  </span>
                </div>
                <TicketStatusWorkflow
                  ticketId={ticket.id}
                  currentStatus={ticket.estado}
                  saldoPendiente={ticket.saldoPendiente}
                  onRequestEntregaGuard={() => onRequestEntregaGuard?.(ticket)}
                />
              </div>

              {/* General Information Section */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-2xs">
                <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground text-sm font-medium truncate tracking-tight">{ticket.dispositivo}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Falla reportada por el cliente:
                  </span>
                  <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/30 break-words leading-relaxed text-pretty">
                    {ticket.falla}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="flex items-start gap-2 min-w-0">
                    <KeyRound className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block text-xs">
                        Contraseña / Patrón:
                      </span>
                      <span className="font-mono font-medium truncate block">
                        {ticket.contrasena || 'Sin contraseña'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <Package className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block text-xs">
                        Accesorios dejados:
                      </span>
                      <span className="font-medium truncate block">
                        {ticket.accesorios || 'Ninguno'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-xs">Cliente:</span>
                    <span className="font-medium text-foreground truncate block">
                      {ticket.cliente?.nombre ?? 'Cliente sin nombre'}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-muted-foreground text-xs shrink-0">
                    {ticket.cliente?.telefono}
                  </span>
                </div>
              </div>

              {/* Multimedia Evidence Section */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 tracking-tight">
                    <Camera className="size-3.5 text-muted-foreground" />
                    <span>Evidencias Multimedia</span>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-md font-mono tabular-nums">
                    {ticket.adjuntos?.length || 0} archivos
                  </Badge>
                </div>

                <TicketMediaCapture
                  adjuntos={ticket.adjuntos ?? []}
                  ticketId={ticket.id}
                  compact
                />
              </div>

              {/* Financial Status & Dynamic Budget */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 tracking-tight">
                    <DollarSign className="size-3.5 text-muted-foreground" />
                    <span>Finanzas y Presupuesto</span>
                  </div>
                  {!isEditingCosto && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setCostoInput(String(ticket.costoTotal));
                        setIsEditingCosto(true);
                      }}
                      className="text-xs h-7 px-2.5 text-primary rounded-md hover:bg-primary/10"
                    >
                      Ajustar presupuesto
                    </Button>
                  )}
                </div>

                {isEditingCosto ? (
                  <form onSubmit={handleUpdateCosto} className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={costoInput}
                      onChange={(e) => setCostoInput(e.target.value)}
                      aria-label="Costo total de cotización"
                      className="h-8 w-32 text-xs font-mono tabular-nums font-semibold"
                      placeholder="Total $"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="xs"
                      disabled={updateCostoMutation.isPending}
                      className="text-xs h-8 px-3 rounded-md"
                    >
                      {updateCostoMutation.isPending && (
                        <Spinner data-icon="inline-start" />
                      )}
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsEditingCosto(false)}
                      className="text-xs h-8 px-2.5 rounded-md"
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-muted/30 p-2.5 border border-border/40">
                      <span className="text-muted-foreground block text-xs">
                        Costo Total Cotizado:
                      </span>
                      <span className="text-base font-semibold font-mono tabular-nums text-foreground">
                        {(ticket.costoTotal)}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'rounded-lg p-2.5 border',
                        ticket.saldoPendiente > 0
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                          : 'bg-muted/20 border-border/40 text-muted-foreground'
                      )}
                    >
                      <span className="block text-xs opacity-80">
                        Saldo Pendiente:
                      </span>
                      <span className={cn(
                        'text-base font-mono tabular-nums',
                        ticket.saldoPendiente > 0 ? 'font-semibold text-foreground' : 'font-medium'
                      )}>
                        {(ticket.saldoPendiente)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payments History */}
                <div className="pt-2 border-t border-border/50">
                  <span className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Historial de pagos y anticipos:
                  </span>
                  {(!ticket.historialPagos || ticket.historialPagos.length === 0) ? (
                    <p className="text-xs text-muted-foreground italic">
                      Sin anticipos o pagos registrados.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {ticket.historialPagos.map((pago) => (
                        <div
                          key={pago.id}
                          className="flex items-center justify-between text-xs bg-muted/20 px-2.5 py-1.5 rounded-md border border-border/30"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold font-mono tabular-nums text-foreground">
                              +{(pago.monto)}
                            </span>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4.5 rounded-sm">
                              {pago.metodoPago}
                            </Badge>
                            {pago.notas && (
                              <span className="text-muted-foreground text-xs truncate max-w-[160px]">
                                - {pago.notas}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono tabular-nums">
                            {new Date(pago.fecha).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bitácora / Timeline Section */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 tracking-tight">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Bitácora Técnica</span>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-md font-mono tabular-nums">
                    {ticket.bitacora?.length || 0} notas
                  </Badge>
                </div>

                {/* Form to Add Note Optimistically */}
                <form onSubmit={handleAddNota} className="flex flex-col gap-2">
                  <Field>
                    <Textarea
                      value={newNotaText}
                      onChange={(e) => setNewNotaText(e.target.value)}
                      aria-label="Escribir nota técnica o actualización"
                      placeholder="Escribir nota técnica o actualización de servicio..."
                      rows={2}
                      className="resize-none text-xs"
                    />
                  </Field>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={notaPrivadaId}
                        checked={isNotaPrivada}
                        onCheckedChange={(checked) => setIsNotaPrivada(Boolean(checked))}
                      />
                      <FieldLabel htmlFor={notaPrivadaId} className="text-xs cursor-pointer flex items-center gap-1">
                        <Lock className="size-3 text-muted-foreground" />
                        <span>Nota privada interna</span>
                      </FieldLabel>
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newNotaText.trim() || addNotaMutation.isPending}
                      className="gap-1.5 text-xs rounded-lg"
                    >
                      {addNotaMutation.isPending ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <Send data-icon="inline-start" />
                      )}
                      <span>{addNotaMutation.isPending ? 'Guardando...' : 'Agregar nota'}</span>
                    </Button>
                  </div>
                </form>

                <Separator className="my-1 opacity-50" />

                {/* Bitácora Entries List */}
                <div className="flex flex-col gap-2">
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
                              ? 'border-primary/40 bg-primary/5'
                              : item.esPrivada === 1
                              ? 'border-primary/20 bg-primary/5 text-foreground'
                              : 'border-border/60 bg-muted/20 text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <div className="flex items-center gap-1.5">
                              {item.esPrivada === 1 ? (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 text-xs font-normal"
                                >
                                  <Lock className="size-2.5" />
                                  Privada
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground font-medium">
                                  Pública / WhatsApp
                                </span>
                              )}
                              {isOptimistic && (
                                <span className="text-primary font-semibold">
                                  (Guardando...)
                                </span>
                              )}
                            </div>

                            <span className="font-mono tabular-nums text-xs">
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <p className="text-xs whitespace-pre-wrap leading-relaxed break-words text-pretty">
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
        <SheetFooter className="border-t border-border px-5 py-3 bg-muted/10 flex-row items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            Ticket ID: {ticketId}
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-lg">
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
