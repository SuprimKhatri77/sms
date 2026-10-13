import { siteButton } from "@/components/site/button";

export const admissionLabelClass =
  "block font-label text-[0.6875rem] uppercase tracking-[0.16em] text-ink";

export const admissionHintClass = "font-site text-[0.75rem] text-ink-muted";

export const admissionErrorClass = "font-site text-[0.75rem] text-red-700";

export const admissionInputClass =
  "w-full rounded-none border bg-paper py-3 pl-10 pr-4 font-site text-[0.9375rem] text-ink outline-none transition-[border-color] duration-300 placeholder:text-ink-muted/60 focus:border-ink disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted";

export const admissionBoxInputClass = admissionInputClass;

export const admissionInputNormalBorder = "border-hairline hover:border-ink/40";

export const admissionInputErrorBorder =
  "border-red-600 hover:border-red-600 focus:border-red-700";

export const admissionIconClass =
  "pointer-events-none absolute left-3.5 text-ink-muted";

export const admissionWizardShellClass =
  "border border-hairline bg-paper lg:flex lg:min-h-[min(720px,calc(100svh-10rem))]";

export const admissionPrimaryBtnClass = siteButton({
  variant: "pine",
  size: "md",
});

export const admissionSecondaryBtnClass = siteButton({
  variant: "outline",
  size: "md",
});

export const admissionSegmentBaseClass =
  "min-w-0 grow basis-[6.5rem] px-3 py-3 text-center font-site text-[0.875rem] outline-none transition-[background-color,color] duration-300 ease-out-expo focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-inset";

export const admissionSegmentActiveClass = "bg-pine text-paper";

export const admissionSegmentInactiveClass =
  "bg-paper text-ink-muted hover:bg-surface hover:text-ink";

export const admissionCourseCardBaseClass =
  "group relative flex w-full items-start gap-3 border p-4 text-left outline-none transition-[background-color,border-color] duration-300 ease-out-expo focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export const admissionCourseCardActiveClass = "border-pine bg-pine/5";

export const admissionCourseCardInactiveClass =
  "border-hairline bg-paper hover:border-ink/40";

export const admissionReviewPanelClass = "border border-hairline bg-paper";

export const admissionCalloutClass =
  "border-l-2 border-clay bg-surface px-4 py-3.5 font-site text-[0.875rem] leading-relaxed text-ink-muted";

export const admissionPhotoDropClass =
  "relative mt-2 flex cursor-pointer items-center gap-4 border border-dashed border-ink/25 bg-paper p-4 transition-[background-color,border-color] duration-300 hover:border-ink/50 hover:bg-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-clay";
