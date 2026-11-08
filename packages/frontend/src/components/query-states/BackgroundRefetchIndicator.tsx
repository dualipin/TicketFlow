import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import { cn } from '../../lib/utils.ts';

interface BackgroundRefetchIndicatorProps {
  isFetching: boolean;
  isPending?: boolean;
  label?: string;
  className?: string;
}

export const BackgroundRefetchIndicator: React.FC<BackgroundRefetchIndicatorProps> = ({
  isFetching,
  isPending = false,
  label = 'Sincronizando con el servidor...',
  className,
}) => {
  // Only show background indicator when data is ALREADY available in cache (not initial pending)
  if (!isFetching || isPending) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200',
        className
      )}
    >
      <ThinkingOrb state="connecting" size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};
