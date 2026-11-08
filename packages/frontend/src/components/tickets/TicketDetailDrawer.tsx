import React, { useState, useId } from 'react';
import { cn } from '../../lib/utils.ts';
import { useTicket } from '../../queries/tickets/queries.ts';
import {
  useAddBitacoraNota,
  useUpdateTicketCosto,
  useUpdateTicketStatus,
} from '../../queries/tickets/mutations.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusChanger } from './TicketStatusChanger.tsx';
import { TicketMediaCapture } from './TicketMediaCapture.tsx';
import { ConfirmEntregaDialog } from './ConfirmEntregaDialog.tsx';
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../ui/card.tsx';
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
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticketId,
  onClose,
}) => {
  // Read server state exclusively from TanStack Query
  const { currentUser } = useAuth();
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
  const [isEntregaGuardOpen, setIsEntregaGuardOpen] = useState(false);
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
                <SheetTitle className="font-mono text-base font-semibold text-foreground">
                  {ticket?.folio ?? `Ticket #${ticketId}`}
                </SheetTitle>
                {ticket && <TicketStatusBadge estado={ticket.estado} size="sm" />}
              </div>
              <SheetDescription className="text-xs text-muted-foreground">
                Detalle técnico y seguimiento del equipo
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
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
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
              <Card className="p-3.5 rounded-xl border border-border bg-card gap-2">
                <span className="text-xs font-normal uppercase tracking-wider text-muted-foreground">
                  Transición rápida de estado
                </span>
                <TicketStatusChanger
                  ticketId={ticket.id}
                  currentStatus={ticket.estado}
                  saldoPendiente={ticket.saldoPendiente}
                  onRequestEntregaGuard={() => setIsEntregaGuardOpen(true)}
                />
                {updateStatusMutation.isPending && (
                  <p className="text-xs text-primary animate-pulse">
                    Aplicando cambio de estado optimista en segundo plano...
                  </p>
                )}
              </Card>

              {/* General Information Card */}
              <Card className="p-4 rounded-xl border border-border bg-card gap-3">
                <CardHeader className="p-0">
                  <CardTitle className="text-xs font-semibold text-primary flex items-center gap-2">
                    <Smartphone className="size-4" />
                    <span>{ticket.dispositivo}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 flex flex-col gap-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Falla reportada por el cliente:
                    </span>
                    <p className="mt-0.5 text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/30">
                      {ticket.falla}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="flex items-start gap-2">
                      <KeyRound className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs text-muted-foreground block">
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
                        <span className="text-xs text-muted-foreground block">
                          Accesorios dejados:
                        </span>
                        <span className="font-medium">
                          {ticket.accesorios || 'Ninguno'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Customer summary */}
                  <div className="text-xs flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground block">Cliente:</span>
                      <span className="font-medium text-foreground">{ticket.cliente?.nombre}</span>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs">
                      {ticket.cliente?.telefono}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Multimedia Evidence Card (Fotos, Audio y Video) */}
              <Card className="p-4 rounded-xl border border-border bg-card gap-3">
                <CardHeader className="p-0 flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" />
                    Evidencias Multimedia
                  </CardTitle>
                  <Badge variant="outline" className="text-xs rounded-full">
                    {ticket.adjuntos?.length || 0} archivos
                  </Badge>
                </CardHeader>

                <CardContent className="p-0">
                  <TicketMediaCapture
                    adjuntos={ticket.adjuntos ?? []}
                    ticketId={ticket.id}
                    compact
                  />
                </CardContent>
              </Card>

              {/* Financial Status & Dynamic Budget */}
              <Card className="p-4 rounded-xl border border-border bg-card gap-3">
                <CardHeader className="p-0 flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Finanzas y Presupuesto
                  </CardTitle>
                  {!isEditingCosto && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setCostoInput(String(ticket.costoTotal));
                        setIsEditingCosto(true);
                      }}
                      className="text-xs h-6 px-2.5 text-primary rounded-full hover:bg-primary/10"
                    >
                      Ajustar presupuesto
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="p-0 flex flex-col gap-3">
                  {isEditingCosto ? (
                    <form onSubmit={handleUpdateCosto} className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={costoInput}
                        onChange={(e) => setCostoInput(e.target.value)}
                        aria-label="Costo total de cotización"
                        className="h-7 w-28 text-xs font-medium"
                        placeholder="Total $"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        size="xs"
                        disabled={updateCostoMutation.isPending}
                        className="text-xs h-7"
                      >
                        {updateCostoMutation.isPending && (
                          <Spinner className="size-3" data-icon="inline-start" />
                        )}
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setIsEditingCosto(false)}
                        className="text-xs h-7"
                      >
                        Cancelar
                      </Button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-muted/30 p-2.5 border border-border/30">
                        <span className="text-xs text-muted-foreground block">
                          Costo Total Cotizado:
                        </span>
                        <span className="text-base font-bold text-foreground">
                          ${ticket.costoTotal.toFixed(2)}
                        </span>
                      </div>

                      <div
                        className={cn(
                          'rounded-lg p-2.5 border',
                          ticket.saldoPendiente > 0
                            ? 'bg-destructive/10 border-destructive/20 text-destructive'
                            : 'bg-primary/10 border-primary/20 text-primary'
                        )}
                      >
                        <span className="text-xs block opacity-80">
                          Saldo Pendiente:
                        </span>
                        <span className="text-base font-bold">
                          ${ticket.saldoPendiente.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payments History */}
                  <div className="pt-2">
                    <Separator className="mb-2" />
                    <span className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Historial de pagos / anticipos:
                    </span>
                    {(!ticket.historialPagos || ticket.historialPagos.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic">
                        Sin pagos registrados en recepción.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {ticket.historialPagos.map((pago) => (
                          <div
                            key={pago.id}
                            className="flex items-center justify-between text-xs bg-muted/20 px-2 py-1.5 rounded"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                +${pago.monto.toFixed(2)}
                              </span>
                              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                {pago.metodoPago}
                              </Badge>
                              {pago.notas && (
                                <span className="text-muted-foreground text-xs">
                                  - {pago.notas}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(pago.fecha).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bitácora / Timeline */}
              <Card className="p-4 rounded-xl border border-border bg-card gap-3">
                <CardHeader className="p-0 flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    Bitácora de Seguimiento
                  </CardTitle>
                  <Badge variant="outline" className="text-xs rounded-full">
                    {ticket.bitacora?.length || 0} notas
                  </Badge>
                </CardHeader>

                <CardContent className="p-0 flex flex-col gap-3">
                  {/* Form to Add Note Optimistically */}
                  <form onSubmit={handleAddNota} className="flex flex-col gap-2">
                    <Field>
                      <Textarea
                        value={newNotaText}
                        onChange={(e) => setNewNotaText(e.target.value)}
                        aria-label="Escribir nota técnica o actualización"
                        placeholder="Escribir nota técnica o actualización para el cliente..."
                        rows={2}
                        className="resize-none"
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
                        className="gap-1 text-xs rounded-full"
                      >
                        {addNotaMutation.isPending ? (
                          <Spinner className="size-3" data-icon="inline-start" />
                        ) : (
                          <Send className="size-3" data-icon="inline-start" />
                        )}
                        {addNotaMutation.isPending ? 'Guardando...' : 'Agregar nota'}
                      </Button>
                    </div>
                  </form>

                  <Separator className="my-2" />

                  {/* Bitácora Entries List */}
                  <div className="flex flex-col gap-2.5">
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
                                    Nota Técnica Privada
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground font-medium">
                                    Nota Pública / WhatsApp
                                  </span>
                                )}
                                {isOptimistic && (
                                  <span className="text-primary font-semibold">
                                    (Guardando optimista...)
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
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t border-border/80 px-5 py-3 bg-muted/10 flex-row items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            Ticket ID: {ticketId}
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </SheetFooter>

        {/* Financial Guard Dialog for Delivery with Pending Debt */}
        {isEntregaGuardOpen && ticket && (
          <ConfirmEntregaDialog
            isOpen={true}
            onClose={() => setIsEntregaGuardOpen(false)}
            ticketId={ticket.id}
            folio={ticket.folio}
            dispositivo={ticket.dispositivo}
            saldoPendiente={ticket.saldoPendiente}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
