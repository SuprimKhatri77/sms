export function SelectField({
  label,
  icon: Icon,
  options,
  error,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ElementType;
  options: readonly { value: string; label: string }[];
  error?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[0.8rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
        {required && <span className="ml-1 text-[#e8552a]">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d4a3e]/40">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border bg-white py-3 pl-10 pr-4 text-[0.92rem] text-[#2d4a3e] outline-none transition-all duration-200 focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15 ${
            !value ? "text-[#2d4a3e]/40" : ""
          } ${error ? "border-red-400 ring-2 ring-red-100" : "border-[#2d4a3e]/15"}`}
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <option value="" disabled>
            {placeholder ?? `Select ${label.toLowerCase()}`}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
