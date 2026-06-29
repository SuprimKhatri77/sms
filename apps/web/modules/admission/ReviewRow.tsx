export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[rgba(47,78,64,0.08)] py-3 last:border-0">
      <span className="font-[family-name:var(--font-dm-sans)] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[rgba(47,78,64,0.45)]">
        {label}
      </span>
      <span className="max-w-[58%] text-right font-[family-name:var(--font-dm-sans)] text-[0.9rem] font-medium text-(--brand-green)">
        {value || "—"}
      </span>
    </div>
  );
}
