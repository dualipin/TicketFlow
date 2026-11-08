export { cn } from "cn";

/**
 * Formats numeric amounts to localized Mexican Pesos currency ($1,250.00).
 * Hardened against NaN, undefined or non-finite inputs.
 */
export function formatCurrency(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

