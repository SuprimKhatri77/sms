// components/admin/student-detail-skeleton.tsx
export function StudentDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f4f1ec] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#2d4a3e]/10" />
            <div className="flex flex-col gap-2">
              <div className="h-6 w-44 rounded-xl bg-[#2d4a3e]/12" />
              <div className="h-3.5 w-32 rounded-lg bg-[#2d4a3e]/07" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-20 rounded-full bg-[#2d4a3e]/08" />
            <div className="h-9 w-32 rounded-xl bg-[#2d4a3e]/12" />
            <div className="h-9 w-32 rounded-xl bg-[#2d4a3e]/08" />
          </div>
        </div>

        {/* Stat row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <div className="mb-2 h-2.5 w-16 rounded-md bg-[#2d4a3e]/10" />
              <div className="mb-1.5 h-5 w-28 rounded-lg bg-[#2d4a3e]/12" />
              <div className="h-2.5 w-14 rounded-md bg-[#2d4a3e]/07" />
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left col */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Personal info card */}
            <SkeletonCard rows={6} twoCol />

            {/* Guardian card */}
            <SkeletonCard rows={2} twoCol />

            {/* Payments card */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              {/* Card header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#2d4a3e]/08" />
                  <div className="h-4 w-32 rounded-lg bg-[#2d4a3e]/10" />
                </div>
                <div className="h-7 w-14 rounded-lg bg-[#2d4a3e]/08" />
              </div>
              {/* Payment rows */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center justify-between rounded-xl border border-[#2d4a3e]/08 bg-[#f4f1ec]/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#2d4a3e]/08" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3.5 w-24 rounded-md bg-[#2d4a3e]/10" />
                      <div className="h-2.5 w-36 rounded-md bg-[#2d4a3e]/07" />
                    </div>
                  </div>
                  <div className="h-3 w-14 rounded-md bg-[#2d4a3e]/07" />
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-5">
            {/* Courses card */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#2d4a3e]/08" />
                <div className="h-4 w-28 rounded-lg bg-[#2d4a3e]/10" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center justify-between rounded-xl border border-[#2d4a3e]/08 bg-[#f4f1ec]/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-[#2d4a3e]/15" />
                    <div className="h-3.5 w-20 rounded-md bg-[#2d4a3e]/10" />
                  </div>
                  <div className="h-3.5 w-16 rounded-md bg-[#2d4a3e]/08" />
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between border-t border-[#2d4a3e]/08 pt-3">
                <div className="h-3 w-10 rounded-md bg-[#2d4a3e]/08" />
                <div className="h-4 w-20 rounded-md bg-[#2d4a3e]/10" />
              </div>
            </div>

            {/* Enrollment details card */}
            <SkeletonCard rows={3} />

            {/* Notes card */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#2d4a3e]/08" />
                <div className="h-4 w-24 rounded-lg bg-[#2d4a3e]/10" />
              </div>
              <div className="rounded-xl bg-amber-50/60 px-4 py-3">
                <div className="mb-2 h-3 w-full rounded-md bg-amber-200/60" />
                <div className="mb-2 h-3 w-4/5 rounded-md bg-amber-200/60" />
                <div className="h-3 w-2/3 rounded-md bg-amber-200/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared inner helper ───────────────────────────────────────────────────────

function SkeletonCard({ rows, twoCol }: { rows: number; twoCol?: boolean }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      {/* Card title */}
      <div className="mb-5 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-[#2d4a3e]/08" />
        <div className="h-4 w-36 rounded-lg bg-[#2d4a3e]/10" />
      </div>
      <div
        className={`grid gap-4 ${twoCol ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-[#2d4a3e]/07" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-16 rounded-md bg-[#2d4a3e]/08" />
              <div
                className="h-3.5 rounded-md bg-[#2d4a3e]/10"
                style={{ width: `${100 + ((i * 37) % 80)}px` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
