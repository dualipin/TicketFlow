import React, { useState, useEffect } from 'react';
import type { CorteCaja } from '../../api/types.ts';
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
import { InputGroup, InputGroupInput, InputGroupAddon } from '../ui/input-group.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Button } from '../ui/button.tsx';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { toast } from '../ui/sonner.tsx';
import { formatCurrencyMxn } from './corte-caja-engine.ts';
import { DollarSign, Landmark, History, ArrowDownToLine } from 'lucide-react';

interface AbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  ultimoCorteCerrado?: CorteCaja | null;
}

export const AbrirCajaModal: React.FC<AbrirCajaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  ultimoCorteCerrado,
}) => {
  const { currentUser } = useAuth();
  const abrirCorte = useAbrirCorte();

  const [montoInicial, setMontoInicial] = useState('');
  const [notas, setNotas] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMontoInicial('');
      setNotas('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const monto = Number(montoInicial);
    if (montoInicial.trim() === '' || Number.isNaN(monto) || monto < 0) {
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
          toast.success(`Turno #${res.id} abierto con éxito`, {
            description: `Fondo inicial registrado: ${formatCurrencyMxn(res.montoInicial)}`,
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

  const handleCopiarFondoAnterior = () => {
    if (ultimoCorteCerrado?.montoReal !== null && ultimoCorteCerrado?.montoReal !== undefined) {
      setMontoInicial(String(ultimoCorteCerrado.montoReal));
      setNotas(`Fondo recibido del Turno #${ultimoCorteCerrado.id} (${ultimoCorteCerrado.usuario?.nombre || 'Operador anterior'})`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !abrirCorte.isPending && onClose()}>
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
            Ingresa el fondo inicial en efectivo con el que se arranca este turno en mostrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Tarjeta de Cadena de Custodia del Turno Anterior */}
          {ultimoCorteCerrado && ultimoCorteCerrado.montoReal !== null && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <History className="size-3" />
                  Cierre previo #{ultimoCorteCerrado.id} ({ultimoCorteCerrado.usuario?.nombre || 'Operador'})
                </span>
                <span className="font-mono font-bold text-foreground tabular-nums">
                  {formatCurrencyMxn(ultimoCorteCerrado.montoReal)}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleCopiarFondoAnterior}
                className="mt-0.5 w-full text-xs"
              >
                <ArrowDownToLine data-icon="inline-start" />
                <span>Usar fondo de cierre anterior ({formatCurrencyMxn(ultimoCorteCerrado.montoReal)})</span>
              </Button>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="monto-inicial-input" className="text-xs font-semibold">
              Fondo Inicial en Efectivo ($ MXN) *
            </FieldLabel>
            <InputGroup className="h-9">
              <InputGroupAddon align="inline-start">
                <DollarSign className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="monto-inicial-input"
                type="number"
                step="0.5"
                min="0"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                placeholder="0.00"
                required
                className="font-mono text-sm font-semibold"
                autoFocus
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="notas-apertura-input" className="text-xs font-semibold">
              Notas de Apertura
            </FieldLabel>
            <Textarea
              id="notas-apertura-input"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Turno matutino, recibido de Administrador..."
              rows={2}
              className="resize-none text-xs"
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
              {abrirCorte.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Landmark data-icon="inline-start" />
              )}
              <span>Abrir Caja</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
