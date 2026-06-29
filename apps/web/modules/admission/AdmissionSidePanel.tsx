import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteInfo } from "@/utils/site-info";
import { ADMISSION_STEP_META } from "./admission-constants";
import { admissionEyebrowClass } from "./admission-styles";

export function AdmissionSidePanel({ currentStep }: { currentStep: number }) {
  const meta = ADMISSION_STEP_META[currentStep];
  const Icon = meta.icon;
  const progress = ((currentStep + 1) / ADMISSION_STEP_META.length) * 100;

  return (
    <aside className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-(--brand-green) p-6 text-white sm:p-8 lg:w-[320px] lg:border-r lg:border-[rgba(255,255,255,0.08)] xl:w-[360px] xl:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 100% 0%, rgba(194,138,79,0.25), transparent 55%),
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 28px 28px, 28px 28px",
        }}
      />

      <div className="relative z-1">
        <span
          className={cn(
            admissionEyebrowClass,
            "mb-4 inline-block text-[rgba(255,255,255,0.5)] lg:mb-5",
          )}
        >
          {siteInfo.admission.cycleLabel}
        </span>

        <div className="mb-5 flex items-center gap-3 lg:mb-6 lg:block">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-(--brand-brown) lg:mb-5 lg:h-11 lg:w-11">
            <Icon className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 lg:mt-0">
            <p className="font-[family-name:var(--font-dm-sans)] text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.42)]">
              Step {currentStep + 1} of {ADMISSION_STEP_META.length}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-[1.35rem] font-bold leading-tight tracking-[-0.02em] sm:text-[1.5rem] lg:mt-2 lg:text-[1.75rem]">
              {meta.title}
            </h1>
          </div>
        </div>

        <p className="hidden max-w-[240px] font-[family-name:var(--font-dm-sans)] text-[0.84rem] leading-[1.65] text-[rgba(255,255,255,0.58)] lg:block">
          {meta.description}
        </p>

        <div className="mt-5 h-1 w-full overflow-hidden bg-[rgba(255,255,255,0.12)] lg:mt-8">
          <div
            className="h-full bg-(--brand-brown) transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="relative z-1 mt-6 hidden space-y-2.5 lg:block">
        {ADMISSION_STEP_META.map((step, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-2.5 font-[family-name:var(--font-dm-sans)] text-[0.8rem] transition-colors",
                active
                  ? "font-medium text-white"
                  : done
                    ? "text-[rgba(255,255,255,0.7)]"
                    : "text-[rgba(255,255,255,0.3)]",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center text-[0.6rem] font-bold",
                  done
                    ? "bg-(--brand-brown) text-white"
                    : active
                      ? "bg-white text-(--brand-green)"
                      : "border border-[rgba(255,255,255,0.22)]",
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : idx + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>

      <p className="relative z-1 mt-6 hidden font-[family-name:var(--font-dm-sans)] text-[0.74rem] leading-relaxed text-[rgba(255,255,255,0.38)] lg:block">
        Questions? {siteInfo.contact.phone}
      </p>
    </aside>
  );
}
