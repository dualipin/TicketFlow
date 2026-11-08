import React from 'react';
import { BorderBeam } from 'border-beam';
import type { Ticket } from '../../api/types.ts';
import { TicketStatusBadge } from './TicketStatusBadge.tsx';
import { TicketStatusChanger } from './TicketStatusChanger.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Separator } from '../ui/separator.tsx';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '../ui/card.tsx';
import { Phone, Smartphone, AlertCircle, ChevronRight, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

interface TicketCardProps {
  ticket: Ticket;
  onSelectTicket: (id: number) => void;
  isSelected?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onSelectTicket,
  isSelected = false,
}) => {
  const hasPendingBalance = ticket.saldoPendiente > 0;

  return (
    <BorderBeam
      size="pulse-inner"
      colorVariant="mono"
      active={isSelected}
      theme="auto"
      className="rounded-xl w-full"
    >
      <Card
        className={cn(
          'group relative transition-all py-4 gap-3 rounded-xl bg-card w-full',
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
              className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[10px] font-normal"
            >
              <AlertCircle className="size-2.5" />
              Deudor
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => onSelectTicket(ticket.id)}
          className="gap-1 text-xs text-primary hover:bg-primary/10 rounded-full"
        >
          <span>Ver detalle</span>
          <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardHeader>

      <Separator className="mx-4 my-1 w-auto opacity-50" />

      {/* Body: Device & Issue description */}
      <CardContent className="px-4 py-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Smartphone className="size-3.5 text-primary shrink-0" />
          <span>{ticket.dispositivo}</span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 pl-5 font-normal">
          {ticket.falla}
        </p>

        {/* Customer info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-5 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">
            {ticket.cliente?.nombre ?? 'Cliente sin nombre'}
          </span>
          {ticket.cliente?.telefono && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Phone className="size-2.5" />
              {ticket.cliente.telefono}
            </span>
          )}
        </div>
      </CardContent>

      <Separator className="mx-4 my-1 w-auto opacity-40" />

      {/* Footer: Financials and Optimistic Status Changer */}
      <CardFooter className="px-4 py-0 flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Balances */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="size-3 text-muted-foreground" />
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

        {/* Quick status update button group */}
        <TicketStatusChanger
          ticketId={ticket.id}
          currentStatus={ticket.estado}
        />
      </CardFooter>
    </Card>
  </BorderBeam>
  );
};
