import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from '../ui/empty.tsx';

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
    <Empty className="border border-dashed border-border/80 bg-card/40 backdrop-blur-xs">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      {(onResetFilters || action) && (
        <EmptyContent className="flex flex-row flex-wrap items-center justify-center gap-2">
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
        </EmptyContent>
      )}
    </Empty>
  );
};
