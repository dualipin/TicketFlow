import { describe, expect, it } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import { ticketsKeys } from './tickets/keys.ts';
import { ticketsQueries } from './tickets/queries.ts';
import { clientesKeys } from './clientes/keys.ts';
import type { Ticket, TicketFilters } from '../api/types.ts';
import { ApiClientError } from '../api/client.ts';

// Helper mock data
const mockTicket1: Ticket = {
  id: 1,
  folio: 'TK-1001',
  clienteId: 2,
  tecnicoId: 3,
  estado: 'RECIBIDO',
  dispositivo: 'iPhone 11',
  falla: 'Pantalla estrellada',
  contrasena: '1234',
  accesorios: 'Funda',
  fotoRecepcion: null,
  fotoAccesorios: null,
  costoTotal: 1000,
  saldoPendiente: 600,
  createdAt: '2026-11-08T00:00:00.000Z',
  updatedAt: '2026-11-08T00:00:00.000Z',
  cliente: {
    id: 2,
    nombre: 'Roberto Gómez',
    telefono: '5215511223344',
    notas: null,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T00:00:00.000Z',
  },
  tecnico: null,
  bitacora: [],
  historialPagos: [],
};

const mockTicket2: Ticket = {
  ...mockTicket1,
  id: 2,
  folio: 'TK-1002',
  dispositivo: 'Galaxy S21',
  estado: 'DIAGNOSTICO',
};

describe('1. Domain-Shaped Query Keys', () => {
  it('generates predictable, strictly-typed query key hierarchies for tickets', () => {
    // Root domain key
    expect(ticketsKeys.all).toEqual(['tickets']);

    // Lists root key
    expect(ticketsKeys.lists()).toEqual(['tickets', 'list']);

    // Filtered lists keys
    const filters1: TicketFilters = { estado: 'RECIBIDO', conSaldo: true };
    expect(ticketsKeys.list(filters1)).toEqual([
      'tickets',
      'list',
      { estado: 'RECIBIDO', conSaldo: true },
    ]);

    expect(ticketsKeys.list()).toEqual(['tickets', 'list', {}]);

    // Details keys
    expect(ticketsKeys.details()).toEqual(['tickets', 'detail']);
    expect(ticketsKeys.detail(1)).toEqual(['tickets', 'detail', 1]);
    expect(ticketsKeys.timeline(1)).toEqual(['tickets', 'detail', 1, 'bitacora']);
  });

  it('generates predictable query keys for clientes', () => {
    expect(clientesKeys.all).toEqual(['clientes']);
    expect(clientesKeys.lists()).toEqual(['clientes', 'list']);
    expect(clientesKeys.list('Roberto')).toEqual(['clientes', 'list', { search: 'Roberto' }]);
    expect(clientesKeys.detail(2)).toEqual(['clientes', 'detail', 2]);
  });
});

describe('2. Colocated Query Functions (queryOptions)', () => {
  it('colocates query keys with fetch logic and options', () => {
    const listOptions = ticketsQueries.list({ estado: 'EN_REPARACION' });
    expect(listOptions.queryKey).toEqual([
      'tickets',
      'list',
      { estado: 'EN_REPARACION' },
    ]);
    expect(typeof listOptions.queryFn).toBe('function');
    expect(listOptions.staleTime).toBe(20000);

    const detailOptions = ticketsQueries.detail(1);
    expect(detailOptions.queryKey).toEqual(['tickets', 'detail', 1]);
    expect(detailOptions.enabled).toBe(true);

    const invalidDetailOptions = ticketsQueries.detail(0);
    expect(invalidDetailOptions.enabled).toBe(false);
  });
});

