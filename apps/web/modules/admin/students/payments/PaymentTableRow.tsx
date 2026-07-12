"use client";

import { useRouter } from "next/navigation";
import type { PaymentListItem } from "../shared/student-finance-list-types";
import { StudentFinanceStudentCell } from "../shared/StudentFinanceStudentCell";
import { formatFinanceDate } from "../shared/student-finance-list-utils";
import { formatNpr } from "../shared/student-utils";
import {
  financeTdClass,
  PAYMENT_TABLE_COLUMNS,
} from "../shared/student-finance-table-layout";

const columnCellClass = Object.fromEntries(
  PAYMENT_TABLE_COLUMNS.map((column) => [column.key, column.cellClassName ?? ""]),
);

export function PaymentTableRow({ payment }: { payment: PaymentListItem }) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/students/${payment.studentId}`)}
      className="group cursor-pointer transition-colors hover:bg-[rgba(47,78,64,0.03)]"
    >
      <td className={financeTdClass}>
        <StudentFinanceStudentCell
          fullName={payment.fullName}
          email={payment.email}
          referenceNo={payment.referenceNo}
        />
      </td>
      <td className={`${financeTdClass} ${columnCellClass.amount}`}>
        <span className="font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums text-(--brand-ink)">
          {formatNpr(payment.amount / 100)}
        </span>
      </td>
      <td className={`${financeTdClass} ${columnCellClass.mode}`}>
        <span className="font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.75)]">
          {payment.paymentMode}
        </span>
      </td>
      <td className={`${financeTdClass} ${columnCellClass.remarks}`}>
        <span
          className="block truncate font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.6)]"
          title={payment.remarks ?? undefined}
        >
          {payment.remarks?.trim() || "—"}
        </span>
      </td>
      <td className={`${financeTdClass} ${columnCellClass.date}`}>
        <span className="font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.65)]">
          {formatFinanceDate(payment.addedAt)}
        </span>
      </td>
    </tr>
  );
}
