import React from 'react';

interface QueryLoadingStateProps {
  count?: number;
  message?: string;
}

export const QueryLoadingState: React.FC<QueryLoadingStateProps> = ({
  count = 3,
  message = 'Cargando datos del servidor...',
}) => {
  return (
    <div className="w-full space-y-4" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
        <div className="size-2 rounded-full bg-primary/70 animate-ping" />
        <span>{message}</span>
      </div>

      <div className="grid gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/60 bg-card/60 p-4 shadow-xs backdrop-blur-xs animate-pulse"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 rounded bg-muted" />
                <div className="h-5 w-24 rounded bg-muted/70" />
              </div>
              <div className="h-5 w-16 rounded bg-muted/60" />
            </div>

            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted/50" />
            </div>

            <div className="mt-4 flex items-center justify-between pt-2">
              <div className="h-4 w-28 rounded bg-muted/40" />
              <div className="h-6 w-20 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
