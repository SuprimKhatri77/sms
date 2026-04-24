import {
  StudentDetail,
  StudentEnrolledCourses,
  StudentPaymentDetials,
} from "@repo/types";
import { STATUS_META } from "./StudentDetail";

type Props = {
  student: Extract<StudentDetail, { success: true }>["data"];
  courses: Extract<StudentEnrolledCourses, { success: true }>["data"];
  payments: Extract<StudentPaymentDetials, { success: true }>["data"];
};
export function Invoice({ student, payments, courses }: Props) {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0) / 100;
  const totalFee = courses.reduce((s, c) => s + c.fee, 0) / 100;
  const balance = totalFee - totalPaid;

  return (
    <div
      id="invoice-content"
      className="rounded-2xl border border-[#2d4a3e]/12 bg-white p-8"
    >
      {/* Invoice header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8552a] text-[1rem] font-extrabold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              G
            </div>
            <span
              className="text-[1.1rem] font-bold text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Greenfield Academy
            </span>
          </div>
          <p
            className="text-[0.78rem] text-[#2d4a3e]/45"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Thamel, Kathmandu · info@greenfield.edu.np
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#2d4a3e]/40"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Invoice
          </p>
          <p className="text-[0.88rem] font-mono font-medium text-[#2d4a3e]">
            {student.referenceNo}
          </p>
          <p
            className="text-[0.78rem] text-[#2d4a3e]/45"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {new Date().toLocaleDateString("en-NP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mb-5 h-px bg-[#2d4a3e]/08" />

      {/* Student info */}
      <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2">
        {[
          ["Student", student.fullName],
          ["Phone", student.phone],
          ["Fiscal Year", student.fiscalYear],
          ["Status", STATUS_META[student.status].label],
        ].map(([label, val]) => (
          <div key={label}>
            <p
              className="text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {label}
            </p>
            <p
              className="text-[0.88rem] font-medium text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {val}
            </p>
          </div>
        ))}
      </div>

      {/* Courses */}
      <p
        className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Enrolled Courses
      </p>
      <table className="mb-6 w-full">
        <thead>
          <tr className="border-b border-[#2d4a3e]/08">
            <th
              className="pb-2 text-left text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Course
            </th>
            <th
              className="pb-2 text-right text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Fee
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} className="border-b border-[#2d4a3e]/06">
              <td
                className="py-2 text-[0.88rem] text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {c.name}
              </td>
              <td
                className="py-2 text-right text-[0.88rem] text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                NPR {(c.fee / 100).toLocaleString()}
              </td>
            </tr>
          ))}
          <tr>
            <td
              className="pt-3 text-[0.82rem] font-semibold text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Total Fee
            </td>
            <td
              className="pt-3 text-right text-[0.88rem] font-semibold text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              NPR {totalFee.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Payments */}
      <p
        className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Payment History
      </p>
      <table className="mb-6 w-full">
        <thead>
          <tr className="border-b border-[#2d4a3e]/08">
            {["Date", "Remarks", "Amount"].map((h) => (
              <th
                key={h}
                className={`pb-2 text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[#2d4a3e]/40 ${h === "Amount" ? "text-right" : "text-left"}`}
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b border-[#2d4a3e]/06">
              <td
                className="py-2 text-[0.82rem] text-[#2d4a3e]/60"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {new Date(p.addedAt).toLocaleDateString("en-NP", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td
                className="py-2 text-[0.82rem] text-[#2d4a3e]/60"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {p.remarks ?? "—"}
              </td>
              <td
                className="py-2 text-right text-[0.82rem] font-medium text-[#2d4a3e]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                NPR {p.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary box */}
      <div className="rounded-xl bg-[#f4f1ec] p-4">
        {[
          { label: "Total Fee", value: totalFee, muted: true },
          { label: "Total Paid", value: totalPaid, muted: false },
          { label: "Balance Due", value: balance, muted: false },
        ].map(({ label, value, muted }) => (
          <div
            key={label}
            className={`flex justify-between py-1.5 ${label === "Balance Due" ? "border-t border-[#2d4a3e]/12 mt-1 pt-2.5" : ""}`}
          >
            <span
              className={`text-[0.85rem] ${muted ? "text-[#2d4a3e]/50" : "font-semibold text-[#2d4a3e]"}`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {label}
            </span>
            <span
              className={`text-[0.88rem] ${label === "Balance Due" ? (balance > 0 ? "font-bold text-red-600" : "font-bold text-green-600") : "font-medium text-[#2d4a3e]"}`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              NPR {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-6 text-center text-[0.72rem] text-[#2d4a3e]/30"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Thank you for choosing Greenfield Academy · This is a computer-generated
        invoice
      </p>
    </div>
  );
}
