import React, { useState } from 'react';
import {
  useCreateTicket,
  useDeleteTicketAdjunto,
} from '../../queries/tickets/mutations.ts';
import { useClientes } from '../../queries/clientes/queries.ts';
import { useAuth } from '../../lib/auth-context.tsx';
import { TicketMediaCapture } from './TicketMediaCapture.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Separator } from '../ui/separator.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Field, FieldGroup, FieldLabel } from '../ui/field.tsx';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '../ui/select.tsx';
import { Alert, AlertDescription } from '../ui/alert.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import type { TicketAdjunto } from '../../api/types.ts';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (ticketId: number) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();
  const createTicket = useCreateTicket();
  const deleteAdjunto = useDeleteTicketAdjunto();
  const { data: existingClientes } = useClientes();

  const [useExistingClient, setUseExistingClient] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>();
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [dispositivo, setDispositivo] = useState('');
  const [falla, setFalla] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [accesorios, setAccesorios] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [adjuntos, setAdjuntos] = useState<TicketAdjunto[]>([]);

  const resetForm = () => {
    setUseExistingClient(false);
    setSelectedClienteId(undefined);
    setNombreCliente('');
    setTelefonoCliente('');
    setDispositivo('');
    setFalla('');
    setContrasena('');
    setAccesorios('');
    setCostoTotal('');
    setAdjuntos([]);
  };

  const handleCloseWithCleanup = () => {
    if (adjuntos.length > 0) {
      for (const item of adjuntos) {
        deleteAdjunto.mutate({ id: item.id });
      }
      setAdjuntos([]);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispositivo.trim() || !falla.trim()) return;
    if (useExistingClient && !selectedClienteId) return;

    createTicket.mutate(
      {
        clienteId: useExistingClient ? selectedClienteId : undefined,
        nombreCliente: useExistingClient ? undefined : nombreCliente.trim(),
        telefonoCliente: useExistingClient ? undefined : telefonoCliente.trim(),
        dispositivo: dispositivo.trim(),
        falla: falla.trim(),
        contrasena: contrasena.trim() || undefined,
        accesorios: accesorios.trim() || undefined,
        costoTotal: Number(costoTotal) || 0,
        usuarioId: currentUser?.id ?? 2,
        adjuntoIds: adjuntos.map((a) => a.id),
      },
      {
        onSuccess: (newTicket) => {
          toast.success('Orden creada con éxito', {
            description: `Folio ${newTicket.folio} - ${newTicket.dispositivo}`,
          });
          resetForm();
          onClose();
          onCreated?.(newTicket.id);
        },
        onError: (err: any) => {
          toast.error('Error al abrir orden', {
            description: err?.message || 'No se pudo crear el ticket.',
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseWithCleanup()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight text-balance">
            Nuevo Ticket de Taller
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground text-pretty">
            Registra cliente, falla del equipo y evidencias de recepción
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1">
          <FieldGroup className="flex flex-col gap-4">
            {/* Client Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Cliente
                </span>
                {existingClientes && existingClientes.length > 0 && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setUseExistingClient(!useExistingClient)}
                    className="min-h-8 h-auto px-1.5 py-1 text-xs font-medium"
                  >
                    {useExistingClient ? '+ Registrar cliente nuevo' : 'Seleccionar cliente existente'}
                  </Button>
                )}
              </div>

              {useExistingClient ? (
                <Field>
                  <FieldLabel htmlFor="cliente-select" className="text-xs">
                    Cliente Registrado
                  </FieldLabel>
                  <Select
                    value={selectedClienteId ? String(selectedClienteId) : ''}
                    onValueChange={(val) => setSelectedClienteId(val ? Number(val) : undefined)}
                  >
                    <SelectTrigger id="cliente-select" className="w-full">
                      <SelectValue placeholder="Selecciona un cliente de la lista..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {existingClientes?.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nombre} ({c.telefono})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="nombre-cliente" className="text-xs">
                      Nombre Completo
                    </FieldLabel>
                    <Input
                      id="nombre-cliente"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="telefono-cliente" className="text-xs">
                      Teléfono
                    </FieldLabel>
                    <Input
                      id="telefono-cliente"
                      type="tel"
                      required
                      placeholder="5512345678"
                      value={telefonoCliente}
                      onChange={(e) => setTelefonoCliente(e.target.value)}
                    />
                  </Field>
                </div>
              )}
            </div>

            <Separator />

            {/* Device & Issue Section */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground">
                Equipo y Falla
              </span>

              <Field>
                <FieldLabel htmlFor="dispositivo" className="text-xs">
                  Dispositivo / Modelo
                </FieldLabel>
                <Input
                  id="dispositivo"
                  required
                  placeholder="Ej. iPhone 13 Pro Max, Laptop Dell Inspiron 15"
                  value={dispositivo}
                  onChange={(e) => setDispositivo(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="falla" className="text-xs">
                  Falla reportada
                </FieldLabel>
                <Textarea
                  id="falla"
                  required
                  rows={2}
                  placeholder="Descripción de la falla observada..."
                  value={falla}
                  onChange={(e) => setFalla(e.target.value)}
                  className="resize-none"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field>
                  <FieldLabel htmlFor="contrasena" className="text-xs">
                    PIN / Contraseña
                  </FieldLabel>
                  <Input
                    id="contrasena"
                    placeholder="PIN o patrón"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="accesorios" className="text-xs">
                    Accesorios
                  </FieldLabel>
                  <Input
                    id="accesorios"
                    placeholder="Funda, cargador..."
                    value={accesorios}
                    onChange={(e) => setAccesorios(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="costo-total" className="text-xs">
                    Costo estimado ($)
                  </FieldLabel>
                  <Input
                    id="costo-total"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0.00"
                    value={costoTotal}
                    onChange={(e) => setCostoTotal(e.target.value)}
                    className="font-mono tabular-nums"
                  />
                </Field>
              </div>
            </div>

            <Separator />

            {/* Media Evidence Section */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-foreground">
                Evidencias
              </span>
              <TicketMediaCapture
                adjuntos={adjuntos}
                onChange={setAdjuntos}
                compact
              />
            </div>
          </FieldGroup>

          {createTicket.isError && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                {createTicket.error instanceof Error
                  ? createTicket.error.message
                  : 'Error al crear el ticket.'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCloseWithCleanup}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createTicket.isPending}
              className="rounded-lg"
            >
              {createTicket.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              <span>{createTicket.isPending ? 'Creando ticket...' : 'Guardar y Abrir Folio'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
