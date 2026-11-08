import React from 'react';
import { BorderBeam } from 'border-beam';
import type { Ticket } from '../../api/types.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusWorkflow } from './TicketStatusWorkflow.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Separator } from '../ui/separator.tsx';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '../ui/card.tsx';
import {
  Phone,
  Smartphone,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Image as ImageIcon,
  Mic,
  Video,
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

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
    <BorderBeam
      size="pulse-inner"
      colorVariant="mono"
      active={isSelected}
      theme="auto"
      className="rounded-xl w-full"
    >
      <Card
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
          'group relative transition-all py-4 gap-3 rounded-xl bg-card w-full cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
          isSelected
            ? 'border-foreground/80 ring-2 ring-foreground/20 bg-foreground/[0.04]'
            : 'border-border hover:border-foreground/30'
        )}
      >
      {/* Header row: Folio, Status Badge & View Detail Button */}
      <CardHeader className="px-4 py-0 flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            {ticket.folio}
          </span>
          <TicketStatusBadge estado={ticket.estado} size="sm" />
          {hasPendingBalance && ticket.estado === 'ENTREGADO' && (
            <Badge
              variant="outline"
              className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-xs font-normal"
            >
              <AlertCircle className="size-3" />
              Deudor
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTicket(ticket.id);
          }}
          className="gap-1 text-xs text-primary hover:bg-primary/10 rounded-full"
        >
          <span>Ver detalle</span>
          <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardHeader>

      <Separator className="mx-4 my-1 w-auto opacity-50" />

      {/* Body: Device & Issue description */}
      <CardContent className="px-4 py-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Smartphone className="size-4 text-primary shrink-0" />
          <span>{ticket.dispositivo}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 pl-6 font-normal">
          {ticket.falla}
        </p>

        {/* Customer info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {ticket.cliente?.nombre ?? 'Cliente sin nombre'}
          </span>
          {ticket.cliente?.telefono && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Phone className="size-3" />
              {ticket.cliente.telefono}
            </span>
          )}
          {adjuntos.length > 0 && (
            <div className="inline-flex items-center gap-1.5">
              {imgCount > 0 && (
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 h-5 text-xs font-mono">
                  <ImageIcon className="size-3" />
                  {imgCount}
                </Badge>
              )}
              {audCount > 0 && (
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 h-5 text-xs font-mono">
                  <Mic className="size-3" />
                  {audCount}
                </Badge>
              )}
              {vidCount > 0 && (
                <Badge variant="secondary" className="gap-1 px-2 py-0.5 h-5 text-xs font-mono">
                  <Video className="size-3" />
                  {vidCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <Separator className="mx-4 my-1 w-auto opacity-40" />

      {/* Footer: Financials and Optimistic Status Changer */}
      <CardFooter className="px-4 py-0 flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Balances */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="size-3.5 text-muted-foreground" />
            <span>Total:</span>
            <span className="font-semibold text-foreground">
              ${ticket.costoTotal.toFixed(2)}
            </span>
          </div>

          <div
            className={cn(
              'flex items-center gap-1 font-semibold',
              hasPendingBalance ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            )}
          >
            <span>Resta:</span>
            <span>
              ${ticket.saldoPendiente.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Contextual Status Workflow Action (Linear Forward-Step + Overflow Menu) */}
        <TicketStatusWorkflow
          ticketId={ticket.id}
          currentStatus={ticket.estado}
          saldoPendiente={ticket.saldoPendiente}
          onRequestEntregaGuard={() => onRequestEntregaGuard?.(ticket)}
        />
      </CardFooter>
    </Card>
  </BorderBeam>
  );
};

export const TicketCard = React.memo(TicketCardComponent);
