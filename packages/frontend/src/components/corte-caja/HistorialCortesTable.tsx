import React, { memo } from 'react';
import type { CorteCaja } from '../../api/types.ts';
import { Card } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Spinner } from '../ui/spinner.tsx';
import { formatCurrencyMxn, formatFechaCorte } from './corte-caja-engine.ts';
import { Receipt, Clock, FileText } from 'lucide-react';

interface HistorialCortesTableProps {
  cortes: CorteCaja[] | undefined;
  isLoading: boolean;
  onSelectCorteZ: (corte: CorteCaja) => void;
}

export const HistorialCortesTable: React.FC<HistorialCortesTableProps> = memo(
  ({ cortes, isLoading, onSelectCorteZ }) => {
    return (
      <Card className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-xs"
            aria-label="Historial de turnos de caja"
          >
            <caption className="sr-only">
              Registro histórico de turnos y arqueos de caja
            </caption>
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  Turno
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Operador & Notas
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Apertura
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Cierre
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Fondo Inicial
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Calculado
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Real Contado
                </th>
                <th scope="col" className="px-4 py-2.5 text-center">
                  Diferencia
                </th>
                <th scope="col" className="px-4 py-2.5 text-center">
                  Comprobante
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <Spinner className="size-5 text-primary mx-auto" />
                  </td>
                </tr>
              ) : !cortes || cortes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground font-sans">
                    No hay registros de cortes de caja en el historial.
                  </td>
                </tr>
              ) : (
                cortes.map((c) => {
                  const diff = c.diferencia ?? 0;
                  const isOpen = c.estado === 'ABIERTO';

                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-bold text-foreground">
                        #{c.id}
                      </td>
                      <td className="px-4 py-3 font-sans font-medium text-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span>{c.usuario?.nombre || `Usuario #${c.usuarioId}`}</span>
                          {c.notas && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal line-clamp-1">
                              <FileText className="size-3 shrink-0" />
                              {c.notas}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatFechaCorte(c.fechaApertura)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {isOpen ? (
                          <Badge
                            variant="outline"
                            className="h-5 border-border/80 bg-muted/40 px-1.5 text-xs font-medium text-foreground/80"
                          >
                            <Clock className="size-3 mr-1 text-muted-foreground" />
                            En Curso
                          </Badge>
                        ) : (
                          formatFechaCorte(c.fechaCierre)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-normal text-muted-foreground tabular-nums">
                        {formatCurrencyMxn(c.montoInicial)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground/90 tabular-nums">
                        {formatCurrencyMxn(c.montoCalculado)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums">
                        {c.montoReal !== null ? formatCurrencyMxn(c.montoReal) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isOpen ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : diff === 0 ? (
                          <span className="text-xs font-sans text-muted-foreground/80">
                            Cuadrado
                          </span>
                        ) : diff > 0 ? (
                          <Badge
                            variant="outline"
                            className="h-5 border-sky-500/30 bg-sky-500/5 px-1.5 text-xs font-mono font-medium text-sky-700 dark:text-sky-300"
                          >
                            +{formatCurrencyMxn(diff)}
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-xs font-mono font-medium"
                          >
                            {formatCurrencyMxn(diff)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectCorteZ(c)}
                          className="text-xs font-sans text-muted-foreground hover:text-primary"
                          title="Ver o imprimir comprobante Corte Z"
                        >
                          <Receipt data-icon="inline-start" />
                          <span>Corte Z</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }
);
