import {
  accountingTableClass,
  accountingTableWrapClass,
  accountingThClass,
  accountingTdClass,
} from "../shared/accounting-styles";

export function SuppliersSkeleton() {
  return (
    <div className={`${accountingTableWrapClass} animate-pulse`}>
      <table className={accountingTableClass}>
        <thead>
          <tr>
            {["Company", "VAT", "Phone", "Created", "Actions"].map((label) => (
              <th key={label} className={accountingThClass}>
                <div className="h-3 w-16 bg-[rgba(47,78,64,0.08)]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className={accountingTdClass}>
                <div className="h-4 w-48 bg-[rgba(47,78,64,0.08)]" />
              </td>
              <td className={accountingTdClass}>
                <div className="h-4 w-24 bg-[rgba(47,78,64,0.06)]" />
              </td>
              <td className={accountingTdClass}>
                <div className="h-4 w-28 bg-[rgba(47,78,64,0.06)]" />
              </td>
              <td className={accountingTdClass}>
                <div className="h-4 w-24 bg-[rgba(47,78,64,0.06)]" />
              </td>
              <td className={accountingTdClass}>
                <div className="ml-auto h-8 w-[4.25rem] bg-[rgba(47,78,64,0.06)]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
