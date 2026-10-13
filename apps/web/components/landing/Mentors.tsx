"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { InstructorCard } from "@/components/courses/InstructorCard";
import { InstructorProfileDrawer } from "@/components/courses/InstructorProfileDrawer";
import { Instructor, mentors } from "@/utils/mock";
import { Reveal } from "@/components/motion/reveal";
import { siteButton } from "@/components/site/button";
import { SectionHeading } from "@/components/site/section-heading";

export default function Mentors() {
  const [selected, setSelected] = useState<Instructor | null>(null);
  const rail = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  // Share of the rail scrolled past, counting the visible part (0..1).
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      const { scrollLeft, clientWidth, scrollWidth } = element;
      setEdges({
        start: scrollLeft <= 4,
        end: scrollLeft + clientWidth >= scrollWidth - 4,
      });
      setProgress(
        scrollWidth > 0
          ? Math.min(1, (scrollLeft + clientWidth) / scrollWidth)
          : 1,
      );
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);

  const scroll = (direction: 1 | -1) =>
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.8,
      behavior: "smooth",
    });

  // Every card fits: no controls needed.
  const scrollable = !(edges.start && edges.end);

  return (
    <section
      id="mentors"
      aria-labelledby="mentors-heading"
      className="container-page overflow-hidden py-20 font-site sm:py-28"
    >
      <Reveal>
        <SectionHeading
          id="mentors-heading"
          eyebrow="Our mentors"
          title={
            <>
              Learn from <em>working professionals.</em>
            </>
          }
          description="Meet the trainers who guide you through every class — experienced baristas and bakers with years in the industry."
        />
      </Reveal>

      <Reveal delay={0.1}>
        <ul
          ref={rail}
          aria-label="Mentors"
          className="scrollbar-hidden -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:px-10"
        >
          {mentors.map((mentor) => (
            <li
              key={mentor.name}
              className="w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[calc((100%-3*1.25rem)/4)]"
            >
              <InstructorCard
                instructor={mentor}
                onViewProfile={() => setSelected(mentor)}
              />
            </li>
          ))}
        </ul>

        {scrollable ? (
          <div className="mt-8 flex items-center gap-6">
            <div aria-hidden className="relative h-px flex-1 bg-hairline">
              <div
                className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300"
                style={{ width: `${Math.max(progress, 0.08) * 100}%` }}
              />
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => scroll(-1)}
                disabled={edges.start}
                aria-label="Scroll mentors back"
                className={siteButton({ variant: "outline", size: "icon" })}
              >
                <ArrowLeftIcon weight="light" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                disabled={edges.end}
                aria-label="Scroll mentors forward"
                className={siteButton({ variant: "outline", size: "icon" })}
              >
                <ArrowRightIcon weight="light" className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </Reveal>

      {selected ? (
        <InstructorProfileDrawer
          instructor={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  );
}
