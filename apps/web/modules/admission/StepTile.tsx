import { cn } from "@/lib/utils";

/** The step heading inside the form, shown below lg where the side panel collapses. */
export function StepTitle({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-2 lg:hidden", className)}>
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden
          className="mt-1.5 h-5 w-5 shrink-0 text-clay-deep"
          strokeWidth={1.5}
        />
        <div>
          <h2 className="font-display text-[1.75rem] leading-tight text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 font-site text-[0.875rem] leading-relaxed text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
