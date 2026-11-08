import React, { useState } from 'react';
import { useCreateCliente } from '../../queries/clientes/mutations.ts';
import type { Cliente } from '../../api/types.ts';
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
import { UserPlus } from 'lucide-react';

interface CreateClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (cliente: Cliente) => void;
}

export const CreateClienteModal: React.FC<CreateClienteModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const createCliente = useCreateCliente();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      setErrorMsg('Nombre y teléfono son obligatorios.');
      return;
    }

    createCliente.mutate(
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        notas: notas.trim() || undefined,
      },
      {
        onSuccess: (newCliente) => {
          setNombre('');
          setTelefono('');
          setNotas('');
          setErrorMsg(null);
          onCreated(newCliente);
          onClose();
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || 'Error al registrar cliente.');
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
              <UserPlus className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Registrar Nuevo Cliente
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Alta rápida de cliente para vincular a la venta actual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel className="text-xs font-semibold">Nombre Completo *</FieldLabel>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
              required
              className="text-xs"
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold">Teléfono *</FieldLabel>
            <Input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 5512345678"
              required
              className="text-xs"
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs font-semibold">Notas (opcional)</FieldLabel>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Dirección, preferencias o comentarios..."
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
              disabled={createCliente.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createCliente.isPending}
              className="gap-1.5"
            >
              {createCliente.isPending && (
                <Spinner className="size-3.5" data-icon="inline-start" />
              )}
              <span>Guardar Cliente</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
