import React from 'react';
import type { TicketEstado } from '../../api/types.ts';
import { useUpdateTicketStatus } from '../../queries/tickets/mutations.ts';
import { Button } from '../ui/button.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { toast } from 'sonner';
import { cn } from '../../lib/utils.ts';

interface TicketStatusChangerProps {
  ticketId: number;
  currentStatus: TicketEstado;
  saldoPendiente?: number;
  className?: string;
  onRequestEntregaGuard?: () => void;
  onSuccess?: () => void;
}

const statusOptions: { value: TicketEstado; label: string }[] = [
  { value: 'RECIBIDO', label: 'Recibido' },
  { value: 'DIAGNOSTICO', label: 'Diagnóstico' },
  { value: 'EN_REPARACION', label: 'En Reparación' },
  { value: 'LISTO', label: 'Listo' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export const TicketStatusChanger: React.FC<TicketStatusChangerProps> = ({
  ticketId,
  currentStatus,
  saldoPendiente = 0,
  className,
  onRequestEntregaGuard,
  onSuccess,
}) => {
  const updateStatus = useUpdateTicketStatus();

  const handleSelect = (newStatus: TicketEstado) => {
    // Intercept delivery if there is a pending balance
    if (newStatus === 'ENTREGADO' && saldoPendiente > 0 && onRequestEntregaGuard) {
      onRequestEntregaGuard();
      return;
    }

    if (newStatus === currentStatus || updateStatus.isPending) return;

    updateStatus.mutate(
      {
        id: ticketId,
        estado: newStatus,
        nota: `Cambio de estado en mostrador a ${newStatus}`,
      },
      {
        onSuccess: () => {
          toast.success(`Estado actualizado`, {
            description: `Folio #${ticketId} cambió a ${newStatus}`,
          });
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(`Error al cambiar estado`, {
            description: err?.message || 'No se pudo actualizar el ticket.',
          });
        },
      }
    );
  };

  return (
    <div
      role="radiogroup"
      aria-label="Estado del ticket"
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      <span className="text-xs font-normal text-muted-foreground mr-1">
        Estado:
      </span>
      {statusOptions.map((opt) => {
        const isCurrent = opt.value === currentStatus;
        const isSelectedPending =
          updateStatus.isPending &&
          updateStatus.variables?.id === ticketId &&
          updateStatus.variables?.estado === opt.value;

        return (
          <Button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isCurrent}
            variant={isCurrent ? 'default' : 'outline'}
            size="xs"
            disabled={isCurrent || updateStatus.isPending}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'h-7 px-2.5 text-xs select-none rounded-md',
              isCurrent
                ? 'bg-primary text-primary-foreground cursor-default font-medium'
                : 'text-muted-foreground hover:text-foreground border-border/80'
            )}
            title={`Cambiar a ${opt.label}`}
          >
            {isSelectedPending && <Spinner data-icon="inline-start" />}
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
};
