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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '../ui/field.tsx';
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
import { toast } from '../ui/sonner.tsx';
import { Smartphone, User, DollarSign, Plus, Check, Camera } from 'lucide-react';
import type { MetodoPago, TicketAdjunto } from '../../api/types.ts';

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
  const [anticipo, setAnticipo] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [notaInicial, setNotaInicial] = useState('Equipo recibido en mostrador para revisión general');
  const [adjuntos, setAdjuntos] = useState<TicketAdjunto[]>([]);

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
        anticipo: Number(anticipo) || 0,
        metodoPago,
        usuarioId: currentUser?.id ?? 3,
        notaInicial: notaInicial.trim() || undefined,
        adjuntoIds: adjuntos.map((a) => a.id),
      },
      {
        onSuccess: (newTicket) => {
          toast.success(`Orden creada con éxito`, {
            description: `Folio ${newTicket.folio} - ${newTicket.dispositivo}`,
          });
          setAdjuntos([]);
          onClose();
          onCreated?.(newTicket.id);
        },
        onError: (err: any) => {
          toast.error(`Error al abrir orden`, {
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
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Recepción de Equipo (Nuevo Ticket)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Registra la falla y datos para iniciar el flujo de taller
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1">
          {/* Client Section */}
          <FieldSet className="rounded-lg bg-muted/20 p-3 border border-border/60 gap-3">
            <div className="flex items-center justify-between">
              <FieldLegend className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-0">
                <User className="size-3.5 text-primary" />
                Datos del Cliente
              </FieldLegend>

              {existingClientes && existingClientes.length > 0 && (
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() => setUseExistingClient(!useExistingClient)}
                  className="h-auto p-0 text-xs font-medium"
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
              <div className="grid grid-cols-2 gap-3">
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
                    Teléfono (WhatsApp)
                  </FieldLabel>
                  <Input
                    id="telefono-cliente"
                    type="tel"
                    required
                    placeholder="52155..."
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                  />
                </Field>
              </div>
            )}
          </FieldSet>

          {/* Device and Problem */}
          <FieldSet className="rounded-lg bg-muted/20 p-3 border border-border/60 gap-3">
            <FieldLegend className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-0">
              <Smartphone className="size-3.5 text-primary" />
              Dispositivo y Falla
            </FieldLegend>

            <Field>
              <FieldLabel htmlFor="dispositivo" className="text-xs">
                Dispositivo / Modelo
              </FieldLabel>
              <Input
                id="dispositivo"
                required
                placeholder="Ej. iPhone 13 Pro Max Azul, Laptop Dell Inspiron 15"
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
                placeholder="Descripción detallada de la falla observada por el cliente..."
                value={falla}
                onChange={(e) => setFalla(e.target.value)}
                className="resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
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
                  Accesorios dejados
                </FieldLabel>
                <Input
                  id="accesorios"
                  placeholder="Funda, cargador, etc."
                  value={accesorios}
                  onChange={(e) => setAccesorios(e.target.value)}
                />
              </Field>
            </div>
          </FieldSet>

          {/* Evidencias Multimedia (Fotos, Audio y Video) */}
          <FieldSet className="rounded-lg bg-muted/20 p-3 border border-border/60 gap-3">
            <FieldLegend className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-0">
              <Camera className="size-3.5 text-primary" />
              Evidencias Multimedia (Imágenes, Audio y Video)
            </FieldLegend>
            <TicketMediaCapture
              adjuntos={adjuntos}
              onChange={setAdjuntos}
            />
          </FieldSet>

          {/* Pricing and Advance Payment */}
          <FieldSet className="rounded-lg bg-muted/20 p-3 border border-border/60 gap-3">
            <FieldLegend className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-0">
              <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Presupuesto y Anticipo
            </FieldLegend>

            <div className="grid grid-cols-3 gap-3">
              <Field>
                <FieldLabel htmlFor="costo-total" className="text-xs">
                  Cotización ($)
                </FieldLabel>
                <Input
                  id="costo-total"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.00"
                  value={costoTotal}
                  onChange={(e) => setCostoTotal(e.target.value)}
                  className="font-semibold"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="anticipo" className="text-xs">
                  Anticipo ($)
                </FieldLabel>
                <Input
                  id="anticipo"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.00"
                  value={anticipo}
                  onChange={(e) => setAnticipo(e.target.value)}
                  className="font-semibold text-emerald-600 dark:text-emerald-400"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="metodo-pago" className="text-xs">
                  Método de Pago
                </FieldLabel>
                <Select
                  value={metodoPago}
                  onValueChange={(val) => setMetodoPago(val as MetodoPago)}
                >
                  <SelectTrigger id="metodo-pago" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="TARJETA">Tarjeta</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldSet>

          {/* Initial Bitácora note */}
          <Field>
            <FieldLabel htmlFor="nota-inicial" className="text-xs">
              Nota inicial de recepción
            </FieldLabel>
            <Input
              id="nota-inicial"
              value={notaInicial}
              onChange={(e) => setNotaInicial(e.target.value)}
            />
          </Field>

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
              className="gap-1.5 rounded-lg"
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
