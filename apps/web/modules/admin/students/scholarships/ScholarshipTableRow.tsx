"use client";

import { useRouter } from "next/navigation";
import type { ScholarshipListItem } from "../shared/student-finance-list-types";
import { StudentFinanceStudentCell } from "../shared/StudentFinanceStudentCell";
import {
  formatFinanceDate,
  formatFinancePercent,
} from "../shared/student-finance-list-utils";
import { formatNpr } from "../shared/student-utils";
import {
  financeTdClass,
  SCHOLARSHIP_TABLE_COLUMNS,
} from "../shared/student-finance-table-layout";

const columnCellClass = Object.fromEntries(
  SCHOLARSHIP_TABLE_COLUMNS.map((column) => [column.key, column.cellClassName ?? ""]),
);

export function ScholarshipTableRow({
  scholarship,
}: {
  scholarship: ScholarshipListItem;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/students/${scholarship.studentId}`)}
      className="group cursor-pointer transition-colors hover:bg-[rgba(47,78,64,0.03)]"
    >
      <td className={financeTdClass}>
        <StudentFinanceStudentCell
          fullName={scholarship.fullName}
          email={scholarship.email}
          referenceNo={scholarship.referenceNo}
        />
      </td>
      <td className={`${financeTdClass} text-right ${columnCellClass.percent}`}>
        <span className="font-(family-name:--font-dm-sans) text-sm tabular-nums text-[rgba(47,78,64,0.75)]">
          {formatFinancePercent(scholarship.percent)}
        </span>
      </td>
      <td className={`${financeTdClass} ${columnCellClass.amount}`}>
        <span className="font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums text-(--brand-ink)">
          {formatNpr(scholarship.amount / 100)}
        </span>
      </td>
      <td className={`${financeTdClass} ${columnCellClass.note}`}>
        <span
          className="block truncate font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.6)]"
          title={scholarship.note ?? undefined}
        >
          {scholarship.note?.trim() || "—"}
        </span>
      </td>
      <td className={`${financeTdClass} ${columnCellClass.date}`}>
        <span className="font-(family-name:--font-dm-sans) text-sm text-[rgba(47,78,64,0.65)]">
          {formatFinanceDate(scholarship.createdAt)}
        </span>
      </td>
    </tr>
  );
}
