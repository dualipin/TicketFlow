import { useEffect } from 'react';

export interface UsePosKeyboardShortcutsOptions {
  onFocusSearch: () => void;
  onOpenCustomerSearch: () => void;
  onHoldOrRestoreCart: () => void;
  onCheckout: () => void;
  onEscape?: () => void;
  canCheckout: boolean;
  isModalOpen?: boolean;
}

/**
 * Función pura que procesa eventos de teclado para la terminal POS.
 */
export function handlePosKeyboardEvent(
  e: { key: string; preventDefault?: () => void },
  options: UsePosKeyboardShortcutsOptions
): void {
  // Si hay un modal activo o diálogo abierto, no interceptar teclas de función globales
  if (options.isModalOpen) return;

  if (e.key === 'F2') {
    e.preventDefault?.();
    options.onFocusSearch();
  } else if (e.key === 'F4') {
    e.preventDefault?.();
    options.onOpenCustomerSearch();
  } else if (e.key === 'F8') {
    e.preventDefault?.();
    options.onHoldOrRestoreCart();
  } else if (e.key === 'F9') {
    e.preventDefault?.();
    if (options.canCheckout) {
      options.onCheckout();
    }
  } else if (e.key === 'Escape') {
    options.onEscape?.();
  }
}

export function usePosKeyboardShortcuts(options: UsePosKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handlePosKeyboardEvent(e, options);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    options.onFocusSearch,
    options.onOpenCustomerSearch,
    options.onHoldOrRestoreCart,
    options.onCheckout,
    options.onEscape,
    options.canCheckout,
    options.isModalOpen,
  ]);
}
