import { CourseDetail } from "@/utils/mock";
import { ChevronDown } from "lucide-react";

export function CurriculumAccordion({ course }: { course: CourseDetail }) {
  return (
    <div className="flex flex-col gap-3">
      {course.curriculum.map((mod, i) => (
        <details
          key={mod.week}
          className="group rounded-2xl border bg-white"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
          open={i === 0}
        >
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 select-none"
            style={{ color: "var(--brand-ink, #1a1a1a)" }}
          >
            <div className="flex items-center gap-4">
              <span
                className="shrink-0 rounded-lg px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-widest"
                style={{
                  backgroundColor: `${course.color}15`,
                  color: course.color,
                }}
              >
                {mod.week}
              </span>
              <span
                className="text-[1rem] font-semibold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {mod.title}
              </span>
            </div>
            <ChevronDown
              className="h-4.5 w-4.5 shrink-0 text-black/30 transition-transform duration-200 group-open:rotate-180"
              strokeWidth={1.75}
            />
          </summary>

          <div
            className="border-t px-6 pb-6 pt-5"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {mod.topics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2.5 text-[0.875rem] leading-[1.6] text-black/55"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
}
