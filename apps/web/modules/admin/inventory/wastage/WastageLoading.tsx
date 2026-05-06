import { Skeleton } from "@/components/ui/skeleton";
export default function WastageLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-[var(--brand-green)]/10" />
        <Skeleton className="h-4 w-72 bg-[var(--brand-green)]/6" />
      </div>
      <div className="rounded-lg border border-[var(--brand-green)]/15 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-3 border-b border-[var(--brand-green)]/8"
          >
            {Array.from({ length: 7 }).map((_, j) => (
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
