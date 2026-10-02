"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { AccountGroup, AccountGroupInput, PrimaryHead } from "@repo/types";

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
import { useAccountGroups } from "@/hooks/queries/admin/account_groups/useAccountGroups";
import { usePrimaryHeads } from "@/hooks/queries/admin/primary_heads/usePrimaryHeads";
import { useCreateAccountGroup } from "@/hooks/mutations/admin/account_groups/useCreateAccountGroup";
import { useUpdateAccountGroup } from "@/hooks/mutations/admin/account_groups/useUpdateAccountGroup";
import { useDeleteAccountGroup } from "@/hooks/mutations/admin/account_groups/useDeleteAccountGroup";

import { accountingTableWrapClass } from "../shared/accounting-styles";
import { HierarchyTable, type HierarchyColumn } from "../shared/HierarchyTable";
import { HierarchyToolbar } from "../shared/HierarchyToolbar";
import { HierarchyError, HierarchySkeleton } from "../shared/HierarchyStates";
import { useHierarchyView } from "../shared/useHierarchyView";
import { getPathLabel } from "../shared/tree";
import { EmptyState } from "../../inventory/shared/EmptyState";
import { ConfirmDialog } from "../../inventory/shared/ConfirmDialog";
import { AccountGroupFormDialog } from "./AccountGroupFormDialog";

const NO_GROUPS: AccountGroup[] = [];
const NO_HEADS: PrimaryHead[] = [];

type FormTarget = { group: AccountGroup | null; parentId: string };

export function AccountGroupsClient() {
  const canManage = useAuthStore((s) => s.user?.role === "superadmin");

  // The target is kept after closing so the dialog doesn't flip from
  // "Edit" to "Add" while its close animation plays.
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<FormTarget>({
    group: null,
    parentId: "",
  });
  const [deleteGroup, setDeleteGroup] = useState<AccountGroup | null>(null);
  const [formKey, setFormKey] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isPending, isError, error, refetch } = useAccountGroups();
  const groups = data ?? NO_GROUPS;
  const view = useHierarchyView(groups);
  const { setSearch } = view;

  // Only needed for the head picker and full head paths; the table falls
  // back to the head name the groups endpoint already returns.
  const { data: headsData } = usePrimaryHeads();
  const heads = headsData ?? NO_HEADS;
  const headsById = useMemo(
    () => new Map(heads.map((h) => [h.id, h])),
    [heads],
  );

  const createGroup = useCreateAccountGroup();
  const updateGroup = useUpdateAccountGroup();
  const removeGroup = useDeleteAccountGroup();

  const openForm = useCallback((target: FormTarget) => {
    setFormTarget(target);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }, []);

  const toggleCreate = useCallback(() => {
    if (!canManage) return;
    if (formOpen) setFormOpen(false);
    else openForm({ group: null, parentId: "" });
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
      else if (deleteGroup) setDeleteGroup(null);
    }, [formOpen, deleteGroup]),
  );

  const columns = useMemo<HierarchyColumn<AccountGroup>[]>(
    () => [
      {
        header: "Primary Head",
        render: (group) => {
          if (!group.effectivePrimaryHeadId) {
            return <span className="italic text-[rgba(47,78,64,0.35)]">—</span>;
          }
          const label = headsById.has(group.effectivePrimaryHeadId)
            ? getPathLabel(headsById, group.effectivePrimaryHeadId)
            : group.effectivePrimaryHeadName;
          return (
            <span className="inline-flex items-center gap-2">
              <span>{label}</span>
              {group.parentId ? (
                <span className="font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.45)]">
                  inherited
                </span>
              ) : null}
            </span>
          );
        },
      },
    ],
    [headsById],
  );

  const handleSubmit = async (input: AccountGroupInput) => {
    if (formTarget.group) {
      await updateGroup.mutateAsync({
        groupID: formTarget.group.id,
        data: input,
      });
    } else {
      await createGroup.mutateAsync(input);
    }
    // Make sure the group just added or moved is visible under its parent.
    if (input.parentId) view.expand(input.parentId);
  };

  return (
    <AdminPageLayout
      title="Account Groups"
      description="Group ledger accounts. Top-level groups can belong to a primary head; sub-groups inherit it."
      maxWidth="wide"
      action={
        canManage ? (
          <button
            type="button"
            onClick={() => openForm({ group: null, parentId: "" })}
            className={adminPrimaryButtonClass}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Group
          </button>
        ) : null
      }
    >
      <HierarchyToolbar
        id="account-group-search"
        search={view.search}
        onSearchChange={view.setSearch}
        searchRef={searchRef}
        placeholder="Search account groups…"
        onExpandAll={view.expandAll}
        onCollapseAll={view.collapseAll}
      />

      <div className="min-h-80">
        {isPending ? (
          <HierarchySkeleton />
        ) : isError ? (
          <div className={accountingTableWrapClass}>
            <HierarchyError
              title="Failed to load account groups"
              message={error?.response?.data.message ?? "Something went wrong"}
              onRetry={refetch}
            />
          </div>
        ) : groups.length === 0 ? (
          <div className={accountingTableWrapClass}>
            <EmptyState
              message={
                canManage
                  ? "No account groups yet. Add the first one to start organising ledgers."
                  : "No account groups yet. A superadmin can add them."
              }
            />
          </div>
        ) : view.rows.length === 0 ? (
          <div className={accountingTableWrapClass}>
            <EmptyState message={`No groups match “${view.search.trim()}”.`} />
          </div>
        ) : (
          <HierarchyTable
            rows={view.rows}
            collapsed={view.collapsed}
            searching={view.searching}
            onToggle={view.toggle}
            columns={columns}
            canManage={canManage}
            childNoun="sub-group"
            onAddChild={(group) =>
              openForm({ group: null, parentId: group.id })
            }
            onEdit={(group) => openForm({ group, parentId: "" })}
            onDelete={setDeleteGroup}
          />
        )}
      </div>

      {canManage ? (
        <>
          <AccountGroupFormDialog
            key={formKey}
            open={formOpen}
            group={formTarget.group}
            defaultParentId={formTarget.parentId}
            groups={groups}
            heads={heads}
            loading={createGroup.isPending || updateGroup.isPending}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />
          <ConfirmDialog
            open={!!deleteGroup}
            itemName={deleteGroup?.name ?? "group"}
            isLoading={removeGroup.isPending}
            onCancel={() => setDeleteGroup(null)}
            onConfirm={async () => {
              if (!deleteGroup) return;
              try {
                await removeGroup.mutateAsync(deleteGroup.id);
              } catch {
                // The mutation already toasts why (e.g. it still has
                // sub-groups); retrying won't help, so just close.
              }
              setDeleteGroup(null);
            }}
          />
        </>
      ) : null}
    </AdminPageLayout>
  );
}
