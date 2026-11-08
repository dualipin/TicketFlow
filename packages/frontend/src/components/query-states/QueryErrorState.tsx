import React from 'react';
import { AlertTriangle, RotateCw, ServerCrash } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '../ui/alert.tsx';
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
    <Alert variant="destructive" className="p-4 sm:p-5">
      <ServerCrash className="size-5 shrink-0" />

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AlertTitle className="text-sm font-semibold">{title}</AlertTitle>
          {isSimulated && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]"
            >
              Simulación Demo
            </Badge>
          )}
        </div>

        <AlertDescription className="text-xs leading-relaxed">
          {errorMessage}
        </AlertDescription>

        <div className="mt-3 flex flex-wrap items-center gap-2">
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
    </Alert>
  );
};
