// Helpers for the self-referencing hierarchies (primary heads, account
// groups). The API returns flat lists linked by parentId; everything here
// works off that shape so both pages share one implementation.

export type TreeItem = {
  id: string;
  parentId: string | null;
  name: string;
  code: string | null;
  description: string | null;
};

export type TreeRow<T extends TreeItem> = {
  item: T;
  depth: number;
  hasChildren: boolean;
};

export const ROOT_OPTION_VALUE = "none";

export const PATH_SEPARATOR = " › ";

function groupByParent<T extends TreeItem>(items: T[]) {
  const ids = new Set(items.map((i) => i.id));
  const childrenOf = new Map<string | null, T[]>();
  for (const item of items) {
    // A parent missing from the list is treated as top level so the row
    // still shows up instead of silently disappearing.
    const key = item.parentId && ids.has(item.parentId) ? item.parentId : null;
    const siblings = childrenOf.get(key);
    if (siblings) siblings.push(item);
    else childrenOf.set(key, [item]);
  }
  return childrenOf;
}

/**
 * Depth-first rows in display order. Children of a collapsed row are skipped.
 * When `visible` is given (a search is active), only those rows are shown and
 * all of them are expanded so every match appears in context. Sibling order
 * follows the input order, which the API already sorts by name.
 */
export function flattenTree<T extends TreeItem>(
  items: T[],
  collapsed: Set<string>,
  visible?: Set<string>,
): TreeRow<T>[] {
  const childrenOf = groupByParent(items);
  const rows: TreeRow<T>[] = [];
  // Guards against a loop in the data; the backend prevents one, but a bad
  // row must never hang the page.
  const seen = new Set<string>();

  const walk = (parentId: string | null, depth: number) => {
    for (const item of childrenOf.get(parentId) ?? []) {
      if (seen.has(item.id)) continue;
      if (visible && !visible.has(item.id)) continue;
      seen.add(item.id);
      const children = childrenOf.get(item.id) ?? [];
      const hasChildren = visible
        ? children.some((c) => visible.has(c.id))
        : children.length > 0;
      rows.push({ item, depth, hasChildren });
      // While searching, every ancestor of a match is expanded.
      if (hasChildren && (visible || !collapsed.has(item.id))) {
        walk(item.id, depth + 1);
      }
    }
  };

  walk(null, 0);
  return rows;
}

/** IDs of every item that has at least one child. */
export function getParentIds<T extends TreeItem>(items: T[]): Set<string> {
  const ids = new Set(items.map((i) => i.id));
  return new Set(
    items
      .map((i) => i.parentId)
      .filter((p): p is string => p !== null && ids.has(p)),
  );
}

/**
 * Items matching the query (name, code or description) plus all of their
 * ancestors, so a match is always shown in context. Null when there is no
 * query, meaning "show everything".
 */
export function getSearchVisibleIds<T extends TreeItem>(
  items: T[],
  query: string,
): Set<string> | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const byId = new Map(items.map((i) => [i.id, i]));
  const visible = new Set<string>();
  for (const item of items) {
    const haystack = [item.name, item.code ?? "", item.description ?? ""]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) continue;

    let current: T | undefined = item;
    while (current && !visible.has(current.id)) {
      visible.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
  }
  return visible;
}

/** The item itself plus everything beneath it. */
export function getSubtreeIds<T extends TreeItem>(
  items: T[],
  rootId: string,
): Set<string> {
  const childrenOf = groupByParent(items);
  const result = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of childrenOf.get(id) ?? []) {
      if (result.has(child.id)) continue;
      result.add(child.id);
      stack.push(child.id);
    }
  }
  return result;
}

/** "Assets › Current Assets › Cash" style label for an item. */
export function getPathLabel<T extends TreeItem>(
  byId: Map<string, T>,
  id: string,
): string {
  const names: string[] = [];
  const seen = new Set<string>();
  let current = byId.get(id);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    names.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return names.join(PATH_SEPARATOR);
}

export type TreeOption = { value: string; label: string };

/**
 * Options for a parent / head picker, labelled with their full path and
 * filtered by the query. `exclude` drops ids that can't be chosen (an item
 * and its own descendants when re-parenting). `rootLabel` adds a leading
 * "no parent" option when the query is empty.
 */
export function buildTreeOptions<T extends TreeItem>(
  items: T[],
  query: string,
  { exclude, rootLabel }: { exclude?: Set<string>; rootLabel?: string } = {},
): TreeOption[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const q = query.trim().toLowerCase();
  const options = items
    .filter((i) => !exclude?.has(i.id))
    .map((i) => ({
      value: i.id,
      label: getPathLabel(byId, i.id),
      code: i.code ?? "",
    }))
    .filter(
      (o) =>
        !q ||
        o.label.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q),
    )
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(({ value, label }) => ({ value, label }));

  if (rootLabel && !q) {
    return [{ value: ROOT_OPTION_VALUE, label: rootLabel }, ...options];
  }
  return options;
}
