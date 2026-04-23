export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#2d4a3e]/08 py-3 last:border-0">
      <span
        className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/50"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
      <span
        className="text-right text-[0.92rem] font-medium text-[#2d4a3e]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {value || "—"}
      </span>
    </div>
  );
}
