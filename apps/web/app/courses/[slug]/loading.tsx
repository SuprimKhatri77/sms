import {
  courseContainerClass,
  courseCreamSection,
  courseMutedSection,
  courseSectionClass,
} from "@/components/courses/course-styles";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <main className="min-h-screen bg-(--brand-cream)">
      {/* Hero */}
      <section className="relative overflow-hidden bg-(--brand-green) px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className={cn(courseContainerClass, "relative")}>
          <div className="mb-8 h-4 w-28 animate-pulse bg-white/10" />
          <div className="mb-6 flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse bg-white/10" />
            <div className="h-7 w-36 animate-pulse bg-white/10" />
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <div className="mb-4 h-12 w-3/4 animate-pulse bg-white/10" />
              <div className="mb-2 h-4 w-full animate-pulse bg-white/8" />
              <div className="mb-2 h-4 w-[90%] animate-pulse bg-white/8" />
              <div className="mb-8 h-4 w-[75%] animate-pulse bg-white/8" />
              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-36 animate-pulse bg-white/10" />
                <div className="h-12 w-44 animate-pulse bg-white/8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 h-4 w-4 animate-pulse bg-white/10" />
                  <div className="mb-1.5 h-3 w-16 animate-pulse bg-white/8" />
                  <div className="h-4 w-24 animate-pulse bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky nav */}
      <div className="sticky top-0 z-30 border-b border-[rgba(47,78,64,0.08)] bg-(--brand-cream)/95 px-6 py-3 backdrop-blur-sm">
        <div className={cn(courseContainerClass, "flex gap-4 overflow-hidden")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-20 shrink-0 animate-pulse bg-black/8"
            />
          ))}
        </div>
      </div>

      {/* Video */}
      <section className={cn(courseSectionClass, courseCreamSection)}>
        <div className={courseContainerClass}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-3 h-3 w-32 animate-pulse bg-black/10" />
              <div className="mb-2 h-8 w-64 animate-pulse bg-black/8" />
              <div className="mb-2 h-8 w-48 animate-pulse bg-black/6" />
              <div className="mt-4 flex flex-col gap-2">
                {[90, 85, 70].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse bg-black/6"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="aspect-video w-full animate-pulse bg-black/8" />
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className={cn(courseSectionClass, courseMutedSection)}>
        <div className={courseContainerClass}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="mb-3 h-3 w-36 animate-pulse bg-black/10" />
              <div className="mb-2 h-8 w-72 animate-pulse bg-black/8" />
              <div className="mt-5 flex flex-col gap-2">
                {[100, 95, 88, 92, 80].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse bg-black/6"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              <div className="mt-10 h-20 w-56 animate-pulse border border-black/8 bg-white/50" />
            </div>
            <div className="border border-black/8 bg-white p-7">
              <div className="mb-5 h-4 w-40 animate-pulse bg-black/10" />
              <ul className="flex flex-col gap-3.5">
                {[85, 70, 90, 75].map((w, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="h-4 w-4 shrink-0 animate-pulse bg-black/10" />
                    <div
                      className="h-3.5 animate-pulse bg-black/8"
                      style={{ width: `${w}%` }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className={cn(courseSectionClass, courseCreamSection)}>
        <div className={cn(courseContainerClass, "max-w-4xl")}>
          <div className="mb-3 h-3 w-24 animate-pulse bg-black/10" />
          <div className="mb-10 h-8 w-48 animate-pulse bg-black/8" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-black/8 bg-white px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-6 w-14 animate-pulse bg-black/8" />
                  <div
                    className="h-4 animate-pulse bg-black/8"
                    style={{ width: `${120 + i * 20}px` }}
                  />
                </div>
                <div className="h-5 w-5 animate-pulse bg-black/8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section className={cn(courseSectionClass, courseMutedSection)}>
        <div className={courseContainerClass}>
          <div className="mb-3 h-3 w-28 animate-pulse bg-black/10" />
          <div className="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-[220px_1fr]">
            <div className="h-44 w-44 animate-pulse bg-black/8" />
            <div className="flex flex-col gap-2">
              {[100, 92, 96, 85, 78].map((w, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse bg-black/8"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={cn(courseSectionClass, courseCreamSection)}>
        <div className={cn(courseContainerClass, "max-w-3xl")}>
          <div className="mb-3 h-3 w-32 animate-pulse bg-black/10" />
          <div className="mb-10 h-8 w-24 animate-pulse bg-black/8" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-black/8 bg-white px-5 py-4"
              >
                <div
                  className="h-4 animate-pulse bg-black/8"
                  style={{ width: `${55 + i * 8}%` }}
                />
                <div className="h-5 w-5 animate-pulse bg-black/8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={cn(courseSectionClass, "pb-24 pt-4", courseCreamSection)}>
        <div className={courseContainerClass}>
          <div className="overflow-hidden border border-black/10 bg-(--brand-green)">
            <div className="h-1 w-full animate-pulse bg-white/20" />
            <div className="flex flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <div className="flex flex-col gap-3">
                <div className="h-8 w-64 animate-pulse bg-white/10" />
                <div className="h-4 w-56 animate-pulse bg-white/8" />
              </div>
              <div className="flex gap-3">
                <div className="h-12 w-36 animate-pulse bg-white/10" />
                <div className="h-12 w-40 animate-pulse bg-white/8" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
