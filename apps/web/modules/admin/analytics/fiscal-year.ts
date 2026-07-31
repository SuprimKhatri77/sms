import { ADToBS, BSToAD } from "bikram-sambat-js";

/** URL / select value for unscoped analytics (no from/to sent). */
export const FISCAL_YEAR_ALL = "all";

/** First FY we track — 082/083 starts Shrawan 1, 2082. */
export const MIN_FISCAL_YEAR_START_BS = 2082;

export const FY_QUERY_PARAM = "fy";

export type FiscalYearOption = {
  value: string;
  label: string;
};

/** `2082` → `"082/083"` */
export function formatFyLabel(startYearBs: number): string {
  const start = String(startYearBs).slice(-3);
  const end = String(startYearBs + 1).slice(-3);
  return `${start}/${end}`;
}

/** `"082/083"` → `2082`, or null if invalid */
export function parseFyLabel(label: string): number | null {
  const match = /^(\d{3})\/(\d{3})$/.exec(label);
  if (!match) return null;
  const startShort = Number(match[1]);
  const endShort = Number(match[2]);
  if (endShort !== startShort + 1) return null;
  return 2000 + startShort;
}

/** Nepal FY starts in Shrawan (BS month 4). */
export function getCurrentFiscalYearStartBs(now = new Date()): number {
  const bs = ADToBS(now);
  const year = Number(bs.slice(0, 4));
  const month = Number(bs.slice(5, 7));
  return month >= 4 ? year : year - 1;
}

export function listFiscalYearOptions(now = new Date()): FiscalYearOption[] {
  const currentStart = getCurrentFiscalYearStartBs(now);
  const options: FiscalYearOption[] = [
    { value: FISCAL_YEAR_ALL, label: "All time" },
  ];

  for (let year = MIN_FISCAL_YEAR_START_BS; year <= currentStart; year++) {
    const label = formatFyLabel(year);
    options.push({ value: label, label: `FY ${label}` });
  }

  return options;
}

/** BSToAD does not throw on out-of-range days — round-trip to detect real month length. */
function isValidBsDate(bs: string): boolean {
  try {
    return ADToBS(BSToAD(bs)) === bs;
  } catch {
    return false;
  }
}

function lastDayOfBsMonth(year: number, month: number): number {
  for (let day = 32; day >= 28; day--) {
    const bs = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (isValidBsDate(bs)) return day;
  }
  return 30;
}

export type AdDateRange = { from: string; to: string };

/**
 * Map FY label to inclusive AD dates (Shrawan 1 → Ashadh end).
 * Returns null for All time / invalid labels.
 */
export function fiscalYearToAdRange(label: string): AdDateRange | null {
  if (!label || label === FISCAL_YEAR_ALL) return null;

  const startYear = parseFyLabel(label);
  if (startYear == null) return null;

  const endYear = startYear + 1;
  const endDay = lastDayOfBsMonth(endYear, 3);
  const from = BSToAD(`${startYear}-04-01`);
  const to = BSToAD(
    `${endYear}-03-${String(endDay).padStart(2, "0")}`,
  );

  return { from, to };
}

export function normalizeFyParam(raw: string | null): string {
  if (!raw || raw === FISCAL_YEAR_ALL) return FISCAL_YEAR_ALL;
  if (parseFyLabel(raw) != null) return raw;
  return FISCAL_YEAR_ALL;
}
