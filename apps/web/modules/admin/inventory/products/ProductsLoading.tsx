import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-[var(--brand-ink)]/8 rounded" />
          <Skeleton className="h-4 w-72 bg-[var(--brand-ink)]/5 rounded" />
        </div>
        <Skeleton className="h-10 w-36 bg-[var(--brand-ink)]/8 rounded" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-[var(--brand-ink)]/10 overflow-hidden">
        {/* Table header */}
        <div className="bg-[var(--brand-green)] px-4 py-3 grid grid-cols-4 gap-4">
          {["Name", "Unit", "Created At", "Actions"].map((col) => (
            <Skeleton
              key={col}
              className="h-4 bg-white/20 rounded"
              style={{
                width: col === "Actions" ? "60%" : "70%",
                marginLeft: col === "Actions" ? "auto" : undefined,
              }}
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`px-4 py-3.5 grid grid-cols-4 gap-4 items-center border-t border-[var(--brand-ink)]/6 ${
              i % 2 === 0 ? "bg-white" : "bg-[var(--brand-cream)]"
            }`}
          >
            <Skeleton className="h-4 w-3/4 bg-[var(--brand-ink)]/8 rounded" />
            <Skeleton className="h-4 w-1/2 bg-[var(--brand-ink)]/6 rounded" />
            <Skeleton className="h-4 w-2/3 bg-[var(--brand-ink)]/6 rounded" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 bg-[var(--brand-ink)]/8 rounded" />
              <Skeleton className="h-8 w-8 bg-[var(--brand-ink)]/8 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <Skeleton className="h-4 w-44 bg-[var(--brand-ink)]/6 rounded" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-10 bg-[var(--brand-ink)]/8 rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
