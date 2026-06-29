import {
  accountingTableWrapClass,
  accountingThClass,
} from "../shared/accounting-styles";

const thClass = `${accountingThClass} bg-[rgba(47,78,64,0.03)]`;
const tableClass = "w-full table-fixed border-collapse text-left text-sm";

function SkeletonColGroup() {
  return (
    <colgroup>
      <col style={{ width: "5%" }} />
      <col style={{ width: "11%" }} />
      <col style={{ width: "20%" }} />
      <col style={{ width: "6%" }} />
      <col style={{ width: "14%" }} />
      <col style={{ width: "14%" }} />
      <col style={{ width: "30%" }} />
    </colgroup>
  );
}

export function SupplierLedgerSkeleton() {
  return (
    <div
      className={`${accountingTableWrapClass} flex w-full animate-pulse flex-col overflow-hidden`}
      style={{
        height: "calc(100vh - 360px)",
        minHeight: "320px",
      }}
    >
      <div className="w-full flex-1 overflow-hidden">
        <table className={tableClass}>
          <SkeletonColGroup />
          <thead>
            <tr>
              {["S.No", "Date", "Supplier", "D/C", "Debit", "Credit", "Narration"].map(
                (label) => (
                  <th key={label} className={thClass}>
                    <div className="h-3 w-3/4 bg-[rgba(47,78,64,0.08)]" />
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, i) => (
              <tr key={i} className="border-b border-[rgba(47,78,64,0.08)]">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <div
                      className="h-3 bg-[rgba(47,78,64,0.06)]"
                      style={{ width: j === 6 ? "85%" : `${55 + (j % 3) * 15}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
