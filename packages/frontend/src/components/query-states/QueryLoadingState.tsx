import React from 'react';
import { Skeleton } from '../ui/skeleton.tsx';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card.tsx';

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="p-4 gap-3 bg-card/60 backdrop-blur-xs">
            <CardHeader className="p-0 flex-row items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </CardHeader>

            <CardContent className="p-0 space-y-2 py-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>

            <CardFooter className="p-0 flex items-center justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
