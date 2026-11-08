import React from 'react';
import { AlertTriangle, RotateCw, ServerCrash } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { networkSimulation } from '../../api/client.ts';

interface QueryErrorStateProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
}

export const QueryErrorState: React.FC<QueryErrorStateProps> = ({
  error,
  onRetry,
  title = 'Error al cargar los datos',
}) => {
  const errorMessage =
    error instanceof Error ? error.message : 'Ocurrió un error inesperado de comunicación.';

  const isSimulated = errorMessage.includes('Simulación activa');

  const handleResetSimulationAndRetry = () => {
    networkSimulation.setSimulateError(false);
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-foreground shadow-sm dark:bg-destructive/10"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive dark:bg-destructive/20">
          <ServerCrash className="size-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-destructive">{title}</h3>
            {isSimulated && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Simulación Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-1.5 border-destructive/40 text-xs hover:bg-destructive/10 text-destructive dark:hover:bg-destructive/20"
              >
                <RotateCw className="size-3.5" />
                Reintentar petición
              </Button>
            )}

            {isSimulated && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetSimulationAndRetry}
                className="gap-1.5 text-xs"
              >
                <AlertTriangle className="size-3.5" />
                Desactivar simulación y reintentar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
