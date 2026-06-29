"use client";

import { useRouter } from "next/navigation";
import type { OutstandingStudent } from "./types/outstanding";
import { formatNpr, getPaymentProgressPct } from "../shared/student-utils";
import { StudentInitialsAvatar } from "../shared/StudentInitialsAvatar";
import { cn } from "@/lib/utils";

function OutstandingBadge({ amount }: { amount: number }) {
  const level = amount > 50000 ? "high" : amount > 20000 ? "mid" : "low";

  const levelClass = {
    high: "border-red-200 bg-red-50 text-[#9a3412]",
    mid: "border-amber-200 bg-amber-50 text-amber-900",
    low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[level];

  return (
    <span
      className={cn(
        "inline-block border px-2.5 py-1 font-[family-name:var(--font-dm-sans)] text-[13px] font-semibold tabular-nums",
        levelClass,
      )}
    >
      {formatNpr(amount)}
    </span>
  );
}

export function StudentTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          <td className="border-b border-[rgba(47,78,64,0.1)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-[120px] animate-pulse bg-[rgba(47,78,64,0.08)]" />
                <div className="h-3 w-[160px] animate-pulse bg-[rgba(47,78,64,0.06)]" />
              </div>
            </div>
          </td>
          {Array.from({ length: 5 }).map((__, j) => (
            <td
              key={j}
              className="border-b border-[rgba(47,78,64,0.1)] px-5 py-4"
            >
              <div className="h-3.5 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface StudentTableRowProps {
  student: OutstandingStudent;
}

export function StudentTableRow({ student }: StudentTableRowProps) {
  const router = useRouter();
  const progressPct = getPaymentProgressPct(student);

  const tdClass =
    "border-b border-[rgba(47,78,64,0.1)] px-5 py-4 align-middle whitespace-nowrap group-last:border-b-0";

  return (
    <tr
      onClick={() => router.push(`/admin/students/${student.studentId}`)}
      className="group cursor-pointer transition-colors hover:bg-[rgba(47,78,64,0.03)]"
    >
      <td className={tdClass}>
        <div className="flex items-center gap-3">
          <StudentInitialsAvatar name={student.name} />
          <div className="flex flex-col gap-0.5">
            <span className="whitespace-nowrap font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-(--brand-ink)">
              {student.name}
            </span>
            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
              {student.email}
            </span>
          </div>
        </div>
      </td>
      <td className={tdClass}>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatNpr(student.totalCourseFee / 100)}
        </span>
      </td>
      <td className={tdClass}>
        <div className="flex flex-col gap-1.5">
          <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium tabular-nums text-(--brand-green)">
            {formatNpr(student.totalPaid / 100)}
          </span>
          <div className="h-1 w-20 overflow-hidden bg-[rgba(47,78,64,0.1)]">
            <div
              className="h-full bg-(--brand-green) transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </td>
      <td className={tdClass}>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatNpr(student.totalDiscount / 100)}
        </span>
      </td>
      <td className={tdClass}>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatNpr(student.totalScholarship / 100)}
        </span>
      </td>
      <td className={tdClass}>
        <OutstandingBadge amount={student.outstanding / 100} />
      </td>
    </tr>
  );
}
