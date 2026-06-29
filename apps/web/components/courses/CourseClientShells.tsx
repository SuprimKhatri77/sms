"use client";

import { useEffect, useRef, useState } from "react";
import type { CourseToneKey } from "./course-styles";
import { courseContainerClass, courseTones } from "./course-styles";

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
}

export default function CourseClientShells({ toneKey }: CourseClientShellsProps) {
  const [activeId, setActiveId] = useState<NavId>("video");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tone = courseTones[toneKey];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
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
    const offset = 56;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden />

      <nav
        aria-label="Course sections"
        className="sticky top-0 z-30 border-b border-[rgba(47,78,64,0.1)] bg-(--brand-cream)/95 backdrop-blur-md transition-shadow duration-200"
        style={{
          boxShadow: stuck ? "0 4px 20px rgba(47,78,64,0.06)" : "none",
        }}
      >
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-(--brand-cream) to-transparent sm:w-8"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-(--brand-cream) to-transparent sm:w-8"
            aria-hidden
          />
          <div
            className={`${courseContainerClass} flex items-center gap-0.5 overflow-x-auto px-4 scrollbar-none snap-x snap-mandatory sm:gap-1 sm:px-6`}
          >
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  aria-current={isActive ? "location" : undefined}
                  className="relative shrink-0 snap-start px-3.5 py-3 font-[family-name:var(--font-dm-sans)] text-[0.82rem] font-medium transition-colors duration-150 sm:px-4 sm:py-3.5 sm:text-[0.85rem]"
                  style={{
                    color: isActive
                      ? "var(--brand-green)"
                      : "rgba(47,78,64,0.45)",
                  }}
                >
                  {label}
                  <span
                    className="absolute bottom-0 left-3.5 right-3.5 h-0.5 origin-left transition-transform duration-300 sm:left-4 sm:right-4"
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
