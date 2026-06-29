function absolutizeAssetUrls(html: string): string {
  const origin = window.location.origin;
  return html.replace(
    /(src=")(\/[^"]+)"/g,
    (_, prefix: string, path: string) => `${prefix}${origin}${path}"`,
  );
}

function waitForImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images);
  if (images.length === 0) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

async function loadCertificateStyles(origin: string): Promise<string> {
  try {
    const response = await fetch(`${origin}/certificate-print.css`, {
      cache: "no-store",
    });
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Fall back to linked stylesheet in the print document.
  }
  return "";
}

function buildPrintHtml(content: string, origin: string, inlineCss: string) {
  const stylesheetTag = inlineCss
    ? `<style>${inlineCss}</style>`
    : `<link rel="stylesheet" href="${origin}/certificate-print.css" />`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Certificate</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${stylesheetTag}
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 297mm;
      height: 210mm;
      max-height: 210mm;
      overflow: hidden;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cert-frame {
      margin: 0 !important;
    }
  </style>
</head>
<body>${content}</body>
</html>`;
}

/** Prints a certificate preview via a hidden iframe (no blank popup tab). */
export async function printCertificateElement(
  root: HTMLElement | null,
): Promise<boolean> {
  if (!root) {
    return false;
  }

  const origin = window.location.origin;
  const paper = root.querySelector(".cert-paper");
  const inner = paper
    ? absolutizeAssetUrls(paper.outerHTML)
    : absolutizeAssetUrls(root.outerHTML);
  const inlineCss = await loadCertificateStyles(origin);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument ?? win?.document;
  if (!doc || !win) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(buildPrintHtml(inner, origin, inlineCss));
  doc.close();

  const runPrint = async () => {
    try {
      if (doc.fonts?.ready) {
        await doc.fonts.ready;
      }
      await waitForImages(doc);
      await new Promise((resolve) => setTimeout(resolve, 350));
    } catch {
      // Continue even if assets fail to load.
    }

    win.focus();
    win.print();

    const cleanup = () => iframe.remove();
    win.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(cleanup, 2000);
  };

  if (doc.readyState === "complete") {
    await runPrint();
  } else {
    iframe.addEventListener("load", () => void runPrint(), { once: true });
  }

  return true;
}
