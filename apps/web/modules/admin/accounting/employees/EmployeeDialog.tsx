"use client";

import { useState } from "react";
import { CalendarDays, CircleCheck, CircleOff, X } from "lucide-react";
import { toast } from "sonner";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import { BSToAD } from "bikram-sambat-js";
import { AxiosError } from "axios";
import z from "zod";
import {
  employeeInputSchema,
  type APIError,
  type Employee,
  type EmployeeInput,
  type EmployeeStatus,
} from "@repo/types";
import { cn } from "@/lib/utils";
import { mapFieldErrors } from "@/utils/api";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  AccountingFormField,
  AccountingFormSection,
  accountingFieldInputClass,
} from "../shared/accounting-styles";
import { ChoiceCards, type ChoiceCardOption } from "../shared/ChoiceCards";

const STATUS_OPTIONS: ChoiceCardOption<EmployeeStatus>[] = [
  {
    value: "active",
    label: "Active",
    hint: "Can be given salary entries",
    icon: CircleCheck,
  },
  {
    value: "inactive",
    label: "Inactive",
    hint: "Has left; history stays, no new entries",
    icon: CircleOff,
  },
];

type FieldErrors = Partial<Record<keyof EmployeeInput, string>>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** the employee being edited; null to add one */
  employee: Employee | null;
  loading: boolean;
  onSubmit: (data: EmployeeInput) => Promise<void>;
}

const hintClass =
  "mt-1.5 font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.5)]";

/**
 * Add or edit an employee. The code (EMP-001, ...) is given by the server
 * and never changes. Mount it with a fresh `key` per open so the fields start
 * from the employee (or blank).
 */
