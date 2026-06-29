"use client";

import { admissionWizardShellClass } from "./admission-styles";
import { landingContainerClass } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

export function AdmissionSkeleton() {
  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <main className="min-h-screen bg-(--brand-cream) pb-16 pt-24">
      <div className={cn(landingContainerClass, "px-4 sm:px-6")}>
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-10 lg:mb-14">
            <div className={`mb-4 h-3 w-36 bg-[rgba(47,78,64,0.08)] ${shimmer}`} />
            <div className={`h-12 w-full max-w-lg bg-[rgba(47,78,64,0.08)] ${shimmer}`} />
            <div className={`mt-4 h-4 w-full max-w-xl bg-[rgba(47,78,64,0.05)] ${shimmer}`} />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-24 border border-[rgba(47,78,64,0.08)] bg-white ${shimmer}`}
                />
              ))}
            </div>
          </header>

          <div className={`mb-5 h-3 w-32 bg-[rgba(47,78,64,0.08)] ${shimmer}`} />

          <div className={cn(admissionWizardShellClass, "lg:min-h-[720px]")}>
            <div className="shrink-0 bg-[rgba(47,78,64,0.15)] p-6 sm:p-8 lg:w-[320px] xl:w-[360px]">
              <div className={`mb-4 h-3 w-28 bg-[rgba(255,255,255,0.15)] ${shimmer}`} />
              <div className={`h-10 w-10 bg-[rgba(255,255,255,0.1)] ${shimmer}`} />
              <div className={`mt-4 h-7 w-48 bg-[rgba(255,255,255,0.12)] ${shimmer}`} />
              <div className={`mt-5 h-1 w-full bg-[rgba(255,255,255,0.08)] ${shimmer}`} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col bg-white">
              <div className="flex-1 p-6 sm:p-8 lg:p-10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-2">
                    <div className={`h-3 w-20 bg-[rgba(47,78,64,0.08)] ${shimmer}`} />
                    <div className={`h-11 w-full bg-[rgba(47,78,64,0.05)] ${shimmer}`} />
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn("space-y-2", i === 1 && "sm:col-span-2")}
                    >
                      <div className={`h-3 w-16 bg-[rgba(47,78,64,0.08)] ${shimmer}`} />
                      <div className={`h-11 w-full bg-[rgba(47,78,64,0.05)] ${shimmer}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end border-t border-[rgba(47,78,64,0.08)] px-6 py-5 sm:px-8 lg:px-10">
                <div className={`h-11 w-32 bg-[rgba(47,78,64,0.08)] ${shimmer}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
