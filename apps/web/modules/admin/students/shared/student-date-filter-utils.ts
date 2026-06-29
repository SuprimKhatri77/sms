import { BSToAD } from "bikram-sambat-js";

export const PARAM_FROM_BS = "from_bs";
export const PARAM_TO_BS = "to_bs";

export function bsToAd(bs: string): string {
  if (!bs) return "";
  return BSToAD(bs);
}

export function bsToAdSafe(bs: string): string {
  if (!bs) return "";
  try {
    return BSToAD(bs);
  } catch {
    return "";
  }
}

export type StudentFinanceUrlFilters = {
  page: number;
  fromBs: string;
  toBs: string;
  from: string;
  to: string;
  search: string;
};

export function parseStudentFinanceFilters(
  searchParams: URLSearchParams,
  options?: { includeSearch?: boolean },
): StudentFinanceUrlFilters {
  const fromBs = searchParams.get(PARAM_FROM_BS) ?? "";
  const toBs = searchParams.get(PARAM_TO_BS) ?? "";

  return {
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10)),
    fromBs,
    toBs,
    from: bsToAdSafe(fromBs),
    to: bsToAdSafe(toBs),
    search: options?.includeSearch
      ? (searchParams.get("search") ?? "")
      : "",
  };
}
