import Link from "next/link";
import { ArrowUpRight, Hash, Phone } from "lucide-react";
import { ListStudent } from "@repo/types";
import { StudentStatusBadge, type StudentStatus } from "./shared/student-status";

export function StudentCard({
  student,
}: {
  student: Extract<ListStudent, { success: true }>["data"][number];
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white transition-colors hover:border-(--brand-green)">
      <div
        className={
          student.status === "pending"
            ? "h-0.5 bg-amber-400"
            : student.status === "active"
              ? "h-0.5 bg-emerald-500"
              : student.status === "completed"
                ? "h-0.5 bg-blue-400"
                : "h-0.5 bg-red-400"
        }
      />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-lora)] text-base font-bold text-(--brand-green)">
              {student.fullName}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Hash
                className="h-3 w-3 shrink-0 text-[rgba(47,78,64,0.35)]"
                strokeWidth={2}
              />
              <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium tracking-wide text-[rgba(47,78,64,0.45)]">
                {student.referenceNo}
              </span>
            </div>
          </div>
          <StudentStatusBadge status={student.status as StudentStatus} />
        </div>

        <div className="flex items-center gap-2.5 border border-[rgba(47,78,64,0.1)] bg-[rgba(47,78,64,0.02)] px-3 py-2">
          <Phone
            className="h-3.5 w-3.5 shrink-0 text-[rgba(47,78,64,0.4)]"
            strokeWidth={1.75}
          />
          <span className="font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.7)]">
            {student.phone}
          </span>
        </div>

        {student.courses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {student.courses.map((course) => (
              <span
                key={course}
                className="border border-[rgba(47,78,64,0.14)] bg-white px-2 py-0.5 font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]"
              >
                {course}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Link
        href={`/admin/students/${student.id}`}
        className="flex items-center justify-between border-t border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.02)] px-5 py-3 font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)] transition-colors group-hover:bg-(--brand-green) group-hover:text-white"
      >
        View profile
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2}
        />
      </Link>
    </article>
  );
}
