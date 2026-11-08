import React, { useState, useDeferredValue } from 'react';
import { BorderBeam } from 'border-beam';
import type { TicketEstado, TicketFilters } from '../../api/types.ts';
import { useTickets } from '../../queries/tickets/queries.ts';
import { TicketCard } from './TicketCard.tsx';
import { TicketDetailDrawer } from './TicketDetailDrawer.tsx';
import { CreateTicketModal } from './CreateTicketModal.tsx';
import { QueryStateWrapper } from '../query-states/QueryStateWrapper.tsx';
import { ServerStateInspector } from '../dev-tools/ServerStateInspector.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group.tsx';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Card, CardContent } from '../ui/card.tsx';
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
  const deferredSearch = useDeferredValue(searchInput);
  const [selectedEstado, setSelectedEstado] = useState<TicketEstado | 'ALL'>('ALL');
  const [onlyConSaldo, setOnlyConSaldo] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derived filter object passed to domain query key
  const activeFilters: TicketFilters = {
    estado: selectedEstado === 'ALL' ? undefined : selectedEstado,
    q: deferredSearch.trim() || undefined,
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
    (deferredSearch.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <Wrench className="size-5 text-primary" />
            <span>Cola Técnica de Reparaciones</span>
          </h2>
          <p className="text-xs text-muted-foreground font-normal">
            Gestión de folios, estados, diagnósticos, bitácoras y liquidaciones.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="default"
          className="gap-2 font-normal text-xs self-start sm:self-auto rounded-full"
        >
          <Plus className="size-3.5" data-icon="inline-start" />
          <span>Nuevo Ticket</span>
        </Button>
      </div>

      {/* Interactive Server-State Inspector & Playground */}
      <ServerStateInspector
        currentFiltersSummary={JSON.stringify({
          estado: selectedEstado,
          q: deferredSearch || undefined,
          conSaldo: onlyConSaldo || undefined,
        })}
        selectedTicketId={selectedTicketId}
      />

      {/* Filter Toolbar */}
      <Card className="p-4 rounded-xl gap-3">
        <CardContent className="p-0 flex flex-col gap-3">
          {/* Top row: Search input & quick toggles */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input using InputGroup (Command-bar style) */}
            <div className="flex-1 max-w-md">
              <BorderBeam
                size="line"
                active={ticketsQuery.isFetching}
                theme="auto"
                className="w-full rounded-lg"
              >
                <InputGroup className="h-9">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar folio (TK-1001), cliente, teléfono o falla..."
                    className="text-xs"
                  />
                </InputGroup>
              </BorderBeam>
            </div>

            {/* Quick Filter: Deudores con saldo pendiente */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={onlyConSaldo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOnlyConSaldo(!onlyConSaldo)}
                className={onlyConSaldo ? 'rounded-full' : 'rounded-full text-muted-foreground hover:text-foreground'}
              >
                <DollarSign className="size-3.5" data-icon="inline-start" />
                <span>Solo Deudores con Saldo</span>
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleResetFilters}
                  className="text-[11px] text-muted-foreground hover:text-foreground rounded-full"
                >
                  Limpiar ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            <Tabs
              value={selectedEstado}
              onValueChange={(val) => setSelectedEstado(val as TicketEstado | 'ALL')}
            >
              <TabsList className="h-8.5">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs px-3 py-1"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Feed & Query State Handling */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              <Layers className="size-4 text-primary" />
              <span>Cola de Equipos en Servicio</span>
            </h3>
            {ticketsQuery.data && (
              <Badge variant="secondary" className="text-[11px] font-normal">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicketId === ticket.id}
                  onSelectTicket={(id) => setSelectedTicketId(id)}
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
    </div>
  );
};
