import React, { useState, useMemo } from 'react';
import { useProductos, useCategorias } from '../../queries/inventario/queries.ts';
import { useReactivarProducto } from '../../queries/inventario/mutations.ts';
import { CreateProductoModal } from './CreateProductoModal.tsx';
import { EditProductoModal } from './EditProductoModal.tsx';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog.tsx';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '../ui/empty.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.tsx';
import { Skeleton } from '../ui/skeleton.tsx';
import { toast } from 'sonner';
import {
  Package,
  Wrench,
  Search,
  Plus,
  Boxes,
  Barcode,
  Layers,
  Archive,
  AlertTriangle,
  Pencil,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import type { ProductoWithDetails } from '../../api/types.ts';

const ESTADO_FILTER_OPTIONS = [
  { value: 'ACTIVOS', label: 'Activos' },
  { value: 'ARCHIVADOS', label: 'Archivados' },
] as const;

const TIPO_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: '0', label: 'Productos' },
  { value: '1', label: 'Servicios' },
] as const;

export const InventarioView: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<ProductoWithDetails | null>(null);
  const [deletingProducto, setDeletingProducto] = useState<ProductoWithDetails | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'ALL' | '0' | '1'>('ALL');
  const [categoriaIdFilter, setCategoriaIdFilter] = useState<string>('ALL');
  const [estadoFilter, setEstadoFilter] = useState<'ACTIVOS' | 'ARCHIVADOS'>('ACTIVOS');

  const { data: categorias = [] } = useCategorias();
  const reactivarProducto = useReactivarProducto();

  const esServicioQuery = tipoFilter === 'ALL' ? undefined : Number(tipoFilter);
  const categoriaIdQuery = categoriaIdFilter === 'ALL' ? undefined : Number(categoriaIdFilter);
  const activoQuery = estadoFilter === 'ACTIVOS' ? 1 : 0;

  const { data: productos = [], isLoading } = useProductos({
    esServicio: esServicioQuery,
    categoriaId: categoriaIdQuery,
    activo: activoQuery,
    q: searchQuery.trim() || undefined,
  });

  // Métricas rápidas calculadas siempre sobre el catálogo activo real
  const { data: productosActivos = [] } = useProductos({
    activo: 1,
  });

  const stats = useMemo(() => {
    const totalProductos = productosActivos.filter((p) => p.esServicio === 0).length;
    const totalServicios = productosActivos.filter((p) => p.esServicio === 1).length;
    const totalStock = productosActivos
      .filter((p) => p.esServicio === 0)
      .reduce((acc, p) => acc + (p.variaciones?.reduce((s, v) => s + v.stock, 0) ?? 0), 0);
    const bajoStock = productosActivos
      .filter((p) => p.esServicio === 0)
      .reduce(
        (acc, p) =>
          acc +
          (p.variaciones?.filter((v) => v.stock <= 3 && v.stock >= 0).length ?? 0),
        0
      );

    return { totalProductos, totalServicios, totalStock, bajoStock };
  }, [productosActivos]);

  const handleReactivar = async (prod: ProductoWithDetails) => {
    try {
      await reactivarProducto.mutateAsync(prod.id);
      toast.success(`Producto "${prod.nombre}" reactivado en el catálogo`);
    } catch (err: any) {
      toast.error(err.message || 'Error al reactivar el producto');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header con Título y Botón de Creación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-secondary border border-border">
              <Boxes className="size-4 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Inventario y Catálogo
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Control de productos físicos, refacciones de taller y catálogo de servicios de mano de obra.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus data-icon="inline-start" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* 2. Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Package className="size-3.5 text-primary shrink-0" /> Productos Físicos
          </span>
          <span className="text-xl font-bold text-foreground">{stats.totalProductos}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Wrench className="size-3.5 text-primary/80 shrink-0" /> Servicios de Taller
          </span>
          <span className="text-xl font-bold text-foreground">{stats.totalServicios}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Archive className="size-3.5 text-foreground shrink-0" /> Stock Físico Total
          </span>
          <span className="text-xl font-bold text-foreground">{stats.totalStock} uds</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 text-destructive shrink-0" /> Variantes Bajo Stock
          </span>
          <span className="text-xl font-bold text-destructive">{stats.bajoStock}</span>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o variación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por Estado (Activos vs Archivados) */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            {ESTADO_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={estadoFilter === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEstadoFilter(option.value)}
                className="text-xs px-2.5"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Filtro por Tipo */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            {TIPO_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={tipoFilter === option.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTipoFilter(option.value)}
                className="text-xs px-2.5"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Filtro por Categoría */}
          <Select
            value={categoriaIdFilter}
            onValueChange={(val) => setCategoriaIdFilter(val ?? 'ALL')}
          >
            <SelectTrigger className="w-full sm:w-[190px] text-xs">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Todas las categorías</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Tabla o Listado de Artículos */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>
              {estadoFilter === 'ARCHIVADOS'
                ? 'No hay productos archivados'
                : 'No hay artículos que coincidan'}
            </EmptyTitle>
            <EmptyDescription>
              {estadoFilter === 'ARCHIVADOS'
                ? 'Los productos retirados que tengan historial contable aparecerán aquí.'
                : searchQuery || categoriaIdFilter !== 'ALL' || tipoFilter !== 'ALL'
                ? 'Intenta ajustar tus criterios de búsqueda o filtros.'
                : 'Aún no has registrado ningún producto o servicio en el inventario.'}
            </EmptyDescription>
          </EmptyHeader>
          {estadoFilter === 'ACTIVOS' && (
            <EmptyContent>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setTipoFilter('ALL');
                  setCategoriaIdFilter('ALL');
                  setIsCreateModalOpen(true);
                }}
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Plus data-icon="inline-start" />
                Crear primer artículo
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs tracking-wider font-medium">
                <tr>
                  <th className="py-3 px-4">Artículo / Descripción</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Variantes (SKU, Precio y Stock)</th>
                  <th className="py-3 px-4 text-right">Rango Precios</th>
                  <th className="py-3 px-4 text-right">Stock Total</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productos.map((prod) => {
                  const isServicio = prod.esServicio === 1;
                  const totalStock = prod.variaciones?.reduce((acc, v) => acc + v.stock, 0) ?? 0;
                  const minPrice = prod.variaciones?.length
                    ? Math.min(...prod.variaciones.map((v) => v.precioBase))
                    : 0;
                  const maxPrice = prod.variaciones?.length
                    ? Math.max(...prod.variaciones.map((v) => v.precioBase))
                    : 0;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Artículo */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground text-sm">
                            {prod.nombre}
                          </span>
                          {prod.descripcion && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {prod.descripcion}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4">
                        {isServicio ? (
                          <Badge variant="outline" className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Wrench className="size-2.5" /> Servicio
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Package className="size-2.5 text-primary" /> Físico
                          </Badge>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="size-3 text-muted-foreground/60" />
                          {prod.categoria?.nombre || 'Sin categoría'}
                        </span>
                      </td>

                      {/* Variantes individuales con SKU, precio y stock */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1.5 max-w-sm">
                          {prod.variaciones?.map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-muted/40 text-xs border border-border/50"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded text-xs border border-border flex items-center gap-1 shrink-0">
                                  <Barcode className="size-3" />
                                  {v.codigo}
                                </span>
                                <span className="text-foreground font-medium truncate">
                                  {v.nombre}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 font-mono">
                                <span className="text-foreground font-semibold">
                                  ${v.precioBase.toFixed(2)}
                                </span>
                                {!isServicio && (
                                  <span className="text-muted-foreground text-xs">
                                    ({v.stock} uds)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Rango de Precios */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                        {minPrice === maxPrice
                          ? `$${minPrice.toFixed(2)}`
                          : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`}
                      </td>

                      {/* Stock Total */}
                      <td className="py-3 px-4 text-right">
                        {isServicio ? (
                          <span className="text-xs text-muted-foreground italic">
                            Sin stock (Servicio)
                          </span>
                        ) : (
                          <Badge
                            variant={totalStock <= 0 ? 'destructive' : 'outline'}
                            className={
                              totalStock <= 0
                                ? undefined
                                : totalStock <= 3
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }
                          >
                            {totalStock <= 0
                              ? 'Agotado (0)'
                              : `${totalStock} uds`}
                          </Badge>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {estadoFilter === 'ARCHIVADOS' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={reactivarProducto.isPending}
                              onClick={() => handleReactivar(prod)}
                              title="Reactivar producto en catálogo"
                              className="text-xs"
                            >
                              <RotateCcw data-icon="inline-start" />
                              Reactivar
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setEditingProducto(prod)}
                                title="Editar producto"
                                aria-label="Editar producto"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeletingProducto(prod)}
                                title="Eliminar o archivar"
                                aria-label="Eliminar o archivar"
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      <CreateProductoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal de Edición */}
      <EditProductoModal
        isOpen={Boolean(editingProducto)}
        onClose={() => setEditingProducto(null)}
        producto={editingProducto}
      />

      {/* Diálogo de Confirmación Destructivo */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deletingProducto)}
        onClose={() => setDeletingProducto(null)}
        producto={deletingProducto}
      />
    </div>
  );
};
