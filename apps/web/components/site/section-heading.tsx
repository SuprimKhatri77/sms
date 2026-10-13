import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

/**
 * Eyebrow + serif display title for a public section, with an optional
 * intro line and a "View all" link aligned to the title's baseline.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  tone = "dark",
  className,
}: {
  /** Put on the h2 so the section can use aria-labelledby. */
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  /** "light" for pine / dark panels. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-4">
        <p className={cn("eyebrow", light && "text-paper/60")}>{eyebrow}</p>
        <h2
          id={id}
          className={cn(
            "display text-[2.75rem] sm:text-6xl lg:text-7xl",
            light ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "max-w-lg pt-1 text-[0.9375rem] leading-relaxed",
              light ? "text-paper/70" : "text-ink-muted",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 pb-2 text-[0.8125rem] outline-none",
            light ? "text-paper" : "text-ink",
          )}
        >
          <span className="link-underline">{linkLabel}</span>
          <ArrowRightIcon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}
