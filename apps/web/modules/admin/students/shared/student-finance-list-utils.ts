export function formatFinancePercent(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return `${num}%`;
}

// A flat-amount discount's percent is only a snapshot of the balance at the
// time (and can round to 0), so it's labelled "Flat" instead.
export function formatDiscountPercent(
  mode: "percent" | "amount",
  percent: number | string,
): string {
  return mode === "amount" ? "Flat" : formatFinancePercent(percent);
}

export function formatFinanceDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
