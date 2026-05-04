"use client";

interface AdmissionSkeletonProps {
  currentStep?: number;
}

export function AdmissionSkeleton({ currentStep = 0 }: AdmissionSkeletonProps) {
  const STEPS = ["Personal", "Guardian", "Course", "Review"];

  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <main className="min-h-screen bg-(--brand-cream) px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        {/* Back link skeleton */}
        <div className={`mb-8 h-4 w-32 rounded-lg bg-gray-200 ${shimmer}`} />

        {/* Header skeleton */}
        <div className="mb-10">
          <div className={`mb-2 h-3 w-40 rounded-lg bg-gray-200 ${shimmer}`} />
          <div className={`h-12 w-64 rounded-lg bg-gray-200 ${shimmer}`} />
        </div>

        {/* Step indicator skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {STEPS.map((_, idx) => (
              <div key={idx} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-8 w-8 rounded-full bg-gray-200 ${shimmer}`}
                  />
                  <div
                    className={`hidden h-3 w-16 rounded-lg bg-gray-200 sm:block ${shimmer}`}
                  />
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 rounded-full bg-gray-200 sm:mx-2 ${shimmer}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card skeleton */}
        <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)] sm:p-10">
          {/* Step title */}
          <div className={`mb-6 flex items-center gap-3`}>
            <div className={`h-6 w-6 rounded-lg bg-gray-200 ${shimmer}`} />
            <div className={`h-6 w-40 rounded-lg bg-gray-200 ${shimmer}`} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name field */}
            <div className="sm:col-span-2 space-y-2">
              <div className={`h-3 w-24 rounded-lg bg-gray-200 ${shimmer}`} />
              <div
                className={`h-11 w-full rounded-xl bg-gray-100 ${shimmer}`}
              />
            </div>

            {/* Date of Birth field */}
            <div className="space-y-2">
              <div className={`h-3 w-32 rounded-lg bg-gray-200 ${shimmer}`} />
              <div
                className={`h-11 w-full rounded-xl bg-gray-100 ${shimmer}`}
              />
            </div>

            {/* Gender field (tiles) */}
            <div className="space-y-2">
              <div className={`h-3 w-16 rounded-lg bg-gray-200 ${shimmer}`} />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-10 rounded-lg bg-gray-100 ${shimmer}`}
                  />
                ))}
              </div>
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <div className={`h-3 w-20 rounded-lg bg-gray-200 ${shimmer}`} />
              <div
                className={`h-11 w-full rounded-xl bg-gray-100 ${shimmer}`}
              />
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <div className={`h-3 w-16 rounded-lg bg-gray-200 ${shimmer}`} />
              <div
                className={`h-11 w-full rounded-xl bg-gray-100 ${shimmer}`}
              />
            </div>

            {/* Address field */}
            <div className="sm:col-span-2 space-y-2">
              <div className={`h-3 w-20 rounded-lg bg-gray-200 ${shimmer}`} />
              <div
                className={`h-24 w-full rounded-xl bg-gray-100 ${shimmer}`}
              />
            </div>

            {/* Photo upload field */}
            <div className="sm:col-span-2 space-y-2">
              <div className={`h-3 w-16 rounded-lg bg-gray-200 ${shimmer}`} />
              <div
                className={`h-20 w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 ${shimmer}`}
              />
            </div>
          </div>

          {/* Navigation buttons skeleton */}
          <div className="mt-8 flex justify-end gap-3">
            <div className={`h-11 w-24 rounded-xl bg-gray-200 ${shimmer}`} />
            <div className={`h-11 w-32 rounded-xl bg-gray-200 ${shimmer}`} />
          </div>
        </div>
      </div>
    </main>
  );
}
