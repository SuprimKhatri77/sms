import { ADMISSION_STEP_META, ADMISSION_STEPS } from "./admission-constants";

/** Mobile-only dots below the green panel header */
export function AdmissionStepNav({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-3 lg:hidden">
      {ADMISSION_STEPS.map((label, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={
                active
                  ? "h-2 w-6 bg-(--brand-brown)"
                  : done
                    ? "h-2 w-2 bg-(--brand-green)"
                    : "h-2 w-2 bg-[rgba(47,78,64,0.15)]"
              }
              aria-label={`${label}${active ? " (current)" : done ? " (done)" : ""}`}
            />
          </div>
        );
      })}
      <span className="sr-only">
        Step {currentStep + 1}: {ADMISSION_STEP_META[currentStep].title}
      </span>
    </div>
  );
}
