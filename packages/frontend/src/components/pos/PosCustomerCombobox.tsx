import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Cliente } from '../../api/types.ts';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { User, UserPlus, Search, Check, ChevronsUpDown, X } from 'lucide-react';

interface PosCustomerComboboxProps {
  clientes: Cliente[] | undefined;
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente | null) => void;
  onOpenCreateCliente: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PosCustomerCombobox: React.FC<PosCustomerComboboxProps> = ({
  clientes = [],
  selectedCliente,
  onSelectCliente,
  onOpenCreateCliente,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;
  const setOpen = (val: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(val);
    }
    controlledOnOpenChange?.(val);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [open]);

  const filteredClientes = useMemo(() => {
    if (!searchQuery.trim()) return clientes;
    const q = searchQuery.toLowerCase().trim();
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.toLowerCase().includes(q))
    );
  }, [clientes, searchQuery]);

  const handleSelect = (cliente: Cliente | null) => {
    onSelectCliente(cliente);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <User className="size-4 text-primary" />
          Cliente
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono font-medium rounded bg-muted text-muted-foreground border border-border/60">
            F4
          </kbd>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenCreateCliente}
          className="h-8 min-h-[32px] text-xs text-primary hover:bg-primary/10 gap-1 px-2"
          aria-label="Dar de alta nuevo cliente"
        >
          <UserPlus className="size-3.5" data-icon="inline-start" />
          <span>+ Nuevo</span>
        </Button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Seleccionar o buscar cliente"
              className="w-full justify-between h-10 px-3 text-left font-normal bg-background hover:bg-muted/30 border-border/70"
            >
              <span className="truncate text-sm">
                {selectedCliente ? (
                  <span className="font-medium text-foreground">
                    {selectedCliente.nombre}{' '}
                    {selectedCliente.telefono ? (
                      <span className="text-xs text-muted-foreground font-normal">
                        ({selectedCliente.telefono})
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Público en General</span>
                )}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {selectedCliente && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCliente(null);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    title="Quitar cliente seleccionado"
                    aria-label="Quitar cliente seleccionado"
                  >
                    <X className="size-4" />
                  </button>
                )}
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </div>
            </Button>
          }
        />
        <PopoverContent align="start" className="w-[320px] sm:w-[360px] p-2 flex flex-col gap-2">
          {/* Campo de búsqueda */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="pl-8 h-9"
              aria-label="Filtrar clientes"
            />
          </div>

          {/* Opciones */}
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
            {/* Opción Público en General */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                selectedCliente === null
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex flex-col">
                <span>Público en General</span>
                <span className="text-xs text-muted-foreground">Sin datos fiscales o de contacto</span>
              </div>
              {selectedCliente === null && <Check className="size-4 shrink-0 text-primary" />}
            </button>

            {/* Clientes filtrados */}
            {filteredClientes.map((c) => {
              const isSelected = selectedCliente?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate text-foreground font-semibold">{c.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.telefono || 'Sin teléfono'}
                    </span>
                  </div>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })}

            {filteredClientes.length === 0 && (
              <div className="py-4 text-center flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  No se encontró ningún cliente para &ldquo;{searchQuery}&rdquo;
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onOpenCreateCliente();
                  }}
                  className="text-xs h-8 gap-1.5 text-primary"
                >
                  <UserPlus className="size-3.5" data-icon="inline-start" />
                  <span>Crear &ldquo;{searchQuery}&rdquo;</span>
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
