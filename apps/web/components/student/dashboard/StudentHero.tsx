"use client";

import {
  Phone,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  Hash,
  Users,
  User,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { siteInfo } from "@/utils/site-info";
import { GetStudentOverviewResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardEyebrowClass,
  dashboardInsetClass,
  dashboardLabelClass,
  dashboardPrimaryBtnClass,
} from "./dashboard-styles";

type StudentOverview = Extract<
  GetStudentOverviewResponse,
  { success: true }
>["data"];

type Shift = StudentOverview["shift"];
type StudentStatus = StudentOverview["status"];

const SHIFT_LABEL: Record<Shift, string> = {
  morning: "Morning",
  day: "Day",
  evening: "Evening",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function InfoCell({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        dashboardInsetClass,
        highlight && "border-[rgba(194,138,79,0.2)] bg-[rgba(194,138,79,0.04)]",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            highlight ? "text-(--brand-brown)" : "text-[rgba(47,78,64,0.4)]",
          )}
          strokeWidth={1.75}
        />
        <p className={dashboardLabelClass}>{label}</p>
      </div>
      <p className="font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-medium leading-snug text-(--brand-green)">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: StudentStatus }) {
  const map = {
    active: "border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.06)] text-(--brand-green)",
    completed:
      "border-[rgba(194,138,79,0.22)] bg-[rgba(194,138,79,0.08)] text-(--brand-brown)",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.1em]",
        map[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" ? "bg-(--brand-green) animate-pulse" : "bg-(--brand-brown)",
        )}
      />
      {status === "active" ? "Active" : "Completed"}
    </span>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
    />
  );
}

function HeroLoadingSkeleton() {
  return (
    <section className={cn(dashboardCardClass, "overflow-hidden")}>
      <div className="border-b border-[rgba(47,78,64,0.08)] p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <Shimmer className="h-20 w-20 shrink-0 sm:h-[88px] sm:w-[88px]" />
          <div className="flex-1 space-y-3">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="h-8 w-56" />
            <Shimmer className="h-6 w-24" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Shimmer key={i} className="h-20" />
        ))}
      </div>
    </section>
  );
}

function HeroErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <section className={cn(dashboardCardClass, "p-8 text-center sm:p-10")}>
      <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-400" strokeWidth={1.75} />
      <p className="font-[family-name:var(--font-playfair)] text-[1.1rem] font-semibold text-(--brand-green)">
        Couldn&apos;t load your profile
      </p>
      <p className="mx-auto mt-2 max-w-sm font-[family-name:var(--font-dm-sans)] text-[0.86rem] text-[rgba(47,78,64,0.5)]">
        {message ?? "Something went wrong while fetching your details."}
      </p>
      <button type="button" onClick={onRetry} className={cn(dashboardPrimaryBtnClass, "mt-6")}>
        <RefreshCw className="h-4 w-4" strokeWidth={2} />
        Try again
      </button>
    </section>
  );
}

export function StudentHero() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["student-overview"],
    queryFn: async () => {
      const res = await api.get<GetStudentOverviewResponse>(
        "/portal/student/overview",
      );
      const parsed = res.data;
      if (!parsed.success) {
        throw new Error(parsed.message ?? "Failed to load student overview");
      }
      return parsed.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  if (isPending) return <HeroLoadingSkeleton />;
  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return <HeroErrorState message={message} onRetry={refetch} />;
  }

  const student = data;
  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className={cn(dashboardCardClass, "overflow-hidden")}>
      <div className="border-b border-[rgba(47,78,64,0.08)] bg-[#faf9f6] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="h-20 w-20 overflow-hidden border border-[rgba(47,78,64,0.12)] bg-white sm:h-[88px] sm:w-[88px]">
                {student.photoUrl ? (
                  <Image
                    src={student.photoUrl}
                    alt={student.fullName}
                    width={88}
                    height={88}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#f4f1ec]">
                    <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-(--brand-green)">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 border-2 border-[#faf9f6] bg-(--brand-green)" />
            </div>

            <div className="min-w-0">
              <p className={dashboardEyebrowClass}>{siteInfo.company.shortName}</p>
              <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-[clamp(1.4rem,3vw,1.85rem)] font-bold leading-tight text-(--brand-green)">
                {student.fullName}
              </h2>
              <div className="mt-3">
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex items-center gap-1.5 border border-[rgba(47,78,64,0.1)] bg-white px-3 py-1.5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-medium text-[rgba(47,78,64,0.55)]">
              <Hash className="h-3.5 w-3.5 text-(--brand-brown)" strokeWidth={2} />
              {student.referenceNo}
            </span>
            <span className="inline-flex items-center gap-1.5 border border-[rgba(47,78,64,0.1)] bg-white px-3 py-1.5 font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-medium text-[rgba(47,78,64,0.55)]">
              <Sparkles className="h-3.5 w-3.5 text-(--brand-green)" strokeWidth={2} />
              FY {student.fiscalYear}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
        <InfoCell icon={Phone} label="Phone" value={student.phone} />
        <InfoCell icon={Calendar} label="Date of birth" value={student.dobBs} />
        <InfoCell
          icon={User}
          label="Gender"
          value={student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
        />
        <InfoCell icon={MapPin} label="Address" value={student.address} />
        <InfoCell
          icon={Clock}
          label="Shift"
          value={`${SHIFT_LABEL[student.shift]} · ${student.shiftTime}`}
          highlight
        />
        <InfoCell
          icon={BookOpen}
          label="Batch"
          value={student.batch ?? "—"}
          highlight
        />
        <InfoCell
          icon={Users}
          label="Guardian"
          value={`${student.guardianName} · ${student.guardianPhone}`}
        />
        <InfoCell
          icon={Hash}
          label="Enrolled since"
          value={formatDate(student.createdAt)}
          highlight
        />
      </div>
    </section>
  );
}
