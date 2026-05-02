import { CourseDetail } from "@/utils/mock";
import { ChevronDown } from "lucide-react";

export function FaqList({ course }: { course: CourseDetail }) {
  return (
    <div className="flex flex-col gap-3">
      {course.faqs.map((faq, i) => (
        <details
          key={faq.question}
          className="group rounded-2xl border bg-white"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
          open={i === 0}
        >
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 select-none"
            style={{ color: "var(--brand-ink, #1a1a1a)" }}
          >
            <span className="text-[0.95rem] font-semibold">{faq.question}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-black/30 transition-transform duration-200 group-open:rotate-180"
              strokeWidth={1.75}
            />
          </summary>
          <div
            className="border-t px-6 pb-6 pt-4 text-[0.9rem] leading-[1.75] text-black/55"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
