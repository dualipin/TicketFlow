import React, { useState } from 'react';
import { cn } from '../../lib/utils.ts';
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
import { Separator } from '../ui/separator.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet.tsx';
import { Field } from '../ui/field.tsx';
import { useAuth } from '../../lib/auth-context.tsx';
import { QueryLoadingState } from '../query-states/QueryLoadingState.tsx';
import { QueryErrorState } from '../query-states/QueryErrorState.tsx';
import { Send } from 'lucide-react';

interface TicketDetailDrawerProps {
  ticketId: number;
  onClose: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticketId,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const ticketQuery = useTicket(ticketId);

  const addNotaMutation = useAddBitacoraNota();
  const updateCostoMutation = useUpdateTicketCosto();

  const [newNotaText, setNewNotaText] = useState('');
  const [isEditingCosto, setIsEditingCosto] = useState(false);
  const [costoInput, setCostoInput] = useState('');

  const { data: ticket, isPending, isError, error, refetch } = ticketQuery;

  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotaText.trim() || addNotaMutation.isPending) return;

    addNotaMutation.mutate({
      ticketId,
      usuarioId: currentUser?.id ?? 2,
      nota: newNotaText.trim(),
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
        className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background"
      >
        {/* Header with Folio, Status Badge & Workshop Action */}
        <SheetHeader className="px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2 min-w-0">
              <SheetTitle className="font-mono text-base font-semibold text-foreground tracking-tight">
                {ticket?.folio ?? `Ticket #${ticketId}`}
              </SheetTitle>
              {ticket && <TicketStatusBadge estado={ticket.estado} size="sm" />}
            </div>

            {ticket && (
              <TicketStatusWorkflow
                ticketId={ticket.id}
                currentStatus={ticket.estado}
                workshopOnly
              />
            )}
          </div>
        </SheetHeader>

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
              {/* Section 1: Device Sheet */}
              <section className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-foreground tracking-tight text-balance">
                  {ticket.dispositivo}
                </h2>

                <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40 break-words leading-relaxed text-pretty">
                  {ticket.falla}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-muted-foreground">PIN / Contraseña</span>
                    <span className="font-mono font-medium text-foreground truncate">
                      {ticket.contrasena || 'Sin contraseña'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-muted-foreground">Accesorios</span>
                    <span className="font-medium text-foreground truncate">
                      {ticket.accesorios || 'Ninguno'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium text-foreground truncate">
                      {ticket.cliente?.nombre ?? 'Sin cliente'}
                    </span>
                    {ticket.cliente?.telefono && (
                      <span className="font-mono tabular-nums text-muted-foreground truncate">
                        {ticket.cliente.telefono}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-muted-foreground">Costo de reparación</span>
                    {isEditingCosto ? (
                      <form onSubmit={handleUpdateCosto} className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={costoInput}
                          onChange={(e) => setCostoInput(e.target.value)}
                          aria-label="Costo de reparación"
                          className="h-7 w-24 text-xs font-mono tabular-nums font-semibold"
                          placeholder="0.00"
                          autoFocus
                        />
                        <Button
                          type="submit"
                          size="xs"
                          disabled={updateCostoMutation.isPending}
                          className="rounded-md"
                        >
                          {updateCostoMutation.isPending && (
                            <Spinner data-icon="inline-start" />
                          )}
                          <span>Guardar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setIsEditingCosto(false)}
                          className="rounded-md"
                        >
                          Cancelar
                        </Button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold tabular-nums text-sm text-foreground">
                          ${ticket.costoTotal}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setCostoInput(String(ticket.costoTotal));
                            setIsEditingCosto(true);
                          }}
                          className="text-xs text-primary px-2 rounded-md hover:bg-primary/10"
                        >
                          Ajustar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 2: Evidence */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-foreground tracking-tight">
                  Evidencias ({ticket.adjuntos?.length || 0})
                </h3>
                <TicketMediaCapture
                  adjuntos={ticket.adjuntos ?? []}
                  ticketId={ticket.id}
                  compact
                />
              </section>

              <Separator />

              {/* Section 3: Technical Log */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-foreground tracking-tight">
                  Bitácora Técnica ({ticket.bitacora?.length || 0})
                </h3>

                <form onSubmit={handleAddNota} className="flex flex-col gap-2">
                  <Field>
                    <Textarea
                      value={newNotaText}
                      onChange={(e) => setNewNotaText(e.target.value)}
                      aria-label="Registrar diagnóstico, avance o refacción utilizada"
                      placeholder="Registrar diagnóstico, avance o refacción utilizada..."
                      rows={2}
                      className="resize-none text-xs"
                    />
                  </Field>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newNotaText.trim() || addNotaMutation.isPending}
                      className="text-xs rounded-lg"
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

                <div className="flex flex-col gap-2">
                  {(!ticket.bitacora || ticket.bitacora.length === 0) ? (
                    <p className="text-xs text-muted-foreground py-2">
                      Aún no hay notas registradas.
                    </p>
                  ) : (
                    ticket.bitacora.map((item) => {
                      const isOptimistic = item.id < 0;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'rounded-lg p-3 text-xs border transition-colors',
                            isOptimistic
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-border/60 bg-muted/20 text-foreground'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono tabular-nums text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isOptimistic && (
                              <span className="text-xs text-primary font-medium">
                                Guardando...
                              </span>
                            )}
                          </div>

                          <p className="text-xs whitespace-pre-wrap leading-relaxed break-words text-pretty">
                            {item.nota}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
