import { cn } from "@/lib/utils";

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
    <div className={cn("mb-6 lg:hidden", className)}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center bg-[rgba(47,78,64,0.06)] text-(--brand-brown)">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-[1.15rem] font-semibold text-(--brand-green)">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.84rem] leading-relaxed text-[rgba(47,78,64,0.52)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
