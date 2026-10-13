import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Instructor } from "@/utils/mock";
import { cn } from "@/lib/utils";

/**
 * A mentor portrait with name, title and experience. When the mentor has a
 * profile, the whole card opens it.
 */
export function InstructorCard({
  instructor,
  onViewProfile,
  sizes = "(min-width: 1024px) 24vw, (min-width: 768px) 31vw, (min-width: 640px) 44vw, 78vw",
}: {
  instructor: Instructor;
  onViewProfile: () => void;
  sizes?: string;
}) {
  return (
    <article className="group relative font-site">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {instructor.image ? (
          <Image
            src={instructor.image}
            alt={`Portrait of ${instructor.name}, ${instructor.title}`}
            fill
            sizes={sizes}
            className="object-cover object-top transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        ) : (
          <div
            aria-hidden
            className="size-full opacity-35"
            style={{ backgroundColor: instructor.imagePlaceholder }}
          />
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
          {instructor.yearsExp} yrs experience
        </p>
        <h3 className="font-display text-2xl leading-tight text-ink sm:text-[1.75rem]">
          {instructor.name}
        </h3>
        <p className="text-[0.8125rem] leading-snug text-ink-muted">
          {instructor.title}
        </p>
      </div>

      {instructor.hasProfileCard ? (
        <button
          type="button"
          onClick={onViewProfile}
          aria-label={`View full profile of ${instructor.name}`}
          className={cn(
            "group/btn mt-4 inline-flex items-center gap-2 text-[0.8125rem] text-ink outline-none",
            // Stretch the click target over the whole card.
            "after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-clay focus-visible:after:ring-inset",
          )}
        >
          <span className="link-underline group-hover:bg-size-[100%_1px] group-focus-visible/btn:bg-size-[100%_1px]">
            View profile
          </span>
          <ArrowRightIcon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
          />
        </button>
      ) : null}
    </article>
  );
}
