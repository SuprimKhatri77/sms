"use client";

import { useEffect, useRef, useState } from "react";
import type { CourseToneKey } from "./course-styles";
import { courseTones } from "./course-styles";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "video", label: "Watch" },
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "instructor", label: "Instructor" },
  { id: "faq", label: "FAQ" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

interface CourseClientShellsProps {
  toneKey: CourseToneKey;
  showInstructor: boolean;
}

export default function CourseClientShells({
  toneKey,
  showInstructor,
}: CourseClientShellsProps) {
  const navItems = showInstructor
    ? NAV_ITEMS
    : NAV_ITEMS.filter(({ id }) => id !== "instructor");
  const [activeId, setActiveId] = useState<NavId>("video");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tone = courseTones[toneKey];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // The nav sticks below the site header, so "stuck" starts once the
    // sentinel passes under the header (64px = --header-h).
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map(({ id }) =>
      document.getElementById(id),
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id as NavId);
          }
        }
      },
      { rootMargin: "-22% 0px -65% 0px" },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: NavId) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Lands below the header (html scroll-padding) and this nav (section
    // scroll-margin).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden />

      <nav
        aria-label="Course sections"
        className={cn(
          "sticky top-(--header-h) z-30 border-y font-site transition-[background-color,border-color] duration-500",
          stuck
            ? "border-hairline bg-paper/90 backdrop-blur-xl backdrop-saturate-150"
            : "border-hairline bg-paper",
        )}
      >
        <div className="container-page">
          <div className="scrollbar-hidden -mx-4 flex h-12 items-stretch overflow-x-auto px-1 sm:px-0">
            {navItems.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative shrink-0 px-3 text-[0.8125rem] outline-none transition-colors duration-300 hover:text-ink focus-visible:text-ink focus-visible:underline sm:px-4",
                    isActive ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-px origin-left transition-transform duration-500 ease-out-expo sm:inset-x-4"
                    style={{
                      backgroundColor: tone.accent,
                      transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
