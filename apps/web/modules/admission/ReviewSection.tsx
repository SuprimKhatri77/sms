import { admissionReviewPanelClass } from "./admission-styles";

export function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={admissionReviewPanelClass}>
      <p className="border-b border-hairline bg-surface px-5 py-2.5 font-label text-[0.6875rem] tracking-[0.16em] text-ink uppercase">
        {title}
      </p>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}
