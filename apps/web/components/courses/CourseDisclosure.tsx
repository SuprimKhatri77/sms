"use client";

import { useId, useState, type ReactNode } from "react";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

interface CourseDisclosureProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/** One row of a hairline accordion; the plus turns into a cross when open. */
export function CourseDisclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: CourseDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("border-b border-hairline", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left outline-none select-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:py-6"
      >
        <span className="min-w-0 flex-1">{title}</span>
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-out-expo",
            open
              ? "rotate-45 border-ink bg-ink text-paper"
              : "border-hairline text-ink group-hover:border-ink/60",
          )}
        >
          <PlusIcon weight="light" className="size-4" />
        </span>
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-out-expo motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <div
            className={cn(
              "pb-6 transition-[opacity,transform] duration-500 ease-out-expo motion-reduce:transition-none",
              open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
