export const financeTableClass =
  "w-full table-fixed border-collapse";

export const financeThClass =
  "px-5 py-3.5 text-left font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-widest text-[rgba(47,78,64,0.45)] bg-[rgba(47,78,64,0.03)] border-b border-[rgba(47,78,64,0.12)] whitespace-nowrap";

export const financeThRightClass = `${financeThClass} text-right`;

export const financeTdClass =
  "border-b border-[rgba(47,78,64,0.1)] px-5 py-4 align-middle group-last:border-b-0";

export type FinanceTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  width: string;
  headerClassName?: string;
  cellClassName?: string;
  skeleton?: "student" | "text-right" | "text" | "date";
};

export const SCHOLARSHIP_TABLE_COLUMNS: FinanceTableColumn[] = [
  {
    key: "student",
    label: "Student",
    width: "26%",
    skeleton: "student",
  },
  {
    key: "percent",
    label: "Percent",
    align: "right",
    width: "12%",
    cellClassName: "whitespace-nowrap",
    skeleton: "text-right",
  },
  {
    key: "amount",
    label: "Amount",
    width: "18%",
    headerClassName: `${financeThClass} pr-10`,
    cellClassName: "whitespace-nowrap pr-10",
    skeleton: "text",
  },
  {
    key: "note",
    label: "Note",
    width: "28%",
    headerClassName: `${financeThClass} pl-10`,
    cellClassName: "pl-10",
    skeleton: "text",
  },
  {
    key: "date",
    label: "Date",
    width: "16%",
    cellClassName: "whitespace-nowrap",
    skeleton: "date",
  },
];

export const PAYMENT_TABLE_COLUMNS: FinanceTableColumn[] = [
  {
    key: "student",
    label: "Student",
    width: "26%",
    skeleton: "student",
  },
  {
    key: "amount",
    label: "Amount",
    width: "18%",
    headerClassName: `${financeThClass} pr-10`,
    cellClassName: "whitespace-nowrap pr-10",
    skeleton: "text",
  },
  {
    key: "mode",
    label: "Mode",
    width: "12%",
    cellClassName: "whitespace-nowrap",
    skeleton: "text",
  },
  {
    key: "remarks",
    label: "Remarks",
    width: "28%",
    headerClassName: `${financeThClass} pl-10`,
    cellClassName: "pl-10",
    skeleton: "text",
  },
  {
    key: "date",
    label: "Date",
    width: "16%",
    cellClassName: "whitespace-nowrap",
    skeleton: "date",
  },
];

export const DISCOUNT_TABLE_COLUMNS: FinanceTableColumn[] = [
  {
    key: "student",
    label: "Student",
    width: "24%",
    skeleton: "student",
  },
  {
    key: "type",
    label: "Type",
    width: "14%",
    cellClassName: "whitespace-nowrap",
    skeleton: "text",
  },
  {
    key: "percent",
    label: "Percent",
    align: "right",
    width: "10%",
    cellClassName: "whitespace-nowrap",
    skeleton: "text-right",
  },
  {
    key: "amount",
    label: "Amount",
    width: "16%",
    headerClassName: `${financeThClass} pr-10`,
    cellClassName: "whitespace-nowrap pr-10",
    skeleton: "text",
  },
  {
    key: "note",
    label: "Note",
    width: "24%",
    headerClassName: `${financeThClass} pl-10`,
    cellClassName: "pl-10",
    skeleton: "text",
  },
  {
    key: "date",
    label: "Date",
    width: "12%",
    cellClassName: "whitespace-nowrap",
    skeleton: "date",
  },
];

export function FinanceTableColGroup({
  columns,
}: {
  columns: FinanceTableColumn[];
}) {
  return (
    <colgroup>
      {columns.map((column) => (
        <col key={column.key} style={{ width: column.width }} />
      ))}
    </colgroup>
  );
}

export function FinanceTableHead({
  columns,
}: {
  columns: FinanceTableColumn[];
}) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={
              column.headerClassName ??
              (column.align === "right" ? financeThRightClass : financeThClass)
            }
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
