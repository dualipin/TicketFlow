import { useState, useEffect } from 'react';

/**
 * Hook to debounce any value by a given delay in milliseconds.
 * Useful for text inputs driving network queries to avoid rapid-fire requests.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
