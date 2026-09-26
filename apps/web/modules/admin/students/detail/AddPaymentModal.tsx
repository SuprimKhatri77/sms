"use client";

import { Spinner } from "@/components/ui/spinner";
import { mapFieldErrors } from "@/utils/api";
import { APIResponse } from "@repo/types";
import { AxiosError } from "axios";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import {
  AlertCircle,
  Banknote,
  Building2,
  CalendarDays,
  Coins,
  CreditCard,
  Plus,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { SearchableSelect } from "../../inventory/shared/SearchableSelect";
import { useBankAccountSearch } from "../../inventory/shared/useProductSupplierSearch";
import { useBankAccountsDropdown } from "@/hooks/queries/admin/banks/bank_ledger/useBankAccountsDropdown";

const CASH_AND_BANK = "cash_and_bank";

const modalSchema = z
  .object({
    amount: z.number().min(0.01, {
      error: "Amount must be at least Rs 0.01",
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
    bankAccountID: z.uuid().optional(),
    cashAmount: z
      .number()
      .min(0.01, { error: "Cash part must be at least Rs 0.01" })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode !== CASH_AND_BANK) return;
    if (data.cashAmount === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Enter the cash part",
        path: ["cashAmount"],
      });
      return;
    }
    // the bank part is the rest of the total; compare in paisa
    if (Math.round(data.amount * 100) - Math.round(data.cashAmount * 100) < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Cash part must be less than the total",
        path: ["cashAmount"],
      });
    }
  });
type AddPaymentModal = z.infer<typeof modalSchema>;

type AddPaymentModalErrors = {
  amount?: string;
  remarks?: string;
  paymentMode?: string;
  date?: string;
  bsDate?: string;
  bankAccountID?: string;
  cashAmount?: string;
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
  { value: CASH_AND_BANK, label: "Cash + Bank", icon: Coins },
];

