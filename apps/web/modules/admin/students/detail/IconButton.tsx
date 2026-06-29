import { adminDangerIconButtonClass, adminIconButtonClass } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { StatusActionTooltip } from "./StatusActionTooltip";

export function IconBtn({
  icon: Icon,
  label,
  onClick,
  variant = "ghost",
  disabled,
  disabledTooltip,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "danger";
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        variant === "danger" ? adminDangerIconButtonClass : adminIconButtonClass,
        disabled &&
          "disabled:cursor-not-allowed disabled:border-[rgba(47,78,64,0.12)] disabled:bg-[rgba(47,78,64,0.04)] disabled:text-[rgba(47,78,64,0.3)] disabled:hover:border-[rgba(47,78,64,0.12)] disabled:hover:text-[rgba(47,78,64,0.3)]",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
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
