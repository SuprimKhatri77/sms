// components/admin/students-skeleton.tsx
export function StudentsPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f4f1ec] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-32 rounded-xl bg-[#2d4a3e]/10" />
            <div className="h-4 w-24 rounded-lg bg-[#2d4a3e]/07" />
          </div>
          <div className="h-8 w-28 rounded-xl bg-[#2d4a3e]/08" />
        </div>

        {/* Search + filter bar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="h-11 flex-1 rounded-xl bg-[#2d4a3e]/08" />
          <div className="h-11 w-36 rounded-xl bg-[#2d4a3e]/08" />
          <div className="h-11 w-36 rounded-xl bg-[#2d4a3e]/08" />
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          {/* Table head */}
          <div className="flex items-center gap-4 border-b border-[#2d4a3e]/08 bg-[#f4f1ec]/60 px-5 py-3.5">
            {[80, 140, 110, 160, 90, 70, 40].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded-md bg-[#2d4a3e]/12"
                style={{ width: w }}
              />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[#2d4a3e]/06 px-5 py-4 last:border-b-0"
            >
              {/* Reference */}
              <div className="h-3.5 w-[80px] rounded-md bg-[#2d4a3e]/07" />
              {/* Name */}
              <div className="h-3.5 w-[140px] rounded-md bg-[#2d4a3e]/10" />
              {/* Phone */}
              <div className="h-3.5 w-[110px] rounded-md bg-[#2d4a3e]/07" />
              {/* Courses — pill group */}
              <div className="flex gap-1.5">
                <div className="h-5 w-14 rounded-full bg-[#2d4a3e]/08" />
                {i % 3 !== 0 && (
                  <div className="h-5 w-16 rounded-full bg-[#2d4a3e]/08" />
                )}
              </div>
              {/* Claimed */}
              <div className="h-3.5 w-[90px] rounded-md bg-[#2d4a3e]/07" />
              {/* Status badge */}
              <div className="h-5 w-16 rounded-full bg-[#2d4a3e]/08" />
              {/* View btn */}
              <div className="ml-auto h-7 w-12 rounded-lg bg-[#2d4a3e]/07" />
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#2d4a3e]/08 px-5 py-4">
            <div className="h-3.5 w-40 rounded-md bg-[#2d4a3e]/08" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-8 rounded-lg bg-[#2d4a3e]/08" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
