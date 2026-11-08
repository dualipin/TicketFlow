import React, { useEffect } from 'react';
import type { CorteCaja, CorteCajaActivo } from '../../api/types.ts';
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
import {
  formatCurrencyMxn,
  formatFechaCorte,
  calcularDesgloseEfectivoCorte,
} from './corte-caja-engine.ts';
import { Printer, Receipt } from 'lucide-react';

interface CorteZTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  corte: CorteCaja | CorteCajaActivo | null;
}

export const CorteZTicketModal: React.FC<CorteZTicketModalProps> = ({
  isOpen,
  onClose,
  corte,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!corte) return null;

  const diferencia = corte.diferencia ?? 0;
  const isCuadrado = diferencia === 0;
  const isSobrante = diferencia > 0;

  const { ventasEf, pagosEf } = calcularDesgloseEfectivoCorte(corte);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md print:border-none print:shadow-none print:p-0">
        <DialogHeader className="print:hidden">
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Comprobante de Corte Z
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Ticket de arqueo definitivo y entrega de valores de gaveta.
          </DialogDescription>
        </DialogHeader>

        {/* Tira Térmica de Auditoría con id="printable-receipt" para @media print */}
        <div
          id="printable-receipt"
          className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 font-mono text-xs text-foreground print:border-none print:p-0"
        >
          {/* Encabezado */}
          <div className="text-center">
            <h2 className="text-sm font-black tracking-tight uppercase">TicketFlow POS & Taller</h2>
            <p className="text-xs text-muted-foreground">Control de Turnos y Efectivo</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider">
              --- CORTE Z #{corte.id} ---
            </p>
          </div>

          <Separator className="my-1 border-dashed" />

          {/* Metadatos del Turno */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Responsable:</span>
              <span className="font-bold">{corte.usuario?.nombre || `Usuario #${corte.usuarioId}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Apertura:</span>
              <span>{formatFechaCorte(corte.fechaApertura)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cierre:</span>
              <span>{formatFechaCorte(corte.fechaCierre || new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={corte.estado === 'ABIERTO' ? 'default' : 'secondary'} className="text-xs h-5 px-1.5">
                {corte.estado}
              </Badge>
            </div>
          </div>

          <Separator className="my-1 border-dashed" />

          {/* Resumen Contable */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span>(+) Fondo Inicial:</span>
              <span className="font-semibold">{formatCurrencyMxn(corte.montoInicial)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Ventas PdV (Ef.):</span>
              <span className="font-semibold">{formatCurrencyMxn(ventasEf)}</span>
            </div>
            <div className="flex justify-between">
              <span>(+) Pagos Taller (Ef.):</span>
              <span className="font-semibold">{formatCurrencyMxn(pagosEf)}</span>
            </div>

            <Separator className="my-0.5" />

            <div className="flex justify-between font-bold">
              <span>(=) Total Esperado:</span>
              <span>{formatCurrencyMxn(corte.montoCalculado)}</span>
            </div>

            <div className="flex justify-between font-bold">
              <span>(✓) Físico Contado:</span>
              <span>{corte.montoReal !== null ? formatCurrencyMxn(corte.montoReal) : '-'}</span>
            </div>

            <div className="flex justify-between items-center pt-1 font-black">
              <span>Diferencia:</span>
              <span
                className={
                  isCuadrado
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isSobrante
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-destructive'
                }
              >
                {isCuadrado
                  ? 'CUADRADO ($0.00)'
                  : isSobrante
                  ? `SOBRANTE (+${formatCurrencyMxn(diferencia)})`
                  : `FALTANTE (-${formatCurrencyMxn(Math.abs(diferencia))})`}
              </span>
            </div>
          </div>

          {/* Resumen de Operaciones */}
          <div className="rounded-lg bg-muted/30 p-2 text-xs text-muted-foreground flex justify-between">
            <span>{corte.ventas?.length || 0} ventas</span>
            <span>•</span>
            <span>{corte.pagosCobrados?.length || 0} cobros taller</span>
          </div>

          {/* Notas */}
          {corte.notas && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-xs">
              <span className="font-bold text-foreground">Notas:</span> {corte.notas}
            </div>
          )}

          {/* Firmas de Custodia */}
          <div className="mt-4 flex flex-col gap-8 pt-4">
            <div className="flex flex-col items-center">
              <div className="w-3/4 border-b border-foreground/60" />
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                Firma Cajero Saliente
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-3/4 border-b border-foreground/60" />
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                Firma Supervisor / Recibió Sobre
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex gap-2 print:hidden">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer data-icon="inline-start" />
            <span>Imprimir Ticket (Ctrl+P)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
