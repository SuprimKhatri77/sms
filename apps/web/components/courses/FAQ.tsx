"use client";

import { CourseDetail } from "@/utils/mock";
import { CourseDisclosure } from "./CourseDisclosure";

export function FaqList({ course }: { course: CourseDetail }) {
  return (
    <div className="flex flex-col gap-3">
      {course.faqs.map((faq, index) => (
        <CourseDisclosure
          key={faq.question}
          defaultOpen={index === 0}
          title={
            <span className="font-[family-name:var(--font-dm-sans)] text-[0.95rem] font-semibold text-(--brand-green)">
              {faq.question}
            </span>
          }
        >
          <div className="px-5 pb-5 pt-4 font-[family-name:var(--font-dm-sans)] text-[0.9rem] leading-[1.75] text-[rgba(47,78,64,0.62)] sm:px-6 sm:pb-6">
            {faq.answer}
          </div>
        </CourseDisclosure>
      ))}
    </div>
  );
}
