import React from 'react';
import NumberFlow from '@number-flow/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet.tsx';
import { Button } from '../ui/button.tsx';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface PosMobileCartSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalCart: number;
  totalItemsCount: number;
  children: React.ReactNode;
}

export const PosMobileCartSheet: React.FC<PosMobileCartSheetProps> = ({
  isOpen,
  onOpenChange,
  totalCart,
  totalItemsCount,
  children,
}) => {
  return (
    <>
      {/* Barra Inferior Fija para Móviles y Tabletas (<1024px) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border p-3.5 lg:hidden flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingCart className="size-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {totalItemsCount}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total en Carrito</span>
            <span className="text-base font-bold text-foreground">
              <NumberFlow value={totalCart} format={{ style: 'currency', currency: 'USD' }} />
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onOpenChange(true)}
          className="h-10 px-4 text-xs font-bold gap-2 rounded-full"
          aria-label={`Ver carrito y cobrar total de ${totalCart} pesos`}
        >
          <span>{totalItemsCount > 0 ? 'Ver Carrito / Cobrar' : 'Ver Carrito'}</span>
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>

      {/* Drawer / Sheet Deslizable para Cobro Móvil */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] max-h-[90vh] p-0 flex flex-col rounded-t-2xl">
          <SheetHeader className="p-4 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                Carrito y Cobro
              </SheetTitle>
              <div className="text-sm font-semibold text-primary">
                <NumberFlow value={totalCart} format={{ style: 'currency', currency: 'USD' }} />
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
