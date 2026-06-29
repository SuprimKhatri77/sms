import { cn } from "@/lib/utils";
import { detailPanelClass } from "./detail-styles";

function Skel({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[rgba(47,78,64,0.08)]", className)}
      aria-hidden
    />
  );
}

function SectionCardSkel({
  titleWidth = "w-28",
  action,
  children,
}: {
  titleWidth?: string;
  action?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={detailPanelClass}>
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Skel className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
          <Skel className={cn("h-4", titleWidth)} />
        </div>
        {action ? <Skel className="h-8 w-24 shrink-0" /> : null}
      </div>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

function FieldRowSkel({
  labelWidth = "w-20",
  valueWidth = "w-36",
}: {
  labelWidth?: string;
  valueWidth?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Skel className={cn("h-3", labelWidth)} />
      <Skel className={cn("h-4", valueWidth)} />
    </div>
  );
}

function InsetRowSkel({ valueWidth = "w-32" }: { valueWidth?: string }) {
  return (
    <div className="border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.02)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skel className="h-2 w-2 shrink-0" />
          <Skel className="h-4 w-40" />
        </div>
        <Skel className={cn("h-4", valueWidth)} />
      </div>
    </div>
  );
}

export function StudentDetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-(--brand-cream) px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-8xl space-y-5">
        {/* Header */}
        <div className={detailPanelClass}>
          <div className="border-b border-[rgba(47,78,64,0.12)] px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <Skel className="h-4 w-28" />
              <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skel key={i} className="h-9 w-full sm:w-28" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center">
            <div className="relative w-fit shrink-0 self-start">
              <Skel className="h-20 w-20 rounded-full sm:h-24 sm:w-24" />
              <Skel className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2 border-white" />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Skel className="h-8 w-52 max-w-full" />
                <Skel className="h-6 w-20" />
              </div>
              <Skel className="h-4 w-64 max-w-full" />
              <div className="flex flex-wrap gap-2">
                <Skel className="h-6 w-24" />
                <Skel className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Finance bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-px border border-[rgba(47,78,64,0.18)] bg-[rgba(47,78,64,0.18)] lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 bg-white px-5 py-4">
                <Skel className="h-3 w-16" />
                <Skel className="h-7 w-24" />
                <Skel className="h-3 w-20" />
              </div>
            ))}
          </div>

          <div className="border border-[rgba(47,78,64,0.18)] bg-white px-5 py-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Skel className="h-3 w-28" />
              <Skel className="h-3 w-20" />
            </div>
            <Skel className="h-2 w-full" />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <SectionCardSkel titleWidth="w-32" action>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <FieldRowSkel
                    key={i}
                    labelWidth={i % 2 === 0 ? "w-24" : "w-20"}
                    valueWidth={i % 2 === 0 ? "w-40" : "w-28"}
                  />
                ))}
              </div>
            </SectionCardSkel>

            <SectionCardSkel titleWidth="w-24" action>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <FieldRowSkel
                    key={i}
                    labelWidth="w-24"
                    valueWidth={i === 1 ? "w-48" : "w-32"}
                  />
                ))}
              </div>
            </SectionCardSkel>

            <SectionCardSkel titleWidth="w-36" action>
              <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <Skel className="h-4 w-32" />
                <Skel className="h-8 w-28" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.02)] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <Skel className="h-4 w-24" />
                        <Skel className="h-3 w-36" />
                      </div>
                      <Skel className="h-8 w-16 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCardSkel>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <SectionCardSkel titleWidth="w-28">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skel key={i} className="h-10 w-full" />
                ))}
              </div>
              <Skel className="mt-4 h-9 w-full sm:ml-auto sm:w-32" />
            </SectionCardSkel>

            <SectionCardSkel titleWidth="w-36">
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <InsetRowSkel key={i} valueWidth="w-20" />
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-[rgba(47,78,64,0.12)] pt-3">
                  <Skel className="h-3 w-12" />
                  <Skel className="h-5 w-24" />
                </div>
              </div>
            </SectionCardSkel>

            <SectionCardSkel titleWidth="w-40">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <FieldRowSkel
                    key={i}
                    labelWidth="w-28"
                    valueWidth="w-24"
                  />
                ))}
              </div>
            </SectionCardSkel>

            <SectionCardSkel titleWidth="w-24" action>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <Skel className="h-10 w-10 rounded-full" />
                <Skel className="h-4 w-40" />
                <Skel className="h-8 w-28" />
              </div>
            </SectionCardSkel>

            <SectionCardSkel titleWidth="w-28" action>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <Skel className="h-10 w-10 rounded-full" />
                <Skel className="h-4 w-44" />
                <Skel className="h-8 w-36" />
              </div>
            </SectionCardSkel>
          </div>
        </div>
      </div>
    </div>
  );
}
