import React, { memo } from 'react';
import type { Categoria, VariacionWithProducto } from '../../api/types.ts';
import { Card, CardContent } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../ui/empty.tsx';
import { Barcode, Store, Wrench, Plus, PackageX, X } from 'lucide-react';

interface CatalogItemCardProps {
  variacion: VariacionWithProducto;
  onAddToCart: (v: VariacionWithProducto) => void;
}

export const CatalogItemCard = memo(function CatalogItemCard({
  variacion,
  onAddToCart,
}: CatalogItemCardProps) {
  const esServicio = Boolean(variacion.producto.esServicio);
  const agotado = !esServicio && variacion.stock <= 0;

  return (
    <button
      type="button"
      onClick={() => onAddToCart(variacion)}
      disabled={agotado}
      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group relative ${
        agotado
          ? 'opacity-50 cursor-not-allowed bg-muted/20 border-border/40'
          : 'bg-card hover:border-primary/50 active:scale-[0.98] cursor-pointer border-border'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-xs font-mono text-muted-foreground truncate">
            {variacion.codigo}
          </span>
          {esServicio ? (
            <Badge
              variant="outline"
              className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20 shrink-0 font-semibold h-5"
            >
              Servicio
            </Badge>
          ) : agotado ? (
            <Badge variant="destructive" className="text-xs px-2 py-0 shrink-0 h-5">
              Agotado
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0 text-muted-foreground shrink-0 h-5"
            >
              {variacion.stock} disp.
            </Badge>
          )}
        </div>

        <div className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {variacion.producto.nombre}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {variacion.nombre}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
        <span className="text-base font-black text-foreground">
          ${variacion.precioBase.toFixed(2)}
        </span>
        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <Plus className="size-4" />
        </div>
      </div>
    </button>
  );
});

interface PosCatalogProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBarcodeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  tipoFilter: 'ALL' | 'FISICOS' | 'SERVICIOS';
  onTipoFilterChange: (tipo: 'ALL' | 'FISICOS' | 'SERVICIOS') => void;
  categorias: Categoria[] | undefined;
  selectedCategoriaId: number | 'ALL';
  onSelectCategoria: (id: number | 'ALL') => void;
  isLoading: boolean;
  variaciones: VariacionWithProducto[];
  onAddToCart: (v: VariacionWithProducto) => void;
}

export const PosCatalog: React.FC<PosCatalogProps> = ({
  searchInputRef,
  searchQuery,
  onSearchChange,
  onBarcodeKeyDown,
  tipoFilter,
  onTipoFilterChange,
  categorias,
  selectedCategoriaId,
  onSelectCategoria,
  isLoading,
  variaciones,
  onAddToCart,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 rounded-xl gap-3">
        <CardContent className="p-0 flex flex-col gap-3">
          {/* Buscador con soporte de escáner de código de barras */}
          <div className="flex items-center gap-2">
            <InputGroup className="h-10 flex-1">
              <InputGroupAddon align="inline-start">
                <Barcode className="size-4.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onBarcodeKeyDown}
                placeholder="Escanear código SKU o buscar por nombre (presiona Enter para agregar)..."
                autoFocus
              />
              {searchQuery ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => onSearchChange('')}
                    className="text-muted-foreground hover:text-foreground"
                    title="Limpiar búsqueda"
                    aria-label="Limpiar búsqueda"
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : (
                <InputGroupAddon align="inline-end">
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono font-medium rounded bg-muted text-muted-foreground border border-border/60">
                    F2
                  </kbd>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>

          {/* Filtro de Tipo: Todos, Físicos, Servicios */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={tipoFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => onTipoFilterChange('ALL')}
                className="text-xs px-3"
              >
                Todos
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipoFilter === 'FISICOS' ? 'default' : 'outline'}
                onClick={() => onTipoFilterChange('FISICOS')}
                className="text-xs px-3 gap-1.5"
              >
                <Store className="size-3.5" data-icon="inline-start" />
                <span>Productos Físicos</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipoFilter === 'SERVICIOS' ? 'default' : 'outline'}
                onClick={() => onTipoFilterChange('SERVICIOS')}
                className="text-xs px-3 gap-1.5"
              >
                <Wrench className="size-3.5" data-icon="inline-start" />
                <span>Servicios de Taller</span>
              </Button>
            </div>

            <span className="text-xs text-muted-foreground">
              {variaciones.length} artículos
            </span>
          </div>

          {/* Categorías Pills */}
          {categorias && categorias.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <Button
                type="button"
                size="sm"
                variant={selectedCategoriaId === 'ALL' ? 'secondary' : 'ghost'}
                onClick={() => onSelectCategoria('ALL')}
                className="text-xs px-3 shrink-0"
              >
                Todas las Categorías
              </Button>
              {categorias.map((cat) => (
                <Button
                  key={cat.id}
                  type="button"
                  size="sm"
                  variant={selectedCategoriaId === cat.id ? 'secondary' : 'ghost'}
                  onClick={() => onSelectCategoria(cat.id)}
                  className="text-xs px-3 shrink-0"
                >
                  {cat.nombre}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Artículos */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2">
          <Spinner className="size-6 text-primary" />
          <span className="text-xs text-muted-foreground">Cargando catálogo...</span>
        </div>
      ) : variaciones.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageX className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No se encontraron artículos</EmptyTitle>
            <EmptyDescription>
              Intenta cambiar los filtros de categoría o buscar con otro término.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {variaciones.map((v) => (
            <CatalogItemCard
              key={v.id}
              variacion={v}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
