/** Placeholder with the course page's hero, section nav and two columns. */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading course" className="font-site">
      <div className="container-page grid gap-10 pt-10 pb-14 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-16">
        <div className="space-y-7 lg:col-span-6">
          <div className="skeleton-shimmer h-3 w-44 bg-surface" />
          <div className="skeleton-shimmer h-3 w-32 bg-surface" />
          <div className="space-y-3">
            <div className="skeleton-shimmer h-[clamp(3rem,6vw,5.5rem)] w-full bg-surface" />
            <div className="skeleton-shimmer h-[clamp(3rem,6vw,5.5rem)] w-2/3 bg-surface" />
          </div>
          <div className="max-w-xl space-y-2">
            <div className="skeleton-shimmer h-3.5 w-full bg-surface" />
            <div className="skeleton-shimmer h-3.5 w-11/12 bg-surface" />
            <div className="skeleton-shimmer h-3.5 w-3/4 bg-surface" />
          </div>
          <div className="skeleton-shimmer h-12 w-40 bg-surface" />
          <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton-shimmer h-2.5 w-16 bg-surface" />
                <div className="skeleton-shimmer h-3.5 w-24 bg-surface" />
              </div>
            ))}
          </div>
        </div>
        <div className="skeleton-shimmer aspect-[4/5] bg-surface sm:aspect-[16/11] lg:col-span-6 lg:aspect-[5/6] lg:max-h-[calc(100svh-var(--header-h)-4rem)]" />
      </div>

      <div className="h-12 border-y border-hairline">
        <div className="container-page flex h-full items-center gap-8">
          {[14, 18, 20, 18, 10].map((w, i) => (
            <div
              key={i}
              className="skeleton-shimmer h-3 bg-surface"
              style={{ width: `${w * 0.25}rem` }}
            />
          ))}
        </div>
      </div>

      <div className="container-page grid gap-16 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
        <div className="space-y-6">
          <div className="skeleton-shimmer h-3 w-28 bg-surface" />
          <div className="skeleton-shimmer h-12 w-72 max-w-full bg-surface" />
          <div className="skeleton-shimmer aspect-video bg-surface" />
        </div>
        <div className="skeleton-shimmer h-[28rem] bg-surface" />
      </div>
    </main>
  );
}
