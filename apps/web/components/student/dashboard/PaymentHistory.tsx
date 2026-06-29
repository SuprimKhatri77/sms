"use client";

import {
  Banknote,
  Smartphone,
  Building2,
  FileText,
  Wallet,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GetStudentPaymentsResponse } from "@repo/types";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { DashboardSection } from "./DashboardSection";
import {
  dashboardCardClass,
  dashboardMoneyClass,
  dashboardPrimaryBtnClass,
} from "./dashboard-styles";

type PaymentItem = Extract<
  GetStudentPaymentsResponse,
  { success: true }
>["data"][number];

const PAYMENT_MODE_META: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  cash: { label: "Cash", icon: <Banknote size={14} strokeWidth={1.75} /> },
  esewa: { label: "eSewa", icon: <Smartphone size={14} strokeWidth={1.75} /> },
  khalti: { label: "Khalti", icon: <Smartphone size={14} strokeWidth={1.75} /> },
  bank_transfer: {
    label: "Bank Transfer",
    icon: <Building2 size={14} strokeWidth={1.75} />,
  },
  cheque: { label: "Cheque", icon: <FileText size={14} strokeWidth={1.75} /> },
};

function getPaymentModeMeta(mode: string) {
  return (
    PAYMENT_MODE_META[mode] ?? {
      label: mode,
      icon: <CreditCard size={14} strokeWidth={1.75} />,
    }
  );
}

function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-NP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function PaymentRow({
  payment,
  index,
}: {
  payment: PaymentItem;
  index: number;
}) {
  const { date, time } = formatDateTime(payment.addedAt);
  const mode = getPaymentModeMeta(payment.paymentMode);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 transition-colors duration-150 hover:bg-[rgba(47,78,64,0.02)] sm:grid-cols-[2.5rem_1fr_auto]">
      <div className="hidden h-8 w-8 shrink-0 items-center justify-center bg-[#f4f1ec] sm:flex">
        <span className="font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold text-[rgba(47,78,64,0.35)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="min-w-0">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-[rgba(47,78,64,0.08)] bg-[#f4f1ec] px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-medium text-[rgba(47,78,64,0.55)]">
            {mode.icon}
            {mode.label}
          </span>
          {payment.remarks ? (
            <span className="max-w-[160px] truncate font-[family-name:var(--font-dm-sans)] text-[0.72rem] text-[rgba(47,78,64,0.38)]">
              {payment.remarks}
            </span>
          ) : null}
        </div>
        <p className="font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-medium text-[rgba(47,78,64,0.38)]">
          {date}&nbsp;·&nbsp;{time}
        </p>
      </div>

      <p className={cn("shrink-0 text-right text-[0.92rem] text-(--brand-green)", dashboardMoneyClass)}>
        {formatNPR(payment.amount / 100)}
      </p>
    </div>
  );
}

function EmptyPayments() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center bg-[#f4f1ec]">
        <Wallet className="h-6 w-6 text-[rgba(47,78,64,0.25)]" strokeWidth={1.75} />
      </div>
      <p className="font-[family-name:var(--font-playfair)] text-[0.92rem] font-semibold text-[rgba(47,78,64,0.45)]">
        No payments recorded
      </p>
      <p className="mt-1 max-w-[220px] font-[family-name:var(--font-dm-sans)] text-[0.75rem] leading-relaxed text-[rgba(47,78,64,0.35)]">
        Payments added by the administration will appear here once processed.
      </p>
    </div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)} />
  );
}

function PaymentHistorySkeleton() {
  return (
    <DashboardSection title="Payment history">
      <div className={cn(dashboardCardClass, "overflow-hidden divide-y divide-[rgba(47,78,64,0.06)]")}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 p-4"
          >
            <Shimmer className="hidden h-8 w-8 sm:block" />
            <div className="space-y-1.5">
              <Shimmer className="h-5 w-24" />
              <Shimmer className="h-3 w-40" />
            </div>
            <Shimmer className="h-4 w-24" />
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

function PaymentHistoryError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <DashboardSection title="Payment history">
      <div
        className={cn(
          dashboardCardClass,
          "flex flex-col items-center gap-3 px-5 py-8 text-center",
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-400" strokeWidth={1.75} />
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-semibold text-(--brand-green)">
            Couldn&apos;t load payment history
          </p>
          <p className="mx-auto mt-1 max-w-xs font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.5)]">
            {message ?? "Something went wrong fetching your payments."}
          </p>
        </div>
        <button type="button" onClick={onRetry} className={dashboardPrimaryBtnClass}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Try again
        </button>
      </div>
    </DashboardSection>
  );
}

export function PaymentHistory() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["student-payments"],
    queryFn: async () => {
      const res = await api.get<GetStudentPaymentsResponse>(
        "/portal/student/payments",
      );
      const parsed = res.data;

      if (!parsed.success) {
        throw new Error(parsed.message ?? "Failed to load payments");
      }

      return parsed.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });

  if (isPending) return <PaymentHistorySkeleton />;

  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return <PaymentHistoryError message={message} onRetry={refetch} />;
  }

  const sorted = [...data].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
  const total = data.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardSection
      title="Payment history"
      badge={data.length > 0 ? `${formatNPR(total / 100)} total` : undefined}
    >
      <div className={cn(dashboardCardClass, "overflow-hidden")}>
        {data.length === 0 ? (
          <EmptyPayments />
        ) : (
          <div className="divide-y divide-[rgba(47,78,64,0.06)]">
            {sorted.map((payment, i) => (
              <PaymentRow key={payment.id} payment={payment} index={i} />
            ))}
          </div>
        )}
      </div>
    </DashboardSection>
  );
}
