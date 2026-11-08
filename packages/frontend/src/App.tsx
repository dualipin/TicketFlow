import { useState, useDeferredValue } from 'react';
import type { TicketEstado, TicketFilters } from './api/types.ts';
import { useTickets } from './queries/tickets/queries.ts';
import { TicketCard } from './components/tickets/TicketCard.tsx';
import { TicketDetailDrawer } from './components/tickets/TicketDetailDrawer.tsx';
import { CreateTicketModal } from './components/tickets/CreateTicketModal.tsx';
import { LockScreen } from './components/auth/LockScreen.tsx';
import { QueryStateWrapper } from './components/query-states/QueryStateWrapper.tsx';
import { ServerStateInspector } from './components/dev-tools/ServerStateInspector.tsx';
import { Button } from './components/ui/button.tsx';
import { Badge } from './components/ui/badge.tsx';
import { Avatar, AvatarFallback } from './components/ui/avatar.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from './components/ui/input-group.tsx';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs.tsx';
import { Card, CardContent } from './components/ui/card.tsx';
import { useAuth } from './lib/auth-context.tsx';
import {
  Wrench,
  Search,
  Plus,
  DollarSign,
  Layers,
  Lock,
  Shield,
  Store,
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
  const { currentUser, isLocked, lock, setIsLocked } = useAuth();

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

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return <Shield className="size-3 text-amber-500" />;
      case 'TECNICO':
        return <Wrench className="size-3 text-sky-500" />;
      case 'MOSTRADOR':
      default:
        return <Store className="size-3 text-emerald-500" />;
    }
  };

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
                <Badge variant="outline" className="bg-primary/10 text-primary uppercase text-[10px] font-semibold border-transparent">
                  Taller & PdV
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Capa de estado del servidor con TanStack Query v5 + Optimistic UI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Indicador de Usuario Autenticado / Botón de Bloqueo */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-2 py-1 rounded-xl bg-muted/40 border border-border/60">
                  <Avatar className="size-6 text-xs font-bold bg-primary/15 text-primary">
                    <AvatarFallback>{currentUser.nombre.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left pr-1">
                    <div className="text-xs font-semibold leading-tight flex items-center gap-1">
                      {currentUser.nombre}
                      {getRoleIcon(currentUser.rol)}
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-medium">
                      {currentUser.rol}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={lock}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border/70 shadow-xs"
                  title="Bloquear pantalla o cambiar de operador en mostrador"
                >
                  <Lock className="size-3.5" data-icon="inline-start" />
                  <span className="hidden md:inline">Cambiar Usuario</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocked(true)}
                className="h-8 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                <Lock className="size-3.5" data-icon="inline-start" />
                <span>Identificarse</span>
              </Button>
            )}

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="gap-1.5 font-medium shadow-sm text-xs"
            >
              <Plus className="size-3.5" data-icon="inline-start" />
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
        <Card className="p-4 shadow-2xs gap-3">
          <CardContent className="p-0 flex flex-col gap-3">
            {/* Top row: Search input & quick toggles */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Input using InputGroup */}
              <div className="flex-1 max-w-md">
                <InputGroup className="h-8">
                  <InputGroupAddon align="inline-start">
                    <Search className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por folio (TK-1001), cliente, teléfono o falla..."
                    className="text-xs"
                  />
                </InputGroup>
              </div>

              {/* Quick Filter: Deudores con saldo pendiente */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={onlyConSaldo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOnlyConSaldo(!onlyConSaldo)}
                  className={`h-8 gap-1.5 text-xs font-medium ${
                    onlyConSaldo
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  <DollarSign className="size-3.5" data-icon="inline-start" />
                  <span>Solo Deudores con Saldo</span>
                </Button>

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
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              <Tabs
                value={selectedEstado}
                onValueChange={(val) => setSelectedEstado(val as TicketEstado | 'ALL')}
              >
                <TabsList className="h-8">
                  {STATUS_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-xs px-2.5 py-1"
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Layers className="size-4 text-primary" />
                Cola de Reparaciones en Taller
              </h2>
              {ticketsQuery.data && (
                <Badge variant="secondary" className="text-[11px]">
                  {ticketsQuery.data.length} tickets
                </Badge>
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

      {/* Pantalla de Bloqueo / Cambio de Operador */}
      {isLocked && <LockScreen onSuccess={() => setIsLocked(false)} />}
    </div>
  );
}

export default App;
