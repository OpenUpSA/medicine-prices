/**
 * Single Exit Price (SEP) dispensing-fee logic, ported verbatim from the
 * original Django models. The maximum dispensing fee is a regulated function
 * of the SEP, plus VAT.
 *
 * Source of truth: Medicines and Related Substances Act fee schedule.
 */
export const DISPENSING_FEE_UPDATED = "27 August 2026";

export const PRICE_PARAMETERS = {
  VAT: 1.15,
  // [max_sep_for_band (inclusive), percentage, flat_rate]
  prices: [
    [159.01, 0.46, 23.13],
    [423.55, 0.33, 42.91],
    [1530.72, 0.15, 122.59],
    [Infinity, 0.05, 270.54],
  ] as const,
};

/** Maximum dispensing fee (incl VAT) allowed on top of the SEP. */
export function dispensingFee(sep: number): number {
  if (sep == null || Number.isNaN(sep)) return sep;
  for (const [maxSep, perc, flat] of PRICE_PARAMETERS.prices) {
    if (sep <= maxSep) {
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
