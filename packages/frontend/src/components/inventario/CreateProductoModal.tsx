import React, { useState } from 'react';
import { useCreateProducto } from '../../queries/inventario/mutations.ts';
import { CategorySelect } from './CategorySelect.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from '../ui/field.tsx';
import { InputGroup, InputGroupAddon } from '../ui/input-group.tsx';
import { Switch } from '../ui/switch.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { toast } from 'sonner';
import {
  Package,
  Wrench,
  Sparkles,
  Barcode,
  DollarSign,
  Boxes,
  Plus,
  Trash2,
} from 'lucide-react';
import type { CreateProductoInput } from '../../api/types.ts';

interface CreateProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface VariantRow {
  id: string;
  nombre: string;
  codigo: string;
  precioBase: string;
  stock: string;
}

export const CreateProductoModal: React.FC<CreateProductoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createProducto = useCreateProducto();

  // Tipo: 0 = Físico, 1 = Servicio
  const [esServicio, setEsServicio] = useState<0 | 1>(0);

  // Campos principales
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();

  // Modo Simple
  const [skuSimple, setSkuSimple] = useState('');
  const [precioSimple, setPrecioSimple] = useState('');
  const [stockSimple, setStockSimple] = useState('0');

  // Modo Múltiples Variantes
  const [tieneVariantes, setTieneVariantes] = useState(false);
  const [variantes, setVariantes] = useState<VariantRow[]>(() => [
    {
      id: '1',
      nombre: 'Estándar',
      codigo: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
      precioBase: '',
      stock: '0',
    },
  ]);

  // Validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSku = (prefix = esServicio ? 'SRV' : 'SKU') => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  };

  const resetForm = () => {
    setEsServicio(0);
    setNombre('');
    setDescripcion('');
    setCategoriaId(undefined);
    setSkuSimple('');
    setPrecioSimple('');
    setStockSimple('0');
    setTieneVariantes(false);
    setVariantes([
      {
        id: '1',
        nombre: 'Estándar',
        codigo: generateSku('SKU'),
        precioBase: '',
        stock: '0',
      },
    ]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddVariantRow = () => {
    setVariantes((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        nombre: '',
        codigo: generateSku('SKU'),
        precioBase: precioSimple || '',
        stock: '0',
      },
    ]);
  };

  const handleRemoveVariantRow = (id: string) => {
    if (variantes.length <= 1) return;
    setVariantes((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (
    id: string,
    field: keyof Omit<VariantRow, 'id'>,
    val: string
  ) => {
    setVariantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!categoriaId) {
      newErrors.categoriaId = 'Selecciona o crea una categoría';
    }

    // Validar según modo
    if (esServicio === 1 || !tieneVariantes) {
      const precioNum = Number(precioSimple);
      if (Number.isNaN(precioNum) || precioNum < 0) {
        newErrors.precioSimple = 'Ingresa un precio válido';
      }
      if (esServicio === 0) {
        const stockNum = Number(stockSimple);
        if (Number.isNaN(stockNum) || stockNum < 0) {
          newErrors.stockSimple = 'Ingresa una cantidad de stock válida';
        }
      }
    } else {
      // Modo variantes múltiples
      if (variantes.length === 0) {
        newErrors.variantes = 'Debes agregar al menos una variante';
      }
      const seenSkus = new Set<string>();
      for (const [index, v] of variantes.entries()) {
        if (!v.nombre.trim()) {
          newErrors[`variant_nombre_${v.id}`] = `Falta el nombre en la variante #${index + 1}`;
        }
        const skuTrimmed = v.codigo.trim().toUpperCase();
        if (!skuTrimmed) {
          newErrors[`variant_sku_${v.id}`] = `Falta el SKU en la variante #${index + 1}`;
        } else if (seenSkus.has(skuTrimmed)) {
          newErrors[`variant_sku_${v.id}`] = `SKU duplicado '${skuTrimmed}'`;
        } else {
          seenSkus.add(skuTrimmed);
        }
        const p = Number(v.precioBase);
        if (Number.isNaN(p) || p < 0) {
          newErrors[`variant_precio_${v.id}`] = `Precio inválido en la variante #${index + 1}`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Revisa los campos obligatorios del formulario');
      return;
    }

    setErrors({});

    try {
      const payload: CreateProductoInput = {
        nombre: nombre.trim(),
        categoriaId: categoriaId!,
        descripcion: descripcion.trim() || null,
        esServicio,
      };

      if (esServicio === 1 || !tieneVariantes) {
        payload.codigo = skuSimple.trim() || generateSku(esServicio ? 'SRV' : 'SKU');
        payload.nombreVariacion = esServicio ? 'Servicio Estándar' : 'Estándar';
        payload.precioBase = Number(precioSimple || 0);
        payload.stock = esServicio ? 0 : Math.max(0, Math.floor(Number(stockSimple || 0)));
      } else {
        payload.variaciones = variantes.map((v) => ({
          nombre: v.nombre.trim(),
          codigo: v.codigo.trim().toUpperCase(),
          precioBase: Number(v.precioBase || 0),
          stock: Math.max(0, Math.floor(Number(v.stock || 0))),
        }));
      }

      const res = await createProducto.mutateAsync(payload);
      toast.success(
        esServicio
          ? `Servicio "${res.nombre}" registrado exitosamente`
          : `Producto "${res.nombre}" guardado en inventario`
      );
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el producto');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {esServicio ? <Wrench className="size-5" /> : <Package className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {esServicio ? 'Nuevo Servicio de Taller' : 'Nuevo Producto de Inventario'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {esServicio
                  ? 'Registra mano de obra o servicios técnicos para venta rápida o tickets.'
                  : 'Registra un artículo físico para control de stock y ventas de mostrador.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* 1. Selector de Tipo (Físico vs Servicio) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg border border-border">
            <Button
              type="button"
              variant={esServicio === 0 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setEsServicio(0);
                setTieneVariantes(false);
              }}
              className="flex items-center justify-center gap-2 text-xs font-medium h-8"
            >
              <Package data-icon="inline-start" />
              Producto Físico
            </Button>
            <Button
              type="button"
              variant={esServicio === 1 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setEsServicio(1);
                setTieneVariantes(false);
              }}
              className="flex items-center justify-center gap-2 text-xs font-medium h-8"
            >
              <Wrench data-icon="inline-start" />
              Servicio de Taller
            </Button>
          </div>

          {/* 2. Información General */}
          <FieldGroup className="flex flex-col gap-3">
            <Field data-invalid={Boolean(errors.nombre)}>
              <FieldLabel htmlFor="prod-nombre" className="text-xs font-medium">
                Nombre del {esServicio ? 'Servicio' : 'Producto'}{' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="prod-nombre"
                placeholder={
                  esServicio
                    ? 'Ej. Cambio de Pantalla iPhone 11, Mantenimiento...'
                    : 'Ej. Cargador 20W USB-C, Funda uso rudo...'
                }
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="text-xs"
              />
              {errors.nombre && <FieldError>{errors.nombre}</FieldError>}
            </Field>

            <CategorySelect
              value={categoriaId}
              onChange={(id) => {
                setCategoriaId(id);
                if (errors.categoriaId) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.categoriaId;
                    return next;
                  });
                }
              }}
              error={errors.categoriaId}
              required
            />

            <Field>
              <FieldLabel htmlFor="prod-descripcion" className="text-xs font-medium">
                Descripción (opcional)
              </FieldLabel>
              <Textarea
                id="prod-descripcion"
                rows={2}
                placeholder="Detalles adicionales, especificaciones o notas de uso..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="text-xs resize-none"
              />
            </Field>
          </FieldGroup>

          {/* 3. Configuración de Precios, Stock y Variaciones */}
          {esServicio === 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Boxes className="size-3.5 text-primary" /> Múltiples Variantes
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Habilita si el producto tiene varios colores, tallas o calidades (OLED, OEM).
                </span>
              </div>
              <Switch
                checked={tieneVariantes}
                onCheckedChange={(checked) => setTieneVariantes(checked)}
              />
            </div>
          )}

          {/* Modo Simple (Físico sin variantes o Servicio) */}
          {(esServicio === 1 || !tieneVariantes) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
              {/* SKU / Código de barras */}
              <Field data-invalid={Boolean(errors.sku)}>
                <FieldLabel htmlFor="prod-sku" className="text-xs font-medium">
                  SKU / Código de Barras
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Barcode className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <Input
                    id="prod-sku"
                    placeholder={esServicio ? 'SRV-0001' : 'Escanea o escribe'}
                    value={skuSimple}
                    onChange={(e) => setSkuSimple(e.target.value)}
                    className="text-xs font-mono uppercase"
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setSkuSimple(generateSku(esServicio ? 'SRV' : 'SKU'))}
                      title="Generar SKU automático"
                      className="size-6 text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="size-3 text-amber-500" />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription className="text-[10px]">
                  Compatible con lector USB o auto-generable.
                </FieldDescription>
              </Field>

              {/* Precio Base */}
              <Field data-invalid={Boolean(errors.precioSimple)}>
                <FieldLabel htmlFor="prod-precio" className="text-xs font-medium">
                  Precio de Venta ($) <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <DollarSign className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <Input
                    id="prod-precio"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={precioSimple}
                    onChange={(e) => setPrecioSimple(e.target.value)}
                    className="text-xs font-mono"
                  />
                </InputGroup>
                {errors.precioSimple && <FieldError>{errors.precioSimple}</FieldError>}
              </Field>

              {/* Stock Inicial (solo físico) */}
              {esServicio === 0 && (
                <Field data-invalid={Boolean(errors.stockSimple)}>
                  <FieldLabel htmlFor="prod-stock" className="text-xs font-medium">
                    Stock Inicial (uds) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="prod-stock"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    value={stockSimple}
                    onChange={(e) => setStockSimple(e.target.value)}
                    className="text-xs font-mono"
                  />
                  {errors.stockSimple && <FieldError>{errors.stockSimple}</FieldError>}
                </Field>
              )}
            </div>
          )}

          {/* Modo Múltiples Variantes (Ticket 03) */}
          {esServicio === 0 && tieneVariantes && (
            <div className="flex flex-col gap-2.5 p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Lista de Variantes ({variantes.length})
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleAddVariantRow}
                  className="h-7 text-xs flex items-center gap-1"
                >
                  <Plus data-icon="inline-start" /> Añadir variante
                </Button>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {variantes.map((v) => (
                  <div
                    key={v.id}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-card border border-border"
                  >
                    {/* Nombre de variante */}
                    <div className="col-span-4">
                      <Input
                        placeholder="Ej. OLED Original, Negro..."
                        value={v.nombre}
                        onChange={(e) => handleVariantChange(v.id, 'nombre', e.target.value)}
                        className="text-xs h-7"
                      />
                      {errors[`variant_nombre_${v.id}`] && (
                        <span className="text-[10px] text-destructive block mt-0.5">
                          {errors[`variant_nombre_${v.id}`]}
                        </span>
                      )}
                    </div>

                    {/* SKU */}
                    <div className="col-span-3">
                      <div className="relative flex items-center">
                        <Input
                          placeholder="SKU"
                          value={v.codigo}
                          onChange={(e) => handleVariantChange(v.id, 'codigo', e.target.value)}
                          className="text-xs h-7 font-mono uppercase pr-6"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleVariantChange(v.id, 'codigo', generateSku('SKU'))}
                          title="Generar SKU"
                          className="absolute right-0.5 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-amber-500"
                        >
                          <Sparkles className="size-3" />
                        </Button>
                      </div>
                      {errors[`variant_sku_${v.id}`] && (
                        <span className="text-[10px] text-destructive block mt-0.5">
                          {errors[`variant_sku_${v.id}`]}
                        </span>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio $"
                        value={v.precioBase}
                        onChange={(e) => handleVariantChange(v.id, 'precioBase', e.target.value)}
                        className="text-xs h-7 font-mono"
                      />
                    </div>

                    {/* Stock */}
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(v.id, 'stock', e.target.value)}
                        className="text-xs h-7 font-mono"
                      />
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={variantes.length <= 1}
                        onClick={() => handleRemoveVariantRow(v.id)}
                        className="size-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createProducto.isPending}
              className="min-w-28"
            >
              {createProducto.isPending ? (
                <>
                  <Spinner data-icon="inline-start" className="size-3.5" />
                  Guardando...
                </>
              ) : (
                <>Guardar {esServicio ? 'Servicio' : 'Producto'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
