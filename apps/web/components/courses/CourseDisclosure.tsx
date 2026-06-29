"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { courseCardClass } from "./course-styles";
import { cn } from "@/lib/utils";

interface CourseDisclosureProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CourseDisclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: CourseDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn(courseCardClass, className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left select-none sm:px-6 sm:py-5"
      >
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[rgba(47,78,64,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "border-t border-[rgba(47,78,64,0.08)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              open
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
