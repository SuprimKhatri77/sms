import {
  courseCategories,
  listedCourses,
  type CourseCategory,
} from "@/utils/mock";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ChipLink } from "@/components/site/chip";
import ClosingCta from "@/components/landing/ClosingCta";
import { CourseCard } from "./CourseCard";

/** Categories that have at least one listed course, in course order. */
export const listedCategories = [
  ...new Set(listedCourses.map((course) => course.category)),
];

export function isListedCategory(value: unknown): value is CourseCategory {
  return listedCategories.includes(value as CourseCategory);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The /courses page: an editorial header with filter chips, then the grid. */
export function CoursesListing({
  category,
  fees,
}: {
  /** Active filter; null shows every listed course. */
  category: CourseCategory | null;
  /** Fees by backend course name, or null when they couldn't be loaded. */
  fees: Map<string, number> | null;
}) {
  const shown = category
    ? listedCourses.filter((course) => course.category === category)
    : listedCourses;

  return (
    <main id="main-content" className="font-site">
      <header className="container-page space-y-8 pt-10 pb-10 sm:pt-14 sm:pb-12">
        <Breadcrumbs
          className="animate-rise"
          items={[{ label: "Home", href: "/" }, { label: "Courses" }]}
        />

        <div className="grid items-end gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
          <div className="space-y-4">
            <p
              className="eyebrow animate-rise"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Programs
            </p>
            <h1
              className="display animate-rise text-[clamp(3.5rem,9vw,8.5rem)] text-ink"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Learn a <em>craft.</em>
            </h1>
          </div>
          <p
            className="animate-rise text-[0.9375rem] leading-relaxed text-ink-muted lg:pb-4"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            Four-week, hands-on programs in coffee, baking and the bar, taught
            on commercial equipment by people who work in the trade.
          </p>
        </div>

        <div
          className="animate-rise flex flex-col gap-4 border-y border-hairline py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <nav
            aria-label="Filter courses"
            className="scrollbar-hidden -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          >
            <ul className="flex w-max gap-2">
              <li>
                <ChipLink href="/courses" active={category === null}>
                  All
                </ChipLink>
              </li>
              {listedCategories.map((key) => (
                <li key={key}>
                  <ChipLink
                    href={`/courses?type=${key}`}
                    active={category === key}
                  >
                    {courseCategories[key]}
                  </ChipLink>
                </li>
              ))}
            </ul>
          </nav>
          <p
            className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase"
            aria-live="polite"
          >
            {pad(shown.length)} {shown.length === 1 ? "course" : "courses"}
          </p>
        </div>
      </header>

      <section
        aria-label="Courses"
        className="container-page pb-20 sm:pb-28"
      >
        {/* Re-keyed per filter so the cards rise in again. */}
        <div
          key={category ?? "all"}
          className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((course, i) => (
            <CourseCard
              key={course.slug}
              course={course}
              fee={fees?.get(course.name.toLowerCase())}
              index={i}
            />
          ))}
        </div>
      </section>

      <ClosingCta
        secondary={{ href: "/#inquiry", label: "Talk to an advisor" }}
      />
    </main>
  );
}
