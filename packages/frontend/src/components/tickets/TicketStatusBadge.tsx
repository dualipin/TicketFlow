import React from 'react';
import type { TicketEstado } from '../../api/types.ts';
import { Badge } from '../ui/badge.tsx';
import { cn } from '../../lib/utils.ts';
import {
  Inbox,
  Search,
  Wrench,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';

interface TicketStatusBadgeProps {
  estado: TicketEstado;
  className?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  TicketEstado,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  RECIBIDO: {
    label: 'Recibido',
    variant: 'outline',
    className: 'border-border bg-card text-foreground',
    icon: Inbox,
  },
  DIAGNOSTICO: {
    label: 'En Diagnóstico',
    variant: 'secondary',
    className: 'border-border/60 bg-muted text-muted-foreground',
    icon: Search,
  },
  EN_REPARACION: {
    label: 'En Reparación',
    variant: 'outline',
    className: 'border-primary/30 bg-primary/10 text-primary',
    icon: Wrench,
  },
  LISTO: {
    label: 'Listo p/ Entrega',
    variant: 'default',
    className: 'bg-primary text-primary-foreground',
    icon: CheckCircle,
  },
  ENTREGADO: {
    label: 'Entregado',
    variant: 'secondary',
    className: 'border-border/40 bg-muted text-muted-foreground',
    icon: Truck,
  },
  CANCELADO: {
    label: 'Cancelado',
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle,
  },
};

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  estado,
  className,
  size = 'md',
}) => {
  const config = statusConfig[estado] ?? {
    label: estado,
    variant: 'outline' as const,
    className: 'bg-muted text-muted-foreground',
    icon: Inbox,
  };

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-normal gap-1 rounded-full',
        size === 'sm' ? 'px-2 py-0 text-[10px] h-4.5' : 'px-2.5 py-0.5 text-xs h-5',
        config.className,
        className
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
};
