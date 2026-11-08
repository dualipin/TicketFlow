import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button.tsx';

interface QueryEmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  action?: React.ReactNode;
}

export const QueryEmptyState: React.FC<QueryEmptyStateProps> = ({
  title = 'No hay datos disponibles',
  description = 'No se encontraron registros que coincidan con los criterios actuales.',
  onResetFilters,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-xs">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
        <Inbox className="size-6 stroke-[1.5]" />
      </div>

      <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Limpiar filtros
          </Button>
        )}
        {action}
      </div>
    </div>
  );
};
