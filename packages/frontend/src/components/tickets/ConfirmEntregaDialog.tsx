import React, { useState } from 'react';
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
import { Spinner } from '../ui/spinner.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx';
import { useRegisterPago, useUpdateTicketStatus } from '../../queries/tickets/mutations.ts';
import { useAuth } from '../../lib/auth-context.tsx';
import { toast } from '../ui/sonner.tsx';
import type { MetodoPago } from '../../api/types.ts';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../lib/utils.ts';

interface ConfirmEntregaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  folio: string;
  dispositivo: string;
  saldoPendiente: number;
  onSuccess?: () => void;
}

export const ConfirmEntregaDialog: React.FC<ConfirmEntregaDialogProps> = ({
  isOpen,
  onClose,
  ticketId,
  folio,
  dispositivo,
  saldoPendiente,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const registerPago = useRegisterPago();
  const updateStatus = useUpdateTicketStatus();

  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vía A: Cobrar el saldo pendiente completo en caja y marcar como ENTREGADO
  const handleCobrarYEntregar = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Registrar liquidación en caja
      await registerPago.mutateAsync({
        ticketId,
        monto: saldoPendiente,
        usuarioId: currentUser?.id ?? 3,
        metodoPago,
        notas: `Liquidación total al entregar equipo (${metodoPago})`,
      });

      // 2. Marcar como ENTREGADO
      await updateStatus.mutateAsync({
        id: ticketId,
        estado: 'ENTREGADO',
        nota: `Equipo entregado tras liquidación de saldo de $${saldoPendiente.toFixed(2)}`,
      });

      toast.success('Cobro registrado y orden entregada', {
        description: `Se liquidaron $${saldoPendiente.toFixed(2)} para el folio ${folio}`,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error('Error al procesar cobro y entrega', {
        description: err?.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vía B: Autorizar entrega a crédito ("fiado") manteniendo el adeudo
  const handleAutorizarCredito = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateStatus.mutateAsync({
        id: ticketId,
        estado: 'ENTREGADO',
        nota: `Entrega a crédito autorizada por operador ${currentUser?.nombre ?? 'Mostrador'} con saldo deudor de $${saldoPendiente.toFixed(2)}`,
      });

      toast.warning('Orden entregada a crédito', {
        description: `El folio ${folio} mantiene un saldo pendiente de $${saldoPendiente.toFixed(2)}`,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error('Error al autorizar entrega a crédito', {
        description: err?.message || 'No se pudo actualizar el ticket.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md p-6 gap-5 rounded-2xl">
        <DialogHeader className="gap-1.5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5" />
            <DialogTitle className="text-base font-semibold">
              Equipo con Saldo Deudor Pendiente
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            No se puede entregar el equipo directamente sin resolver el saldo pendiente.
          </DialogDescription>
        </DialogHeader>

        {/* Info Card */}
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold text-foreground">{folio}</span>
            <span className="text-muted-foreground truncate max-w-[200px]">{dispositivo}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-amber-500/15">
            <span className="text-xs font-medium text-foreground">Saldo pendiente por cobrar:</span>
            <Badge variant="destructive" className="font-mono tabular-nums text-xs px-2 py-0.5">
              {formatCurrency(saldoPendiente)}
            </Badge>
          </div>
        </div>

        {/* Action Options */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Método de pago para liquidación inmediata:
            </label>
            <Select
              value={metodoPago}
              onValueChange={(val) => setMetodoPago(val as MetodoPago)}
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="EFECTIVO">Efectivo en Caja</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta (Terminal TPV)</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia Bancaria</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-xs rounded-lg"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={handleAutorizarCredito}
            className="text-xs text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 rounded-lg"
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            <span>Autorizar a Crédito</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isSubmitting}
            onClick={handleCobrarYEntregar}
            className="text-xs rounded-lg gap-1.5"
          >
            {isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <CheckCircle2 data-icon="inline-start" />
            )}
            <span>Cobrar {formatCurrency(saldoPendiente)} y Entregar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
