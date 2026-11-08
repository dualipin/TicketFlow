import React from 'react';
import type { TicketEstado } from '../../api/types.ts';
import { useUpdateTicketStatus } from '../../queries/tickets/mutations.ts';
import { cn } from '../../lib/utils.ts';
import { RefreshCw } from 'lucide-react';

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
          <button
            key={opt.value}
            type="button"
            disabled={isCurrent || updateStatus.isPending}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all select-none',
              isCurrent
                ? 'bg-primary/15 text-primary border border-primary/30 font-semibold cursor-default'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 border border-border/40',
              updateStatus.isPending && !isSelectedPending && 'opacity-60 cursor-not-allowed'
            )}
            title={`Cambiar a ${opt.label}`}
          >
            {isSelectedPending && <RefreshCw className="size-2.5 animate-spin" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
