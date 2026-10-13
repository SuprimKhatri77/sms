import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteInfo } from "@/utils/site-info";
import { ADMISSION_STEP_META } from "./admission-constants";

const pad = (n: number) => String(n).padStart(2, "0");

export function AdmissionSidePanel({ currentStep }: { currentStep: number }) {
  const meta = ADMISSION_STEP_META[currentStep];
  const progress = ((currentStep + 1) / ADMISSION_STEP_META.length) * 100;

  return (
    <aside className="relative flex shrink-0 flex-col justify-between bg-pine p-6 text-paper sm:p-8 lg:w-[320px] xl:w-[360px] xl:p-10">
      <div>
        <p className="font-label text-[0.6875rem] tracking-[0.16em] text-paper/60 uppercase">
          {siteInfo.admission.cycleLabel}
        </p>

        <p className="mt-6 font-label text-[0.6875rem] tracking-[0.16em] text-clay uppercase tabular-nums lg:mt-10">
          Step {pad(currentStep + 1)} / {pad(ADMISSION_STEP_META.length)}
        </p>
        {/* key: each step's title rises in. */}
        <h2
          key={meta.label}
          className="animate-rise mt-2 font-display text-[2rem] leading-[1.05] tracking-[-0.01em] sm:text-[2.25rem] lg:text-[2.5rem]"
        >
          {meta.title}
        </h2>
        <p className="mt-4 hidden max-w-[260px] font-site text-[0.875rem] leading-relaxed text-paper/65 lg:block">
          {meta.description}
        </p>

        <div
          aria-hidden
          className="relative mt-8 hidden h-px w-full bg-paper/15 lg:block"
        >
          <div
            className="absolute inset-y-0 left-0 bg-clay transition-[width] duration-700 ease-out-expo"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="mt-8 hidden lg:block">
        {ADMISSION_STEP_META.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <li
              key={step.label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 border-t border-paper/12 py-3 font-site text-[0.875rem] transition-colors duration-300",
                active
                  ? "text-paper"
                  : done
                    ? "text-paper/70"
                    : "text-paper/40",
              )}
            >
              <span className="w-6 font-label text-[0.6875rem] tracking-[0.08em] tabular-nums">
                {pad(idx + 1)}
              </span>
              <span className="flex-1">{step.label}</span>
              {done ? (
                <Check
                  aria-label="done"
                  className="h-3.5 w-3.5 text-clay"
                  strokeWidth={2}
                />
              ) : active ? (
                <span aria-hidden className="h-1.5 w-1.5 bg-clay" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-6 hidden font-site text-[0.75rem] leading-relaxed text-paper/50 lg:block">
        Questions? {siteInfo.contact.phone}
      </p>
    </aside>
  );
}
