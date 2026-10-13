type ErrorPageShellProps = {
  eyebrow: string;
  /** May contain one <em> for the italic accent. */
  title: React.ReactNode;
  description: string;
  /** Oversized serif mark above the copy, e.g. "404". */
  watermark?: string;
  actions: React.ReactNode;
};

/** Editorial error / not-found layout used by the app and certificate routes. */
export function ErrorPageShell({
  eyebrow,
  title,
  description,
  watermark,
  actions,
}: ErrorPageShellProps) {
  return (
    <main
      id="main-content"
      className="container-page flex min-h-[70svh] flex-col justify-center py-20 font-site sm:py-28"
    >
      {watermark ? (
        <p
          aria-hidden
          className="animate-rise font-display text-[clamp(6rem,20vw,14rem)] leading-[0.8] tracking-[-0.04em] text-pine/15 select-none"
        >
          {watermark}
        </p>
      ) : null}
      <p
        className="eyebrow animate-rise mt-6"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {eyebrow}
      </p>
      <h1
        className="display animate-rise mt-4 max-w-3xl text-[clamp(2.75rem,6.5vw,5rem)] text-ink"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        {title}
      </h1>
      <p
        className="animate-rise mt-6 max-w-md text-sm leading-relaxed text-ink-muted"
        style={{ "--i": 3 } as React.CSSProperties}
      >
        {description}
      </p>
      <div
        className="animate-rise mt-10 flex flex-wrap items-center gap-3"
        style={{ "--i": 4 } as React.CSSProperties}
      >
        {actions}
      </div>
    </main>
  );
}
