import React from 'react';
import type { TicketEstado } from '../../api/types.ts';
import { useUpdateTicketStatus } from '../../queries/tickets/mutations.ts';
import { Button } from '../ui/button.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { cn } from '../../lib/utils.ts';

interface TicketStatusChangerProps {
  ticketId: number;
  currentStatus: TicketEstado;
  className?: string;
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
  className,
  onSuccess,
}) => {
  const updateStatus = useUpdateTicketStatus();

  const handleSelect = (newStatus: TicketEstado) => {
    if (newStatus === currentStatus || updateStatus.isPending) return;

    updateStatus.mutate(
      {
        id: ticketId,
        estado: newStatus,
        nota: `Cambio de estado en mostrador a ${newStatus}`,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <span className="text-[11px] font-medium text-muted-foreground mr-1">
        Cambiar a:
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
            variant={isCurrent ? 'secondary' : 'outline'}
            size="xs"
            disabled={isCurrent || updateStatus.isPending}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'h-6 px-2 text-[11px] select-none',
              isCurrent && 'bg-primary/15 text-primary border-primary/30 font-semibold cursor-default hover:bg-primary/15 hover:text-primary'
            )}
            title={`Cambiar a ${opt.label}`}
          >
            {isSelectedPending && <Spinner className="size-2.5" data-icon="inline-start" />}
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
};
