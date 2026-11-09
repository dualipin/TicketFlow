import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Field, FieldLabel } from '../ui/field.tsx';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert.tsx';
import { Checkbox } from '../ui/checkbox.tsx';
import { Spinner } from '../ui/spinner.tsx';
import {
  evaluarArqueo,
  formatCurrencyMxn,
} from './corte-caja-engine.ts';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from 'lucide-react';

interface ConfirmarCierreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notas: string) => void;
  isPending: boolean;
  corteId: number;
  montoEsperado: number;
  montoReal: number;
  desgloseTexto?: string;
  initialNotas?: string;
}

export const ConfirmarCierreModal: React.FC<ConfirmarCierreModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  corteId,
  montoEsperado,
  montoReal,
  desgloseTexto = '',
  initialNotas = '',
}) => {
  const [notas, setNotas] = useState(initialNotas);
  const [confirmacionCritica, setConfirmacionCritica] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotas(initialNotas);
      setConfirmacionCritica(false);
    }
  }, [isOpen, initialNotas]);

  const evalResult = evaluarArqueo({
    montoEsperado,
    montoReal,
    notas,
    confirmacionCriticaAceptada: confirmacionCritica,
  });

  const diferencia = evalResult.diferencia ?? 0;
  const isCuadrado = diferencia === 0;
  const isSobrante = diferencia > 0;

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalResult.puedeCerrar || isPending) return;

    let notasFinales = notas.trim();
    if (desgloseTexto) {
      notasFinales = notasFinales
        ? `${notasFinales} | [Desglose: ${desgloseTexto}]`
        : `[Desglose: ${desgloseTexto}]`;
    }

    onConfirm(notasFinales);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Confirmar Cierre de Turno #{corteId}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Verifica la conciliación de caja antes de sellar definitivamente este turno.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-4">
          {/* Tarjeta de Resumen Financiero con divisores hairline sub-píxel */}
          <div className="grid grid-cols-3 gap-px bg-border/60 rounded-xl border border-border/70 overflow-hidden">
            <div className="bg-card p-3 flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">
                Esperado en Caja
              </span>
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                {formatCurrencyMxn(montoEsperado)}
              </span>
            </div>

            <div className="bg-card p-3 flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">
                Físico Contado
              </span>
              <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                {formatCurrencyMxn(montoReal)}
              </span>
            </div>

            <div className="bg-card p-3 flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">
                Diferencia
              </span>
              <span
                className={`font-mono text-sm font-bold tabular-nums ${
                  isCuadrado
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isSobrante
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-destructive'
                }`}
              >
                {isSobrante ? `+${formatCurrencyMxn(diferencia)}` : formatCurrencyMxn(diferencia)}
              </span>
            </div>
          </div>

          {/* Estado de la Banda de Tolerancia */}
          {evalResult.banda === 'CUADRADO_O_TOLERANCIA' && (
            <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-xs font-semibold">
                {isCuadrado ? 'Cuadre Exacto de Gaveta' : 'Tolerancia Operativa Aceptable'}
              </AlertTitle>
              <AlertDescription className="text-xs opacity-90">
                {isCuadrado
                  ? 'El monto físico coincide al 100% con las ventas y cobros registrados.'
                  : `La diferencia de ${formatCurrencyMxn(diferencia)} está dentro del margen operativo de cambio (±$20 MXN).`}
              </AlertDescription>
            </Alert>
          )}

          {evalResult.banda === 'DESCUADRE_MODERADO' && (
            <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-xs font-semibold">
                Descuadre Moderado ({formatCurrencyMxn(diferencia)})
              </AlertTitle>
              <AlertDescription className="text-xs opacity-90">
                Para cerrar este turno es obligatorio documentar una justificación escrita (mínimo 10 caracteres) explicando el motivo de la discrepancia.
              </AlertDescription>
            </Alert>
          )}

          {evalResult.banda === 'DESCUADRE_CRITICO' && (
            <Alert variant="destructive">
              <ShieldAlert className="size-4" />
              <AlertTitle className="text-xs font-semibold">
                Alerta de Auditoría: Descuadre Crítico ({formatCurrencyMxn(diferencia)})
              </AlertTitle>
              <AlertDescription className="text-xs">
                Existe una discrepancia superior a $100 MXN. Se requiere justificación detallada y confirmación explícita de auditoría para sellar el turno.
              </AlertDescription>
            </Alert>
          )}

          {/* Campo de Notas y Justificación */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="notas-cierre-modal" className="text-xs font-semibold">
                {evalResult.requiereNotaJustificacion ? (
                  <span className="flex items-center gap-1 text-destructive">
                    Nota de Justificación Obligatoria *
                  </span>
                ) : (
                  'Observaciones o Notas de Cierre'
                )}
              </FieldLabel>
              {evalResult.requiereNotaJustificacion && (
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {notas.trim().length} / 10 caracteres
                </span>
              )}
            </div>
            <Textarea
              id="notas-cierre-modal"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder={
                evalResult.requiereNotaJustificacion
                  ? 'Describe con detalle el motivo del faltante o sobrante...'
                  : 'Opcional: notas sobre el cambio de turno o pendientes...'
              }
              rows={3}
              required={evalResult.requiereNotaJustificacion}
              className="resize-none text-xs"
            />
          </Field>

          {/* Checkbox de Confirmación Crítica (Banda 3) envuelto en Field */}
          {evalResult.requiereConfirmacionCritica && (
            <Field className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <Checkbox
                id="check-critica"
                checked={confirmacionCritica}
                onCheckedChange={(checked) => setConfirmacionCritica(Boolean(checked))}
                className="mt-0.5"
              />
              <FieldLabel
                htmlFor="check-critica"
                className="cursor-pointer text-xs font-medium leading-relaxed text-foreground select-none"
              >
                Confirmo que he recontado físicamente la gaveta y asumo la responsabilidad del registro de esta discrepancia para auditoría de administración.
              </FieldLabel>
            </Field>
          )}

          {evalResult.motivoBloqueo && (
            <p className="text-xs font-medium text-destructive">
              * {evalResult.motivoBloqueo}
            </p>
          )}

          <DialogFooter className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Recontar Gaveta
            </Button>
            <Button
              type="submit"
              variant={evalResult.banda === 'DESCUADRE_CRITICO' ? 'destructive' : 'default'}
              size="sm"
              disabled={!evalResult.puedeCerrar || isPending}
              className="gap-1.5"
            >
              {isPending && <Spinner className="size-3.5" data-icon="inline-start" />}
              <Lock data-icon="inline-start" />
              <span>Confirmar y Cerrar Caja</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
