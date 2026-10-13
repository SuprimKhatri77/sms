import { cn } from "@/lib/utils";
import { ADMISSION_STEP_META, ADMISSION_STEPS } from "./admission-constants";

/** Below lg: numbered steps over a hairline progress line. */
export function AdmissionStepNav({ currentStep }: { currentStep: number }) {
  return (
    <div className="px-6 pt-6 sm:px-8 lg:hidden">
      <ol className="grid grid-cols-4 gap-2">
        {ADMISSION_STEPS.map((label, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="min-w-0"
            >
              <span
                aria-hidden
                className={cn(
                  "block h-px transition-colors duration-500",
                  active ? "bg-clay" : done ? "bg-pine" : "bg-hairline",
                )}
              />
              <span
                className={cn(
                  "mt-2 block truncate font-label text-[0.625rem] tracking-[0.12em] uppercase",
                  active ? "text-ink" : done ? "text-pine" : "text-ink-muted/70",
                )}
              >
                <span className="block tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {label}
                <span className="sr-only">
                  {active ? " (current)" : done ? " (done)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <span className="sr-only">
        Step {currentStep + 1}: {ADMISSION_STEP_META[currentStep].title}
      </span>
    </div>
  );
}
