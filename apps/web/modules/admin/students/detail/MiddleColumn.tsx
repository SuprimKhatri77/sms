"use client";

import { StudentDetail, StudentPaymentDetails } from "@repo/types";
import { CreditCard, Plus } from "lucide-react";

import { SectionCard } from "./shared/SectionCard";
import { DetailEmptyState } from "./shared/DetailEmptyState";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { GuardianSection } from "./GuardianSection";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import {
  detailEmptyActionClass,
  detailEmptyActionIconClass,
} from "./detail-styles";
import { cn } from "@/lib/utils";
import type { Status } from "./StudentDetail";
import { StatusActionTooltip } from "./StatusActionTooltip";
import {
  canPerformStudentActions,
  STUDENT_STATUS_ACTION_TOOLTIP,
} from "./student-status-actions";

type Student = Extract<StudentDetail, { success: true }>["data"];

type Payment = Extract<
  StudentPaymentDetails,
  { success: true }
>["data"][number];

type PaymentRowProps = {
  payment: {
    id: string | number;
    amount: number;
    addedAt: string;
    remarks?: string | null;
    addedByName?: string;
    paymentMode?: string | null;
  };
  student: {
    referenceNo: string;
    fullName: string;
    phone: string;
    fiscalYear: string;
  };
  receiptNo: number;
};

export function MiddleColumn({
  student,
  payments,
  setShowPaymentModal,
  PaymentRow,
  balanceDue,
  currentStatus,
}: {
  student: Student;
  payments: Payment[];
  setShowPaymentModal: (v: boolean) => void;
  PaymentRow: React.ComponentType<PaymentRowProps>;
  balanceDue: number;
  currentStatus: Status;
}) {
  const actionsAllowed = canPerformStudentActions(currentStatus);
  const paymentDisabled = balanceDue <= 0 || !actionsAllowed;
  const paymentStatusBlocked = !actionsAllowed && balanceDue > 0;

  const renderAddPaymentButton = (compact = false) => (
    <button
      type="button"
      onClick={() => setShowPaymentModal(true)}
      disabled={paymentDisabled}
      className={cn(
        adminPrimaryButtonClass,
        compact && detailEmptyActionClass,
        "disabled:cursor-not-allowed disabled:border-[rgba(47,78,64,0.2)] disabled:bg-[rgba(47,78,64,0.35)] disabled:hover:bg-[rgba(47,78,64,0.35)]",
      )}
    >
      {compact ? (
        <Plus className={detailEmptyActionIconClass} strokeWidth={2} />
      ) : (
        <Plus size={14} />
      )}
      {balanceDue <= 0 ? "Balance Cleared" : "Add Payment"}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <PersonalInfoSection student={student} currentStatus={currentStatus} />
      <GuardianSection student={student} currentStatus={currentStatus} />

      <SectionCard title="Payment History" icon={CreditCard}>
        {payments.length === 0 ? (
          <DetailEmptyState
            icon={CreditCard}
            message="No payments recorded yet."
            action={
              paymentStatusBlocked ? (
                <StatusActionTooltip
                  blocked
                  className="w-auto"
                  message={STUDENT_STATUS_ACTION_TOOLTIP}
                >
                  {renderAddPaymentButton(true)}
                </StatusActionTooltip>
              ) : (
                renderAddPaymentButton(true)
              )
            }
          />
        ) : (
          <>
            <div className="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.5)]">
                {payments.length} payment{payments.length !== 1 ? "s" : ""}{" "}
                recorded
              </p>
              {paymentStatusBlocked ? (
                <StatusActionTooltip
                  blocked
                  className="w-full sm:w-auto"
                  message={STUDENT_STATUS_ACTION_TOOLTIP}
                >
                  {renderAddPaymentButton()}
                </StatusActionTooltip>
              ) : (
                renderAddPaymentButton()
              )}
            </div>

            <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
              {[...payments].reverse().map((p, reversedIdx) => {
                const originalIdx = payments.length - 1 - reversedIdx;
                return (
                  <PaymentRow
                    key={p.id}
                    payment={{
                      id: p.id,
                      amount: p.amount,
                      addedAt:
                        p.addedAt instanceof Date
                          ? p.addedAt.toISOString()
                          : String(p.addedAt),
                      remarks: p.remarks,
                      addedByName: p.addedByName,
                      paymentMode: p.paymentMode,
                    }}
                    student={student}
                    receiptNo={originalIdx + 1}
                  />
                );
              })}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
