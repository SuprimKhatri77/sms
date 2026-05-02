"use client";

import { useEffect, useRef, useState } from "react";
import type { CourseDetail } from "@/utils/mock";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "video", label: "Video" },
  { id: "instructor", label: "Instructor" },
  { id: "faq", label: "FAQ" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

interface CourseClientShellsProps {
  course: Omit<CourseDetail, "icon">;
}

export default function CourseClientShells({
  course,
}: CourseClientShellsProps) {
  const [activeId, setActiveId] = useState<NavId>("overview");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Detect when the nav bar sticks to the top
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

  // Track which section is in view
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
      { rootMargin: "-20% 0px -70% 0px" },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: NavId) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 72; // sticky nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* Sentinel — sits just above the nav in DOM flow */}
      <div ref={sentinelRef} aria-hidden />

      {/* Sticky nav */}
      <nav
        aria-label="Course sections"
        className="sticky top-0 z-30 transition-shadow duration-200"
        style={{
          backgroundColor: "var(--brand-cream, #fbfaf7)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: stuck ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center overflow-x-auto px-6 scrollbar-none">
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                aria-current={isActive ? "location" : undefined}
                className="relative shrink-0 px-4 py-4 text-[0.85rem] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  color: isActive
                    ? "var(--brand-green, #2f4e40)"
                    : "rgba(0,0,0,0.4)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {label}
                {/* Active indicator */}
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full rounded-full transition-transform duration-300 origin-left"
                  style={{
                    backgroundColor: course.color,
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
