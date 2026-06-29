import { CashLedger } from "@repo/types";
import { accountingTdClass } from "../shared/accounting-styles";

interface CashLedgerEntryRowProps {
  entry: CashLedger;
  serialNo: number;
}

function formatRs(paisa: number) {
  return (paisa / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CashLedgerEntryRow({
  entry,
  serialNo,
}: CashLedgerEntryRowProps) {
  const isDebit = entry.entryType === "dr";

  return (
    <tr className="transition-colors hover:bg-[rgba(47,78,64,0.02)]">
      <td
        className={`${accountingTdClass} text-center tabular-nums text-[rgba(47,78,64,0.45)]`}
      >
        {serialNo}
      </td>

      <td
        className={`${accountingTdClass} whitespace-nowrap font-mono text-xs tabular-nums`}
      >
        {entry.bsDate}
      </td>

      <td className={`${accountingTdClass} text-center`}>
        <span
          className={`inline-block w-6 text-center text-xs font-bold ${isDebit ? "text-[#9a3412]" : "text-[#16a34a]"}`}
        >
          {isDebit ? "D" : "C"}
        </span>
      </td>

      <td
        className={`${accountingTdClass} text-right font-mono text-xs tabular-nums whitespace-nowrap ${isDebit ? "text-[#9a3412]" : "text-[rgba(47,78,64,0.2)]"}`}
      >
        {isDebit ? formatRs(entry.amount) : "—"}
      </td>

      <td
        className={`${accountingTdClass} text-right font-mono text-xs tabular-nums whitespace-nowrap ${!isDebit ? "text-[#16a34a]" : "text-[rgba(47,78,64,0.2)]"}`}
      >
        {!isDebit ? formatRs(entry.amount) : "—"}
      </td>

      <td
        className={`${accountingTdClass} whitespace-nowrap text-[rgba(47,78,64,0.65)]`}
      >
        {entry.description ?? (
          <span className="text-[rgba(47,78,64,0.2)]">—</span>
        )}
      </td>
    </tr>
  );
}
