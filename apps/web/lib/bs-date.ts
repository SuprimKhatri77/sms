import {
  bsToAd,
  formatBsDate,
  parseBsDate,
  todayBs,
  type BSDate,
} from "bikram-sambat-ts";

// String-based BS/AD helpers on top of bikram-sambat-ts, which shares go-bs's
// calendar data, so the BS/AD pairs we send always match what the backend
// validates. Every date crosses the API as "YYYY-MM-DD".

function formatAd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "2083-07-14" → "2026-10-31". Throws on a malformed or non-existent BS date. */
export function bsToAdString(bs: string): string {
  // bsToAd returns local midnight, so read it back with local getters.
  return formatAd(bsToAd(parseBsDate(bs)));
}

/** Like bsToAdString, but "" for an empty or invalid BS date (e.g. from a URL). */
export function bsToAdStringSafe(bs: string): string {
  if (!bs) return "";
  try {
    return bsToAdString(bs);
  } catch {
    return "";
  }
}

/** Parses a "YYYY-MM-DD" BS string, or returns undefined if it isn't a real BS date. */
export function parseBsDateSafe(bs: string): BSDate | undefined {
  if (!bs) return undefined;
  try {
    return parseBsDate(bs);
  } catch {
    return undefined;
  }
}

/** Today in Nepal (UTC+05:45), as both BS and AD strings. */
export function todayBsAd(): { bs: string; ad: string } {
  const bs = todayBs();
  return { bs: formatBsDate(bs), ad: formatAd(bsToAd(bs)) };
}
