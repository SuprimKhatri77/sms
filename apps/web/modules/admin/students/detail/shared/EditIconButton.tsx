import { Pencil } from "lucide-react";
import { adminIconButtonClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { StatusActionTooltip } from "../StatusActionTooltip";

export function EditIconBtn({
  onClick,
  disabled,
  disabledTooltip,
}: {
  onClick: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        adminIconButtonClass,
        disabled && "disabled:cursor-not-allowed disabled:opacity-50",
      )}
      aria-label="Edit"
    >
      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
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
