import type { LedgerEntry } from "@repo/types";

/** paisa → "Rs. 2,500.00" */
export function formatRs(paisa: number): string {
  return `Rs. ${formatAmount(paisa)}`;
}

/** paisa → "2,500.00" */
export function formatAmount(paisa: number): string {
  return (paisa / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Who an entry is with: the supplier, the employee, or the bank and account. */
export function partyLabel(entry: LedgerEntry): string {
  if (entry.supplierName) return entry.supplierName;
  if (entry.employeeName) return entry.employeeName;
  if (entry.bankName) {
    const account = entry.accountNumber
      ? `${entry.accountName} · ${entry.accountNumber}`
      : entry.accountName;
    return `${entry.bankName} — ${account}`;
  }
  return "";
}
