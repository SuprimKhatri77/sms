import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Mono breadcrumb trail; the last crumb is the current page. */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-label text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="link-underline outline-none hover:text-ink focus-visible:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(last && "text-ink")}
                >
                  {item.label}
                </span>
              )}
              {!last ? <span aria-hidden>—</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
