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
      className={`relative w-10 h-5.5 rounded-full border-0 cursor-pointer transition-colors duration-200 shrink-0 p-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-200 shadow-sm"
        style={{ left: checked ? "20px" : "2px" }}
      />
    </button>
  );
}
