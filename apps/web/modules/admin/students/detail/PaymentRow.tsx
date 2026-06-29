import { CheckCircle2, Printer } from "lucide-react";
import { usePrintReceipt } from "./PrintReceipt";
import { detailInsetClass } from "./detail-styles";
import { formatNpr } from "../shared/student-utils";
import { adminIconButtonClass } from "@/components/admin/admin-styles";

export function PaymentRow({
  payment,
  student,
  receiptNo,
}: {
  payment: {
    id: string | number;
    amount: number;
    addedAt: string;
    remarks?: string | null;
    addedByName?: string;
    paymentMode?: string | null;
  };
  student: {
    referenceNo: string;
    fullName: string;
    phone: string;
    fiscalYear: string;
  };
  receiptNo: number;
}) {
  const { handlePrintReceipt } = usePrintReceipt({
    student,
    payment,
    receiptNo,
  });

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 ${detailInsetClass}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center border border-emerald-200 bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold tabular-nums text-(--brand-green)">
            {formatNpr(payment.amount / 100)}
          </p>
          <p className="truncate font-[family-name:var(--font-dm-sans)] text-xs text-[rgba(47,78,64,0.5)]">
            {payment.remarks ?? "Payment"}
            {payment.paymentMode ? ` · ${payment.paymentMode}` : ""}
            {" · "}
            {new Date(payment.addedAt).toLocaleDateString("en-NP", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden font-[family-name:var(--font-dm-sans)] text-[11px] text-[rgba(47,78,64,0.4)] sm:inline">
          by {payment.addedByName}
        </span>
        <button
          type="button"
          onClick={handlePrintReceipt}
          title="Print receipt"
          className={adminIconButtonClass}
        >
          <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
