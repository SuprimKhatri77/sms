import { cn } from "@/lib/utils";
import { admissionWizardShellClass } from "./admission-styles";

const bone = "skeleton-shimmer bg-surface";

export function AdmissionSkeleton() {
  return (
    <main
      aria-busy
      aria-label="Loading the admission form"
      className="bg-paper pt-10 pb-20 font-site sm:pt-14 sm:pb-28"
    >
      <div className="container-page">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-12 lg:mb-16">
            <div className={cn(bone, "h-3 w-32")} />
            <div className={cn(bone, "mt-10 h-3 w-36")} />
            <div className={cn(bone, "mt-5 h-14 w-full max-w-xl sm:h-20")} />
            <div className={cn(bone, "mt-6 h-4 w-full max-w-lg")} />
            <div className="mt-12 grid grid-cols-1 border-t border-hairline sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="space-y-3 border-b border-hairline py-5 sm:border-b-0 sm:py-6 sm:pr-6 sm:not-first:border-l sm:not-first:pl-6"
                >
                  <div className={cn(bone, "h-3 w-6")} />
                  <div className={cn(bone, "h-6 w-40")} />
                  <div className={cn(bone, "h-3 w-full max-w-56")} />
                </div>
              ))}
            </div>
          </header>

          <div className={cn(bone, "mb-5 h-3 w-32")} />

          <div className={cn(admissionWizardShellClass, "lg:min-h-[720px]")}>
            <div className="shrink-0 bg-pine p-6 sm:p-8 lg:w-[320px] xl:w-[360px] xl:p-10">
              <div className="h-3 w-28 bg-paper/10" />
              <div className="mt-6 h-3 w-20 bg-paper/10 lg:mt-10" />
              <div className="mt-3 h-9 w-48 bg-paper/15" />
              <div className="mt-8 hidden h-px w-full bg-paper/15 lg:block" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex-1 p-6 sm:p-8 lg:p-10">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn("space-y-2", i === 0 && "sm:col-span-2")}
                    >
                      <div className={cn(bone, "h-3 w-20")} />
                      <div className={cn(bone, "h-12 w-full")} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end border-t border-hairline px-6 py-5 sm:px-8 lg:px-10">
                <div className={cn(bone, "h-11 w-32")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
