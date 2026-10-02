"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form-nextjs";
import { AxiosError } from "axios";
import {
  APIError,
  PrimaryHead,
  PrimaryHeadInput,
  primaryHeadInputSchema,
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
} from "@/components/admin/hierarchy/tree";

const ROOT_LABEL = "None (top-level head)";

// The parent remounts this dialog (via `key`) each time it opens, so the form
// and any server errors always start from the target's current values.
type PrimaryHeadFormDialogProps = {
  open: boolean;
  /** The head being edited; null when creating. */
  head: PrimaryHead | null;
  /** Parent to preselect when creating (e.g. "Add sub-head"); "" for top level. */
  defaultParentId: string;
  heads: PrimaryHead[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: PrimaryHeadInput) => Promise<void>;
};

function toFormValues(
  head: PrimaryHead | null,
  defaultParentId: string,
): PrimaryHeadInput {
  return {
    name: head?.name ?? "",
    code: head?.code ?? "",
    description: head?.description ?? "",
    parentId: head ? (head.parentId ?? "") : defaultParentId,
  };
}

export function PrimaryHeadFormDialog({
  open,
  head,
  defaultParentId,
  heads,
  loading,
  onClose,
  onSubmit,
}: PrimaryHeadFormDialogProps) {
  const isEdit = head !== null;
  const [errors, setErrors] = useState<
    Partial<Record<keyof PrimaryHeadInput, string>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  // A server error belongs to the value that caused it; drop it as soon as
  // that field is edited so it doesn't linger next to a corrected value.
  const clearServerError = (key: keyof PrimaryHeadInput) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const initialValues = useMemo(
    () => toFormValues(head, defaultParentId),
    [head, defaultParentId],
  );

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: primaryHeadInputSchema,
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

  const byId = useMemo(() => new Map(heads.map((h) => [h.id, h])), [heads]);

  // A head can't move under itself or anything beneath it.
  const excluded = useMemo(
    () => (head ? getSubtreeIds(heads, head.id) : undefined),
    [heads, head],
  );

  const searchParents = useCallback(
    async (query: string) =>
      buildTreeOptions(heads, query, {
        exclude: excluded,
        rootLabel: ROOT_LABEL,
      }),
    [heads, excluded],
  );

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      variant="modal"
      title={isEdit ? "Edit Primary Head" : "Add Primary Head"}
      description={
        isEdit
          ? "Rename, re-code or move this head."
          : "Create a head, or nest it under an existing one."
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
                values.parentId === initialValues.parentId;
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
                      : "Add Head"}
                </button>
              );
            }}
          </form.Subscribe>
        </div>
      }
    >
      <div className="flex flex-col gap-8 px-8 py-10">
        <AccountingFormSection title="Head details">
          <form.Field name="parentId">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.parentId;
              return (
                <AccountingFormField
                  label="Parent head"
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
                        ? getPathLabel(byId, field.state.value)
                        : ROOT_LABEL
                    }
                    placeholder="Search heads…"
                    disabled={loading}
                    debounceMs={0}
                  />
                </AccountingFormField>
              );
            }}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const mergedError =
                field.state.meta.errors[0]?.message ?? errors.name;
              return (
                <AccountingFormField
                  label="Name"
                  htmlFor="primary-head-name"
                  required
                  error={mergedError}
                >
                  <input
                    id="primary-head-name"
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
                    placeholder="e.g. Current Assets"
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
                  htmlFor="primary-head-code"
                  optional
                  error={mergedError}
                >
                  <input
                    id="primary-head-code"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") form.handleSubmit();
                    }}
                    placeholder="e.g. 1100"
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
                  htmlFor="primary-head-description"
                  optional
                  error={mergedError}
                >
                  <textarea
                    id="primary-head-description"
                    rows={3}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      clearServerError(field.name);
                    }}
                    placeholder="What belongs under this head…"
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
