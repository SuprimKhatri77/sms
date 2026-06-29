"use client";

import { useState } from "react";
import { ModalShell } from "./shared/ModalShell";
import { GraduationCap } from "lucide-react";
import { FormField } from "./shared/FormField";
import {
  APIError,
  StudentScholarshipInput,
  studentScholarshipMutationSchema,
} from "@repo/types";
import z from "zod";
import { mapFieldErrors } from "@/utils/api";
import { FieldError } from "@/components/ui/field";
import { inputCls } from "./shared/utils";
import { cn } from "@/lib/utils";

type ScholarshipFormData = {
  percent: string;
  note: string;
};

export function ScholarshipFormModal({
  initial,
  onSubmit,
  isPending,
  onCancel,
}: {
  initial?: StudentScholarshipInput;
  onSubmit: (data: StudentScholarshipInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ScholarshipFormData>({
    percent: initial?.percent.toString() ?? "",
    note: initial?.note ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ScholarshipFormData, string>>
  >({});

  const set =
    (k: keyof ScholarshipFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const isEdit = !!initial;

  const handleSubmit = async () => {
    const validate = studentScholarshipMutationSchema.safeParse({
      ...form,
      percent: Number(form.percent),
    });
    if (!validate.success) {
      const tree = z.treeifyError(validate.error).properties;
      setErrors({
        percent: tree?.percent?.errors[0],
        note: tree?.note?.errors[0],
      });
      return;
    }
    try {
      await onSubmit({ ...form, percent: Number(form.percent) });
    } catch (err) {
      const error = err as APIError;
      if (error.errors?.length) {
        setErrors(mapFieldErrors(error));
      }
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Scholarship" : "Award Scholarship"}
      icon={GraduationCap}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Save Changes" : "Award Scholarship"}
      submitting={isPending}
    >
      <FormField label="Percent" required hint="Must be between 0 and 100">
        <div className="relative">
          <input
            className={cn(inputCls, "pr-8", errors.percent && "border-[#9a3412]")}
            placeholder="e.g. 25"
            type="number"
            min={0.01}
            max={100}
            step="any"
            value={form.percent}
            onChange={set("percent")}
            autoFocus
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
          placeholder="Reason for awarding scholarship…"
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
