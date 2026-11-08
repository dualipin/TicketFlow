import React, { useState } from 'react';
import { useCreateTicket } from '../../queries/tickets/mutations.ts';
import { useClientes } from '../../queries/clientes/queries.ts';
import { Button } from '../ui/button.tsx';
import { X, Smartphone, User, DollarSign, Plus, Check } from 'lucide-react';
import type { MetodoPago } from '../../api/types.ts';

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
  const createTicket = useCreateTicket();
  const { data: existingClientes } = useClientes();

  const [useExistingClient, setUseExistingClient] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>();
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [dispositivo, setDispositivo] = useState('');
  const [falla, setFalla] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [accesorios, setAccesorios] = useState('');
  const [costoTotal, setCostoTotal] = useState('800');
  const [anticipo, setAnticipo] = useState('300');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [notaInicial, setNotaInicial] = useState('Equipo recibido en mostrador para revisión general');

  if (!isOpen) return null;

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
        usuarioId: 3, // Mariana (Mostrador)
        notaInicial: notaInicial.trim() || undefined,
      },
      {
        onSuccess: (newTicket) => {
          onClose();
          onCreated?.(newTicket.id);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Recepción de Equipo (Nuevo Ticket)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Registra la falla y datos para iniciar el flujo de taller
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Client Selection */}
          <div className="space-y-2 rounded-lg bg-muted/20 p-3 border border-border/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                Datos del Cliente
              </label>

              {existingClientes && existingClientes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseExistingClient(!useExistingClient)}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  {useExistingClient ? '+ Registrar cliente nuevo' : 'Seleccionar cliente existente'}
                </button>
              )}
            </div>

            {useExistingClient ? (
              <div>
                <select
                  value={selectedClienteId ?? ''}
                  onChange={(e) => setSelectedClienteId(Number(e.target.value))}
                  required
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona un cliente de la lista...</option>
                  {existingClientes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.telefono})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Nombre:</span>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Teléfono (WhatsApp):</span>
                  <input
                    type="tel"
                    required
                    placeholder="52155..."
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Device and Problem */}
          <div className="space-y-2 rounded-lg bg-muted/20 p-3 border border-border/60">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Smartphone className="size-3.5 text-primary" />
              Dispositivo y Falla
            </label>

            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">Dispositivo / Modelo:</span>
              <input
                type="text"
                required
                placeholder="Ej. iPhone 13 Pro Max Azul, Laptop Dell Inspiron 15"
                value={dispositivo}
                onChange={(e) => setDispositivo(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground block mb-0.5">Falla reportada:</span>
              <textarea
                required
                rows={2}
                placeholder="Descripción detallada de la falla observada por el cliente..."
                value={falla}
                onChange={(e) => setFalla(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">PIN / Contraseña:</span>
                <input
                  type="text"
                  placeholder="PIN o patrón"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">Accesorios dejados:</span>
                <input
                  type="text"
                  placeholder="Funda, cargador, etc."
                  value={accesorios}
                  onChange={(e) => setAccesorios(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Pricing and Advance Payment */}
          <div className="space-y-2 rounded-lg bg-muted/20 p-3 border border-border/60">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Presupuesto y Anticipo
            </label>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">Cotización Total ($):</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={costoTotal}
                  onChange={(e) => setCostoTotal(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">Anticipo Recibido ($):</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={anticipo}
                  onChange={(e) => setAnticipo(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">Método de Pago:</span>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                  className="w-full h-8 rounded-md border border-input bg-background px-1 text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Initial Bitácora note */}
          <div>
            <span className="text-[10px] text-muted-foreground block mb-0.5">Nota inicial de recepción:</span>
            <input
              type="text"
              value={notaInicial}
              onChange={(e) => setNotaInicial(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          {createTicket.isError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/20">
              {createTicket.error instanceof Error
                ? createTicket.error.message
                : 'Error al crear el ticket.'}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createTicket.isPending}
              className="gap-1.5"
            >
              <Check className="size-3.5" />
              {createTicket.isPending ? 'Creando ticket...' : 'Guardar y Abrir Folio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
