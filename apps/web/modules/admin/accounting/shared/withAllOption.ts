import type { SearchableSelectOption } from "../../inventory/shared/SearchableSelect";

// Prepends an "All …" option to a filter's search results (only for the
// unfiltered list), so filter dropdowns can be reset back to "all"
export function withAllOption(
  search: (q: string) => Promise<SearchableSelectOption[]>,
  allLabel: string,
) {
  return async (q: string): Promise<SearchableSelectOption[]> => {
    const results = await search(q);
    return q ? results : [{ value: "all", label: allLabel }, ...results];
  };
}
