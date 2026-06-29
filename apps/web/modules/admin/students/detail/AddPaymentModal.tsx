"use client";

import { Spinner } from "@/components/ui/spinner";
import { mapFieldErrors } from "@/utils/api";
import { APIResponse } from "@repo/types";
import { AxiosError } from "axios";
import { ADToBS } from "bikram-sambat-js";
import {
  AlertCircle,
  Banknote,
  Building2,
  CreditCard,
  Plus,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { adminFieldLabelClass } from "@/components/admin/admin-drawer";
import { cn } from "@/lib/utils";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { formatNpr } from "../shared/student-utils";
import { inputCls } from "./shared/utils";

const modalSchema = z.object({
  amount: z.number().gt(0, {
    error: "Amount must be greater than 0",
  }),
  remarks: z
    .string()
    .min(3)
    .max(100, {
      error: "Remarks must be less than 100 characters",
    })
    .optional(),
  paymentMode: z.string().min(2).max(60, {
    error: "Payment mode must be less than 60 characters",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "AD date must be in YYYY-MM-DD format",
  }),
  bsDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "BS date must be in YYYY-MM-DD format",
  }),
});
type AddPaymentModal = z.infer<typeof modalSchema>;

type AddPaymentModalErrors = {
  amount?: string;
  remarks?: string;
  paymentMode?: string;
  date?: string;
  bsDate?: string;
};

type PaymentModeOption = {
  value: string;
  label: string;
  icon: typeof Banknote;
};

