import React, { useState, useCallback } from 'react';
import type { Ticket, TicketEstado, TicketFilters } from '../../api/types.ts';
import { useTickets } from '../../queries/tickets/queries.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { TicketCard } from './TicketCard.tsx';
import { TicketDetailDrawer } from './TicketDetailDrawer.tsx';
import { CreateTicketModal } from './CreateTicketModal.tsx';
import { ConfirmEntregaDialog } from './ConfirmEntregaDialog.tsx';
import { QueryStateWrapper } from '../query-states/QueryStateWrapper.tsx';
import { SectionCards } from '../layout/SectionCards.tsx';
import { cn } from '../../lib/utils.ts';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group.tsx';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import {
  Wrench,
  Search,
  Plus,
  DollarSign,
  Layers,
} from 'lucide-react';

const STATUS_TABS: { label: string; value: TicketEstado | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Recibidos', value: 'RECIBIDO' },
  { label: 'En Diagnóstico', value: 'DIAGNOSTICO' },
  { label: 'En Reparación', value: 'EN_REPARACION' },
  { label: 'Listos', value: 'LISTO' },
  { label: 'Entregados', value: 'ENTREGADO' },
  { label: 'Cancelados', value: 'CANCELADO' },
];

export const TallerView: React.FC = () => {
  // Client state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedEstado, setSelectedEstado] = useState<TicketEstado | 'ALL'>('ALL');
  const [onlyConSaldo, setOnlyConSaldo] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ticketForEntregaGuard, setTicketForEntregaGuard] = useState<Ticket | null>(null);

  // Memoized selection handler for stable card callbacks
  const handleSelectTicket = useCallback((id: number) => {
    setSelectedTicketId(id);
  }, []);

  const handleRequestEntregaGuard = useCallback((ticket: Ticket) => {
    setTicketForEntregaGuard(ticket);
  }, []);

  // Derived filter object passed to domain query key
  const activeFilters: TicketFilters = {
    estado: selectedEstado === 'ALL' ? undefined : selectedEstado,
    q: debouncedSearch.trim() || undefined,
    conSaldo: onlyConSaldo || undefined,
  };

  // Server state via TanStack Query
  const ticketsQuery = useTickets(activeFilters);

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedEstado('ALL');
    setOnlyConSaldo(false);
  };

  const activeFiltersCount =
    (selectedEstado !== 'ALL' ? 1 : 0) +
    (onlyConSaldo ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5 text-balance">
            <Wrench className="size-5 text-primary" />
            <span>Cola Técnica de Reparaciones</span>
          </h1>
          <p className="text-xs text-muted-foreground font-normal text-pretty">
            Gestión operativa de órdenes, diagnósticos, bitácoras y liquidaciones.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="default"
          className="gap-2 font-medium text-xs self-start sm:self-auto rounded-lg shadow-2xs"
        >
          <Plus data-icon="inline-start" />
          <span>Nuevo Ticket</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <SectionCards />

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-3 shadow-2xs">
        {/* Top row: Search input & quick toggles */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input using InputGroup */}
          <div className="flex-1 max-w-md">
            <InputGroup className="h-9 bg-background">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Buscar folio, cliente, teléfono o falla"
                placeholder="Buscar folio (#TK-1001), cliente, teléfono o falla..."
                className="text-xs"
              />
            </InputGroup>
          </div>

          {/* Quick Filter: Deudores con saldo pendiente */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={onlyConSaldo ? 'secondary' : 'outline'}
              size="sm"
              aria-pressed={onlyConSaldo}
              onClick={() => setOnlyConSaldo(!onlyConSaldo)}
              className={cn(
                'rounded-lg text-xs gap-1.5 font-medium transition-colors',
                onlyConSaldo
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <DollarSign data-icon="inline-start" />
              <span>Solo Deudores con Saldo</span>
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground rounded-lg h-8"
              >
                Limpiar ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>

        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
          <Tabs
            value={selectedEstado}
            onValueChange={(val) => setSelectedEstado(val as TicketEstado | 'ALL')}
            className="w-full"
          >
            <TabsList className="h-9 w-full sm:w-auto justify-start overflow-x-auto scrollbar-none gap-1 bg-muted/60 p-1 rounded-lg">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-3 py-1 font-medium transition-colors rounded-md"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tickets Feed & Query State Handling */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5 text-balance">
              <Layers className="size-4 text-primary" />
              <span>Cola de Equipos en Servicio</span>
            </h2>
            {ticketsQuery.data && (
              <Badge variant="secondary" className="text-xs font-normal tabular-nums font-mono">
                {ticketsQuery.data.length} órdenes
              </Badge>
            )}
          </div>
        </div>

        {/* Composable Query State Wrapper */}
        <QueryStateWrapper
          query={ticketsQuery}
          showStaleIndicator={true}
          showBackgroundIndicator={true}
          queryKeySummary={`tickets, list, ${JSON.stringify(activeFilters)}`}
          loadingMessage="Consultando tickets y órdenes de taller..."
          loadingCount={6}
          emptyTitle="No se encontraron tickets con los criterios indicados"
          emptyDescription="Prueba ajustando el término de búsqueda, cambiando el filtro de estado o limpiando los filtros."
          onResetFilters={handleResetFilters}
        >
          {(tickets) => (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicketId === ticket.id}
                  onSelectTicket={handleSelectTicket}
                  onRequestEntregaGuard={handleRequestEntregaGuard}
                />
              ))}
            </div>
          )}
        </QueryStateWrapper>
      </section>

      {/* Ticket Detail Drawer */}
      {selectedTicketId !== null && (
        <TicketDetailDrawer
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onRequestEntregaGuard={handleRequestEntregaGuard}
        />
      )}

      {/* Reception / Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newId) => {
          setSelectedTicketId(newId);
        }}
      />

      {/* Financial Guard Modal for Delivery with Pending Debt */}
      {ticketForEntregaGuard && (
        <ConfirmEntregaDialog
          isOpen={true}
          onClose={() => setTicketForEntregaGuard(null)}
          ticketId={ticketForEntregaGuard.id}
          folio={ticketForEntregaGuard.folio}
          dispositivo={ticketForEntregaGuard.dispositivo}
          saldoPendiente={ticketForEntregaGuard.saldoPendiente}
        />
      )}
    </div>
  );
};
