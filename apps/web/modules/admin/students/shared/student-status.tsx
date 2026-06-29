import { cn } from "@/lib/utils";

export type StudentStatus = "pending" | "active" | "completed" | "rejected";

export const STUDENT_STATUS_META: Record<
  StudentStatus,
  { label: string; accent: string; classes: string }
> = {
  pending: {
    label: "Pending",
    accent: "bg-amber-400",
    classes:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  active: {
    label: "Active",
    accent: "bg-emerald-500",
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  completed: {
    label: "Completed",
    accent: "bg-blue-400",
    classes:
      "border-blue-200 bg-blue-50 text-blue-800",
  },
  rejected: {
    label: "Rejected",
    accent: "bg-red-400",
    classes:
      "border-red-200 bg-red-50 text-red-800",
  },
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const meta = STUDENT_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em]",
        meta.classes,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.accent)} />
      {meta.label}
    </span>
  );
}
