import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { courseCategories, type CourseDetail } from "@/utils/mock";
import { COURSE_PRICE_VAT_NOTE } from "@/components/courses/course-styles";
import { formatFee } from "./course-fees";

export const COURSE_CARD_SIZES =
  "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw";

/**
 * A course in the /courses grid: a 4:5 photo with mono facts, then the
 * name, tagline and fee. The whole card is one link.
 */
export function CourseCard({
  course,
  fee,
  index,
}: {
  course: CourseDetail;
  /** In paisa; undefined when the fee couldn't be loaded. */
  fee: number | undefined;
  index: number;
}) {
  const facts = [course.duration, course.format, course.difficulty];

  return (
    <article
      className="group animate-rise relative flex flex-col"
      style={{ "--i": index + 3 } as React.CSSProperties}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          src={course.videoPlaceholder}
          alt=""
          fill
          loading={index < 3 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          sizes={COURSE_CARD_SIZES}
          className="object-cover transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05] motion-reduce:transition-none"
        />
        <ul className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <li
              key={fact}
              className="bg-paper/90 px-2 py-1 font-label text-[0.625rem] tracking-[0.14em] text-ink uppercase backdrop-blur-sm"
            >
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <p className="eyebrow">
          {courseCategories[course.category]} · {course.tagline}
        </p>
        <h2 className="mt-3 font-display text-4xl leading-none text-ink sm:text-5xl">
          <Link
            href={`/courses/${course.slug}`}
            className="outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-clay focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-paper"
          >
            {course.name}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 max-w-md text-[0.875rem] leading-relaxed text-ink-muted">
          {course.shortDescription}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-4 border-t border-hairline pt-4">
            {fee != null ? (
              <div>
                <p className="font-label text-sm tracking-[0.06em] text-ink tabular-nums">
                  {formatFee(fee)}
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-ink-muted">
                  {COURSE_PRICE_VAT_NOTE}
                </p>
              </div>
            ) : (
              <p className="text-[0.8125rem] text-ink-muted">Fee on request</p>
            )}
            <span
              aria-hidden
              className="inline-flex shrink-0 items-center gap-2 pb-0.5 text-[0.8125rem] text-ink"
            >
              <span className="link-underline group-hover:bg-size-[100%_1px]">
                View course
              </span>
              <ArrowRightIcon className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
