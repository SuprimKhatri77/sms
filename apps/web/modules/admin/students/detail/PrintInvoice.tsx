import { siteInfo } from "@/utils/site-info";
import {
  StudentDetail,
  StudentEnrolledCourses,
  StudentPaymentDetails,
} from "@repo/types";

type Student = Extract<StudentDetail, { success: true }>["data"];
type Courses = Extract<StudentEnrolledCourses, { success: true }>["data"];
type Payments = Extract<StudentPaymentDetails, { success: true }>["data"];
interface PrintInvoiceProps {
  student: Student;
  courses: Courses;
  payments: Payments;
}

function buildInvoiceHTML(
  student: Student,
  courses: Courses,
  payments: Payments,
): string {
  const totalPaidRaw = payments.reduce((s, p) => s + p.amount, 0) / 100;
  const totalFeeRaw = courses.reduce((s, c) => s + c.fee, 0) / 100;
  const balanceRaw = totalFeeRaw - totalPaidRaw;

  const courseRows = courses
    .map(
      (c, i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;color:#2d4a3e;width:32px;">${i + 1}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;color:#2d4a3e;text-transform:capitalize;">${c.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;color:#2d4a3e;text-align:right;">
            NPR ${(c.fee / 100).toLocaleString()}
          </td>
        </tr>`,
    )
    .join("");

  const studentFields: [string, string][] = [
    ["Student", student.fullName],
    ["Phone", student.phone],
    ["Fiscal Year", student.fiscalYear],
  ];

  const studentCells = studentFields
    .map(
      ([label, value]) => `
        <div>
          <p style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#aaa;margin-bottom:3px;">
            ${label}
          </p>
          <p style="font-size:13px;font-weight:600;color:#2d4a3e;">${value}</p>
        </div>`,
    )
    .join("");

  const printDate = new Date().toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const balanceColour = balanceRaw > 0 ? "#dc2626" : "#16a34a";
  const balanceLabel = `NPR ${Math.abs(balanceRaw).toLocaleString()}${balanceRaw === 0 ? " (Cleared)" : ""}`;

  return /* html */ `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice – ${student.referenceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #2f4e40;
      padding: 24px;
      max-width: 520px;
      margin: 0 auto;
    }

    @media print {
      body { padding: 12mm; }
      @page { margin: 10mm; size: A5 portrait; }
    }

    .divider {
      height: 1px;
      background: #efe8dd;
      margin: 16px 0;
    }

    table { width: 100%; border-collapse: collapse; }

    th {
      text-align: left;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #9a8d7c;
      padding-bottom: 8px;
      border-bottom: 1px solid #efe8dd;
    }

    th.right { text-align: right; }
  </style>
</head>
<body>

  <!-- ── HEADER: Logo + Company Info ───────────────────────────────────────── -->
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
    <div style="width:54px;height:54px;border-radius:12px;overflow:hidden;border:1px solid rgba(47,78,64,0.18);background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <img
        src="${siteInfo.assets.emblem}"
        alt="${siteInfo.company.shortName}"
        style="width:42px;height:42px;object-fit:contain;display:block;"
      />
    </div>
    <div>
      <p style="font-size:16px;font-weight:800;color:#2f4e40;letter-spacing:0.02em;line-height:1.2;">
        ${siteInfo.company.shortName}
      </p>
      <p style="font-size:11px;color:#888;margin-top:3px;">${siteInfo.contact.address}</p>
      <p style="font-size:11px;color:#888;margin-top:1px;">
        ${siteInfo.contact.phone} &nbsp;·&nbsp; PAN: ${siteInfo.company.panNo}
      </p>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ── INVOICE META: Ref No + Date ───────────────────────────────────────── -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
    <div>
      <p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaa;margin-bottom:3px;">
        Invoice No.
      </p>
      <p style="font-size:14px;font-weight:700;color:#2f4e40;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
        ${student.referenceNo}
      </p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaa;margin-bottom:3px;">
        Date
      </p>
      <p style="font-size:13px;font-weight:600;color:#2f4e40;">${printDate}</p>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ── STUDENT INFO ───────────────────────────────────────────────────────── -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 32px;margin-bottom:20px;">
    ${studentCells}
  </div>

  <div class="divider"></div>

  <!-- ── COURSES TABLE ──────────────────────────────────────────────────────── -->
  <p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaa;margin-bottom:10px;">
    Enrolled Courses
  </p>
  <table style="margin-bottom:8px;">
    <thead>
      <tr>
        <th style="width:32px;">S.N.</th>
        <th>Course</th>
        <th class="right">Fee</th>
      </tr>
    </thead>
    <tbody>
      ${courseRows}
    </tbody>
    <tfoot>
      <tr>
        <td></td>
        <td style="padding-top:12px;font-size:13px;font-weight:700;color:#2d4a3e;">Total Fee</td>
        <td style="padding-top:12px;font-size:13px;font-weight:700;color:#2d4a3e;text-align:right;">
          NPR ${totalFeeRaw.toLocaleString()}
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="divider"></div>

  <!-- ── SUMMARY BOX ────────────────────────────────────────────────────────── -->
  <!--
  
  <div style="background:#f7f5f2;border-radius:12px;padding:20px 24px;">
  <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
  <span style="color:rgba(47,78,64,0.65);">Total Fee</span>
  <span style="font-weight:700;color:#2f4e40;">NPR ${totalFeeRaw.toLocaleString()}</span>
  </div>
  <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
  <span style="color:rgba(47,78,64,0.65);">Total Paid</span>
  <span style="font-weight:700;color:#2f4e40;">NPR ${totalPaidRaw.toLocaleString()}</span>
  </div>
  <div style="height:1px;background:#e6ddcf;margin:8px 0;"></div>
  <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;">
  <span style="font-weight:900;color:#2f4e40;">Balance Due</span>
  <span style="font-weight:900;color:${balanceColour};">${balanceLabel}</span>
  </div>
  </div>
  -->

  <!-- ── FOOTER ─────────────────────────────────────────────────────────────── -->
  <p style="margin-top:28px;text-align:center;font-size:11px;color:#bbb;">
    Thank you for choosing ${siteInfo.company.shortName} &nbsp;·&nbsp; This is a computer-generated invoice
  </p>

</body>
</html>`;
}

export function usePrintInvoice({
  student,
  courses,
  payments,
}: PrintInvoiceProps) {
  const handlePrint = () => {
    const html = buildInvoiceHTML(student, courses, payments);

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(html);
    win.document.close();
    win.focus();

    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return { handlePrint };
}
