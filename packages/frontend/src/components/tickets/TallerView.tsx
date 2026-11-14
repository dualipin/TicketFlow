import React, { useState, useCallback, useMemo } from 'react';
import { useTickets } from '../../queries/tickets/queries.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { TicketCard } from './TicketCard.tsx';
import { TicketDetailDrawer } from './TicketDetailDrawer.tsx';
import { CreateTicketModal } from './CreateTicketModal.tsx';
import { QueryStateWrapper } from '../query-states/QueryStateWrapper.tsx';
import { Button } from '../ui/button.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group.tsx';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Search, Plus } from 'lucide-react';

type TallerTab = 'EN_TALLER' | 'RECIBIDO' | 'DIAGNOSTICO' | 'EN_REPARACION' | 'LISTO';

const STATUS_TABS: { label: string; value: TallerTab }[] = [
  { label: 'En Taller', value: 'EN_TALLER' },
  { label: 'Recibidos', value: 'RECIBIDO' },
  { label: 'Diagnóstico', value: 'DIAGNOSTICO' },
  { label: 'En Reparación', value: 'EN_REPARACION' },
  { label: 'Listos', value: 'LISTO' },
];

const ACTIVE_WORKSHOP_STATUSES = new Set(['RECIBIDO', 'DIAGNOSTICO', 'EN_REPARACION']);

export const TallerView: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedTab, setSelectedTab] = useState<TallerTab>('EN_TALLER');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelectTicket = useCallback((id: number) => {
    setSelectedTicketId(id);
  }, []);

  const searchQuery = debouncedSearch.trim() || undefined;
  const ticketsQuery = useTickets({ q: searchQuery });

  const tabCounts = useMemo(() => {
    const tickets = ticketsQuery.data ?? [];
    const counts: Record<TallerTab, number> = {
      EN_TALLER: 0,
      RECIBIDO: 0,
      DIAGNOSTICO: 0,
      EN_REPARACION: 0,
      LISTO: 0,
    };

    for (const ticket of tickets) {
      if (ACTIVE_WORKSHOP_STATUSES.has(ticket.estado)) {
        counts.EN_TALLER += 1;
      }
      if (ticket.estado in counts) {
        counts[ticket.estado as Exclude<TallerTab, 'EN_TALLER'>] += 1;
      }
    }

    return counts;
  }, [ticketsQuery.data]);

  const filteredTickets = useMemo(() => {
    const tickets = ticketsQuery.data ?? [];
    if (selectedTab === 'EN_TALLER') {
      return tickets.filter((t) => ACTIVE_WORKSHOP_STATUSES.has(t.estado));
    }
    return tickets.filter((t) => t.estado === selectedTab);
  }, [ticketsQuery.data, selectedTab]);

  const hasActiveFilters = searchInput.trim() !== '' || selectedTab !== 'EN_TALLER';

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setSelectedTab('EN_TALLER');
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Compact Technical Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={selectedTab}
          onValueChange={(val) => setSelectedTab(val as TallerTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="h-9 w-full sm:w-auto justify-start overflow-x-auto scrollbar-none gap-1 bg-muted/60 p-1 rounded-lg">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs px-2.5 py-1 font-medium transition-colors rounded-md gap-1.5"
              >
                <span>{tab.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {tabCounts[tab.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="h-8 w-full sm:w-64 bg-background rounded-lg">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Buscar folio, equipo, cliente o falla"
              placeholder="Buscar folio, equipo, cliente o falla..."
              className="text-xs"
            />
          </InputGroup>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground rounded-lg h-8"
            >
              Limpiar
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-lg text-xs font-medium"
          >
            <Plus data-icon="inline-start" />
            <span>Nuevo Ticket</span>
          </Button>
        </div>
      </div>

      {/* Workshop Queue */}
      <QueryStateWrapper
        query={ticketsQuery}
        showStaleIndicator={false}
        showBackgroundIndicator={false}
        loadingMessage="Cargando cola de taller..."
        loadingCount={6}
        isEmpty={() => filteredTickets.length === 0}
        emptyTitle="Sin equipos en esta etapa"
        emptyDescription={
          hasActiveFilters
            ? 'Prueba ajustando la búsqueda o cambiando de etapa.'
            : 'Registra un nuevo ticket para comenzar a gestionar reparaciones.'
        }
        onResetFilters={hasActiveFilters ? handleResetFilters : undefined}
      >
        {() => (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicketId === ticket.id}
                onSelectTicket={handleSelectTicket}
              />
            ))}
          </div>
        )}
      </QueryStateWrapper>

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
