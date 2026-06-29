"use client";

import { useState } from "react";
import { CheckCircle2, Shield } from "lucide-react";
import { Status } from "./StudentDetail";
import { SectionCard } from "./shared/SectionCard";
import { updateStudentStatusSchema } from "@repo/types";
import z from "zod";
import { toast } from "sonner";
import {
  adminPrimaryButtonClass,
  adminInputClass,
} from "@/components/admin/admin-styles";
import { detailEmptyActionClass, detailEmptyActionIconClass } from "./detail-styles";
import { cn } from "@/lib/utils";

interface StatusMeta {
  label: string;
  classes: string;
  dotClass: string;
  activeClass: string;
}

interface StatusEditorProps {
  current: Status;
  onUpdate: (next: Status, rejectionReason?: string) => Promise<void> | void;
}

const STATUS_META: Record<Status, StatusMeta> = {
  pending: {
    label: "Pending",
    classes: "text-amber-800",
    dotClass: "bg-amber-400",
    activeClass: "border-amber-300 bg-amber-50",
  },
  active: {
    label: "Active",
    classes: "text-emerald-800",
    dotClass: "bg-emerald-500",
    activeClass: "border-emerald-300 bg-emerald-50",
  },
  completed: {
    label: "Completed",
    classes: "text-blue-800",
    dotClass: "bg-blue-400",
    activeClass: "border-blue-300 bg-blue-50",
  },
  rejected: {
    label: "Rejected",
    classes: "text-red-800",
    dotClass: "bg-red-400",
    activeClass: "border-red-300 bg-red-50",
  },
};

const ALL_STATUSES = Object.keys(STATUS_META) as Status[];

export function StatusEditor({ current, onUpdate }: StatusEditorProps) {
  const [selected, setSelected] = useState<Status>(current);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const isDirty = selected !== current;
  const isRejected = selected === "rejected";
  const isUpdateDisabled =
    loading || (isRejected && rejectionReason.trim() === "");

  const handleUpdate = async () => {
    setLoading(true);

    const validateFields = updateStudentStatusSchema.safeParse({
      status: selected,
      rejectionReason,
    });
    if (!validateFields.success) {
      setLoading(false);
      const tree = z.treeifyError(validateFields.error).properties;
      const statusError = tree?.status?.errors[0];
      const rejectionReasonError = tree?.rejectionReason?.errors[0];
      toast.error(
        statusError
          ? statusError
          : rejectionReasonError
            ? rejectionReasonError
            : "Something went wrong",
      );

      return;
    }
    try {
      await onUpdate(selected, isRejected ? rejectionReason.trim() : undefined);
      if (!isRejected) setRejectionReason("");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStatus = (s: Status) => {
    setSelected(s);
    if (s !== "rejected") setRejectionReason("");
  };

  const updateButton =
    isDirty && !isRejected ? (
      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading}
        className={cn(adminPrimaryButtonClass, detailEmptyActionClass)}
      >
        <CheckCircle2 className={detailEmptyActionIconClass} strokeWidth={2} />
        <span className="sm:hidden">{loading ? "Saving…" : "Update"}</span>
        <span className="hidden sm:inline">
          {loading ? "Updating…" : "Update Status"}
        </span>
      </button>
    ) : null;

  return (
    <SectionCard
      title="Student Status"
      icon={Shield}
      action={updateButton}
      headerClassName="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between"
      actionClassName="sm:shrink-0 [&_button]:w-full [&_button]:justify-center sm:[&_button]:w-auto"
      contentClassName="px-4 py-3 sm:px-5 sm:py-4"
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
        {ALL_STATUSES.map((s) => {
          const meta = STATUS_META[s];
          const isSelected = selected === s;

          return (
            <button
              key={s}
              type="button"
              onClick={() => handleSelectStatus(s)}
              className={cn(
                "flex min-w-0 items-center justify-center gap-1 border px-2 py-1.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase leading-tight tracking-[0.04em] transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.06em]",
                isSelected
                  ? meta.activeClass
                  : "border-[rgba(47,78,64,0.12)] bg-white hover:bg-[rgba(47,78,64,0.03)]",
                meta.classes,
              )}
            >
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2", meta.dotClass)} />
              {meta.label}
            </button>
          );
        })}
        </div>

        {isDirty && isRejected ? (
          <div className="space-y-3 border border-red-200 bg-red-50/40 p-3 sm:p-4">
            <label
              htmlFor="rejection-reason"
              className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.1em] text-red-700"
            >
              Rejection reason (required)
            </label>
            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete documentation, did not meet minimum requirements…"
              rows={3}
              className={cn(
                adminInputClass,
                "resize-none border-red-200 bg-white normal-case tracking-normal focus:border-red-400",
              )}
            />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdateDisabled}
                className={cn(
                  "inline-flex items-center gap-1.5 border border-red-700 bg-red-700 px-2.5 py-1.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.08em]",
                )}
              >
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
                <span className="sm:hidden">
                  {loading ? "Saving…" : "Confirm"}
                </span>
                <span className="hidden sm:inline">
                  {loading ? "Updating…" : "Confirm Rejection"}
                </span>
              </button>
              <p className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[rgba(47,78,64,0.45)]">
                This reason will be shown to the student.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
