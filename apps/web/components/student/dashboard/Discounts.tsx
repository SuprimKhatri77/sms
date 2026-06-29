"use client";

import api from "@/lib/axios";
import { GetStudentDiscountsResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BadgePercent, RefreshCw, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardSection } from "./DashboardSection";
import {
  dashboardCardClass,
  dashboardBadgeClass,
  dashboardMoneyClass,
  dashboardPrimaryBtnClass,
} from "./dashboard-styles";

function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-NP")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)} />
  );
}

interface DiscountItem {
  id: string;
  type: string;
  percent: number;
  amount: number;
  note: string | null;
  createdAt: string;
}

function DiscountsSkeleton() {
  return (
    <DashboardSection title="Discounts">
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Shimmer key={i} className="h-[88px]" />
        ))}
      </div>
    </DashboardSection>
  );
}

function DiscountsEmpty() {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex flex-col items-center gap-3 px-5 py-10 text-center",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center bg-[#f4f1ec]">
        <BadgePercent className="h-[22px] w-[22px] text-[rgba(47,78,64,0.25)]" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-playfair)] text-[0.92rem] font-semibold text-[rgba(47,78,64,0.45)]">
          No discounts applied
        </p>
        <p className="mx-auto mt-1 max-w-[200px] font-[family-name:var(--font-dm-sans)] text-[0.75rem] leading-relaxed text-[rgba(47,78,64,0.35)]">
          Any discounts added to your account will appear here.
        </p>
      </div>
    </div>
  );
}

function DiscountRow({ discount }: { discount: DiscountItem }) {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex items-start justify-between gap-4 p-4 transition-colors duration-200 hover:border-[rgba(194,138,79,0.25)]",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[rgba(194,138,79,0.1)]">
          <Tag className="h-[15px] w-[15px] text-(--brand-brown)" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-playfair)] text-[0.92rem] font-semibold leading-snug text-(--brand-green)">
            {discount.type}
          </p>
          {discount.note ? (
            <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] leading-snug text-[rgba(47,78,64,0.45)]">
              {discount.note}
            </p>
          ) : null}
          <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.72rem] text-[rgba(47,78,64,0.35)]">
            {formatDate(discount.createdAt)}
          </p>
        </div>
      </div>

      <div className="shrink-0 space-y-1 text-right">
        <p className={cn("text-[0.92rem] text-(--brand-brown)", dashboardMoneyClass)}>
          {formatNPR(discount.amount / 100)}
        </p>
        <span
          className={cn(
            dashboardBadgeClass,
            "border border-[rgba(194,138,79,0.2)] bg-[rgba(194,138,79,0.08)] px-2 py-0.5 text-(--brand-brown)",
          )}
        >
          {discount.percent}% off
        </span>
      </div>
    </div>
  );
}

function SectionError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry: () => void;
}) {
  return (
    <DashboardSection title={title}>
      <div
        className={cn(
          dashboardCardClass,
          "flex flex-col items-center gap-3 px-5 py-8 text-center",
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-400" strokeWidth={1.75} />
        <div>
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-semibold text-(--brand-green)">
            Couldn&apos;t load data
          </p>
          <p className="mx-auto mt-1 max-w-xs font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.5)]">
            {message ?? "Something went wrong. Please try again."}
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

export function Discounts() {
  const { data, isPending, refetch, isError, error } = useQuery({
    queryKey: ["student-portal-discounts"],
    queryFn: async () => {
      const res = await api.get<GetStudentDiscountsResponse>(
        "/portal/student/discounts",
      );
      const parsed = res.data;
      if (!parsed.success) throw new Error(parsed.message);
      return parsed.data;
    },
  });

  if (isPending) return <DiscountsSkeleton />;

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong fetching your discounts.";
    return (
      <SectionError title="Discounts" message={message} onRetry={refetch} />
    );
  }

  return (
    <DashboardSection
      title="Discounts"
      badge={
        data.length > 0
          ? `${formatNPR(data.reduce((s, d) => s + d.amount, 0) / 100)} saved`
          : undefined
      }
    >
      {data.length === 0 ? (
        <DiscountsEmpty />
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.map((d) => (
            <DiscountRow key={d.id} discount={d} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
