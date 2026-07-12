import {
  landingContainerClass,
  landingCreamSectionClass,
  landingMutedSectionClass,
} from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

export function CertificateVerificationSkeleton() {
  return (
    <main className="min-h-screen bg-(--brand-cream)">
      <section className={cn(landingCreamSectionClass, "pb-12 pt-28 sm:pt-32")}>
        <div className={landingContainerClass}>
          <div className="max-w-3xl text-left">
            <div className="mb-4 h-3 w-32 animate-pulse bg-[rgba(47,78,64,0.1)]" />
            <div className="mb-4 h-10 w-4/5 max-w-lg animate-pulse bg-[rgba(47,78,64,0.08)]" />
            <div className="mb-2 h-4 w-full max-w-xl animate-pulse bg-[rgba(47,78,64,0.06)]" />
            <div className="h-4 w-3/4 max-w-md animate-pulse bg-[rgba(47,78,64,0.06)]" />
          </div>

          <div className="mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border border-[rgba(47,78,64,0.1)] bg-white p-4"
              >
                <div className="mb-2 h-3 w-16 animate-pulse bg-[rgba(47,78,64,0.08)]" />
                <div className="h-4 w-24 animate-pulse bg-[rgba(47,78,64,0.1)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6">
        <div className={landingContainerClass}>
          <div className="mb-6 h-4 w-48 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="mx-auto max-w-[794px] overflow-hidden border border-[rgba(47,78,64,0.12)] bg-white p-4 shadow-[0_24px_64px_rgba(47,78,64,0.08)] sm:p-6">
            <div className="h-[794px] w-full animate-pulse bg-[rgba(47,78,64,0.05)]" />
          </div>
        </div>
      </section>

      <section className={cn(landingMutedSectionClass, "pt-16")}>
        <div className={cn(landingContainerClass, "max-w-3xl text-left")}>
          <div className="mb-4 h-8 w-56 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="mb-2 h-4 w-full animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="mb-2 h-4 w-5/6 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="mt-8 h-12 w-40 animate-pulse bg-[rgba(47,78,64,0.08)]" />
        </div>
      </section>
    </main>
  );
}
