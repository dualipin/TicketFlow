import React from 'react';
import type { Ticket } from '../../api/types.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusWorkflow } from './TicketStatusWorkflow.tsx';
import { Smartphone, KeyRound, Paperclip } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface TicketCardProps {
  ticket: Ticket;
  onSelectTicket: (id: number) => void;
  isSelected?: boolean;
}

const TicketCardComponent: React.FC<TicketCardProps> = ({
  ticket,
  onSelectTicket,
  isSelected = false,
}) => {
  const adjuntos = ticket.adjuntos ?? [];
  const fechaIngreso = new Date(ticket.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <div
      role="article"
      tabIndex={0}
      aria-label={`Orden de servicio ${ticket.folio}, ${ticket.dispositivo}`}
      onClick={() => onSelectTicket(ticket.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectTicket(ticket.id);
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between p-4 rounded-xl border bg-card transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        isSelected
          ? 'border-primary ring-1 ring-primary/25 bg-primary/[0.02]'
          : 'border-border hover:border-foreground/30'
      )}
    >
      {/* Header: Folio, Status Badge & Entry Date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground shrink-0">
            {ticket.folio}
          </span>
          <TicketStatusBadge estado={ticket.estado} size="sm" />
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground shrink-0">
          {fechaIngreso}
        </span>
      </div>

      {/* Body: Device & Reported Issue */}
      <div className="flex flex-col gap-1.5 my-2.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground tracking-tight">
          <Smartphone className="size-4 text-muted-foreground shrink-0" />
          <span className="truncate">{ticket.dispositivo}</span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words text-pretty">
          {ticket.falla}
        </p>
      </div>

      {/* Footer: Client, PIN, Media Count & Workshop Action */}
      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 text-xs text-muted-foreground">
          <span className="truncate max-w-[120px] font-medium text-foreground/80">
            {ticket.cliente?.nombre ?? 'Sin cliente'}
          </span>

          {ticket.contrasena && (
            <span
              className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground shrink-0"
              title="PIN / Contraseña"
            >
              <KeyRound className="size-3 text-muted-foreground" />
              <span>{ticket.contrasena}</span>
            </span>
          )}

          {adjuntos.length > 0 && (
            <span
              className="inline-flex items-center gap-1 font-mono tabular-nums text-xs text-muted-foreground shrink-0"
              title={`${adjuntos.length} evidencia(s) adjunta(s)`}
            >
              <Paperclip className="size-3" />
              <span>{adjuntos.length}</span>
            </span>
          )}
        </div>

        <TicketStatusWorkflow
          ticketId={ticket.id}
          currentStatus={ticket.estado}
          workshopOnly
        />
      </div>
    </div>
  );
};

export const TicketCard = React.memo(TicketCardComponent);
