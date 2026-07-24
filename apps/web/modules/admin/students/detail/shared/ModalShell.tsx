import type { ElementType, ReactNode } from "react";
import { X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  adminPrimaryButtonClass,
  adminPrimaryButtonDisabledClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { detailPanelClass } from "../detail-styles";

export function ModalShell({
  title,
  icon: Icon,
  onCancel,
  onSubmit,
  submitLabel,
  submitting,
  children,
}: {
  title: string;
  icon: ElementType;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitting?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 supports-backdrop-filter:backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className={`w-full max-w-md ${detailPanelClass} shadow-[0_0_40px_rgba(0,0,0,0.12)]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-shell-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(47,78,64,0.12)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.03)] text-(--brand-green)">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <h2
              id="modal-shell-title"
              className="font-(family-name:--font-lora) text-base font-bold text-(--brand-green)"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center border border-[rgba(47,78,64,0.18)] text-[rgba(47,78,64,0.55)] transition-colors hover:bg-[rgba(47,78,64,0.04)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">{children}</div>

        <div className="flex justify-end gap-2 border-t border-[rgba(47,78,64,0.12)] px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={cn(
              adminSecondaryButtonClass,
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className={cn(
              adminPrimaryButtonClass,
              adminPrimaryButtonDisabledClass,
            )}
          >
            {submitting ? (
              <>
                <Spinner />
                {submitLabel}
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
