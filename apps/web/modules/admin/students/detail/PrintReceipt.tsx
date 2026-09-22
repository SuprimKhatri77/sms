import { siteInfo } from "@/utils/site-info";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Payment {
  id: string | number;
  amount: number; // in paisa (×100)
  date: string;
  remarks?: string | null;
  addedByName?: string;
  paymentMode?: string | null;
}

interface Student {
  referenceNo: string;
  fullName: string;
  phone: string;
  fiscalYear: string;
}

interface PrintReceiptProps {
  student: Student;
  payment: Payment;
  /** Optional: receipt serial / sequence number  e.g. payments.indexOf(p) + 1 */
  receiptNo?: number;
}

// ─── HTML Builder ─────────────────────────────────────────────────────────────
function buildReceiptHTML(
  student: Student,
  payment: Payment,
  receiptNo?: number,
): string {
  const amountRaw = payment.amount / 100;

  const paymentDate = new Date(payment.date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const printDate = new Date().toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Receipt number: passed in, or fall back to last 6 chars of payment id
  const receiptLabel = receiptNo
    ? `RCP-${String(receiptNo).padStart(4, "0")}`
    : `RCP-${String(payment.id).slice(-6).toUpperCase()}`;

  // ── Student detail rows ───────────────────────────────────────────────────
  const studentFields: [string, string][] = [
    ["Student", student.fullName],
    ["Phone", student.phone],
    ["Ref. No.", student.referenceNo],
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

  return /* html */ `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Receipt – ${receiptLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #2f4e40;
      padding: 24px;
      max-width: 420px;   /* narrower than invoice — receipt feel */
      margin: 0 auto;
    }

    @media print {
      body { padding: 10mm; }
      @page { margin: 8mm; size: A6 portrait; }
    }

    .divider {
      height: 1px;
      background: #efe8dd;
      margin: 14px 0;
    }

    /* Dashed divider for the "tear" feel */
    .divider-dash {
      border: none;
      border-top: 1.5px dashed #d8d0c4;
      margin: 16px 0;
    }
  </style>
</head>
<body>

  <!-- ── HEADER ──────────────────────────────────────────────────────────────── -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
    <div style="width:46px;height:46px;border-radius:10px;overflow:hidden;border:1px solid rgba(47,78,64,0.18);background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <img
        src="${siteInfo.assets.emblem}"
        alt="${siteInfo.company.shortName}"
        style="width:36px;height:36px;object-fit:contain;display:block;"
      />
    </div>
    <div>
      <p style="font-size:15px;font-weight:800;color:#2f4e40;letter-spacing:0.02em;line-height:1.2;">
        ${siteInfo.company.shortName}
      </p>
      <p style="font-size:10.5px;color:#888;margin-top:2px;">${siteInfo.contact.address}</p>
      <p style="font-size:10.5px;color:#888;margin-top:1px;">
        ${siteInfo.contact.phone} &nbsp;·&nbsp; PAN: ${siteInfo.company.panNo}
      </p>
    </div>
  </div>

  <!-- ── RECEIPT LABEL ───────────────────────────────────────────────────────── -->
  <div style="background:#2d4a3e;border-radius:10px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
    <div>
      <p style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:3px;">
        Payment Receipt
      </p>
      <p style="font-size:14px;font-weight:700;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
        ${receiptLabel}
      </p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:3px;">
        Date
      </p>
      <p style="font-size:12px;font-weight:600;color:#fff;">${paymentDate}</p>
    </div>
  </div>

  <!-- ── STUDENT INFO ─────────────────────────────────────────────────────────── -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-bottom:16px;">
    ${studentCells}
  </div>

  <hr class="divider-dash" />

  <!-- ── PAYMENT DETAIL ───────────────────────────────────────────────────────── -->
  <p style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaa;margin-bottom:10px;">
    Payment Detail
  </p>

  <div style="display:flex;flex-direction:column;gap:0;">

    <!-- Remarks -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f0ede8;">
      <span style="font-size:12px;color:rgba(47,78,64,0.55);">Remarks</span>
      <span style="font-size:12px;font-weight:600;color:#2d4a3e;">${payment.remarks ?? "—"}</span>
    </div>

    <!-- Payment Mode -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f0ede8;">
      <span style="font-size:12px;color:rgba(47,78,64,0.55);">Payment Mode</span>
      <span style="font-size:12px;font-weight:600;color:#2d4a3e;">${payment.paymentMode ?? "—"}</span>
    </div>

    <!-- Received by -->
    ${
      payment.addedByName
        ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f0ede8;">
             <span style="font-size:12px;color:rgba(47,78,64,0.55);">Received by</span>
             <span style="font-size:12px;font-weight:600;color:#2d4a3e;">${payment.addedByName}</span>
           </div>`
        : ""
    }

  </div>

  <!-- ── AMOUNT BOX ────────────────────────────────────────────────────────────── -->
  <div style="background:#f7f5f2;border-radius:12px;padding:18px 22px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:13px;font-weight:700;color:#2f4e40;">Amount Received</span>
    <span style="font-size:22px;font-weight:900;color:#2d4a3e;letter-spacing:-0.02em;">
      NPR ${amountRaw.toLocaleString()}
    </span>
  </div>

  <hr class="divider-dash" style="margin-top:22px;" />

  <!-- ── FOOTER ─────────────────────────────────────────────────────────────────── -->
  <p style="text-align:center;font-size:10.5px;color:#bbb;margin-top:14px;line-height:1.6;">
    Thank you for your payment &nbsp;·&nbsp; ${siteInfo.company.shortName}<br/>
    <span style="font-size:10px;">Printed on ${printDate} &nbsp;·&nbsp; Computer-generated receipt</span>
  </p>

</body>
</html>`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePrintReceipt({
  student,
  payment,
  receiptNo,
}: PrintReceiptProps) {
  const handlePrintReceipt = () => {
    const html = buildReceiptHTML(student, payment, receiptNo);

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

  return { handlePrintReceipt };
}
