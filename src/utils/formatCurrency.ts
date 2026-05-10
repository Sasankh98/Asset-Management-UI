/**
 * Format a monetary value in Indian number system with ₹ prefix.
 *
 * Rules:
 *  ≥ 1 Cr  →  ₹X.XX Cr
 *  ≥ 1 L   →  ₹X.XX L
 *  else    →  ₹X,XX,XXX.XX   (Indian comma grouping, always 2 dp)
 *
 * Handles null / undefined / NaN gracefully.
 */
export function fmtInr(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return "—";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  return `${sign}₹${abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Inline Indian comma formatting for raw numbers (no ₹ prefix).
 * Always shows exactly 2 decimal places.
 */
export function inrNum(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return "—";
  return val.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
