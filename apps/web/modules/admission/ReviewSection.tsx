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
      <p className="bg-(--brand-green) px-5 py-2.5 font-[family-name:var(--font-dm-sans)] text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white">
        {title}
      </p>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}
