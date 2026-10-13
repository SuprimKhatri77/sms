import { cn } from "@/lib/utils";

const bone = "skeleton-shimmer bg-surface";

export function CertificateVerificationSkeleton() {
  return (
    <main
      aria-busy
      aria-label="Loading the certificate"
      className="bg-paper font-site"
    >
      <section className="container-page pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className={cn(bone, "h-3 w-48")} />
        <div className="mt-10 max-w-3xl">
          <div className={cn(bone, "h-3 w-36")} />
          <div className={cn(bone, "mt-5 h-14 w-4/5 max-w-xl sm:h-20")} />
          <div className={cn(bone, "mt-6 h-4 w-full max-w-xl")} />
          <div className={cn(bone, "mt-2 h-4 w-3/4 max-w-md")} />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.6fr)]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "space-y-3 bg-paper px-5 py-5",
                index === 4 && "sm:col-span-2 lg:col-span-1",
              )}
            >
              <div className={cn(bone, "h-3 w-20")} />
              <div className={cn(bone, "h-4 w-28")} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <div className={cn(bone, "mb-5 h-3 w-52")} />
        <div className="overflow-hidden border border-hairline bg-surface p-3 sm:p-6">
          <div className="mx-auto my-6 aspect-[794/1123] w-full max-w-[794px] bg-paper" />
        </div>
      </section>
    </main>
  );
}
