"use client";

import { useCallback, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { PrimaryHead, PrimaryHeadInput } from "@repo/types";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  useAdminClearFiltersShortcut,
  useAdminEscapeShortcut,
  useAdminFocusSearchShortcut,
  useAdminNewShortcut,
  useAdminRefreshShortcut,
} from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { useAuthStore } from "@/store/auth";
import { usePrimaryHeads } from "@/hooks/queries/admin/primary_heads/usePrimaryHeads";
import { useCreatePrimaryHead } from "@/hooks/mutations/admin/primary_heads/useCreatePrimaryHead";
import { useUpdatePrimaryHead } from "@/hooks/mutations/admin/primary_heads/useUpdatePrimaryHead";
import { useDeletePrimaryHead } from "@/hooks/mutations/admin/primary_heads/useDeletePrimaryHead";

import { accountingTableWrapClass } from "../shared/accounting-styles";
import { HierarchyTable } from "../shared/HierarchyTable";
import { HierarchyToolbar } from "../shared/HierarchyToolbar";
import { HierarchyError, HierarchySkeleton } from "../shared/HierarchyStates";
import { useHierarchyView } from "../shared/useHierarchyView";
import { EmptyState } from "../../inventory/shared/EmptyState";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";
import { PrimaryHeadFormDialog } from "./PrimaryHeadFormDialog";

const NO_HEADS: PrimaryHead[] = [];

type FormTarget = { head: PrimaryHead | null; parentId: string };

export function PrimaryHeadsClient() {
  const canManage = useAuthStore((s) => s.user?.role === "superadmin");

  // The target is kept after closing so the dialog doesn't flip from
  // "Edit" to "Add" while its close animation plays.
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<FormTarget>({
    head: null,
    parentId: "",
  });
  const [deleteHead, setDeleteHead] = useState<PrimaryHead | null>(null);
  const [formKey, setFormKey] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isPending, isError, error, refetch } = usePrimaryHeads();
  const heads = data ?? NO_HEADS;
  const view = useHierarchyView(heads);
  const { setSearch } = view;

  const createHead = useCreatePrimaryHead();
  const updateHead = useUpdatePrimaryHead();
  const removeHead = useDeletePrimaryHead();

  const openForm = useCallback((target: FormTarget) => {
    setFormTarget(target);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const toggleCreate = useCallback(() => {
    if (!canManage) return;
    if (formOpen) setFormOpen(false);
    else openForm({ head: null, parentId: "" });
  }, [canManage, formOpen, openForm]);

  useAdminNewShortcut(toggleCreate);
  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));
  useAdminFocusSearchShortcut(
    useCallback(() => searchRef.current?.focus(), []),
  );
  useAdminClearFiltersShortcut(useCallback(() => setSearch(""), [setSearch]));
  useAdminEscapeShortcut(
    useCallback(() => {
      if (formOpen) setFormOpen(false);
      else if (deleteHead) setDeleteHead(null);
    }, [formOpen, deleteHead]),
  );

  const handleSubmit = async (input: PrimaryHeadInput) => {
    if (formTarget.head) {
      await updateHead.mutateAsync({ headID: formTarget.head.id, data: input });
    } else {
      await createHead.mutateAsync(input);
    }
    // Make sure the head just added or moved is visible under its parent.
    if (input.parentId) view.expand(input.parentId);
  };

  return (
    <AdminPageLayout
      title="Primary Heads"
      description="The top level of the chart of accounts. Heads can be nested to any depth."
      maxWidth="wide"
      action={
        canManage ? (
          <button
            type="button"
            onClick={() => openForm({ head: null, parentId: "" })}
            className={adminPrimaryButtonClass}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Head
          </button>
        ) : null
      }
    >
      <HierarchyToolbar
        id="primary-head-search"
        search={view.search}
        onSearchChange={view.setSearch}
        searchRef={searchRef}
        placeholder="Search primary heads…"
        onExpandAll={view.expandAll}
        onCollapseAll={view.collapseAll}
      />

      <div className="min-h-80">
        {isPending ? (
          <HierarchySkeleton />
        ) : isError ? (
          <div className={accountingTableWrapClass}>
            <HierarchyError
              title="Failed to load primary heads"
              message={error?.response?.data.message ?? "Something went wrong"}
              onRetry={refetch}
            />
          </div>
        ) : heads.length === 0 ? (
          <div className={accountingTableWrapClass}>
            <EmptyState
              message={
                canManage
                  ? "No primary heads yet. Add the first one to start building the chart of accounts."
                  : "No primary heads yet. A superadmin can add them."
              }
            />
          </div>
        ) : view.rows.length === 0 ? (
          <div className={accountingTableWrapClass}>
            <EmptyState message={`No heads match “${view.search.trim()}”.`} />
          </div>
        ) : (
          <HierarchyTable
            rows={view.rows}
            collapsed={view.collapsed}
            searching={view.searching}
            onToggle={view.toggle}
            canManage={canManage}
            childNoun="sub-head"
            onAddChild={(head) => openForm({ head: null, parentId: head.id })}
            onEdit={(head) => openForm({ head, parentId: "" })}
            onDelete={setDeleteHead}
          />
        )}
      </div>

      {canManage ? (
        <>
          <PrimaryHeadFormDialog
            key={formKey}
            open={formOpen}
            head={formTarget.head}
            defaultParentId={formTarget.parentId}
            heads={heads}
            loading={createHead.isPending || updateHead.isPending}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />
          <ConfirmDialog
            open={!!deleteHead}
            itemName={deleteHead?.name ?? "head"}
            isLoading={removeHead.isPending}
            onCancel={() => setDeleteHead(null)}
            onConfirm={async () => {
              if (!deleteHead) return;
              try {
                await removeHead.mutateAsync(deleteHead.id);
              } catch {
                // The mutation already toasts why (e.g. it still has
                // sub-heads); retrying won't help, so just close.
              }
              setDeleteHead(null);
            }}
          />
        </>
      ) : null}
    </AdminPageLayout>
  );
}
