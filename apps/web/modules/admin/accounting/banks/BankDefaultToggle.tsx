"use client";

interface BankDefaultToggleProps {
  bankId: string;
  isDefault: boolean;
  loading: boolean;
  onToggle: (id: string) => void;
}

export function BankDefaultToggle({
  bankId,
  isDefault,
  loading,
  onToggle,
}: BankDefaultToggleProps) {
  const disabled = loading || isDefault;

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          onToggle(bankId);
        }}
        disabled={disabled}
        aria-label={isDefault ? "Default bank" : "Set as default bank"}
        aria-pressed={isDefault}
        className={[
          "relative inline-flex h-[22px] w-10 p-[2px] transition-colors duration-200",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          isDefault ? "bg-(--brand-green)" : "bg-[rgba(47,78,64,0.2)]",
        ].join(" ")}
      >
        <span
          className={[
            "block h-[18px] w-[18px] bg-white shadow-sm transition-transform duration-200",
            isDefault ? "translate-x-[18px]" : "translate-x-0",
          ].join(" ")}
        />
      </button>

      {isDefault ? (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
          <div className="whitespace-nowrap bg-[#1a1a1a] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[11px] text-white">
            Set another bank as default to change this
          </div>
        </div>
      ) : null}
    </div>
  );
}
