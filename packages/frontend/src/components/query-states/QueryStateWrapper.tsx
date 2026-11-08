import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { QueryLoadingState } from './QueryLoadingState.tsx';
import { QueryErrorState } from './QueryErrorState.tsx';
import { QueryEmptyState } from './QueryEmptyState.tsx';
import { BackgroundRefetchIndicator } from './BackgroundRefetchIndicator.tsx';
import { StaleDataIndicator } from './StaleDataIndicator.tsx';

interface QueryStateWrapperProps<T> {
  query: UseQueryResult<T, unknown>;
  children: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  loadingMessage?: string;
  loadingCount?: number;
  showStaleIndicator?: boolean;
  showBackgroundIndicator?: boolean;
  queryKeySummary?: string;
}

export function QueryStateWrapper<T>({
  query,
  children,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onResetFilters,
  loadingMessage,
  loadingCount = 3,
  showStaleIndicator = false,
  showBackgroundIndicator = true,
  queryKeySummary,
}: QueryStateWrapperProps<T>) {
  const {
    isPending,
    isError,
    error,
    data,
    refetch,
    isFetching,
    isStale,
    dataUpdatedAt,
  } = query;

  // 1. Initial Loading State (Cache empty, fetching)
  if (isPending) {
    return <QueryLoadingState count={loadingCount} message={loadingMessage} />;
  }

  // 2. Error State
  if (isError) {
    return <QueryErrorState error={error} onRetry={() => refetch()} />;
  }

  // 3. Empty State (Query succeeded, but result is empty)
  const isDataEmpty = isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0;

  if (isDataEmpty) {
    return (
      <div className="space-y-3">
        {showBackgroundIndicator && (
          <div className="flex justify-end">
            <BackgroundRefetchIndicator isFetching={isFetching} isPending={isPending} />
          </div>
        )}
        <QueryEmptyState
          title={emptyTitle}
          description={emptyDescription}
          onResetFilters={onResetFilters}
        />
      </div>
    );
  }

  // 4 & 5. Success State with optional Background-Refetch and Stale indicators
  return (
    <div className="space-y-3">
      {(showBackgroundIndicator || showStaleIndicator) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {showStaleIndicator && (
            <div className="flex-1">
              <StaleDataIndicator
                isStale={isStale}
                dataUpdatedAt={dataUpdatedAt}
                isFetching={isFetching}
                onRefetch={() => refetch()}
                queryKeySummary={queryKeySummary}
              />
            </div>
          )}
          {showBackgroundIndicator && (
            <div className="self-end sm:self-center">
              <BackgroundRefetchIndicator isFetching={isFetching} isPending={isPending} />
            </div>
          )}
        </div>
      )}

      {children(data)}
    </div>
  );
}
