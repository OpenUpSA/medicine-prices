/**
 * Single Exit Price (SEP) dispensing-fee logic, ported verbatim from the
 * original Django models. The maximum dispensing fee is a regulated function
 * of the SEP, plus VAT.
 *
 * Source of truth: Medicines and Related Substances Act fee schedule.
 */
export const PRICE_PARAMETERS = {
  VAT: 1.15,
  // [threshold, percentage, flat_rate]
  prices: [
    [118.8, 0.46, 15.8],
    [315.53, 0.33, 30.24],
    [1104.4, 0.15, 86.11],
    [Infinity, 0.05, 198.36],
  ] as const,
};

/** Maximum dispensing fee (incl VAT) allowed on top of the SEP. */
export function dispensingFee(sep: number): number {
  if (sep == null || Number.isNaN(sep)) return sep;
  for (const [threshold, perc, flat] of PRICE_PARAMETERS.prices) {
    if (sep < threshold) {
      return (sep * perc + flat) * PRICE_PARAMETERS.VAT;
    }
  }
  return sep;
}

/** SEP + maximum dispensing fee. */
export function maxFee(sep: number): number {
  if (sep == null) return 0;
  return dispensingFee(sep) + sep;
}

/** Total quantity of units in the product (pack size × number of packs). */
export function quantity(packSize: number, numPacks: number): number {
  if (packSize == null) return 0;
  return packSize > 0 ? packSize * numPacks : numPacks;
}

/** Highest per-unit cost: max fee divided by total units. */
export function costPerUnit(
  sep: number,
  packSize: number,
  numPacks: number
): number {
  const qty = quantity(packSize, numPacks);
  if (qty === 0) return 0;
  return maxFee(sep) / qty;
}

/** Lowest per-unit cost: SEP (no fee) divided by total units. */
export function minCostPerUnit(
  sep: number,
  packSize: number,
  numPacks: number
): number {
  const qty = quantity(packSize, numPacks);
  if (qty === 0) return 0;
  return sep / qty;
}

/** Format a number as South African Rand, matching the original "R %.2f". */
export function asCurrency(x: number | null | undefined): string {
  const n = typeof x === "number" ? x : Number(x);
  if (x == null || Number.isNaN(n)) return "-";
  return `R ${n.toFixed(2)}`;
}

/** Render a strength/number as an int when whole, else a float, else "-". */
export function intOrFloat(x: unknown): number | string {
  const n = Number(x);
  if (x === "" || x == null || Number.isNaN(n)) return "-";
  return Number.isInteger(n) ? n : n;
}