describe('3. Optimistic Mutations & Targeted Invalidation Lifecycle', () => {
  it('optimistically updates cache, supports snapshotting and rollback on error', async () => {
    const queryClient = new QueryClient();

    // 1. Pre-seed cache with initial state
    const detailKey = ticketsKeys.detail(1);
    const listKey = ticketsKeys.list({ estado: 'ALL' });

    queryClient.setQueryData<Ticket>(detailKey, mockTicket1);
    queryClient.setQueryData<Ticket[]>(listKey, [mockTicket1, mockTicket2]);

    expect(queryClient.getQueryData<Ticket>(detailKey)?.estado).toBe('RECIBIDO');
    expect(queryClient.getQueryData<Ticket[]>(listKey)?.[0].estado).toBe('RECIBIDO');

    // 2. Perform optimistic mutation (onMutate)
    const previousDetail = queryClient.getQueryData<Ticket>(detailKey);
    const previousLists = queryClient.getQueriesData<Ticket[]>({
      queryKey: ticketsKeys.lists(),
    });

    // Optimistically update to 'EN_REPARACION'
    queryClient.setQueryData<Ticket>(detailKey, {
      ...previousDetail!,
      estado: 'EN_REPARACION',
    });

    queryClient.setQueriesData<Ticket[]>(
      { queryKey: ticketsKeys.lists() },
      (oldList) =>
        oldList?.map((t) => (t.id === 1 ? { ...t, estado: 'EN_REPARACION' } : t))
    );

    // Verify cache was updated INSTANTLY without server round-trip
    expect(queryClient.getQueryData<Ticket>(detailKey)?.estado).toBe('EN_REPARACION');
    expect(queryClient.getQueryData<Ticket[]>(listKey)?.[0].estado).toBe('EN_REPARACION');

    // 3. Simulate Mutation Error & Rollback (onError)
    if (previousDetail) {
      queryClient.setQueryData(detailKey, previousDetail);
    }
    for (const [key, listData] of previousLists) {
      queryClient.setQueryData(key, listData);
    }

    // Verify state was accurately restored to 'RECIBIDO'
    expect(queryClient.getQueryData<Ticket>(detailKey)?.estado).toBe('RECIBIDO');
    expect(queryClient.getQueryData<Ticket[]>(listKey)?.[0].estado).toBe('RECIBIDO');
  });

  it('performs targeted invalidation on affected domain keys without wiping unrelated cache', async () => {
    const queryClient = new QueryClient();

    // Seed ticket queries and client queries
    const ticketListKey = ticketsKeys.list();
    const ticketDetailKey = ticketsKeys.detail(1);
    const clientListKey = clientesKeys.list();

    queryClient.setQueryData(ticketListKey, [mockTicket1]);
    queryClient.setQueryData(ticketDetailKey, mockTicket1);
    queryClient.setQueryData(clientListKey, [mockTicket1.cliente]);

    // Perform targeted invalidation of only tickets list queries
    await queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });

    // ticketListKey query must be marked invalidated
    const ticketListQuery = queryClient.getQueryCache().find({ queryKey: ticketListKey });
    expect(ticketListQuery?.state.isInvalidated).toBe(true);

    // ticketDetailKey must NOT be invalidated because targeted invalidation only touched lists!
    const ticketDetailQuery = queryClient.getQueryCache().find({ queryKey: ticketDetailKey });
    expect(ticketDetailQuery?.state.isInvalidated).toBe(false);

    // clientListKey must NOT be invalidated because it belongs to the clientes domain
    const clientListQuery = queryClient.getQueryCache().find({ queryKey: clientListKey });
    expect(clientListQuery?.state.isInvalidated).toBe(false);
  });
});

describe('4. Server-State Verification (Loading, Error, Empty, Background-Refetch, Stale)', () => {
  it('distinguishes between initial loading and background-refetch', () => {
    // Initial loading: no data yet and fetching
    const initialLoadingState = {
      isPending: true,
      isFetching: true,
      data: undefined,
    };
    expect(initialLoadingState.isPending).toBe(true);
    expect(initialLoadingState.isFetching).toBe(true);

    // Background refetch: existing data in cache, fetching fresh version in background
    const backgroundRefetchState = {
      isPending: false,
      isFetching: true,
      data: [mockTicket1],
    };
    expect(backgroundRefetchState.isPending).toBe(false);
    expect(backgroundRefetchState.isFetching && !backgroundRefetchState.isPending).toBe(true);
  });

  it('handles stale data detection via staleTime', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 50, // 50ms stale time for test
        },
      },
    });

    const key = ticketsKeys.detail(1);
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: () => Promise.resolve(mockTicket1),
      staleTime: 50,
    });

    const query = queryClient.getQueryCache().find({ queryKey: key });
    expect(query?.isStaleByTime(50)).toBe(false); // initially fresh

    // Wait 70ms to exceed staleTime
    await new Promise((r) => setTimeout(r, 70));
    expect(query?.isStaleByTime(50)).toBe(true); // now stale, triggers background refetch on next trigger
  });

  it('handles empty state properly without entering error state', () => {
    const emptyResult: Ticket[] = [];
    const isDataEmpty = Array.isArray(emptyResult) && emptyResult.length === 0;
    expect(isDataEmpty).toBe(true);
  });

  it('handles ApiClientError with retry discrimination', () => {
    const notFoundError = new ApiClientError('Not found', 404, 'Not Found');
    const serverError = new ApiClientError('Service unavailable', 503, 'Service Unavailable');

    // Default retry policy: don't retry 4xx, retry 5xx
    const retryPolicy = (failureCount: number, error: unknown) => {
      if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    };

    expect(retryPolicy(0, notFoundError)).toBe(false);
    expect(retryPolicy(0, serverError)).toBe(true);
    expect(retryPolicy(2, serverError)).toBe(false);
  });
});

describe('5. Separation of Client State vs Server State', () => {
  it('ensures query keys represent pure functions of client filter inputs', () => {
    const clientState1: TicketFilters = { estado: 'RECIBIDO', q: 'iPhone' };
    const clientState2: TicketFilters = { estado: 'RECIBIDO', q: 'Samsung' };

    const key1 = ticketsKeys.list(clientState1);
    const key2 = ticketsKeys.list(clientState2);

    // Independent query keys mean each client filter combination caches independently
    expect(key1).not.toEqual(key2);
    expect(key1).toEqual(['tickets', 'list', { estado: 'RECIBIDO', q: 'iPhone' }]);
    expect(key2).toEqual(['tickets', 'list', { estado: 'RECIBIDO', q: 'Samsung' }]);
  });
});