function getToday() {
  const ad = new Date().toISOString().split("T")[0];
  return { ad, bs: ADToBS(ad) };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 font-(family-name:--font-dm-sans) text-xs text-[#9a3412]">
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
  const [cashAmount, setCashAmount] = useState("");
  const [error, setError] = useState<AddPaymentModalErrors>({});
  const [isAddingNewMode, setIsAddingNewMode] = useState(false);
  const [newModeInput, setNewModeInput] = useState("");
  const [paymentModes, setPaymentModes] = useState(defaultPaymentModes);
  const [bankAccountId, setBankAccountId] = useState("");
  const [bankAccountLabel, setBankAccountLabel] = useState("");

  const searchBankAccounts = useBankAccountSearch();
  const { data: bankAccounts } = useBankAccountsDropdown();

  const isSplitMode = paymentMode === CASH_AND_BANK;
  // a split payment books its bank part to a bank account too
  const isBankMode = paymentMode === "bank" || isSplitMode;
  const defaultBankAccount = bankAccounts?.find((a) => a.isDefault);
  const effectiveBankAccountId =
    bankAccountId || (isBankMode ? (defaultBankAccount?.id ?? "") : "");
  const effectiveBankAccountLabel =
    bankAccountLabel ||
    (isBankMode && defaultBankAccount
      ? `${defaultBankAccount.bankName} — ${defaultBankAccount.accountName}`
      : "");

  const bankPartPaisa =
    Math.round(Number(amount) * 100) - Math.round(Number(cashAmount) * 100);

  const [bsDate, setBsDate] = useState(() => getToday().bs);
  const [adDate, setAdDate] = useState(() => getToday().ad);

  useEffect(() => {
    if (!open) return;
    const today = getToday();
    setBsDate(today.bs);
    setAdDate(today.ad);
  }, [open]);

  const resetForm = () => {
    setAmount("");
    setRemarks("");
    setPaymentMode("");
    setCashAmount("");
    setError({});
    setIsAddingNewMode(false);
    setNewModeInput("");
    setPaymentModes(defaultPaymentModes);
    setBankAccountId("");
    setBankAccountLabel("");
    const today = getToday();
    setBsDate(today.bs);
    setAdDate(today.ad);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (isBankMode && !effectiveBankAccountId) {
      toast.error("Please select a bank account.");
      return;
    }

    const result = modalSchema.safeParse({
      amount: Number(amount),
      remarks: remarks || undefined,
      paymentMode: paymentMode || undefined,
      date: adDate,
      bsDate: bsDate,
      bankAccountID: isBankMode ? effectiveBankAccountId : undefined,
      cashAmount:
        isSplitMode && cashAmount !== "" ? Number(cashAmount) : undefined,
    });

    if (!result.success) {
      const tree = z.treeifyError(result.error).properties;
      setError({
        amount: tree?.amount?.errors[0],
        remarks: tree?.remarks?.errors[0],
        paymentMode: tree?.paymentMode?.errors[0],
        date: tree?.date?.errors[0],
        bsDate: tree?.bsDate?.errors[0],
        cashAmount: tree?.cashAmount?.errors[0],
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
    const value = trimmed.toLowerCase().replace(/\s+/g, "_");
    // "Cash" or "Cash and Bank" typed by hand selects the built-in option,
    // so it gets the right ledger handling instead of a duplicate chip.
    if (!paymentModes.some((m) => m.value === value)) {
      setPaymentModes((prev) => [
        ...prev,
        { value, label: trimmed, icon: CreditCard },
      ]);
    }
    setPaymentMode(value);
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
            <span className="font-(family-name:--font-lora) text-lg text-(--brand-brown)">
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
              className="min-w-0 flex-1 border-0 bg-transparent font-(family-name:--font-lora) text-3xl font-bold tracking-tight text-(--brand-green) outline-none placeholder:text-[rgba(47,78,64,0.18)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          {balanceDue !== undefined && balanceDue > 0 ? (
            <button
              type="button"
              onClick={handlePayFullBalance}
              className="mt-4 font-(family-name:--font-dm-sans) text-xs text-(--brand-brown) underline-offset-2 hover:underline"
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
                    if (mode.value !== CASH_AND_BANK) setCashAmount("");
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
                      "flex-1 font-(family-name:--font-dm-sans) text-sm font-medium",
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

          {isSplitMode && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.6)]">
                  Cash part (NPR)
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0"
                  value={cashAmount}
                  onChange={(e) => {
                    setCashAmount(e.target.value);
                    setError((prev) => ({ ...prev, cashAmount: undefined }));
                  }}
                  className={cn(
                    inputCls,
                    error.cashAmount && "border-[#9a3412]",
                  )}
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.6)]">
                  Bank part
                </span>
                <p className="py-2 font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums text-(--brand-green)">
                  {amount !== "" && cashAmount !== "" && bankPartPaisa > 0
                    ? formatNpr(bankPartPaisa / 100)
                    : "—"}
                </p>
              </div>
            </div>
          )}
          {isSplitMode && <FieldError message={error.cashAmount} />}

          {isBankMode && (
            <div className="mt-4">
              <SearchableSelect
                value={effectiveBankAccountId}
                onChange={(v, label) => {
                  setBankAccountId(v);
                  setBankAccountLabel(label);
                }}
                onSearch={searchBankAccounts}
                selectedLabel={effectiveBankAccountLabel}
                placeholder="Search bank accounts…"
              />
            </div>
          )}

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
              className="mt-4 inline-flex items-center gap-1.5 font-(family-name:--font-dm-sans) text-xs text-(--brand-brown) underline-offset-2 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add another method
            </button>
          )}

          <FieldError message={error.paymentMode} />
        </section>

        <section>
          <p className={adminFieldLabelClass}>Date (BS)</p>
          <div className="relative mt-5">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <NepaliDatePicker
              inputClassName={cn(
                inputCls,
                "pl-9",
                (error.bsDate || error.date) && "border-[#9a3412]",
              )}
              value={bsDate}
              onChange={(v: string) => {
                setBsDate(v);
                try {
                  setAdDate(BSToAD(v));
                  setError((prev) => ({
                    ...prev,
                    bsDate: undefined,
                    date: undefined,
                  }));
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Invalid date",
                  );
                }
              }}
              options={{ calenderLocale: "en", valueLocale: "en" }}
            />
          </div>
          <FieldError message={error.bsDate ?? error.date} />
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
