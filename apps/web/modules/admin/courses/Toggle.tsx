export interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 cursor-pointer border-0 p-0 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-(--brand-green)" : "bg-[rgba(47,78,64,0.2)]"
      }`}
    >
      <span
        className="absolute top-0.5 h-4 w-4 bg-white transition-all duration-200"
        style={{ left: checked ? "18px" : "2px" }}
      />
    </button>
  );
}
