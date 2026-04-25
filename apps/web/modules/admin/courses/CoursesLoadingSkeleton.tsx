const SKELETON_ROWS = 5;

export function CoursesLoading() {
  return (
    <div className="max-w-240 mx-auto p-8 px-4">
      {/* Toolbar skeleton */}
      <div className="mb-4 h-9 w-64 animate-pulse rounded-lg bg-gray-200" />

      {/* Table card skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header row */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex gap-4">
            <div className="h-3 w-40 animate-pulse rounded bg-gray-300" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
            <div className="h-3 w-16 animate-pulse rounded bg-gray-300" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
            <div className="h-3 w-16 animate-pulse rounded bg-gray-300" />
          </div>
        </div>

        {/* Body rows */}
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-none"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="h-4 flex-3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 flex-[1.5] animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-10 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200" />
              <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
