"use client";

import { useEffect, useState } from "react";

interface BankAccountDefaultToggleProps {
  accountId: string;
  isDefault: boolean;
  isToggling: boolean;
  onToggle: (id: string) => void;
}

export function BankAccountDefaultToggle({
  accountId,
  isDefault,
  isToggling,
  onToggle,
}: BankAccountDefaultToggleProps) {
  const [optimistic, setOptimistic] = useState(isDefault);

  useEffect(() => {
    setTimeout(() => {
      setOptimistic(isDefault);
    }, 0);
  }, [isDefault]);

  const isLocked = optimistic;
  const disabled = isLocked || isToggling;

  const handleClick = () => {
    if (disabled) return;
    setOptimistic(true);
    onToggle(accountId);
  };

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={
          optimistic ? "Default account (locked)" : "Set as default account"
        }
        aria-pressed={optimistic}
        className={[
          "relative inline-flex h-[22px] w-10 p-[2px] transition-colors duration-200",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          optimistic ? "bg-(--brand-green)" : "bg-[rgba(47,78,64,0.2)]",
        ].join(" ")}
      >
        <span
          className={[
            "block h-[18px] w-[18px] bg-white shadow-sm transition-transform duration-200",
            optimistic ? "translate-x-[18px]" : "translate-x-0",
          ].join(" ")}
        />
      </button>

      {isLocked ? (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
          <div className="whitespace-nowrap bg-[#1a1a1a] px-2 py-1 font-[family-name:var(--font-dm-sans)] text-[11px] text-white">
            Cannot unset default account directly. Set another account as
            default first.
          </div>
        </div>
      ) : null}
    </div>
  );
}
