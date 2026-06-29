"use client";

import api from "@/lib/axios";
import { GetStudentPortalScholarshipResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { Award, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardSection } from "./DashboardSection";
import {
  dashboardBadgeClass,
  dashboardCardClass,
  dashboardMoneyClass,
  dashboardPrimaryBtnClass,
} from "./dashboard-styles";

interface ScholarshipItem {
  percent: number;
  amount: number;
  note: string | null;
  createdAt: string;
}

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

function ScholarshipSkeleton() {
  return (
    <DashboardSection title="Scholarship">
      <Shimmer className="h-[120px]" />
    </DashboardSection>
  );
}

function ScholarshipEmpty() {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex flex-col items-center gap-3 px-5 py-10 text-center",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center bg-[#f4f1ec]">
        <Award className="h-[22px] w-[22px] text-[rgba(47,78,64,0.25)]" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-playfair)] text-[0.92rem] font-semibold text-[rgba(47,78,64,0.45)]">
          No scholarship awarded
        </p>
        <p className="mx-auto mt-1 max-w-[200px] font-[family-name:var(--font-dm-sans)] text-[0.75rem] leading-relaxed text-[rgba(47,78,64,0.35)]">
          A scholarship awarded to your account will appear here.
        </p>
      </div>
    </div>
  );
}

function ScholarshipCard({ scholarship }: { scholarship: ScholarshipItem }) {
  return (
    <div className="relative overflow-hidden border border-[rgba(47,78,64,0.16)] bg-[#f6f9f7] p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-(--brand-green) to-transparent opacity-40" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-[rgba(47,78,64,0.1)]">
            <Award className="h-[18px] w-[18px] text-(--brand-green)" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-playfair)] text-[0.92rem] font-bold leading-snug text-(--brand-green)">
              Merit scholarship
            </p>
            {scholarship.note ? (
              <p className="mt-0.5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] leading-snug text-[rgba(47,78,64,0.5)]">
                {scholarship.note}
              </p>
            ) : null}
            <p className="mt-1.5 font-[family-name:var(--font-dm-sans)] text-[0.72rem] text-[rgba(47,78,64,0.38)]">
              Awarded {formatDate(scholarship.createdAt)}
            </p>
          </div>
        </div>

        <div className="shrink-0 space-y-1.5 text-right">
          <p className={cn("text-[1rem] text-(--brand-green)", dashboardMoneyClass)}>
            {formatNPR(scholarship.amount / 100)}
          </p>
          <span
            className={cn(
              dashboardBadgeClass,
              "border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.08)] px-2.5 py-0.5 text-(--brand-green)",
            )}
          >
            {scholarship.percent}% awarded
          </span>
        </div>
      </div>
    </div>
  );
}

export function Scholarship() {
  const { data, isPending, refetch, isError, error } = useQuery({
    queryKey: ["student-portal-scholarship"],
    queryFn: async () => {
      const res = await api.get<GetStudentPortalScholarshipResponse>(
        "/portal/student/scholarship",
      );
      const parsed = res.data;
      if (!parsed.success) throw new Error(parsed.message);
      return parsed.data;
    },
  });

  if (isPending) return <ScholarshipSkeleton />;

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong fetching your scholarship details.";
    return (
      <SectionError title="Scholarship" message={message} onRetry={refetch} />
    );
  }

  return (
    <DashboardSection title="Scholarship">
      {data ? <ScholarshipCard scholarship={data} /> : <ScholarshipEmpty />}
    </DashboardSection>
  );
}
