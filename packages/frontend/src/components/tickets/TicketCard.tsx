import React from 'react';
import type { Ticket } from '../../api/types.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusWorkflow } from './TicketStatusWorkflow.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Phone,
  Smartphone,
  AlertCircle,
  Image as ImageIcon,
  Mic,
  Video,
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils.ts';

interface TicketCardProps {
  ticket: Ticket;
  onSelectTicket: (id: number) => void;
  onRequestEntregaGuard?: (ticket: Ticket) => void;
  isSelected?: boolean;
}

const TicketCardComponent: React.FC<TicketCardProps> = ({
  ticket,
  onSelectTicket,
  onRequestEntregaGuard,
  isSelected = false,
}) => {
  const hasPendingBalance = ticket.saldoPendiente > 0;
  const adjuntos = ticket.adjuntos ?? [];
  const imgCount = adjuntos.filter((a) => a.tipo === 'IMAGEN').length;
  const audCount = adjuntos.filter((a) => a.tipo === 'AUDIO').length;
  const vidCount = adjuntos.filter((a) => a.tipo === 'VIDEO').length;

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
        'group relative flex flex-col justify-between p-4 rounded-xl border bg-card transition-all duration-150 cursor-pointer',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        isSelected
          ? 'border-primary ring-1 ring-primary/25 bg-primary/[0.02]'
          : 'border-border hover:border-foreground/30 hover:shadow-2xs'
      )}
    >
      {/* Top Header: Folio, Status Badge & Debt Tag */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground shrink-0">
            {ticket.folio}
          </span>
          <TicketStatusBadge estado={ticket.estado} size="sm" />
        </div>
        {hasPendingBalance && ticket.estado === 'ENTREGADO' && (
          <Badge
            variant="outline"
            className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs font-normal shrink-0"
          >
            <AlertCircle className="size-3" />
            <span>Deudor</span>
          </Badge>
        )}
      </div>

      {/* Main Body: Device & Issue description */}
      <div className="flex flex-col gap-2 my-2.5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Smartphone className="size-4 text-primary shrink-0" />
          <span className="truncate">{ticket.dispositivo}</span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words pl-6">
          {ticket.falla}
        </p>

        {/* Customer & Media Badges */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-xs text-muted-foreground pt-0.5">
          <span className="font-medium text-foreground truncate max-w-[130px] sm:max-w-[170px]">
            {ticket.cliente?.nombre ?? 'Cliente sin nombre'}
          </span>
          {ticket.cliente?.telefono && (
            <span className="inline-flex items-center gap-1 font-mono text-muted-foreground shrink-0">
              <Phone className="size-3" />
              <span>{ticket.cliente.telefono}</span>
            </span>
          )}
          {adjuntos.length > 0 && (
            <div className="inline-flex items-center gap-1 shrink-0">
              {imgCount > 0 && (
                <Badge variant="secondary" className="gap-1 px-1.5 py-0 h-4.5 text-xs font-mono">
                  <ImageIcon className="size-2.5" />
                  <span>{imgCount}</span>
                </Badge>
              )}
              {audCount > 0 && (
                <Badge variant="secondary" className="gap-1 px-1.5 py-0 h-4.5 text-xs font-mono">
                  <Mic className="size-2.5" />
                  <span>{audCount}</span>
                </Badge>
              )}
              {vidCount > 0 && (
                <Badge variant="secondary" className="gap-1 px-1.5 py-0 h-4.5 text-xs font-mono">
                  <Video className="size-2.5" />
                  <span>{vidCount}</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Financials and Contextual Status Workflow */}
      <div className="pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Balances */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Total:</span>
            <span className="font-mono tabular-nums font-semibold text-foreground">
              {formatCurrency(ticket.costoTotal)}
            </span>
          </div>

          <div
            className={cn(
              'flex items-center gap-1 font-mono tabular-nums font-semibold',
              hasPendingBalance ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            )}
          >
            <span className="font-sans font-normal text-muted-foreground">Resta:</span>
            <span>{formatCurrency(ticket.saldoPendiente)}</span>
          </div>
        </div>

        {/* Linear Forward-Step + Overflow Menu */}
        <TicketStatusWorkflow
          ticketId={ticket.id}
          currentStatus={ticket.estado}
          saldoPendiente={ticket.saldoPendiente}
          onRequestEntregaGuard={() => onRequestEntregaGuard?.(ticket)}
        />
      </div>
    </div>
  );
};

export const TicketCard = React.memo(TicketCardComponent);
