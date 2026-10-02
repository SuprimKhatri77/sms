"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import {
  AccountGroup,
  AccountGroupInput,
  accountGroupInputSchema,
  APIError,
  PrimaryHead,
} from "@repo/types";

import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { mapFieldErrors } from "@/utils/api";
import { cn } from "@/lib/utils";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
} from "../shared/accounting-styles";
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import {
  buildTreeOptions,
  getPathLabel,
  getSubtreeIds,
  ROOT_OPTION_VALUE,
} from "../shared/tree";

const ROOT_GROUP_LABEL = "None (top-level group)";
const NO_HEAD_LABEL = "No primary head";

// The parent remounts this dialog (via `key`) each time it opens, so the form
// and any server errors always start from the target's current values.
type AccountGroupFormDialogProps = {
  open: boolean;
  /** The group being edited; null when creating. */
  group: AccountGroup | null;
  /** Parent to preselect when creating (e.g. "Add sub-group"); "" for top level. */
  defaultParentId: string;
  groups: AccountGroup[];
  heads: PrimaryHead[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: AccountGroupInput) => Promise<void>;
};

function toFormValues(
  group: AccountGroup | null,
  defaultParentId: string,
): AccountGroupInput {
  return {
    name: group?.name ?? "",
    code: group?.code ?? "",
    description: group?.description ?? "",
    parentId: group ? (group.parentId ?? "") : defaultParentId,
    primaryHeadId: group?.primaryHeadId ?? "",
  };
}

const readOnlyClass =
  "flex items-center border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)] px-3 py-2 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.7)]";

