export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-3 last:border-0">
      <span className="font-label text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
        {label}
      </span>
      <span className="max-w-[58%] text-right font-site text-[0.9375rem] break-words text-ink">
        {value || "—"}
      </span>
    </div>
  );
}
