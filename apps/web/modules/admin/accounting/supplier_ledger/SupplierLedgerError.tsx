import { AlertCircle } from "lucide-react";
import { adminSecondaryButtonClass } from "@/components/admin/admin-styles";

interface SupplierLedgerErrorProps {
  message: string;
  onRetry: () => void;
}

export function SupplierLedgerError({
  message,
  onRetry,
}: SupplierLedgerErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center border border-red-200 bg-red-50 text-red-500">
        <AlertCircle size={20} strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-[family-name:var(--font-lora)] text-base font-semibold text-(--brand-ink)">
          Failed to load ledger
        </p>
        <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.55)]">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={adminSecondaryButtonClass}
      >
        Try again
      </button>
    </div>
  );
}
