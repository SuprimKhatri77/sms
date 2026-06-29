import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Printer,
  Award,
  FileText,
  Info,
} from "lucide-react";
import { StudentAvatar } from "./StudentAvatar";
import type { Status } from "./StudentDetail";
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { StudentStatusBadge } from "../shared/student-status";
import { cn } from "@/lib/utils";
import { StatusActionTooltip } from "./StatusActionTooltip";
import {
  canPerformStudentActions,
  STUDENT_STATUS_ACTION_TOOLTIP,
} from "./student-status-actions";

type StudentDetailHeaderProps = {
  fullName: string;
  referenceNo: string;
  email?: string | null;
  batch?: string | null;
  shift?: string | null;
  photoUrl?: string | null;
  status: Status;
  balanceDue: number;
  onAddPayment: () => void;
  showInvoice: boolean;
  onToggleInvoice: () => void;
  showCertificate: boolean;
  onToggleCertificate: () => void;
  showWorkshopCertificate: boolean;
  onToggleWorkshopCertificate: () => void;
};

export function StudentDetailHeader({
  fullName,
  referenceNo,
  email,
  batch,
  shift,
  photoUrl,
  status,
  balanceDue,
  onAddPayment,
  showInvoice,
  onToggleInvoice,
  showCertificate,
  onToggleCertificate,
  showWorkshopCertificate,
  onToggleWorkshopCertificate,
}: StudentDetailHeaderProps) {
  const actionsAllowed = canPerformStudentActions(status);
  const paymentDisabled = balanceDue <= 0 || !actionsAllowed;
  const paymentStatusBlocked = !actionsAllowed && balanceDue > 0;
  const certificateBlocked = !actionsAllowed && !showCertificate;
  const workshopCertificateBlocked =
    !actionsAllowed && !showWorkshopCertificate;
  const invoiceBlocked = !actionsAllowed && !showInvoice;
  const showStatusNotice = !actionsAllowed;

  const actionButtonClass =
    "min-w-0 w-full justify-center gap-1 px-2 py-1.5 text-[10px] leading-snug tracking-[0.04em] sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.08em]";

  const actionIconClass = "h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5";

  const addPaymentButton = (
    <button
      type="button"
      onClick={onAddPayment}
      disabled={paymentDisabled}
      className={cn(
        adminPrimaryButtonClass,
        actionButtonClass,
        "disabled:cursor-not-allowed disabled:border-[rgba(47,78,64,0.2)] disabled:bg-[rgba(47,78,64,0.35)] disabled:hover:bg-[rgba(47,78,64,0.35)]",
      )}
    >
      <Plus className={actionIconClass} strokeWidth={2} />
      <span className="sm:hidden">
        {balanceDue <= 0 ? "Cleared" : "Payment"}
      </span>
      <span className="hidden sm:inline">
        {balanceDue <= 0 ? "Balance Cleared" : "Add Payment"}
      </span>
    </button>
  );

  const certificateButton = (
    <button
      type="button"
      onClick={onToggleCertificate}
      disabled={certificateBlocked}
      className={cn(
        adminSecondaryButtonClass,
        actionButtonClass,
        showCertificate && "border-(--brand-brown) text-(--brand-brown)",
        certificateBlocked &&
          "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <Award className={actionIconClass} strokeWidth={2} />
      <span className="sm:hidden">
        {showCertificate ? "Hide Cert" : "Cert"}
      </span>
      <span className="hidden sm:inline">
        {showCertificate ? "Hide Certificate" : "Certificate"}
      </span>
    </button>
  );

  const workshopCertificateButton = (
    <button
      type="button"
      onClick={onToggleWorkshopCertificate}
      disabled={workshopCertificateBlocked}
      className={cn(
        adminSecondaryButtonClass,
        actionButtonClass,
        showWorkshopCertificate && "border-(--brand-brown) text-(--brand-brown)",
        workshopCertificateBlocked &&
          "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <Printer className={actionIconClass} strokeWidth={2} />
      <span className="sm:hidden">
        {showWorkshopCertificate ? "Hide Wkshp" : "Workshop"}
      </span>
      <span className="hidden sm:inline">
        {showWorkshopCertificate ? "Hide Workshop" : "Workshop Cert"}
      </span>
    </button>
  );

  const invoiceButton = (
    <button
      type="button"
      onClick={onToggleInvoice}
      disabled={invoiceBlocked}
      className={cn(
        adminSecondaryButtonClass,
        actionButtonClass,
        showInvoice && "border-(--brand-green) bg-[rgba(47,78,64,0.04)]",
        invoiceBlocked && "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <FileText className={actionIconClass} strokeWidth={2} />
      <span className="sm:hidden">
        {showInvoice ? "Hide Inv" : "Invoice"}
      </span>
      <span className="hidden sm:inline">
        {showInvoice ? "Hide Invoice" : "Invoice"}
      </span>
    </button>
  );

  return (
    <div className="border border-[rgba(47,78,64,0.18)] bg-white">
      <div className="border-b border-[rgba(47,78,64,0.12)] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Link
            href="/admin/students"
            className="inline-flex shrink-0 items-center gap-2 font-[family-name:var(--font-dm-sans)] text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)] transition-colors hover:text-(--brand-green)"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            All Students
          </Link>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:items-end">
            <div className="grid w-full min-w-0 grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-2">
              {paymentStatusBlocked ? (
                <StatusActionTooltip blocked className="w-full sm:w-auto">
                  {addPaymentButton}
                </StatusActionTooltip>
              ) : (
                addPaymentButton
              )}
              {invoiceBlocked ? (
                <StatusActionTooltip
                  blocked
                  className="w-full sm:w-auto"
                  message={STUDENT_STATUS_ACTION_TOOLTIP}
                >
                  {invoiceButton}
                </StatusActionTooltip>
              ) : (
                invoiceButton
              )}
              {certificateBlocked ? (
                <StatusActionTooltip
                  blocked
                  className="w-full sm:w-auto"
                  message={STUDENT_STATUS_ACTION_TOOLTIP}
                >
                  {certificateButton}
                </StatusActionTooltip>
              ) : (
                certificateButton
              )}
              {workshopCertificateBlocked ? (
                <StatusActionTooltip
                  blocked
                  className="w-full sm:w-auto"
                  message={STUDENT_STATUS_ACTION_TOOLTIP}
                >
                  {workshopCertificateButton}
                </StatusActionTooltip>
              ) : (
                workshopCertificateButton
              )}
            </div>

            {showStatusNotice ? (
              <p className="flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2 font-[family-name:var(--font-dm-sans)] text-[11px] leading-relaxed text-amber-900 md:hidden">
                <Info
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
                {STUDENT_STATUS_ACTION_TOOLTIP}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center">
        <StudentAvatar
          imageUrl={photoUrl}
          fullName={fullName}
          status={status}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-lora)] text-2xl font-bold tracking-tight text-(--brand-green)">
              {fullName}
            </h1>
            <StudentStatusBadge status={status} />
          </div>
          <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.5)]">
            {referenceNo}
            {email ? ` · ${email}` : ""}
          </p>
          {(batch || shift) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {batch ? (
                <span className="border border-[rgba(47,78,64,0.14)] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]">
                  Batch {batch}
                </span>
              ) : null}
              {shift ? (
                <span className="border border-[rgba(47,78,64,0.14)] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]">
                  {shift} shift
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
