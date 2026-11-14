import React, { useState } from 'react';
import { useCategorias } from '../../queries/inventario/queries.ts';
import { useCreateCategoria } from '../../queries/inventario/mutations.ts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field.tsx';
import { InputGroup, InputGroupAddon } from '../ui/input-group.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { Plus, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface CategorySelectProps {
  value?: number;
  onChange: (categoriaId: number) => void;
  error?: string;
  required?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  error,
  required = false,
}) => {
  const { data: categorias = [], isLoading: isLoadingCategorias } = useCategorias();
  const createCategoria = useCreateCategoria();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatNombre, setNewCatNombre] = useState('');

  const handleSaveNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatNombre.trim();
    if (!trimmed) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    try {
      const created = await createCategoria.mutateAsync({ nombre: trimmed });
      toast.success(`Categoría "${created.nombre}" creada`);
      onChange(created.id);
      setNewCatNombre('');
      setIsCreatingNew(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la categoría');
    }
  };

  return (
    <Field data-invalid={Boolean(error)}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor="categoria-select" className="text-xs font-medium">
          Categoría {required && <span className="text-destructive">*</span>}
        </FieldLabel>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => {
            setIsCreatingNew(!isCreatingNew);
            setNewCatNombre('');
          }}
          className="px-2 text-xs text-primary"
        >
          {isCreatingNew ? (
            <span className="flex items-center gap-1">
              <X data-icon="inline-start" /> Cancelar
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Plus data-icon="inline-start" /> + Nueva categoría
            </span>
          )}
        </Button>
      </div>

      {isCreatingNew ? (
        <div className="flex flex-col gap-1.5">
          <InputGroup>
            <InputGroupAddon>
              <Tag className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <Input
              id="new-category-name"
              placeholder="Ej. Pantallas, Accesorios, Baterías..."
              value={newCatNombre}
              onChange={(e) => setNewCatNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveNewCategory(e);
                }
              }}
              autoFocus
            />
            <InputGroupAddon align="inline-end" className="py-0 pr-1">
              <Button
                type="button"
                size="sm"
                variant="default"
                disabled={createCategoria.isPending || !newCatNombre.trim()}
                onClick={handleSaveNewCategory}
                className="px-2.5 text-xs"
              >
                {createCategoria.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Check data-icon="inline-start" />
                )}
                Crear
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription className="text-xs">
            Escribe el nombre de la nueva categoría y presiona Enter o "Crear".
          </FieldDescription>
        </div>
      ) : (
        <Select
          value={value ? String(value) : ''}
          onValueChange={(val) => {
            if (val) onChange(Number(val));
          }}
          disabled={isLoadingCategorias}
        >
          <SelectTrigger id="categoria-select" className="w-full text-xs">
            <SelectValue placeholder="Selecciona una categoría..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
};
