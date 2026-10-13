import Link from "next/link";
import { cn } from "@/lib/utils";

/** A filter pill that links to a filtered view; the active one is filled. */
export function ChipLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-[0.8125rem] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-clay/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        active
          ? "border-ink bg-ink text-paper"
          : "border-hairline text-ink hover:border-ink/60",
      )}
    >
      {children}
    </Link>
  );
}
