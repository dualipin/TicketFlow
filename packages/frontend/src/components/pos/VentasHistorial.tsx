import React, { useState, useMemo } from 'react';
import NumberFlow from '@number-flow/react';
import { useVentas } from '../../queries/pos/queries.ts';
import { useCorteActivo } from '../../queries/corte-caja/queries.ts';
import type { MetodoPagoVenta } from '../../api/types.ts';
import { VentaDetailDrawer } from './VentaDetailDrawer.tsx';
import { Card, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group.tsx';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  Receipt,
  Search,
  DollarSign,
  CreditCard,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const VentasHistorial: React.FC = () => {
  const { data: corteActivoData } = useCorteActivo();
  const activeCorteId = corteActivoData?.activo ? corteActivoData.corte?.id : undefined;

  const [onlyTurnoActivo, setOnlyTurnoActivo] = useState(false);
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPagoVenta | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null);

  // Fetch sales, optionally filtered by active cash drawer id
  const filters = useMemo(() => {
    return onlyTurnoActivo && activeCorteId ? { corteCajaId: activeCorteId } : undefined;
  }, [onlyTurnoActivo, activeCorteId]);

  const { data: ventas, isLoading } = useVentas(filters);

  // Client-side filtering for search and payment method
  const filteredVentas = useMemo(() => {
    if (!ventas) return [];
    let list = ventas;

    if (selectedMetodo !== 'ALL') {
      list = list.filter((v) => v.metodoPago === selectedMetodo);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (v) =>
          `#${v.id}`.includes(q) ||
          (v.cliente?.nombre && v.cliente.nombre.toLowerCase().includes(q)) ||
          (v.usuario?.nombre && v.usuario.nombre.toLowerCase().includes(q)) ||
          (v.notas && v.notas.toLowerCase().includes(q))
      );
    }

    return list;
  }, [ventas, selectedMetodo, searchQuery]);

  // KPIs
  const totalVendido = useMemo(() => {
    return filteredVentas.reduce((acc, v) => acc + (v.total || 0), 0);
  }, [filteredVentas]);

  const totalEfectivo = useMemo(() => {
    return filteredVentas
      .filter((v) => v.metodoPago === 'EFECTIVO')
      .reduce((acc, v) => acc + (v.total || 0), 0);
  }, [filteredVentas]);

  const totalElectronico = useMemo(() => {
    return filteredVentas
      .filter((v) => v.metodoPago === 'TARJETA' || v.metodoPago === 'TRANSFERENCIA')
      .reduce((acc, v) => acc + (v.total || 0), 0);
  }, [filteredVentas]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getMetodoBadge = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold">
            Efectivo
          </Badge>
        );
      case 'TARJETA':
        return (
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/30 text-[10px] font-semibold">
            Tarjeta
          </Badge>
        );
      case 'TRANSFERENCIA':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] font-semibold">
            Transferencia
          </Badge>
        );
      case 'MIXTO':
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-semibold">
            Mixto
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Receipt className="size-6 text-primary" />
          Historial de Ventas de Mostrador
        </h1>
        <p className="text-xs text-muted-foreground">
          Consulta y auditoría de transacciones, tickets cobrados y desglose de formas de pago.
        </p>
      </div>

      {/* Tarjetas de Resumen / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
            <DollarSign className="size-3.5 text-primary" />
            Total Vendido
          </span>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={totalVendido} format={{ style: 'currency', currency: 'USD' }} />
          </span>
          <span className="text-[10px] text-muted-foreground">
            {filteredVentas.length} transacciones
          </span>
        </Card>

        <Card className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
            <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            En Efectivo
          </span>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
            <NumberFlow value={totalEfectivo} format={{ style: 'currency', currency: 'USD' }} />
          </span>
          <span className="text-[10px] text-muted-foreground">
            {((totalEfectivo / (totalVendido || 1)) * 100).toFixed(0)}% del total
          </span>
        </Card>

        <Card className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
            <CreditCard className="size-3.5 text-primary" />
            En Tarjeta / Transf.
          </span>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            <NumberFlow value={totalElectronico} format={{ style: 'currency', currency: 'USD' }} />
          </span>
          <span className="text-[10px] text-muted-foreground">
            {((totalElectronico / (totalVendido || 1)) * 100).toFixed(0)}% del total
          </span>
        </Card>

        <Card className="p-4 rounded-xl border border-border bg-card flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
            <Layers className="size-3.5 text-muted-foreground" />
            Ticket Promedio
          </span>
          <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            <NumberFlow
              value={filteredVentas.length > 0 ? totalVendido / filteredVentas.length : 0}
              format={{ style: 'currency', currency: 'USD' }}
            />
          </span>
          <span className="text-[10px] text-muted-foreground">Por venta</span>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <Card className="p-4 rounded-xl border border-border bg-card">
        <CardContent className="p-0 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Buscador */}
            <div className="flex-1 max-w-md">
              <InputGroup className="h-8">
                <InputGroupAddon align="inline-start">
                  <Search className="size-3.5 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por # folio, cliente o cajero..."
                  className="text-xs"
                />
              </InputGroup>
            </div>

            {/* Quick Toggle: Solo Turno Activo */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={onlyTurnoActivo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOnlyTurnoActivo(!onlyTurnoActivo)}
                disabled={!activeCorteId}
                className={`h-8 gap-1.5 text-xs font-medium ${
                  onlyTurnoActivo
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border/60 bg-muted/30 text-muted-foreground'
                }`}
                title={!activeCorteId ? 'No hay un turno de caja abierto' : undefined}
              >
                <Filter className="size-3.5" data-icon="inline-start" />
                <span>Solo Turno Actual {activeCorteId ? `(#${activeCorteId})` : ''}</span>
              </Button>
            </div>
          </div>

          {/* Filtro por Método de Pago */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <Tabs
              value={selectedMetodo}
              onValueChange={(val) => setSelectedMetodo(val as MetodoPagoVenta | 'ALL')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="ALL" className="text-xs px-2.5 py-1">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="EFECTIVO" className="text-xs px-2.5 py-1">
                  Efectivo
                </TabsTrigger>
                <TabsTrigger value="TARJETA" className="text-xs px-2.5 py-1">
                  Tarjeta
                </TabsTrigger>
                <TabsTrigger value="TRANSFERENCIA" className="text-xs px-2.5 py-1">
                  Transferencia
                </TabsTrigger>
                <TabsTrigger value="MIXTO" className="text-xs px-2.5 py-1">
                  Mixto
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Ventas */}
      <Card className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-2.5">Folio</th>
                <th className="px-4 py-2.5">Fecha & Hora</th>
                <th className="px-4 py-2.5">Cliente</th>
                <th className="px-4 py-2.5">Cajero</th>
                <th className="px-4 py-2.5">Método</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Spinner className="size-5 text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No se encontraron ventas con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => (
                  <tr
                    key={venta.id}
                    onClick={() => setSelectedVentaId(venta.id)}
                    className="hover:bg-muted/20 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-bold text-foreground">
                      #{venta.id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(venta.fecha)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {venta.cliente?.nombre || 'Público en General'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {venta.usuario?.nombre || `Usuario #${venta.usuarioId}`}
                    </td>
                    <td className="px-4 py-3">{getMetodoBadge(venta.metodoPago)}</td>
                    <td className="px-4 py-3 text-right font-black text-foreground text-sm">
                      ${venta.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="opacity-70 group-hover:opacity-100 gap-1 text-[11px]"
                      >
                        <span>Detalle</span>
                        <ChevronRight className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drawer de Detalle de Venta */}
      <VentaDetailDrawer
        ventaId={selectedVentaId}
        onClose={() => setSelectedVentaId(null)}
      />
    </div>
  );
};
