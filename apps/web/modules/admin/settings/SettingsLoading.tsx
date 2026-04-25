const SKELETON_ROWS = 4;

export function SettingsLoading() {
  return (
    <div className="max-w-[760px] mx-auto p-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Card skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Card header */}
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-300" />
        </div>

        {/* Rows */}
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 last:border-none"
            style={{ opacity: 1 - i * 0.2 }}
          >
            {/* Left: label + key badge */}
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Right: value pill + edit button */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-7 w-7 animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
