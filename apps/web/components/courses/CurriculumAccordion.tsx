"use client";

import { CourseDetail } from "@/utils/mock";
import { CourseDisclosure } from "./CourseDisclosure";

export function CurriculumAccordion({
  course,
  accent,
}: {
  course: CourseDetail;
  accent: string;
}) {
  return (
    <div className="border-t border-hairline">
      {course.curriculum.map((mod, index) => (
        <CourseDisclosure
          key={mod.week}
          defaultOpen={index === 0}
          title={
            <span className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-20 shrink-0 font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
                {mod.week}
              </span>
              <span className="font-display text-2xl leading-tight text-ink sm:text-[1.75rem]">
                {mod.title}
              </span>
            </span>
          }
        >
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:ml-26 sm:grid-cols-2">
            {mod.topics.map((topic) => (
              <li
                key={topic}
                className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-ink-muted"
              >
                <span
                  aria-hidden
                  className="mt-[0.55rem] size-1.5 shrink-0"
                  style={{ backgroundColor: accent }}
                />
                {topic}
              </li>
            ))}
          </ul>
        </CourseDisclosure>
      ))}
    </div>
  );
}
