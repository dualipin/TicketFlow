import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';
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
    <div className="w-full flex flex-col gap-4" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
        <ThinkingOrb state="searching" size={20} aria-hidden="true" />
        <span>{message}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="p-4 rounded-xl border border-border bg-card gap-3">
            <CardHeader className="p-0 flex-row items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>

            <CardContent className="p-0 flex flex-col gap-2 py-1">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </CardContent>

            <CardFooter className="p-0 flex items-center justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
