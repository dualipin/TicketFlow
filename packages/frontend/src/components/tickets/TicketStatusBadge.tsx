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
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    icon: Inbox,
  },
  DIAGNOSTICO: {
    label: 'En Diagnóstico',
    variant: 'outline',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    icon: Search,
  },
  EN_REPARACION: {
    label: 'En Reparación',
    variant: 'outline',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    icon: Wrench,
  },
  LISTO: {
    label: 'Listo p/ Entrega',
    variant: 'outline',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    icon: CheckCircle,
  },
  ENTREGADO: {
    label: 'Entregado',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border/60',
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
        'font-medium gap-1',
        size === 'sm' ? 'px-1.5 py-0 text-[10px] h-4.5' : 'px-2 py-0.5 text-xs h-5',
        config.className,
        className
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
};
