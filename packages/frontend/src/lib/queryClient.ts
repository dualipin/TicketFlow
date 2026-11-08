import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from '../api/client.ts';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds fresh data
      gcTime: 1000 * 60 * 5, // 5 minutes garbage collection time
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Do not retry 4xx client errors (400, 404, etc.)
        if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