const defaultPaymentModes: PaymentModeOption[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "esewa", label: "eSewa", icon: Smartphone },
  { value: "fonepay", label: "FonePay", icon: Smartphone },
  { value: "bank", label: "Bank", icon: Building2 },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)] text-xs text-[#9a3412]">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function AddPaymentModal({
  open,
  onOpenChange,
  onAdd,
  isAdding,
  balanceDue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: AddPaymentModal) => void | Promise<unknown>;
  isAdding: boolean;
  balanceDue?: number;
}) {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [error, setError] = useState<AddPaymentModalErrors>({});
  const [isAddingNewMode, setIsAddingNewMode] = useState(false);
  const [newModeInput, setNewModeInput] = useState("");
  const [paymentModes, setPaymentModes] = useState(defaultPaymentModes);

  const todayAd = useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );
  const todayBs = useMemo(() => ADToBS(todayAd), [todayAd]);

  const resetForm = () => {
    setAmount("");
    setRemarks("");
    setPaymentMode("");
    setError({});
    setIsAddingNewMode(false);
    setNewModeInput("");
    setPaymentModes(defaultPaymentModes);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const result = modalSchema.safeParse({
      amount: Number(amount),
      remarks: remarks || undefined,
      paymentMode: paymentMode || undefined,
      date: todayAd,
      bsDate: todayBs,
    });

    if (!result.success) {
      const tree = z.treeifyError(result.error).properties;
      setError({
        amount: tree?.amount?.errors[0],
        remarks: tree?.remarks?.errors[0],
        paymentMode: tree?.paymentMode?.errors[0],
        date: tree?.date?.errors[0],
        bsDate: tree?.bsDate?.errors[0],
      });
      return;
    }

    try {
      await onAdd(result.data);
      handleClose();
    } catch (err) {
      const axiosErr = err as AxiosError<APIResponse>;
      const data = axiosErr.response?.data;
      if (data?.errors?.length) {
        toast.error(data.errors[0].message);
        setError(mapFieldErrors(data));
      } else {
        toast.error(data?.message ?? "Failed to add payment");
      }
    }
  };

  const handleAddNewMode = () => {
    const trimmed = newModeInput.trim();
    if (!trimmed) return;
    const newEntry: PaymentModeOption = {
      value: trimmed.toLowerCase().replace(/\s+/g, "_"),
      label: trimmed,
      icon: CreditCard,
    };
    setPaymentModes((prev) => [...prev, newEntry]);
    setPaymentMode(newEntry.value);
    setIsAddingNewMode(false);
    setNewModeInput("");
    setError((prev) => ({ ...prev, paymentMode: undefined }));
  };

  const handlePayFullBalance = () => {
    if (balanceDue === undefined || balanceDue <= 0) return;
    setAmount(String(balanceDue));
    setError((prev) => ({ ...prev, amount: undefined }));
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else onOpenChange(true);
      }}
      title="Record Payment"
      description="Add a fee payment for this student"
      className="sm:max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={isAdding}
            className={adminSecondaryButtonClass}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isAdding}
            className={cn(adminPrimaryButtonClass, "min-w-[140px] justify-center")}
            onClick={handleSubmit}
          >
            {isAdding ? <Spinner /> : "Record Payment"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-12 px-8 py-10">
        <section>
          <p className={adminFieldLabelClass}>Amount</p>
          <div
            className={cn(
              "mt-5 flex items-baseline gap-3 border-b pb-4 transition-colors",
              error.amount
                ? "border-[#9a3412]"
                : "border-[rgba(47,78,64,0.15)] focus-within:border-(--brand-green)",
            )}
          >
            <span className="font-[family-name:var(--font-lora)] text-lg text-(--brand-brown)">
              NPR
            </span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="0"
              autoFocus
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError((prev) => ({ ...prev, amount: undefined }));
              }}
              className="min-w-0 flex-1 border-0 bg-transparent font-[family-name:var(--font-lora)] text-3xl font-bold tracking-tight text-(--brand-green) outline-none placeholder:text-[rgba(47,78,64,0.18)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          {balanceDue !== undefined && balanceDue > 0 ? (
            <button
              type="button"
              onClick={handlePayFullBalance}
              className="mt-4 font-[family-name:var(--font-dm-sans)] text-xs text-(--brand-brown) underline-offset-2 hover:underline"
            >
              Use full balance ({formatNpr(balanceDue)})
            </button>
          ) : null}
          <FieldError message={error.amount} />
        </section>

        <section>
          <p className={adminFieldLabelClass}>Method</p>
          <div
            className={cn(
              "mt-5 divide-y divide-[rgba(47,78,64,0.12)] border bg-white",
              error.paymentMode
                ? "border-[#9a3412]"
                : "border-[rgba(47,78,64,0.18)]",
            )}
          >
            {paymentModes.map((mode) => {
              const selected = paymentMode === mode.value;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    setPaymentMode(mode.value);
                    setIsAddingNewMode(false);
                    setError((prev) => ({ ...prev, paymentMode: undefined }));
                  }}
                  className={cn(
                    "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors",
                    selected
                      ? "bg-[rgba(47,78,64,0.04)]"
                      : "hover:bg-[rgba(47,78,64,0.02)]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center border",
                      selected
                        ? "border-(--brand-green) bg-[rgba(47,78,64,0.06)]"
                        : "border-[rgba(47,78,64,0.12)] bg-white",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        selected
                          ? "text-(--brand-green)"
                          : "text-[rgba(47,78,64,0.4)]",
                      )}
                      strokeWidth={1.75}
                    />
                  </span>
                  <span
                    className={cn(
                      "flex-1 font-[family-name:var(--font-dm-sans)] text-sm font-medium",
                      selected ? "text-(--brand-green)" : "text-(--brand-ink)",
                    )}
                  >
                    {mode.label}
                  </span>
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
                      selected
                        ? "border-(--brand-green)"
                        : "border-[rgba(47,78,64,0.25)]",
                    )}
                  >
                    {selected ? (
                      <span className="h-2 w-2 rounded-full bg-(--brand-green)" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {isAddingNewMode ? (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Payment method name"
                value={newModeInput}
                onChange={(e) => setNewModeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddNewMode();
                  if (e.key === "Escape") {
                    setIsAddingNewMode(false);
                    setNewModeInput("");
                  }
                }}
                className={cn(inputCls, "flex-1")}
              />
              <button
                type="button"
                onClick={handleAddNewMode}
                className={adminPrimaryButtonClass}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewMode(false);
                  setNewModeInput("");
                }}
                className={adminSecondaryButtonClass}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingNewMode(true)}
              className="mt-4 inline-flex items-center gap-1.5 font-[family-name:var(--font-dm-sans)] text-xs text-(--brand-brown) underline-offset-2 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add another method
            </button>
          )}

          <FieldError message={error.paymentMode} />
        </section>

        <section>
          <label className={adminFieldLabelClass} htmlFor="payment-remarks">
            Remarks
          </label>
          <input
            id="payment-remarks"
            type="text"
            placeholder="Optional"
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setError((prev) => ({ ...prev, remarks: undefined }));
            }}
            className={cn(
              inputCls,
              "mt-5",
              error.remarks && "border-[#9a3412]",
            )}
          />
          <FieldError message={error.remarks} />
        </section>
      </div>
    </AdminDrawer>
  );
}
