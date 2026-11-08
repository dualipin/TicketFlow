import React from 'react';
import type { TicketEstado } from '../../api/types.ts';
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
    classes: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  RECIBIDO: {
    label: 'Recibido',
    classes:
      'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    icon: Inbox,
  },
  DIAGNOSTICO: {
    label: 'En Diagnóstico',
    classes:
      'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    icon: Search,
  },
  EN_REPARACION: {
    label: 'En Reparación',
    classes:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    icon: Wrench,
  },
  LISTO: {
    label: 'Listo p/ Entrega',
    classes:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    icon: CheckCircle,
  },
  ENTREGADO: {
    label: 'Entregado',
    classes:
      'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    icon: Truck,
  },
  CANCELADO: {
    label: 'Cancelado',
    classes:
      'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
    icon: XCircle,
  },
};

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  estado,
  className,
  size = 'md',
}) => {
  const config = statusConfig[estado] || {
    label: estado,
    classes: 'bg-muted text-muted-foreground border-border',
    icon: Inbox,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all select-none',
        config.classes,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