export function AccountGroupFormDialog({
  open,
  group,
  defaultParentId,
  groups,
  heads,
  loading,
  onClose,
  onSubmit,
}: AccountGroupFormDialogProps) {
  const isEdit = group !== null;
  const [errors, setErrors] = useState<
    Partial<Record<keyof AccountGroupInput, string>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  // A server error belongs to the value that caused it; drop it as soon as
  // that field is edited so it doesn't linger next to a corrected value.
  const clearServerError = (key: keyof AccountGroupInput) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const initialValues = useMemo(
    () => toFormValues(group, defaultParentId),
    [group, defaultParentId],
  );

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: accountGroupInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
        onClose();
      } catch (err) {
        const data = (err as AxiosError<APIError>).response?.data;
        if (data?.errors?.length) {
          setErrors(mapFieldErrors(data));
        }
      }
    },
  });

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  const groupsById = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups],
  );
  const headsById = useMemo(
    () => new Map(heads.map((h) => [h.id, h])),
    [heads],
  );

  // A group can't move under itself or anything beneath it.
  const excluded = useMemo(
    () => (group ? getSubtreeIds(groups, group.id) : undefined),
    [groups, group],
  );

  const searchParents = useCallback(
    async (query: string) =>
      buildTreeOptions(groups, query, {
        exclude: excluded,
        rootLabel: ROOT_GROUP_LABEL,
      }),
    [groups, excluded],
  );

  const searchHeads = useCallback(
    async (query: string) =>
      buildTreeOptions(heads, query, { rootLabel: NO_HEAD_LABEL }),
    [heads],
  );

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      variant="modal"
      title={isEdit ? "Edit Account Group" : "Add Account Group"}
      description={
        isEdit
          ? "Rename, re-code or move this group."
          : "Create a group, or nest it under an existing one."
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>
          <form.Subscribe selector={(s) => s.values}>
            {(values) => {
              const unchanged =
                isEdit &&
                values.name.trim() === initialValues.name &&
                values.code.trim() === initialValues.code &&
                values.description.trim() === initialValues.description &&
                values.parentId === initialValues.parentId &&
                values.primaryHeadId === initialValues.primaryHeadId;
              return (
                <button
                  type="button"
                  onClick={() => form.handleSubmit()}
                  disabled={loading || unchanged || !values.name.trim()}
                  className={adminPrimaryButtonClass}
                >
                  {loading
                    ? isEdit
                      ? "Saving…"
                      : "Adding…"
                    : isEdit
                      ? "Save Changes"
                      : "Add Group"}
                </button>
              );
            }}
          </form.Subscribe>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <AccountingFormSection title="Group details">
          <form.Field
            name="parentId"
            listeners={{
              // Only root groups carry a head; a sub-group inherits its
              // root's, so drop any head picked before choosing a parent.
              onChange: ({ value }) => {
                if (value) form.setFieldValue("primaryHeadId", "");
              },
            }}
          >
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.parentId;
              return (
                <AccountingFormField
                  label="Parent group"
                  optional
                  error={mergedError}
                >
                  <SearchableSelect
                    value={field.state.value || ROOT_OPTION_VALUE}
                    onChange={(value) => {
                      field.handleChange(
                        value === ROOT_OPTION_VALUE ? "" : value,
                      );
                      clearServerError(field.name);
                    }}
                    onSearch={searchParents}
                    selectedLabel={
                      field.state.value
                        ? getPathLabel(groupsById, field.state.value)
                        : ROOT_GROUP_LABEL
                    }
                    placeholder="Search groups…"
                    disabled={loading}
                    debounceMs={0}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(s) => s.values.parentId}>
            {(parentId) => {
              if (parentId) {
                const parent = groupsById.get(parentId);
                const inheritedHeadId = parent?.effectivePrimaryHeadId;
                return (
                  <AccountingFormField label="Primary head">
                    <div className={readOnlyClass}>
                      {inheritedHeadId
                        ? `Inherited: ${getPathLabel(headsById, inheritedHeadId)}`
                        : "Inherited: none (the parent group has no primary head)"}
                    </div>
                  </AccountingFormField>
                );
              }
              return (
                <form.Field name="primaryHeadId">
                  {(field) => {
                    const mergedError =
                      field.state.meta.errors[0]?.message ??
                      errors.primaryHeadId;
                    return (
                      <AccountingFormField
                        label="Primary head"
                        optional
                        error={mergedError}
                      >
                        <SearchableSelect
                          value={field.state.value || ROOT_OPTION_VALUE}
                          onChange={(value) => {
                            field.handleChange(
                              value === ROOT_OPTION_VALUE ? "" : value,
                            );
                            clearServerError(field.name);
                          }}
                          onSearch={searchHeads}
                          selectedLabel={
                            field.state.value
                              ? getPathLabel(headsById, field.state.value)
                              : NO_HEAD_LABEL
                          }
                          placeholder="Search primary heads…"
                          disabled={loading}
                          debounceMs={0}
                        />
                      </AccountingFormField>
                    );
                  }}
                </form.Field>
              );
            }}
          </form.Subscribe>

          <form.Field name="name">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.name;
              return (
                <AccountingFormField
                  label="Name"
                  htmlFor="account-group-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="account-group-name"
                    ref={inputRef}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                    }}
                    placeholder="e.g. Office Expenses"
                    disabled={loading}
                    className={cn(
                      accountingFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="code">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.code;
              return (
                <AccountingFormField
                  label="Code"
                  htmlFor="account-group-code"
                  optional
                  error={mergedError}
                >
                  <input
                    id="account-group-code"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                    }}
                    placeholder="e.g. 5100"
                    disabled={loading}
                    className={cn(
                      accountingFieldInputClass,
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="description">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.description;
              return (
                <AccountingFormField
                  label="Description"
                  htmlFor="account-group-description"
                  optional
                  error={mergedError}
                >
                  <textarea
                    id="account-group-description"
                    rows={3}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    placeholder="What belongs in this group…"
                    disabled={loading}
                    className={cn(
                      accountingFieldInputClass,
                      "resize-none",
                      mergedError && "border-[#9a3412]",
                    )}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>
        </AccountingFormSection>
      </div>
    </AdminDrawer>
  );
}
