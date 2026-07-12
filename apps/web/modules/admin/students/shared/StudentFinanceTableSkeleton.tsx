import type { FinanceTableColumn } from "./student-finance-table-layout";

const skClass = "animate-pulse bg-[rgba(47,78,64,0.08)]";

function FinanceTableSkeletonCell({
  column,
}: {
  column: FinanceTableColumn;
}) {
  if (column.skeleton === "student") {
    return (
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 shrink-0 ${skClass}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className={`h-3.5 w-32 max-w-full ${skClass}`} />
          <div className={`h-3 w-40 max-w-full bg-[rgba(47,78,64,0.06)] animate-pulse`} />
          <div className={`h-2.5 w-28 max-w-full bg-[rgba(47,78,64,0.05)] animate-pulse`} />
        </div>
      </div>
    );
  }

  if (column.skeleton === "text-right") {
    return (
      <div
        className={`ml-auto h-3.5 ${skClass} ${
          column.key === "amount" ? "w-24" : "w-14"
        }`}
      />
    );
  }

  if (column.skeleton === "date") {
    return <div className={`h-3.5 w-24 ${skClass}`} />;
  }

  return <div className={`h-3.5 w-32 max-w-full ${skClass}`} />;
}

export function StudentFinanceTableSkeleton({
  rows = 8,
  columns,
}: {
  rows?: number;
  columns: FinanceTableColumn[];
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[rgba(47,78,64,0.08)]">
          {columns.map((column) => (
            <td
              key={column.key}
              className={`px-5 py-4 ${column.cellClassName ?? ""} ${
                column.align === "right" ? "text-right" : ""
              }`}
            >
              <FinanceTableSkeletonCell column={column} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function StudentFinanceMobileSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-[rgba(47,78,64,0.1)] p-4 last:border-b-0"
        >
          <div className="mb-3 flex gap-3">
            <div className={`h-10 w-10 shrink-0 ${skClass}`} />
            <div className="flex flex-1 flex-col gap-2">
              <div className={`h-3.5 w-2/5 ${skClass}`} />
              <div className="h-3 w-3/5 animate-pulse bg-[rgba(47,78,64,0.06)]" />
            </div>
          </div>
          <div className="flex flex-col gap-2 pl-[52px]">
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className="h-3 w-1/2 animate-pulse bg-[rgba(47,78,64,0.06)]"
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
