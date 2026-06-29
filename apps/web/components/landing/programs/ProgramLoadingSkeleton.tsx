import { landingContainerClass } from "../landing-styles";

export default function ProgramsSkeleton() {
  return (
    <section className="relative overflow-hidden bg-(--brand-cream) px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(47,78,64,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,78,64,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className={landingContainerClass}>
        <div className="mb-14 max-w-2xl">
          <div className="mb-4 h-2.5 w-24 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="mb-3 h-10 w-72 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="mb-2 h-10 w-52 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="h-4 w-full max-w-md animate-pulse bg-[rgba(47,78,64,0.05)]" />
        </div>

        <div className="mb-6 border border-[rgba(47,78,64,0.08)] bg-white">
          <div className="h-1 w-full animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
            <div className="p-8">
              <div className="mb-6 h-14 w-14 animate-pulse border border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.04)]" />
              <div className="mb-3 h-8 w-48 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              <div className="mb-5 h-4 w-full animate-pulse bg-[rgba(47,78,64,0.05)]" />
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-3 animate-pulse bg-[rgba(47,78,64,0.05)]" />
                ))}
              </div>
            </div>
            <div className="border-t border-[rgba(47,78,64,0.06)] p-8 lg:border-t-0 lg:border-l">
              <div className="mb-6 h-9 w-32 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              <div className="h-11 w-full animate-pulse border border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.04)]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="mt-14 border border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.03)] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-64 animate-pulse bg-[rgba(47,78,64,0.08)]" />
              <div className="h-4 w-80 max-w-full animate-pulse bg-[rgba(47,78,64,0.05)]" />
            </div>
            <div className="h-11 w-44 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-full flex-col border border-[rgba(47,78,64,0.08)] bg-white">
      <div className="h-1 w-full animate-pulse bg-[rgba(47,78,64,0.06)]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 h-11 w-11 animate-pulse border border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.04)]" />
        <div className="mb-2 h-3 w-28 animate-pulse bg-[rgba(47,78,64,0.06)]" />
        <div className="mb-3 h-7 w-28 animate-pulse bg-[rgba(47,78,64,0.08)]" />
        <div className="mb-5 h-3 w-full animate-pulse bg-[rgba(47,78,64,0.05)]" />
        <div className="mt-auto border-t border-[rgba(47,78,64,0.06)] pt-4">
          <div className="mb-4 h-7 w-24 animate-pulse bg-[rgba(47,78,64,0.08)]" />
          <div className="h-10 w-full animate-pulse border border-[rgba(47,78,64,0.08)] bg-[rgba(47,78,64,0.04)]" />
        </div>
      </div>
    </div>
  );
}
