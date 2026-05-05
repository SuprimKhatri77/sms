export function InputField({
  label,
  icon: Icon,
  error,
  required,
  ...props
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
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
        <input
          {...props}
          className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-[0.92rem] text-[#2d4a3e] outline-none transition-all duration-200 placeholder:text-[#2d4a3e]/30 focus:border-[#e8552a] focus:ring-2 focus:ring-[#e8552a]/15 
    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-70 disabled:border-[#2d4a3e]/10 disabled:focus:ring-0 disabled:focus:border-[#2d4a3e]/10
      ${error ? "border-red-400 ring-2 ring-red-100" : "border-[#2d4a3e]/15"}`}
          style={{ fontFamily: "var(--font-dm-sans)" }}
        />
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
