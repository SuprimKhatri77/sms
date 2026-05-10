import { Skeleton } from "@/components/ui/skeleton";
export default function SummaryLoading() {
  return (
    <div className="space-y-6 min-h-screen bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-[var(--brand-green)]/10" />
        <Skeleton className="h-4 w-80 bg-[var(--brand-green)]/6" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg bg-[var(--brand-green)]/6" />
      <div className="rounded-lg border border-[var(--brand-green)]/15 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-3 border-b border-[var(--brand-green)]/8"
          >
            {Array.from({ length: 10 }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-4 flex-1 bg-[var(--brand-green)]/8"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
