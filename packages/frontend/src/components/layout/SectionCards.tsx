import React, { useMemo } from 'react';
import NumberFlow from '@number-flow/react';
import { useTickets } from '../../queries/tickets/queries.ts';
import { useCorteActivo } from '../../queries/corte-caja/queries.ts';
import { useVentas } from '../../queries/pos/queries.ts';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Wrench,
  CheckCircle2,
  TrendingUp,
  Coins,
  AlertCircle,
} from 'lucide-react';

export const SectionCards: React.FC = () => {
  const { data: tickets = [] } = useTickets();
  const { data: corteData } = useCorteActivo();
  const { data: ventas = [] } = useVentas();

  // Metric 1: Tickets en taller activos (recibido, diagnostico, reparacion)
  const ticketsActivosCount = useMemo(() => {
    return tickets.filter((t) =>
      ['RECIBIDO', 'DIAGNOSTICO', 'EN_REPARACION'].includes(t.estado)
    ).length;
  }, [tickets]);

  // Metric 2: Equipos listos para entrega
  const ticketsListosCount = useMemo(() => {
    return tickets.filter((t) => t.estado === 'LISTO').length;
  }, [tickets]);

  // Metric 3: Ventas del turno o del día
  const totalVentasTurno = useMemo(() => {
    if (corteData?.activo && corteData.corte) {
      const vTotal = corteData.corte.ventas?.reduce((sum, v) => sum + (v.total || 0), 0);
      if (typeof vTotal === 'number' && vTotal > 0) return vTotal;
      return (corteData.corte.ventasEfectivo || 0) + (corteData.corte.pagosEfectivo || 0);
    }
    // Fallback sum of today's sales
    const today = new Date().toISOString().split('T')[0];
    return ventas
      .filter((v) => v.fecha?.startsWith(today))
      .reduce((sum, v) => sum + (v.total || 0), 0);
  }, [corteData, ventas]);

  // Metric 4: Efectivo en caja
  const montoCaja = corteData?.activo && corteData.corte
    ? corteData.corte.montoCalculado
    : 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 1. Reparaciones en Taller */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            Taller Activo
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground @[250px]/card:text-3xl">
            <NumberFlow value={ticketsActivosCount} />
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-border bg-secondary/80">
              <Wrench className="size-3.5 text-primary" data-icon="inline-start" />
              <span>En Cola</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Órdenes en diagnóstico y servicio</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {tickets.length} folios históricos registrados
          </div>
        </CardFooter>
      </Card>

      {/* 2. Listos para Entrega */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            Listos para Entrega
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground @[250px]/card:text-3xl">
            <NumberFlow value={ticketsListosCount} />
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              <CheckCircle2 className="size-3.5 text-emerald-400" data-icon="inline-start" />
              <span>Por Cobrar</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Reparaciones concluidas</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Avisar a cliente para retiro de equipo
          </div>
        </CardFooter>
      </Card>

      {/* 3. Ingresos / Ventas del Turno */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            Ventas del Turno
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground @[250px]/card:text-3xl">
            <NumberFlow
              value={totalVentasTurno}
              format={{ style: 'currency', currency: 'USD' }}
            />
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-border bg-secondary/80">
              <TrendingUp className="size-3.5 text-[#59d499]" data-icon="inline-start" />
              <span>PdV + Taller</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Total facturado en mostrador</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {corteData?.activo ? `Turno #${corteData.corte?.id} en curso` : 'Sin turno activo'}
          </div>
        </CardFooter>
      </Card>

      {/* 4. Efectivo en Turno / Caja */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            Efectivo en Caja
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground @[250px]/card:text-3xl">
            <NumberFlow
              value={montoCaja}
              format={{ style: 'currency', currency: 'USD' }}
            />
          </CardTitle>
          <CardAction>
            {corteData?.activo ? (
              <Badge
                variant="outline"
                className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-border bg-secondary/80 text-foreground"
              >
                <Coins className="size-3.5 text-[#ffc533]" data-icon="inline-start" />
                <span>Arqueo Vivo</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-amber-500/30 bg-amber-500/10 text-amber-400"
              >
                <AlertCircle className="size-3.5" data-icon="inline-start" />
                <span>Caja Cerrada</span>
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Saldo contable en gaveta</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Incluye fondo inicial y cobros en efectivo
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
