"use client";

import { useState } from "react";
import { ModalShell } from "./shared/ModalShell";
import { PercentIcon } from "lucide-react";
import { FormField } from "./shared/FormField";
import {
  APIError,
  StudentDiscountMutationInput,
  studentDiscountMutationSchema,
} from "@repo/types";
import z from "zod";
import { FieldError } from "@/components/ui/field";
import { mapFieldErrors } from "@/utils/api";
import { inputCls } from "./shared/utils";
import { cn } from "@/lib/utils";

type StudentDiscountFormInput = {
  type: string;
  percent: string;
  note: string;
};

export function DiscountFormModal({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: StudentDiscountMutationInput;
  onSubmit: (data: StudentDiscountMutationInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<StudentDiscountFormInput>({
    type: initial?.type ?? "",
    percent: initial?.percent.toString() ?? "",
    note: initial?.note ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentDiscountMutationInput, string>>
  >({});

  const set =
    (k: keyof StudentDiscountMutationInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({
        ...prev,
        [k]: e.target.value,
      }));

  const isEdit = !!initial;

  const handleSubmit = async () => {
    const validate = studentDiscountMutationSchema.safeParse(form);
    if (!validate.success) {
      const tree = z.treeifyError(validate.error).properties;
      setErrors({
        type: tree?.type?.errors[0],
        percent: tree?.percent?.errors[0],
        note: tree?.note?.errors[0],
      });
      return;
    }
    try {
      await onSubmit({ ...form, percent: Number(form.percent) });
    } catch (err) {
      const error = err as APIError;
      if (error?.errors?.length) {
        setErrors(mapFieldErrors(error));
      }
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Discount" : "Add Discount"}
      icon={PercentIcon}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Save Changes" : "Add Discount"}
      submitting={isPending}
    >
      <FormField label="Discount Type" required>
        <input
          className={cn(inputCls, errors.type && "border-[#9a3412]")}
          placeholder="e.g. Sibling, Early Bird, Referral"
          maxLength={50}
          value={form.type}
          onChange={set("type")}
          autoFocus
        />
        {errors.type ? <FieldError>{errors.type}</FieldError> : null}
      </FormField>

      <FormField label="Percent" required hint="Must be greater than 0">
        <div className="relative">
          <input
            className={cn(inputCls, "pr-8", errors.percent && "border-[#9a3412]")}
            placeholder="e.g. 10"
            type="number"
            min={0.01}
            step="any"
            value={form.percent}
            onChange={set("percent")}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-[rgba(47,78,64,0.4)]">
            %
          </span>
        </div>
        {errors.percent ? <FieldError>{errors.percent}</FieldError> : null}
      </FormField>

      <FormField label="Note" hint="Optional — max 100 characters">
        <textarea
          className={cn(inputCls, "resize-none", errors.note && "border-[#9a3412]")}
          placeholder="Any additional context…"
          maxLength={100}
          rows={2}
          value={form.note}
          onChange={set("note")}
        />
        {errors.note ? <FieldError>{errors.note}</FieldError> : null}
      </FormField>
    </ModalShell>
  );
}
