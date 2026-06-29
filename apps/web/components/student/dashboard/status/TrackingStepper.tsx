import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackingStep {
  id: string;
  label: string;
  description?: string;
  state: "done" | "active" | "upcoming";
}

export function TrackingStepper({ steps }: { steps: TrackingStep[] }) {
  return (
    <div className="w-full">
      {/* Desktop horizontal */}
      <ol className="hidden sm:flex sm:items-start sm:justify-between sm:gap-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.id}
              className={cn("flex min-w-0 flex-1 flex-col items-center", !isLast && "relative")}
            >
              {!isLast ? (
                <div
                  className={cn(
                    "absolute left-[calc(50%+1rem)] top-4 h-px w-[calc(100%-2rem)]",
                    step.state === "done"
                      ? "bg-(--brand-brown)"
                      : "bg-[rgba(47,78,64,0.12)]",
                  )}
                  aria-hidden
                />
              ) : null}

              <div className="relative z-1 flex flex-col items-center text-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center text-[0.7rem] font-bold transition-all",
                    step.state === "done"
                      ? "bg-(--brand-brown) text-white"
                      : step.state === "active"
                        ? "bg-(--brand-green) text-white ring-4 ring-[rgba(47,78,64,0.08)]"
                        : "border border-[rgba(47,78,64,0.14)] bg-[#f4f1ec] text-[rgba(47,78,64,0.35)]",
                  )}
                >
                  {step.state === "done" ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </div>
                <p
                  className={cn(
                    "mt-3 font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-semibold leading-tight",
                    step.state === "active"
                      ? "text-(--brand-green)"
                      : step.state === "done"
                        ? "text-(--brand-brown)"
                        : "text-[rgba(47,78,64,0.38)]",
                  )}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-1 hidden max-w-[9rem] font-[family-name:var(--font-dm-sans)] text-[0.68rem] leading-snug text-[rgba(47,78,64,0.45)] lg:block">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile vertical */}
      <ol className="space-y-0 sm:hidden">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li key={step.id} className="grid grid-cols-[2.25rem_1fr] gap-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center text-[0.65rem] font-bold",
                    step.state === "done"
                      ? "bg-(--brand-brown) text-white"
                      : step.state === "active"
                        ? "bg-(--brand-green) text-white"
                        : "border border-[rgba(47,78,64,0.14)] bg-white text-[rgba(47,78,64,0.35)]",
                  )}
                >
                  {step.state === "done" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </div>
                {!isLast ? (
                  <div
                    className={cn(
                      "my-1 w-px flex-1 min-h-[1.5rem]",
                      step.state === "done"
                        ? "bg-(--brand-brown)/40"
                        : "bg-[rgba(47,78,64,0.1)]",
                    )}
                  />
                ) : null}
              </div>
              <div className={cn("pb-5", isLast && "pb-0")}>
                <p
                  className={cn(
                    "font-[family-name:var(--font-dm-sans)] text-[0.84rem] font-semibold",
                    step.state === "active"
                      ? "text-(--brand-green)"
                      : step.state === "done"
                        ? "text-(--brand-brown)"
                        : "text-[rgba(47,78,64,0.4)]",
                  )}
                >
                  {step.label}
                  {step.state === "active" ? (
                    <span className="ml-2 text-[0.62rem] font-bold uppercase tracking-wider text-(--brand-brown)">
                      Now
                    </span>
                  ) : null}
                </p>
                {step.description ? (
                  <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-[0.8rem] leading-relaxed text-[rgba(47,78,64,0.5)]">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
