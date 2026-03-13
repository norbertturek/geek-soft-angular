/**
 * Format a signed number with optional decimal places (e.g. +1.50 or -0.00).
 */
export function formatSigned(value: number, maxDecimals = 2): string {
  const abs = Math.abs(value);
  if (abs < Number.EPSILON) {
    return '0.' + '0'.repeat(maxDecimals);
  }
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  });
  return value > 0 ? '+' + formatted : '-' + formatted;
}
