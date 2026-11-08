import React, { useState } from 'react';
import { useAbrirCorte } from '../../queries/corte-caja/mutations.ts';
import { useAuth } from '../../lib/auth-context.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Button } from '../ui/button.tsx';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { toast } from '../ui/sonner.tsx';
import { DollarSign, Landmark } from 'lucide-react';

interface AbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AbrirCajaModal: React.FC<AbrirCajaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const abrirCorte = useAbrirCorte();

  const [montoInicial, setMontoInicial] = useState('500');
  const [notas, setNotas] = useState('Apertura de turno');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const monto = Number(montoInicial);
    if (Number.isNaN(monto) || monto < 0) {
      setErrorMsg('Ingresa un monto inicial válido (mayor o igual a cero).');
      return;
    }

    const usuarioId = currentUser?.id ?? 1;

    abrirCorte.mutate(
      {
        usuarioId,
        montoInicial: monto,
        notas: notas.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(`Turno #${res.id} abierto`, {
            description: `Fondo inicial: $${res.montoInicial.toFixed(2)}`,
          });
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          const msg = err?.message || 'Error al abrir el turno de caja.';
          setErrorMsg(msg);
          toast.error('Error al abrir turno', { description: msg });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Landmark className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Abrir Turno de Caja
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresa el fondo inicial de efectivo con el que se arranca este turno en mostrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel className="text-xs font-semibold">
              Fondo Inicial en Efectivo ($)
            </FieldLabel>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                min="0"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                placeholder="500.00"
                required
                className="pl-8 text-sm font-semibold"
                autoFocus
              />
              <DollarSign className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold">Notas de Apertura</FieldLabel>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Turno matutino, recibido de Administrador..."
              rows={2}
              className="text-xs resize-none"
            />
          </Field>

          <DialogFooter className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={abrirCorte.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={abrirCorte.isPending}
              className="gap-1.5"
            >
              {abrirCorte.isPending && <Spinner className="size-3.5" data-icon="inline-start" />}
              <span>Abrir Caja</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
