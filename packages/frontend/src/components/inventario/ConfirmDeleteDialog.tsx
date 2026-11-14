import React from 'react';
import { useDeleteProducto } from '../../queries/inventario/mutations.ts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductoWithDetails } from '../../api/types.ts';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ProductoWithDetails | null;
  onSuccess?: () => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  producto,
  onSuccess,
}) => {
  const deleteProducto = useDeleteProducto();

  if (!producto) return null;

  const handleDelete = async () => {
    try {
      const result = await deleteProducto.mutateAsync(producto.id);
      toast.success(result.mensaje);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el producto');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                ¿Eliminar {producto.esServicio ? 'servicio' : 'producto'}?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Confirmación de baja para "{producto.nombre}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2 text-xs text-muted-foreground">
          <p>
            Esta acción evaluará el historial contable de{' '}
            <strong className="text-foreground">{producto.nombre}</strong>:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 bg-muted/40 p-2.5 rounded-lg border border-border text-xs">
            <li>
              Si ya cuenta con ventas en el Punto de Venta, se{' '}
              <strong className="text-foreground">archivará</strong> de forma segura para
              mantener la integridad de los cortes de caja y auditoría.
            </li>
            <li>
              Si nunca ha sido vendido, se{' '}
              <strong className="text-destructive">eliminará de forma definitiva</strong> junto con
              sus variantes.
            </li>
          </ul>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteProducto.isPending}
            onClick={handleDelete}
            className="flex items-center gap-1.5"
          >
            {deleteProducto.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 data-icon="inline-start" />
                Confirmar baja
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
