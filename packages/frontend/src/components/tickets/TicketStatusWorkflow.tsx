import React, { useState } from 'react';
import type { TicketEstado } from '../../api/types.ts';
import { useUpdateTicketStatus } from '../../queries/tickets/mutations.ts';
import { Button } from '../ui/button.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.tsx';
import { toast } from '../ui/sonner.tsx';
import { cn } from '../../lib/utils.ts';
import {
  getNextTicketStep,
  getAlternativeTicketSteps,
} from './ticket-state-machine.ts';
import {
  ArrowRight,
  MoreHorizontal,
  RotateCcw,
  Ban,
  Wrench,
  Check,
} from 'lucide-react';

interface TicketStatusWorkflowProps {
  ticketId: number;
  currentStatus: TicketEstado;
  saldoPendiente?: number;
  className?: string;
  onRequestEntregaGuard?: () => void;
  onSuccess?: () => void;
}

export const TicketStatusWorkflow: React.FC<TicketStatusWorkflowProps> = ({
  ticketId,
  currentStatus,
  saldoPendiente = 0,
  className,
  onRequestEntregaGuard,
  onSuccess,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const updateStatus = useUpdateTicketStatus();

  const nextStep = getNextTicketStep(currentStatus);
  const alternatives = getAlternativeTicketSteps(currentStatus);

  const handleApplyStatus = (newStatus: TicketEstado) => {
    // If attempting to mark ENTREGADO with pending balance, delegate to guard
    if (newStatus === 'ENTREGADO' && saldoPendiente > 0 && onRequestEntregaGuard) {
      setIsPopoverOpen(false);
      onRequestEntregaGuard();
      return;
    }

    if (newStatus === currentStatus || updateStatus.isPending) return;

    updateStatus.mutate(
      {
        id: ticketId,
        estado: newStatus,
        nota: `Avance de estado a ${newStatus}`,
      },
      {
        onSuccess: () => {
          toast.success('Estado actualizado', {
            description: `Folio #${ticketId} cambió a ${newStatus}`,
          });
          setIsPopoverOpen(false);
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error('Error al actualizar estado', {
            description: err?.message || 'No se pudo actualizar el ticket.',
          });
        },
      }
    );
  };

  const isPending = updateStatus.isPending;

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Primary Forward Step Action */}
      {nextStep ? (
        <Button
          type="button"
          size="sm"
          variant="default"
          disabled={isPending}
          onClick={() => handleApplyStatus(nextStep.nextStatus)}
          className="h-7.5 px-3 text-xs font-medium rounded-full gap-1.5 shadow-none"
        >
          {isPending ? (
            <Spinner className="size-3" data-icon="inline-start" />
          ) : (
            <ArrowRight className="size-3.5" data-icon="inline-end" />
          )}
          <span>{nextStep.label}</span>
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground font-normal px-2 py-1 rounded-full bg-muted/50 border border-border">
          {currentStatus === 'ENTREGADO' ? 'Entregado' : 'Cancelado'}
        </span>
      )}

      {/* Alternative Options Popover */}
      {alternatives.length > 0 && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Más transiciones de estado"
                className="size-7.5 p-0 rounded-full border-border/80 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <MoreHorizontal className="size-3.5" />
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-52 p-1.5 flex flex-col gap-0.5 rounded-xl shadow-lg border-border bg-card"
          >
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cambiar estado
            </div>
            {alternatives.map((alt) => (
              <button
                key={alt.status}
                type="button"
                onClick={() => handleApplyStatus(alt.status)}
                disabled={isPending}
                className={cn(
                  'flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs text-left transition-colors',
                  alt.status === 'CANCELADO'
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span className="flex items-center gap-2">
                  {alt.status === 'CANCELADO' ? (
                    <Ban className="size-3.5 text-destructive" />
                  ) : alt.status === 'RECIBIDO' ? (
                    <RotateCcw className="size-3.5 text-muted-foreground" />
                  ) : (
                    <Wrench className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{alt.label}</span>
                </span>
                {currentStatus === alt.status && <Check className="size-3 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
