import React from 'react';
import { useVenta } from '../../queries/pos/queries.ts';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet.tsx';
import { Badge } from '../ui/badge.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { Receipt, User, Clock, CreditCard, Package } from 'lucide-react';

interface VentaDetailDrawerProps {
  ventaId: number | null;
  onClose: () => void;
}

export const VentaDetailDrawer: React.FC<VentaDetailDrawerProps> = ({
  ventaId,
  onClose,
}) => {
  const { data: venta, isLoading, isError, error } = useVenta(ventaId ?? 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const getMetodoBadge = (metodo?: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return (
          <Badge variant="outline" className="border-border bg-card text-foreground text-xs font-normal rounded-full">
            Efectivo
          </Badge>
        );
      case 'TARJETA':
        return (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-normal rounded-full">
            Tarjeta
          </Badge>
        );
      case 'TRANSFERENCIA':
        return (
          <Badge variant="secondary" className="text-xs font-normal rounded-full">
            Transferencia
          </Badge>
        );
      case 'MIXTO':
      default:
        return (
          <Badge variant="outline" className="border-border text-muted-foreground text-xs font-normal rounded-full">
            Mixto
          </Badge>
        );
    }
  };

  return (
    <Sheet open={ventaId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="size-4" />
            </div>
            <SheetTitle className="text-base font-bold">
              Detalle de Venta #{ventaId}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Desglose de productos vendidos, totales y forma de pago.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <Spinner className="size-6 text-primary" />
            <span className="text-xs text-muted-foreground">Cargando venta...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-destructive">
            Error al consultar la venta: {(error as any)?.message || 'No encontrada'}
          </div>
        ) : !venta ? null : (
          <div className="flex flex-col gap-5 pt-4">
            {/* Metadatos de la venta */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[14px] bg-card border border-border text-xs">
              <div>
                <span className="text-muted-foreground flex items-center gap-1 font-medium text-xs">
                  <Clock className="size-3" />
                  Fecha & Hora
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {formatDate(venta.fecha)}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground flex items-center gap-1 font-medium text-xs">
                  <CreditCard className="size-3" />
                  Método de Pago
                </span>
                <div className="mt-0.5">{getMetodoBadge(venta.metodoPago)}</div>
              </div>

              <div>
                <span className="text-muted-foreground flex items-center gap-1 font-medium text-xs">
                  <User className="size-3" />
                  Cliente
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {venta.cliente?.nombre || 'Público en General'}
                </span>
                {venta.cliente?.telefono && (
                  <span className="text-xs text-muted-foreground block">
                    Tel: {venta.cliente.telefono}
                  </span>
                )}
              </div>

              <div>
                <span className="text-muted-foreground flex items-center gap-1 font-medium text-xs">
                  <User className="size-3" />
                  Cajero
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {venta.usuario?.nombre || `Usuario #${venta.usuarioId}`}
                </span>
                {venta.corteCajaId && (
                  <span className="text-xs text-muted-foreground block">
                    Turno de Caja #{venta.corteCajaId}
                  </span>
                )}
              </div>
            </div>

            {/* Lista de productos / artículos */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                Artículos Vendidos ({venta.detalles?.length || 0})
              </span>

              <div className="rounded-[14px] border border-border divide-y divide-border/60 overflow-hidden text-xs">
                {venta.detalles && venta.detalles.length > 0 ? (
                  venta.detalles.map((d: any) => {
                    const prodNombre =
                      d.variacion?.producto?.nombre || 'Artículo de mostrador';
                    const varNombre = d.variacion?.nombre;
                    const codigo = d.variacion?.codigo;

                    return (
                      <div
                        key={d.id}
                        className="p-3 flex items-center justify-between gap-3 bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {prodNombre}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            {varNombre && <span>{varNombre}</span>}
                            {codigo && <span>• SKU: {codigo}</span>}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-foreground">
                            ${d.subtotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {d.cantidad} x ${d.precioUnit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-xs">
                    Sin detalle de artículos disponible.
                  </div>
                )}
              </div>
            </div>

            {/* Total General */}
            <div className="p-4 rounded-[14px] bg-card border border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary block">
                  Total Cobrado
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  {venta.metodoPago}
                </span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-primary">
                ${venta.total.toFixed(2)}
              </span>
            </div>

            {venta.notas && (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Notas:</span> {venta.notas}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
