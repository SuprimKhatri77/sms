import { Plus } from "lucide-react";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import {
  detailEmptyActionClass,
  detailEmptyActionIconClass,
} from "./detail-styles";
import { cn } from "@/lib/utils";
import { StatusActionTooltip } from "./StatusActionTooltip";

export function AddBtn({
  label,
  onClick,
  disabled,
  disabledTooltip,
  compact,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  compact?: boolean;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        adminPrimaryButtonClass,
        compact && detailEmptyActionClass,
        disabled &&
          "disabled:cursor-not-allowed disabled:border-[rgba(47,78,64,0.2)] disabled:bg-[rgba(47,78,64,0.35)] disabled:hover:bg-[rgba(47,78,64,0.35)]",
      )}
    >
      {compact ? (
        <Plus className={detailEmptyActionIconClass} strokeWidth={2} />
      ) : (
        <Plus size={14} />
      )}
      {label}
    </button>
  );

  if (disabled && disabledTooltip) {
    return (
      <StatusActionTooltip blocked message={disabledTooltip}>
        {button}
      </StatusActionTooltip>
    );
  }

  return button;
}
