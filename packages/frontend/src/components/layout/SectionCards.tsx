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
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 1. Reparaciones en Taller */}
      <Card className="@container/card bg-card border-border shadow-2xs">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium text-balance">
            Taller Activo
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            <NumberFlow value={ticketsActivosCount} />
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-border bg-secondary/80">
              <Wrench className="size-3.5 text-primary" />
              <span>En Cola</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Órdenes en diagnóstico y servicio</span>
          </div>
          <div className="text-xs text-muted-foreground text-pretty">
            {tickets.length} folios históricos registrados
          </div>
        </CardFooter>
      </Card>

      {/* 2. Listos para Entrega */}
      <Card className="@container/card bg-card border-border shadow-2xs">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium text-balance">
            Listos para Entrega
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            <NumberFlow value={ticketsListosCount} />
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Por Cobrar</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Reparaciones concluidas</span>
          </div>
          <div className="text-xs text-muted-foreground text-pretty">
            Avisar a cliente para retiro de equipo
          </div>
        </CardFooter>
      </Card>

      {/* 3. Ingresos / Ventas del Turno */}
      <Card className="@container/card bg-card border-border shadow-2xs">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium text-balance">
            Ventas del Turno
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            <NumberFlow
              value={totalVentasTurno}
              format={{ style: 'currency', currency: 'MXN' }}
              locales="es-MX"
            />
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-border bg-secondary/80">
              <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>PdV + Taller</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Total facturado en mostrador</span>
          </div>
          <div className="text-xs text-muted-foreground text-pretty">
            {corteData?.activo ? `Turno #${corteData.corte?.id} en curso` : 'Sin turno activo'}
          </div>
        </CardFooter>
      </Card>

      {/* 4. Efectivo en Turno / Caja */}
      <Card className="@container/card bg-card border-border shadow-2xs">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground font-medium text-balance">
            Efectivo en Caja
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            <NumberFlow
              value={montoCaja}
              format={{ style: 'currency', currency: 'MXN' }}
              locales="es-MX"
            />
          </CardTitle>
          <CardAction>
            {corteData?.activo ? (
              <Badge
                variant="outline"
                className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-border bg-secondary/80 text-foreground"
              >
                <Coins className="size-3.5 text-amber-500 dark:text-amber-400" />
                <span>Arqueo Vivo</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 px-2.5 py-0.5 text-xs font-normal border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Caja Cerrada</span>
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm pt-1">
          <div className="line-clamp-1 flex items-center gap-1.5 font-medium text-foreground/90">
            <span>Saldo contable en gaveta</span>
          </div>
          <div className="text-xs text-muted-foreground text-pretty">
            Incluye fondo inicial y cobros en efectivo
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
