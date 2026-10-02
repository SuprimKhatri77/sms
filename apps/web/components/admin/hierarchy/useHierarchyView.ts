"use client";

import { useCallback, useMemo, useState } from "react";
import {
  flattenTree,
  getParentIds,
  getSearchVisibleIds,
  type TreeItem,
} from "./tree";

/**
 * Search + expand/collapse state for a hierarchy page. Rows start expanded;
 * `collapsed` only records what the user has folded, so newly added items
 * appear without any extra bookkeeping.
 */
export function useHierarchyView<T extends TreeItem>(items: T[]) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const visible = useMemo(
    () => getSearchVisibleIds(items, search),
    [items, search],
  );

  const rows = useMemo(
    () => flattenTree(items, collapsed, visible ?? undefined),
    [items, collapsed, visible],
  );

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsed(new Set()), []);
  const collapseAll = useCallback(
    () => setCollapsed(getParentIds(items)),
    [items],
  );

  /** Make sure a row's children are showing, e.g. after adding one. */
  const expand = useCallback((id: string) => {
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return {
    search,
    setSearch,
    searching: visible !== null,
    collapsed,
    rows,
    toggle,
    expand,
    expandAll,
    collapseAll,
  };
}