export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  loading,
  onSubmit,
}: EmployeeDialogProps) {
  const isEdit = !!employee;
  const [fullName, setFullName] = useState(employee?.fullName ?? "");
  const [designation, setDesignation] = useState(employee?.designation ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [salaryRs, setSalaryRs] = useState(
    employee?.monthlySalary ? String(employee.monthlySalary / 100) : "",
  );
  const [joinDateBs, setJoinDateBs] = useState(employee?.joinDateBs ?? "");
  const [joinDate, setJoinDate] = useState(employee?.joinDate ?? "");
  const [panNo, setPanNo] = useState(employee?.panNo ?? "");
  const [address, setAddress] = useState(employee?.address ?? "");
  const [notes, setNotes] = useState(employee?.notes ?? "");
  const [status, setStatus] = useState<EmployeeStatus>(
    employee?.status ?? "active",
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof EmployeeInput) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = employeeInputSchema.safeParse({
      fullName,
      designation: designation.trim() || undefined,
      phone: phone.trim() || undefined,
      monthlySalary: salaryRs === "" ? undefined : Number(salaryRs),
      joinDate: joinDate || undefined,
      joinDateBs: joinDateBs || undefined,
      panNo: panNo.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      // new employees start active
      status: isEdit ? status : undefined,
    });
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error).properties;
      setErrors({
        fullName: tree?.fullName?.errors[0],
        designation: tree?.designation?.errors[0],
        phone: tree?.phone?.errors[0],
        monthlySalary: tree?.monthlySalary?.errors[0],
        joinDateBs: tree?.joinDateBs?.errors[0] ?? tree?.joinDate?.errors[0],
        panNo: tree?.panNo?.errors[0],
        address: tree?.address?.errors[0],
        notes: tree?.notes?.errors[0],
      });
      return;
    }
    setErrors({});
    try {
      await onSubmit(parsed.data);
      onOpenChange(false);
    } catch (err) {
      const data = (err as AxiosError<APIError>).response?.data;
      if (data?.errors?.length) setErrors(mapFieldErrors(data));
    }
  };

  return (
    <AdminDrawer
      open={open}
      onOpenChange={onOpenChange}
      variant="modal"
      className="sm:max-w-2xl"
      title={isEdit ? `Edit ${employee.code}` : "Add Employee"}
      description={
        isEdit
          ? "Change this employee's details or mark them inactive."
          : "Add someone who is paid through the salary ledger."
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            className={adminSecondaryButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="employee-form"
            disabled={loading}
            className={adminPrimaryButtonClass}
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      }
    >
      <form
        id="employee-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 px-8 py-8"
      >
        <AccountingFormSection title="Employee">
          <AccountingFormField label="Employee code">
            <div
              className={cn(
                "flex h-10 items-center border border-dashed border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.03)] px-3 text-sm",
                isEdit
                  ? "font-mono text-(--brand-green)"
                  : "font-(family-name:--font-dm-sans) text-[rgba(47,78,64,0.5)]",
              )}
            >
              {isEdit ? employee.code : "Given automatically when saved"}
            </div>
            <p className={hintClass}>
              Tells apart people with the same name. It never changes and is
              never reused.
            </p>
          </AccountingFormField>

          <AccountingFormField
            label="Full name"
            htmlFor="employee-name"
            required
            error={errors.fullName}
          >
            <input
              id="employee-name"
              placeholder="e.g. Ram Shrestha"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearError("fullName");
              }}
              className={cn(
                accountingFieldInputClass,
                errors.fullName && "border-[#9a3412]",
              )}
            />
          </AccountingFormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AccountingFormField
              label="Designation"
              htmlFor="employee-designation"
              optional
              error={errors.designation}
            >
              <input
                id="employee-designation"
                placeholder="e.g. Barista"
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  clearError("designation");
                }}
                className={cn(
                  accountingFieldInputClass,
                  errors.designation && "border-[#9a3412]",
                )}
              />
            </AccountingFormField>

            <AccountingFormField
              label="Phone"
              htmlFor="employee-phone"
              optional
              error={errors.phone}
            >
              <input
                id="employee-phone"
                inputMode="numeric"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError("phone");
                }}
                className={cn(
                  accountingFieldInputClass,
                  errors.phone && "border-[#9a3412]",
                )}
              />
            </AccountingFormField>
          </div>
        </AccountingFormSection>

        <AccountingFormSection title="Pay">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AccountingFormField
              label="Monthly salary (Rs.)"
              htmlFor="employee-salary"
              optional
              error={errors.monthlySalary}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.45)]">
                  Rs.
                </span>
                <input
                  id="employee-salary"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={salaryRs}
                  onChange={(e) => {
                    setSalaryRs(e.target.value);
                    clearError("monthlySalary");
                  }}
                  className={cn(
                    accountingFieldInputClass,
                    "pl-10",
                    errors.monthlySalary && "border-[#9a3412]",
                  )}
                />
              </div>
              <p className={hintClass}>
                Filled in as the amount when you add a salary entry for them.
              </p>
            </AccountingFormField>

            <AccountingFormField
              label="Join date (BS)"
              optional
              error={errors.joinDateBs}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[rgba(47,78,64,0.4)]">
                  <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <NepaliDatePicker
                  inputClassName={cn(
                    accountingFieldInputClass,
                    "pl-9",
                    joinDateBs && "pr-9",
                    errors.joinDateBs && "border-[#9a3412]",
                  )}
                  value={joinDateBs}
                  onChange={(v: string) => {
                    if (!v) return;
                    try {
                      setJoinDate(BSToAD(v));
                      setJoinDateBs(v);
                      clearError("joinDateBs");
                    } catch (err) {
                      toast.error(
                        err instanceof Error ? err.message : "Invalid date",
                      );
                    }
                  }}
                  options={{ calenderLocale: "en", valueLocale: "en" }}
                />
                {joinDateBs && (
                  <button
                    type="button"
                    aria-label="Clear join date"
                    onClick={() => {
                      setJoinDateBs("");
                      setJoinDate("");
                      clearError("joinDateBs");
                    }}
                    className="absolute right-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[rgba(47,78,64,0.45)] hover:text-(--brand-green)"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </AccountingFormField>
          </div>
        </AccountingFormSection>

        <AccountingFormSection title="Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AccountingFormField
              label="PAN number"
              htmlFor="employee-pan"
              optional
              error={errors.panNo}
            >
              <input
                id="employee-pan"
                inputMode="numeric"
                placeholder="9 digits"
                value={panNo}
                onChange={(e) => {
                  setPanNo(e.target.value);
                  clearError("panNo");
                }}
                className={cn(
                  accountingFieldInputClass,
                  errors.panNo && "border-[#9a3412]",
                )}
              />
            </AccountingFormField>

            <AccountingFormField
              label="Address"
              htmlFor="employee-address"
              optional
              error={errors.address}
            >
              <input
                id="employee-address"
                placeholder="e.g. Kathmandu"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearError("address");
                }}
                className={cn(
                  accountingFieldInputClass,
                  errors.address && "border-[#9a3412]",
                )}
              />
            </AccountingFormField>
          </div>

          <AccountingFormField
            label="Notes"
            htmlFor="employee-notes"
            optional
            error={errors.notes}
          >
            <textarea
              id="employee-notes"
              rows={3}
              placeholder="e.g. Morning shift"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                clearError("notes");
              }}
              className={cn(
                accountingFieldInputClass,
                "resize-none",
                errors.notes && "border-[#9a3412]",
              )}
            />
          </AccountingFormField>
        </AccountingFormSection>

        {isEdit && (
          <AccountingFormSection title="Status">
            <AccountingFormField label="Status" required error={errors.status}>
              <ChoiceCards
                name="employee-status"
                label="Status"
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  clearError("status");
                }}
                options={STATUS_OPTIONS}
              />
            </AccountingFormField>
          </AccountingFormSection>
        )}
      </form>
    </AdminDrawer>
  );
}
