import React from 'react';
import { Clock, CheckCircle2, RotateCw } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { cn } from '../../lib/utils.ts';

interface StaleDataIndicatorProps {
  isStale: boolean;
  dataUpdatedAt?: number;
  onRefetch?: () => void;
  isFetching?: boolean;
  className?: string;
  queryKeySummary?: string;
}

export const StaleDataIndicator: React.FC<StaleDataIndicatorProps> = ({
  isStale,
  dataUpdatedAt,
  onRefetch,
  isFetching = false,
  className,
  queryKeySummary,
}) => {
  const formattedTime = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
        isStale
          ? 'border-amber-500/30 bg-amber-500/5 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
          : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isStale ? (
          <Clock className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-medium">
            <span>
              {isStale ? 'Estado: En caché (Obsoleto / Stale)' : 'Estado: En caché (Fresco / Fresh)'}
            </span>
            {queryKeySummary && (
              <span className="font-mono text-xs text-muted-foreground">
                [{queryKeySummary}]
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formattedTime
              ? `Última sincronización: ${formattedTime}`
              : 'Sin marca de tiempo registrada'}
          </span>
        </div>
      </div>

      {onRefetch && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefetch}
          disabled={isFetching}
          className="border-current/30 text-xs hover:bg-current/10"
        >
          <RotateCw
            data-icon="inline-start"
            className={cn(isFetching && 'animate-spin')}
          />
          Refrescar ahora
        </Button>
      )}
    </div>
  );
};
