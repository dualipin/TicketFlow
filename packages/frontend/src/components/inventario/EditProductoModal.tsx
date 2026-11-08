import React, { useState, useEffect } from 'react';
import { useUpdateProducto } from '../../queries/inventario/mutations.ts';
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
import type { ProductoWithDetails, UpdateProductoInput } from '../../api/types.ts';

interface EditProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ProductoWithDetails | null;
  onSuccess?: () => void;
}

interface EditVariantRow {
  localId: string;
  id?: number;
  nombre: string;
  codigo: string;
  precioBase: string;
  stock: string;
}

export const EditProductoModal: React.FC<EditProductoModalProps> = ({
  isOpen,
  onClose,
  producto,
  onSuccess,
}) => {
  const updateProducto = useUpdateProducto();

  // Campos principales
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [esServicio, setEsServicio] = useState<0 | 1>(0);

  // Modo Simple
  const [skuSimple, setSkuSimple] = useState('');
  const [precioSimple, setPrecioSimple] = useState('');
  const [stockSimple, setStockSimple] = useState('0');

  // Modo Múltiples Variantes
  const [tieneVariantes, setTieneVariantes] = useState(false);
  const [variantes, setVariantes] = useState<EditVariantRow[]>([]);

  // Errores
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!producto) return;

    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setCategoriaId(producto.categoriaId);
    const srv = (producto.esServicio ? 1 : 0) as 0 | 1;
    setEsServicio(srv);

    const isMulti = (producto.variaciones?.length ?? 0) > 1;
    setTieneVariantes(isMulti);

    if (producto.variaciones && producto.variaciones.length > 0) {
      const rows: EditVariantRow[] = producto.variaciones.map((v) => ({
        localId: String(v.id),
        id: v.id,
        nombre: v.nombre,
        codigo: v.codigo,
        precioBase: String(v.precioBase),
        stock: String(v.stock),
      }));
      setVariantes(rows);

      // Precargar simple si tiene 1 sola variante
      const first = producto.variaciones[0];
      setSkuSimple(first.codigo);
      setPrecioSimple(String(first.precioBase));
      setStockSimple(String(first.stock));
    } else {
      setVariantes([]);
    }

    setErrors({});
  }, [producto, isOpen]);

  const generateSku = (prefix = esServicio ? 'SRV' : 'SKU') => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  };

  const handleAddVariantRow = () => {
    setVariantes((prev) => [
      ...prev,
      {
        localId: String(Date.now()),
        nombre: '',
        codigo: generateSku('SKU'),
        precioBase: precioSimple || '',
        stock: '0',
      },
    ]);
  };

  const handleRemoveVariantRow = (localId: string) => {
    if (variantes.length <= 1) return;
    setVariantes((prev) => prev.filter((v) => v.localId !== localId));
  };

  const handleVariantChange = (
    localId: string,
    field: keyof Omit<EditVariantRow, 'localId' | 'id'>,
    val: string
  ) => {
    setVariantes((prev) =>
      prev.map((v) => (v.localId === localId ? { ...v, [field]: val } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto) return;

    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!categoriaId) {
      newErrors.categoriaId = 'Selecciona o crea una categoría';
    }

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
      if (variantes.length === 0) {
        newErrors.variantes = 'Debes mantener al menos una variante';
      }
      const seenSkus = new Set<string>();
      for (const [index, v] of variantes.entries()) {
        if (!v.nombre.trim()) {
          newErrors[`variant_nombre_${v.localId}`] = `Falta el nombre en la variante #${index + 1}`;
        }
        const skuTrimmed = v.codigo.trim().toUpperCase();
        if (!skuTrimmed) {
          newErrors[`variant_sku_${v.localId}`] = `Falta el SKU en la variante #${index + 1}`;
        } else if (seenSkus.has(skuTrimmed)) {
          newErrors[`variant_sku_${v.localId}`] = `SKU duplicado '${skuTrimmed}'`;
        } else {
          seenSkus.add(skuTrimmed);
        }
        const p = Number(v.precioBase);
        if (Number.isNaN(p) || p < 0) {
          newErrors[`variant_precio_${v.localId}`] = `Precio inválido en la variante #${index + 1}`;
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
      const payload: UpdateProductoInput = {
        nombre: nombre.trim(),
        categoriaId: categoriaId!,
        descripcion: descripcion.trim() || null,
        esServicio,
      };

      if (esServicio === 1 || !tieneVariantes) {
        // En modo simple, si había 1 variante la preservamos con su id
        const singleVarId = producto.variaciones?.[0]?.id;
        payload.variaciones = [
          {
            id: singleVarId,
            codigo: skuSimple.trim().toUpperCase() || generateSku(esServicio ? 'SRV' : 'SKU'),
            nombre: esServicio ? 'Servicio Estándar' : 'Estándar',
            precioBase: Number(precioSimple || 0),
            stock: esServicio ? 0 : Math.max(0, Math.floor(Number(stockSimple || 0))),
          },
        ];
      } else {
        payload.variaciones = variantes.map((v) => ({
          id: v.id,
          nombre: v.nombre.trim(),
          codigo: v.codigo.trim().toUpperCase(),
          precioBase: Number(v.precioBase || 0),
          stock: Math.max(0, Math.floor(Number(v.stock || 0))),
        }));
      }

      const res = await updateProducto.mutateAsync({
        id: producto.id,
        input: payload,
      });

      toast.success(`Producto "${res.nombre}" actualizado`);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el producto');
    }
  };

  if (!producto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {esServicio ? <Wrench className="size-5" /> : <Package className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Editar {esServicio ? 'Servicio de Taller' : 'Producto de Inventario'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Modifica los datos del catálogo, precios y variaciones de #{producto.id}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* 1. Selector de Tipo */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg border border-border">
            <Button
              type="button"
              variant={esServicio === 0 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setEsServicio(0);
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
              <FieldLabel htmlFor="edit-prod-nombre" className="text-xs font-medium">
                Nombre del {esServicio ? 'Servicio' : 'Producto'}{' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="edit-prod-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                aria-invalid={Boolean(errors.nombre)}
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
              <FieldLabel htmlFor="edit-prod-descripcion" className="text-xs font-medium">
                Descripción (opcional)
              </FieldLabel>
              <Textarea
                id="edit-prod-descripcion"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="text-xs resize-none"
              />
            </Field>
          </FieldGroup>

          {/* 3. Variaciones & Precios */}
          {esServicio === 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Boxes className="size-3.5 text-primary" /> Múltiples Variantes
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Habilita si el producto tiene varios modelos, colores o calidades.
                </span>
              </div>
              <Switch
                checked={tieneVariantes}
                onCheckedChange={(checked) => setTieneVariantes(checked)}
              />
            </div>
          )}

          {/* Modo Simple */}
          {(esServicio === 1 || !tieneVariantes) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
              <Field data-invalid={Boolean(errors.skuSimple)}>
                <FieldLabel htmlFor="edit-prod-sku" className="text-xs font-medium">
                  SKU / Código de Barras
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Barcode className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <Input
                    id="edit-prod-sku"
                    value={skuSimple}
                    onChange={(e) => setSkuSimple(e.target.value)}
                    aria-invalid={Boolean(errors.skuSimple)}
                    className="text-xs font-mono uppercase"
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setSkuSimple(generateSku(esServicio ? 'SRV' : 'SKU'))}
                      title="Generar SKU"
                      className="size-6 text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="size-3 text-primary" />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription className="text-[10px]">
                  Compatible con lector USB o auto-generable.
                </FieldDescription>
              </Field>

              <Field data-invalid={Boolean(errors.precioSimple)}>
                <FieldLabel htmlFor="edit-prod-precio" className="text-xs font-medium">
                  Precio de Venta ($) <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <DollarSign className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <Input
                    id="edit-prod-precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioSimple}
                    onChange={(e) => setPrecioSimple(e.target.value)}
                    aria-invalid={Boolean(errors.precioSimple)}
                    className="text-xs font-mono"
                  />
                </InputGroup>
                {errors.precioSimple && <FieldError>{errors.precioSimple}</FieldError>}
              </Field>

              {esServicio === 0 && (
                <Field data-invalid={Boolean(errors.stockSimple)}>
                  <FieldLabel htmlFor="edit-prod-stock" className="text-xs font-medium">
                    Stock (uds) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="edit-prod-stock"
                    type="number"
                    step="1"
                    min="0"
                    value={stockSimple}
                    onChange={(e) => setStockSimple(e.target.value)}
                    aria-invalid={Boolean(errors.stockSimple)}
                    className="text-xs font-mono"
                  />
                  {errors.stockSimple && <FieldError>{errors.stockSimple}</FieldError>}
                </Field>
              )}
            </div>
          )}

          {/* Modo Múltiples Variantes */}
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
                    key={v.localId}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-card border border-border"
                  >
                    <div className="col-span-4">
                      <Input
                        placeholder="Nombre de variante"
                        value={v.nombre}
                        onChange={(e) => handleVariantChange(v.localId, 'nombre', e.target.value)}
                        className="text-xs h-7"
                      />
                      {errors[`variant_nombre_${v.localId}`] && (
                        <span className="text-[10px] text-destructive block mt-0.5">
                          {errors[`variant_nombre_${v.localId}`]}
                        </span>
                      )}
                    </div>

                    <div className="col-span-3">
                      <div className="relative flex items-center">
                        <Input
                          placeholder="SKU"
                          value={v.codigo}
                          onChange={(e) => handleVariantChange(v.localId, 'codigo', e.target.value)}
                          className="text-xs h-7 font-mono uppercase pr-6"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleVariantChange(v.localId, 'codigo', generateSku('SKU'))}
                          title="Generar SKU"
                          className="absolute right-0.5 top-1/2 -translate-y-1/2 size-6 text-muted-foreground hover:text-primary"
                        >
                          <Sparkles className="size-3" />
                        </Button>
                      </div>
                      {errors[`variant_sku_${v.localId}`] && (
                        <span className="text-[10px] text-destructive block mt-0.5">
                          {errors[`variant_sku_${v.localId}`]}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio $"
                        value={v.precioBase}
                        onChange={(e) => handleVariantChange(v.localId, 'precioBase', e.target.value)}
                        className="text-xs h-7 font-mono"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(v.localId, 'stock', e.target.value)}
                        className="text-xs h-7 font-mono"
                      />
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={variantes.length <= 1}
                        onClick={() => handleRemoveVariantRow(v.localId)}
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
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateProducto.isPending}
              className="min-w-28"
            >
              {updateProducto.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Actualizando...
                </>
              ) : (
                <>Guardar Cambios</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
