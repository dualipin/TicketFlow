export class ApiClientError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// Global debug flag for testing error recovery and optimistic rollbacks in UI
let simulateNetworkError = false;
let simulatedLatencyMs = 0;

export const networkSimulation = {
  getSimulateError: () => simulateNetworkError,
  setSimulateError: (value: boolean) => {
    simulateNetworkError = value;
  },
  getSimulatedLatency: () => simulatedLatencyMs,
  setSimulatedLatency: (ms: number) => {
    simulatedLatencyMs = ms;
  },
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { signal, headers, ...restOptions } = options;

  if (simulatedLatencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, simulatedLatencyMs));
  }

  if (simulateNetworkError) {
    throw new ApiClientError(
      'Simulación activa: Error de conexión con el servidor (503 Service Unavailable)',
      503,
      'Service Unavailable',
      { simulated: true }
    );
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (restOptions.body && typeof restOptions.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    signal,
  });

  if (!response.ok) {
    let errorData: unknown;
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData === 'object' && 'error' in errorData) {
        errorMessage = String((errorData as { error: unknown }).error);
      }
    } catch {
      // response wasn't JSON
    }

    throw new ApiClientError(errorMessage, response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
