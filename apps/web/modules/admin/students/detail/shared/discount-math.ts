/**
 * Live-preview math for the discount percent/amount toggle. Display-only —
 * the backend recomputes authoritatively from integer paisa math, so this
 * just needs to round the same way (nearest, not truncated) to stay in sync.
 */

export function percentToRupeeAmount(baseRupees: number, percent: number): number {
  if (!Number.isFinite(percent) || percent <= 0) return 0;
  return Math.round(baseRupees * percent) / 100;
}

export function amountToPercent(baseRupees: number, amountRupees: number): number {
  if (baseRupees <= 0 || !Number.isFinite(amountRupees) || amountRupees <= 0) return 0;
  return Math.round((amountRupees / baseRupees) * 10000) / 100;
}
