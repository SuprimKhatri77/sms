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
import { percentToRupeeAmount, amountToPercent } from "./shared/discount-math";
import { formatNpr } from "../shared/student-utils";

type DiscountMode = "percent" | "amount";

type StudentDiscountFormInput = {
  type: string;
  mode: DiscountMode;
  percent: string;
  amount: string;
  note: string;
};

type DiscountFormInitial = {
  type: string;
  percent: number;
  note: string;
};

type DiscountFormErrors = {
  type?: string;
  percent?: string;
  amount?: string;
  note?: string;
};

export function DiscountFormModal({
  initial,
  balanceDue,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: DiscountFormInitial;
  balanceDue: number;
  onSubmit: (data: StudentDiscountMutationInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<StudentDiscountFormInput>({
    type: initial?.type ?? "",
    mode: "percent",
    percent: initial ? initial.percent.toString() : "",
    amount: "",
    note: initial?.note ?? "",
  });
  const [errors, setErrors] = useState<DiscountFormErrors>({});

  const set =
    (k: Exclude<keyof StudentDiscountFormInput, "mode">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({
        ...prev,
        [k]: e.target.value,
      }));

  const isEdit = !!initial;

  const parsedPercent = Number(form.percent);
  const parsedAmount = Number(form.amount);
  const computedAmountPreview =
    form.mode === "percent" && parsedPercent > 0
      ? percentToRupeeAmount(balanceDue, parsedPercent).toString()
      : "";
  const computedPercentPreview =
    form.mode === "amount" && parsedAmount > 0
      ? amountToPercent(balanceDue, parsedAmount).toString()
      : "";

  const handleSubmit = async () => {
    const payload =
      form.mode === "percent"
        ? {
            mode: "percent" as const,
            type: form.type,
            note: form.note || undefined,
            percent: form.percent,
          }
        : {
            mode: "amount" as const,
            type: form.type,
            note: form.note || undefined,
            amount: form.amount,
          };

    const validate = studentDiscountMutationSchema.safeParse(payload);
    if (!validate.success) {
      const tree = z.treeifyError(validate.error).properties as
        | Record<string, { errors: string[] } | undefined>
        | undefined;
      setErrors({
        type: tree?.type?.errors[0],
        percent: tree?.percent?.errors?.[0],
        amount: tree?.amount?.errors?.[0],
        note: tree?.note?.errors[0],
      });
      return;
    }
    try {
      await onSubmit(validate.data);
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

      <div className="mb-3 flex gap-2">
        {(["percent", "amount"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, mode: m }))}
            className={cn(
              "border px-3 py-1.5 font-(family-name:--font-dm-sans) text-xs font-semibold uppercase tracking-[0.06em] transition-colors",
              form.mode === m
                ? "border-(--brand-green) bg-(--brand-green) text-white"
                : "border-[rgba(47,78,64,0.18)] bg-white text-[rgba(47,78,64,0.65)] hover:border-(--brand-green) hover:text-(--brand-green)",
            )}
          >
            {m === "percent" ? "%" : "Amount"}
          </button>
        ))}
      </div>

      <FormField
        label="Percent"
        required={form.mode === "percent"}
        hint={
          form.mode === "percent"
            ? "Must be greater than 0"
            : "Computed from amount"
        }
      >
        <div className="relative">
          <input
            className={cn(
              inputCls,
              "pr-8",
              errors.percent && "border-[#9a3412]",
              form.mode === "amount" &&
                "cursor-not-allowed text-[rgba(47,78,64,0.5)]",
            )}
            placeholder="e.g. 10"
            type="number"
            min={0.01}
            step="any"
            value={form.mode === "percent" ? form.percent : computedPercentPreview}
            onChange={form.mode === "percent" ? set("percent") : undefined}
            disabled={form.mode === "amount"}
            readOnly={form.mode === "amount"}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-(family-name:--font-dm-sans) text-sm font-semibold text-[rgba(47,78,64,0.4)]">
            %
          </span>
        </div>
        {form.mode === "percent" && parsedPercent > 0 ? (
          <p className="mt-1 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.5)]">
            = {formatNpr(percentToRupeeAmount(balanceDue, parsedPercent))}
          </p>
        ) : null}
        {errors.percent ? <FieldError>{errors.percent}</FieldError> : null}
      </FormField>

      <FormField
        label="Amount"
        required={form.mode === "amount"}
        hint={
          form.mode === "amount"
            ? "Must be greater than 0"
            : "Computed from percent"
        }
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.45)]">
            Rs.
          </span>
          <input
            className={cn(
              inputCls,
              "pl-10",
              errors.amount && "border-[#9a3412]",
              form.mode === "percent" &&
                "cursor-not-allowed text-[rgba(47,78,64,0.5)]",
            )}
            placeholder="e.g. 500"
            type="number"
            min={0.01}
            step="any"
            value={form.mode === "amount" ? form.amount : computedAmountPreview}
            onChange={form.mode === "amount" ? set("amount") : undefined}
            disabled={form.mode === "percent"}
            readOnly={form.mode === "percent"}
          />
        </div>
        {form.mode === "amount" && parsedAmount > 0 ? (
          <p className="mt-1 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.5)]">
            = {amountToPercent(balanceDue, parsedAmount)}%
          </p>
        ) : null}
        {errors.amount ? <FieldError>{errors.amount}</FieldError> : null}
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
