import { useState, useDeferredValue } from 'react';
import type { TicketEstado, TicketFilters } from './api/types.ts';
import { useTickets } from './queries/tickets/queries.ts';
import { TicketCard } from './components/tickets/TicketCard.tsx';
import { TicketDetailDrawer } from './components/tickets/TicketDetailDrawer.tsx';
import { CreateTicketModal } from './components/tickets/CreateTicketModal.tsx';
import { QueryStateWrapper } from './components/query-states/QueryStateWrapper.tsx';
import { ServerStateInspector } from './components/dev-tools/ServerStateInspector.tsx';
import { Button } from './components/ui/button.tsx';
import {
  Wrench,
  Search,
  Plus,
  Filter,
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

export function App() {
  // =========================================================================
  // CLIENT STATE (Strictly UI concerns; server data is kept in TanStack Query)
  // =========================================================================
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

  // =========================================================================
  // SERVER STATE (Fetched, cached, and synchronized via TanStack Query)
  // =========================================================================
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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                  TicketFlow
                </h1>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                  Taller & PdV
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Capa de estado del servidor con TanStack Query v5 + Optimistic UI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="gap-1.5 font-medium shadow-sm text-xs"
            >
              <Plus className="size-3.5" />
              <span>Nuevo Ticket</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
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
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
          {/* Top row: Search input & quick toggles */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por folio (TK-1001), cliente, teléfono o falla..."
                className="w-full rounded-lg border border-input bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {/* Quick Filter: Deudores con saldo pendiente */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyConSaldo(!onlyConSaldo)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
                  onlyConSaldo
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold shadow-2xs'
                    : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <DollarSign className="size-3.5" />
                <span>Solo Deudores con Saldo</span>
              </button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleResetFilters}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Limpiar ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <Filter className="size-3" />
              Estado:
            </span>
            {STATUS_TABS.map((tab) => {
              const isActive = selectedEstado === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedEstado(tab.value)}
                  className={`inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tickets Feed & Query State Handling */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Layers className="size-4 text-primary" />
                Cola de Reparaciones en Taller
              </h2>
              {ticketsQuery.data && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {ticketsQuery.data.length} tickets
                </span>
              )}
            </div>
          </div>

          {/* Composable Query State Wrapper: Handles Loading, Error, Empty, Background-Refetch and Stale states */}
          <QueryStateWrapper
            query={ticketsQuery}
            showStaleIndicator={true}
            showBackgroundIndicator={true}
            queryKeySummary={`tickets, list, ${JSON.stringify(activeFilters)}`}
            loadingMessage="Consultando tickets y órdenes de taller..."
            loadingCount={4}
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
      </main>

      {/* Ticket Detail Drawer (Receives only ticketId and fetches independently via useTicket) */}
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
}

export default App;
