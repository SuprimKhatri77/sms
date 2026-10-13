/** Placeholder for /courses with the same header and grid geometry. */
export function CoursesListingSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading courses" className="font-site">
      <div className="container-page space-y-8 pt-10 pb-10 sm:pt-14 sm:pb-12">
        <div className="skeleton-shimmer h-3 w-32 bg-surface" />
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
          <div className="space-y-4">
            <div className="skeleton-shimmer h-3 w-20 bg-surface" />
            <div className="skeleton-shimmer h-[clamp(3.5rem,9vw,8.5rem)] w-4/5 max-w-2xl bg-surface" />
          </div>
          <div className="space-y-2 lg:pb-4">
            <div className="skeleton-shimmer h-3.5 w-full bg-surface" />
            <div className="skeleton-shimmer h-3.5 w-11/12 bg-surface" />
            <div className="skeleton-shimmer h-3.5 w-2/3 bg-surface" />
          </div>
        </div>
        <div className="flex gap-2 border-y border-hairline py-4">
          {[14, 20, 18, 14].map((w, i) => (
            <div
              key={i}
              className="skeleton-shimmer h-9 rounded-full bg-surface"
              style={{ width: `${w * 0.25}rem` }}
            />
          ))}
        </div>
      </div>

      <div className="container-page grid gap-x-5 gap-y-14 pb-20 sm:grid-cols-2 sm:pb-28 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton-shimmer aspect-[4/5] bg-surface" />
            <div className="skeleton-shimmer mt-5 h-3 w-40 bg-surface" />
            <div className="skeleton-shimmer mt-4 h-10 w-48 bg-surface" />
            <div className="skeleton-shimmer mt-4 h-3.5 w-full bg-surface" />
            <div className="skeleton-shimmer mt-2 h-3.5 w-4/5 bg-surface" />
            <div className="mt-6 flex justify-between border-t border-hairline pt-4">
              <div className="skeleton-shimmer h-4 w-28 bg-surface" />
              <div className="skeleton-shimmer h-4 w-24 bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
