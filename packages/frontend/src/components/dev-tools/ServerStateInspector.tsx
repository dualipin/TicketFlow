import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ticketsKeys } from '../../queries/tickets/keys.ts';
import { networkSimulation } from '../../api/client.ts';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Separator } from '../ui/separator.tsx';
import { Card, CardHeader, CardContent } from '../ui/card.tsx';
import {
  Activity,
  Layers,
  Database,
  RefreshCw,
  AlertOctagon,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ServerStateInspectorProps {
  currentFiltersSummary?: string;
  selectedTicketId?: number | null;
}

export const ServerStateInspector: React.FC<ServerStateInspectorProps> = ({
  currentFiltersSummary = '{}',
  selectedTicketId,
}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulatingError, setIsSimulatingError] = useState(
    networkSimulation.getSimulateError()
  );
  const [simulatedLatency, setSimulatedLatency] = useState(
    networkSimulation.getSimulatedLatency()
  );

  const toggleSimulateError = () => {
    const nextVal = !isSimulatingError;
    setIsSimulatingError(nextVal);
    networkSimulation.setSimulateError(nextVal);
  };

  const toggleLatency = () => {
    const nextVal = simulatedLatency > 0 ? 0 : 1500;
    setSimulatedLatency(nextVal);
    networkSimulation.setSimulatedLatency(nextVal);
  };

  const handleInvalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
  };

  const handleInvalidateAllTickets = () => {
    queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
  };

  const handleRefetchActive = () => {
    queryClient.refetchQueries({ type: 'active' });
  };

  // Inspect queries in cache
  const cachedQueries = queryClient.getQueryCache().getAll();

  return (
    <Card className="p-4 shadow-xs bg-card/80 backdrop-blur-xs transition-all gap-0">
      <CardHeader className="p-0 flex flex-wrap flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Activity className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground">
                TanStack Query Server-State Inspector
              </h3>
              <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] font-semibold border-transparent">
                {cachedQueries.length} consultas en caché
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Supervisión de estados del servidor, claves por dominio y pruebas de invalidación dirigida
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation switches */}
          <Button
            variant={isSimulatingError ? 'destructive' : 'outline'}
            size="xs"
            onClick={toggleSimulateError}
            className="gap-1 text-[11px]"
            title="Provoca un error 503 para validar el estado de Error y la recuperación con Reintentar"
          >
            <AlertOctagon className="size-3" data-icon="inline-start" />
            {isSimulatingError ? 'Error 503 Activo' : 'Simular Error Servidor'}
          </Button>

          <Button
            variant={simulatedLatency > 0 ? 'secondary' : 'outline'}
            size="xs"
            onClick={toggleLatency}
            className="gap-1 text-[11px]"
            title="Añade 1.5s de latencia artificial para apreciar el estado de Carga y Sincronización en segundo plano"
          >
            <Clock className="size-3" data-icon="inline-start" />
            {simulatedLatency > 0 ? 'Latencia: 1.5s' : 'Latencia normal'}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-1 text-[11px]"
          >
            <span>{isOpen ? 'Ocultar panel' : 'Ver claves y métricas'}</span>
            {isOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-0 mt-4 space-y-4 pt-4 border-t border-border/60 text-xs animate-in fade-in duration-200">
          {/* Interactive targeted invalidation triggers */}
          <div>
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-2">
              Disparadores de Invalidación Dirigida (Targeted Invalidation):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleRefetchActive}
                className="gap-1.5 text-[11px]"
              >
                <RefreshCw className="size-3" data-icon="inline-start" />
                Refrescar consultas activas (Segundo plano)
              </Button>

              <Button
                variant="outline"
                size="xs"
                onClick={handleInvalidateLists}
                className="gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 border-amber-500/30"
              >
                <Layers className="size-3" data-icon="inline-start" />
                Invalidar sólo listas: ['tickets', 'list']
              </Button>

              <Button
                variant="outline"
                size="xs"
                onClick={handleInvalidateAllTickets}
                className="gap-1.5 text-[11px] text-primary border-primary/30"
              >
                <Database className="size-3" data-icon="inline-start" />
                Invalidar dominio completo: ['tickets']
              </Button>
            </div>
          </div>

          {/* Active Domain Keys Hierarchy */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-3 shadow-none bg-muted/30 border-border/50 gap-2">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                Jerarquía de Claves del Dominio Tickets
              </span>
              <ul className="space-y-1 font-mono text-[11px] text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <span className="text-primary font-bold">1. All:</span>
                  <span>{JSON.stringify(ticketsKeys.all)}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-primary font-bold">2. Lists:</span>
                  <span>{JSON.stringify(ticketsKeys.lists())}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-primary font-bold">3. List Activa:</span>
                  <span className="text-foreground">
                    ['tickets', 'list', {currentFiltersSummary}]
                  </span>
                </li>
                {selectedTicketId && (
                  <li className="flex items-center gap-1.5">
                    <span className="text-primary font-bold">4. Detail:</span>
                    <span className="text-foreground">
                      {JSON.stringify(ticketsKeys.detail(selectedTicketId))}
                    </span>
                  </li>
                )}
              </ul>
            </Card>

            <Card className="p-3 shadow-none bg-muted/30 border-border/50 gap-2">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Database className="size-3 text-emerald-600 dark:text-emerald-400" />
                Separación de Responsabilidades
              </span>
              <div className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Estado del Servidor:</strong> Gestionado
                  exclusivamente por TanStack Query (datos de tickets, clientes, bitácora y pagos).
                </p>
                <p>
                  <strong className="text-foreground">Estado del Cliente:</strong> Gestionado por
                  React local (filtros de búsqueda, modal abierto/cerrado, ID del ticket seleccionado).
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Cero duplicación de colecciones del servidor en stores globales (sin shadow copies).
                </p>
              </div>
            </Card>
          </div>

          <Separator className="my-2" />

          {/* Active cache entries table */}
          <div>
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-2">
              Entradas en Cache ({cachedQueries.length}):
            </span>
            <div className="max-h-44 overflow-y-auto rounded-lg border border-border/60 bg-background/50 divide-y divide-border/40 font-mono text-[10px]">
              {cachedQueries.map((q) => {
                const isStale = q.isStale();
                const isFetching = q.state.fetchStatus === 'fetching';
                const status = q.state.status;

                return (
                  <div
                    key={q.queryHash}
                    className="flex flex-wrap items-center justify-between gap-2 p-2"
                  >
                    <div className="truncate max-w-[280px] sm:max-w-[380px]">
                      <span className="text-foreground font-semibold">{q.queryHash}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          status === 'success'
                            ? 'outline'
                            : status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className={
                          status === 'success'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[9px]'
                            : 'text-[9px]'
                        }
                      >
                        {status}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          isStale
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        {isStale ? 'STALE' : 'FRESH'}
                      </Badge>

                      {isFetching && (
                        <Badge
                          variant="outline"
                          className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20 text-[9px] animate-pulse"
                        >
                          FETCHING
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
