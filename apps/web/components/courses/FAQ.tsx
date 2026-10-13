"use client";

import { CourseDetail } from "@/utils/mock";
import { CourseDisclosure } from "./CourseDisclosure";

export function FaqList({ course }: { course: CourseDetail }) {
  return (
    <div className="border-t border-hairline">
      {course.faqs.map((faq, index) => (
        <CourseDisclosure
          key={faq.question}
          defaultOpen={index === 0}
          title={
            <span className="text-[1rem] font-medium text-ink sm:text-[1.0625rem]">
              {faq.question}
            </span>
          }
        >
          <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
            {faq.answer}
          </p>
        </CourseDisclosure>
      ))}
    </div>
  );
}
