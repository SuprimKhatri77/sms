"use client";

import { CourseDetail } from "@/utils/mock";
import { Check } from "lucide-react";
import { CourseDisclosure } from "./CourseDisclosure";
import { courseAccentAlpha } from "./course-styles";

export function CurriculumAccordion({
  course,
  accent,
}: {
  course: CourseDetail;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {course.curriculum.map((mod, index) => (
        <CourseDisclosure
          key={mod.week}
          defaultOpen={index === 0}
          title={
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span
                className="shrink-0 border px-2.5 py-1 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-semibold uppercase tracking-widest"
                style={{
                  borderColor: courseAccentAlpha(accent, 28),
                  backgroundColor: courseAccentAlpha(accent, 10),
                  color: accent,
                }}
              >
                {mod.week}
              </span>
              <span className="font-[family-name:var(--font-playfair)] text-[1rem] font-semibold text-(--brand-green)">
                {mod.title}
              </span>
            </div>
          }
        >
          <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {mod.topics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2.5 font-[family-name:var(--font-dm-sans)] text-[0.875rem] leading-[1.6] text-[rgba(47,78,64,0.62)]"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: accent }}
                    strokeWidth={2.5}
                  />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </CourseDisclosure>
      ))}
    </div>
  );
}
