"use client";

import { useRouter } from "next/navigation";
import type { SalesStudent } from "./types/sales";
import { formatNpr, getPaymentProgressPct } from "../shared/student-utils";
import { StudentInitialsAvatar } from "../shared/StudentInitialsAvatar";
import { cn } from "@/lib/utils";

function CollectedCell({
  amount,
  progressPct,
}: {
  amount: number;
  progressPct: number;
}) {
  return (
    <div className="inline-flex flex-col items-end gap-1.5">
      <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold tabular-nums text-(--brand-green)">
        {formatNpr(amount)}
      </span>
      <div className="h-1 w-20 overflow-hidden bg-[rgba(47,78,64,0.1)]">
        <div
          className="h-full bg-(--brand-brown) transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <span className="font-[family-name:var(--font-dm-sans)] text-[11px] tabular-nums text-[rgba(47,78,64,0.45)]">
        {Math.round(progressPct)}%
      </span>
    </div>
  );
}

function RemainingCell({ amount }: { amount: number }) {
  if (amount <= 0) {
    return (
      <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-emerald-800">
        Cleared
      </span>
    );
  }

  return (
    <span className="font-[family-name:var(--font-dm-sans)] text-sm font-bold tabular-nums text-[#9a3412]">
      {formatNpr(amount)}
    </span>
  );
}

export function SalesTableSkeleton() {
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
              className="border-b border-[rgba(47,78,64,0.1)] px-5 py-4 text-right"
            >
              <div className="ml-auto h-3.5 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface SalesTableRowProps {
  student: SalesStudent;
}

export function SalesTableRow({ student }: SalesTableRowProps) {
  const router = useRouter();
  const progressPct = getPaymentProgressPct(student);

  const tdClass =
    "border-b border-[rgba(47,78,64,0.1)] px-5 py-4 align-middle whitespace-nowrap group-last:border-b-0";
  const tdRightClass = cn(tdClass, "text-right");

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

      <td className={tdRightClass}>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatNpr(student.totalCourseFee / 100)}
        </span>
      </td>

      <td className={tdRightClass}>
        <CollectedCell
          amount={student.totalPaid / 100}
          progressPct={progressPct}
        />
      </td>

      <td className={tdRightClass}>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatNpr(student.totalDiscount / 100)}
        </span>
      </td>

      <td className={tdRightClass}>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatNpr(student.totalScholarship / 100)}
        </span>
      </td>

      <td className={tdRightClass}>
        <RemainingCell amount={student.outstanding / 100} />
      </td>
    </tr>
  );
}
