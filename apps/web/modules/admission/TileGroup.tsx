export function TileGroup({
  label,
  options,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
        {required && <span className="ml-1 text-[#e8552a]">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-4 py-2.5 text-[0.88rem] font-medium transition-all duration-150 ${
              value === o.value
                ? "border-[#e8552a] bg-[#e8552a] text-white shadow-[0_2px_12px_rgba(232,85,42,0.3)]"
                : "border-[#2d4a3e]/15 bg-white text-[#2d4a3e]/70 hover:border-[#e8552a]/40 hover:text-[#2d4a3e]"
            }`}
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && (
        <p
          className="text-[0.78rem] text-red-500"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
