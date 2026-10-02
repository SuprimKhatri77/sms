"use client";

import type { ReactNode } from "react";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import {
  accountingTableClass,
  accountingTableScrollClass,
  accountingTableWrapClass,
  accountingTdClass,
  accountingThClass,
} from "@/modules/admin/accounting/shared/accounting-styles";
import type { TreeItem, TreeRow } from "./tree";

export type HierarchyColumn<T> = {
  header: string;
  render: (item: T) => ReactNode;
};

type HierarchyTableProps<T extends TreeItem> = {
  rows: TreeRow<T>[];
  collapsed: Set<string>;
  /** While searching every row is expanded, so the chevrons are inert. */
  searching: boolean;
  onToggle: (id: string) => void;
  /** Hide for hierarchies without codes (e.g. product categories). */
  showCode?: boolean;
  /** Extra columns rendered between Code and Description. */
  columns?: HierarchyColumn<T>[];
  canManage: boolean;
  /** Singular noun for aria labels, e.g. "sub-head". */
  childNoun: string;
  onAddChild: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
};

const INDENT_PX = 22;

const emptyCell = <span className="italic text-[rgba(47,78,64,0.35)]">—</span>;

export function HierarchyTable<T extends TreeItem>({
  rows,
  collapsed,
  searching,
  onToggle,
  showCode = true,
  columns = [],
  canManage,
  childNoun,
  onAddChild,
  onEdit,
  onDelete,
}: HierarchyTableProps<T>) {
  return (
    <div className={accountingTableWrapClass}>
      <div className={accountingTableScrollClass}>
        <table className={accountingTableClass}>
          <thead>
            <tr>
              <th className={accountingThClass}>Name</th>
              {showCode ? <th className={accountingThClass}>Code</th> : null}
              {columns.map((col) => (
                <th key={col.header} className={accountingThClass}>
                  {col.header}
                </th>
              ))}
              <th className={accountingThClass}>Description</th>
              {canManage ? (
                <th className={`${accountingThClass} text-right`}>Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, depth, hasChildren }) => {
              const expanded = searching || !collapsed.has(item.id);
              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[rgba(47,78,64,0.02)]"
                >
                  <td className={`${accountingTdClass} font-medium`}>
                    <div
                      className="flex min-w-0 items-center gap-1.5"
                      style={{ paddingLeft: depth * INDENT_PX }}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => onToggle(item.id)}
                          disabled={searching}
                          aria-expanded={expanded}
                          aria-label={`${expanded ? "Collapse" : "Expand"} ${item.name}`}
                          className="grid h-5 w-5 shrink-0 cursor-pointer place-items-center text-[rgba(47,78,64,0.55)] transition-colors hover:text-(--brand-green) disabled:cursor-default"
                        >
                          <ChevronRight
                            size={14}
                            strokeWidth={2}
                            className={cn(
                              "transition-transform duration-150",
                              expanded && "rotate-90",
                            )}
                          />
                        </button>
                      ) : (
                        <span className="h-5 w-5 shrink-0" aria-hidden />
                      )}
                      <span
                        className={cn(depth === 0 && "text-(--brand-green)")}
                      >
                        {item.name}
                      </span>
                    </div>
                  </td>
                  {showCode ? (
                    <td
                      className={`${accountingTdClass} text-[rgba(47,78,64,0.7)]`}
                    >
                      {item.code ?? emptyCell}
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.header} className={accountingTdClass}>
                      {col.render(item)}
                    </td>
                  ))}
                  <td
                    className={`${accountingTdClass} max-w-xs truncate text-[rgba(47,78,64,0.7)]`}
                    title={item.description ?? undefined}
                  >
                    {item.description ?? emptyCell}
                  </td>
                  {canManage ? (
                    <td className={`${accountingTdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAddChild(item)}
                          aria-label={`Add ${childNoun} under ${item.name}`}
                          title={`Add ${childNoun}`}
                          className={adminIconButtonClass}
                        >
                          <Plus size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className={adminIconButtonClass}
                        >
                          <Pencil size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          aria-label={`Delete ${item.name}`}
                          className={adminDangerIconButtonClass}
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
