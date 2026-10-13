import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { Instructor } from "@/utils/mock";
import { courseCardClass } from "./course-styles";
import { cn } from "@/lib/utils";

export function InstructorCard({
  instructor,
  onViewProfile,
}: {
  instructor: Instructor;
  onViewProfile: () => void;
}) {
  return (
    <article className={cn(courseCardClass, "flex flex-col")}>
      <div className="relative aspect-4/5 w-full overflow-hidden border-b border-[rgba(47,78,64,0.08)]">
        {instructor.image ? (
          <Image
            src={instructor.image}
            alt={`Portrait of ${instructor.name}, ${instructor.title}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: instructor.imagePlaceholder,
              opacity: 0.35,
            }}
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-[family-name:var(--font-playfair)] text-[1.15rem] font-bold leading-snug text-(--brand-green)">
          {instructor.name}
        </h3>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-[0.82rem] leading-normal text-[rgba(47,78,64,0.55)]">
          {instructor.title}
        </p>

        <div className="mt-4 flex items-center gap-2.5">
          <BookOpen
            className="h-4 w-4 shrink-0 text-(--brand-brown)"
            strokeWidth={1.75}
          />
          <span className="font-(family-name:--font-dm-sans) text-[0.82rem] text-[rgba(47,78,64,0.62)]">
            <strong className="text-(--brand-green)">
              {instructor.yearsExp} years
            </strong>{" "}
            of industry experience
          </span>
        </div>

        {instructor.hasProfileCard ? (
          <div className="mt-auto pt-5">
            <button
              type="button"
              onClick={onViewProfile}
              className="inline-flex items-center gap-2 border border-[rgba(47,78,64,0.18)] bg-white px-4 py-2 font-(family-name:--font-dm-sans) text-sm font-semibold text-(--brand-green) transition-colors hover:bg-[rgba(47,78,64,0.04)]"
              aria-label={`View full profile of ${instructor.name}`}
            >
              View full profile
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
