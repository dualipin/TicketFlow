import React, { useEffect, useCallback } from 'react';
import NumberFlow from '@number-flow/react';
import type { CartItem, MetodoPagoVenta } from '../../api/types.ts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Separator } from '../ui/separator.tsx';
import { CheckCircle2, Printer, Plus, User, CreditCard, Banknote } from 'lucide-react';

export interface PosSaleSummary {
  ventaId: number;
  total: number;
  cambio: number;
  metodoPago: MetodoPagoVenta;
  clienteNombre?: string | null;
  items: CartItem[];
  montoRecibido?: number;
}

interface PosSaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: PosSaleSummary | null;
}

export const PosSaleSuccessModal: React.FC<PosSaleSuccessModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Atajos de teclado mientras el modal está abierto:
  // [Enter] -> Nueva Venta (Cerrar modal y limpiar)
  // [Ctrl+P] / [Cmd+P] -> Imprimir comprobante
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrint]);

  if (!summary) return null;

  const {
    ventaId,
    total,
    cambio,
    metodoPago,
    clienteNombre,
    items,
    montoRecibido,
  } = summary;

  const isEfectivo = metodoPago === 'EFECTIVO';
  const tieneCambio = isEfectivo && cambio > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="items-center text-center pb-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="size-7" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              ¡Cobro Registrado!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span>Folio: <strong className="text-foreground font-mono">#{ventaId}</strong></span>
              <span>•</span>
              <span>TicketFlow POS</span>
            </DialogDescription>
          </DialogHeader>

          {/* Héroe: Despliegue de Cambio en Números Gigantes */}
          {tieneCambio ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Cambio a Entregar al Cliente
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 py-1">
                <NumberFlow
                  value={cambio}
                  format={{ style: 'currency', currency: 'USD' }}
                />
              </div>
              {montoRecibido !== undefined && (
                <span className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
                  Efectivo recibido: ${montoRecibido.toFixed(2)} • Total: ${total.toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-center flex flex-col items-center justify-center gap-0.5">
              <span className="text-xs text-muted-foreground">
                Total Pagado ({metodoPago})
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-tight text-primary">
                <NumberFlow
                  value={total}
                  format={{ style: 'currency', currency: 'USD' }}
                />
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Pago cubierto con exactitud (sin cambio)
              </span>
            </div>
          )}

          {/* Resumen de Venta */}
          <div className="flex flex-col gap-3 py-1">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                Cliente:
              </span>
              <span className="font-semibold text-foreground">
                {clienteNombre || 'Público en General'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                {isEfectivo ? (
                  <Banknote className="size-3.5 text-primary" />
                ) : (
                  <CreditCard className="size-3.5 text-primary" />
                )}
                Método de Pago:
              </span>
              <Badge variant="secondary" className="font-semibold text-xs py-0 h-5">
                {metodoPago}
              </Badge>
            </div>

            <Separator className="my-1" />

            {/* Desglose resumido de artículos */}
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.variacionId}
                  className="flex items-center justify-between text-xs py-1 px-1 rounded-md bg-muted/20"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium text-foreground truncate block">
                      {item.cantidad}x {item.productoNombre}
                    </span>
                    <span className="text-muted-foreground text-xs truncate block">
                      {item.variacionNombre} • <span className="font-mono">{item.codigo}</span>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">
                    ${(item.precioUnit * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="gap-2 text-xs h-10 w-full sm:w-auto"
            >
              <Printer className="size-4" data-icon="inline-start" />
              <span>Imprimir Ticket</span>
              <kbd className="hidden sm:inline-block text-xs bg-muted px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
                Ctrl+P
              </kbd>
            </Button>

            <Button
              type="button"
              onClick={onClose}
              className="gap-2 text-xs font-semibold h-10 w-full sm:flex-1"
            >
              <Plus className="size-4" data-icon="inline-start" />
              <span>Nueva Venta</span>
              <kbd className="hidden sm:inline-block text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded font-mono">
                Enter
              </kbd>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comprobante imprimible solo para @media print */}
      <div id="printable-receipt" className="hidden print:block">
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>TICKETFLOW</h2>
          <p style={{ margin: '2px 0', fontSize: '12px' }}>Comprobante de Venta</p>
          <p style={{ margin: '2px 0', fontSize: '12px', fontFamily: 'monospace' }}>Folio: #{ventaId}</p>
          <p style={{ margin: '2px 0', fontSize: '12px' }}>{new Date().toLocaleString()}</p>
        </div>

        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '8px 0', fontSize: '12px' }}>
          <p style={{ margin: '2px 0' }}><strong>Cliente:</strong> {clienteNombre || 'Público en General'}</p>
          <p style={{ margin: '2px 0' }}><strong>Pago:</strong> {metodoPago}</p>
        </div>

        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', margin: '8px 0' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Art.</th>
              <th style={{ textAlign: 'center', padding: '4px 0' }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.variacionId}>
                <td style={{ padding: '3px 0' }}>{it.productoNombre} ({it.variacionNombre})</td>
                <td style={{ textAlign: 'center', padding: '3px 0' }}>{it.cantidad}</td>
                <td style={{ textAlign: 'right', padding: '3px 0', fontFamily: 'monospace' }}>
                  ${(it.precioUnit * it.cantidad).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', fontSize: '12px' }}>
          <p style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0', fontWeight: 'bold' }}>
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </p>
          {isEfectivo && montoRecibido !== undefined && (
            <>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', fontSize: '12px' }}>
                <span>Recibido:</span>
                <span>${montoRecibido.toFixed(2)}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', fontSize: '12px', fontWeight: 'bold' }}>
                <span>CAMBIO:</span>
                <span>${cambio.toFixed(2)}</span>
              </p>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px' }}>
          <p style={{ margin: '2px 0' }}>¡Gracias por su compra!</p>
          <p style={{ margin: '2px 0' }}>ticketflow.dev</p>
        </div>
      </div>
    </>
  );
};
