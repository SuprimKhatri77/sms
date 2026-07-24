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

/** Inline CSS must not keep @import — it delays/breaks print rendering. */
function prepareInlineCss(css: string): string {
  return css.replace(/@import\s+url\([^)]+\)\s*;?/g, "").trim();
}

async function loadCertificateStyles(origin: string): Promise<string> {
  try {
    const response = await fetch(
      `${origin}/certificate-print.css?t=${Date.now()}`,
      { cache: "no-store" },
    );
    if (response.ok) {
      return prepareInlineCss(await response.text());
    }
  } catch {
    // Fall back to linked stylesheet in the print document.
  }
  return "";
}

function buildPrintHtml(content: string, origin: string, inlineCss: string) {
  const stylesheetTag = inlineCss
    ? `<style>${inlineCss}</style>`
    : `<link rel="stylesheet" href="${origin}/certificate-print.css?t=${Date.now()}" />`;

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
      size: A4 portrait;
      margin: 6mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cert-frame {
      margin: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    .cert-paper {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
      margin: 0 !important;
      box-shadow: none !important;
    }
    .cert-body-prose {
      max-width: 132mm !important;
      width: 132mm !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    .cert-frame-ring {
      border-width: 3px 3px 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .cert-frame-ring-outer {
      top: 3px !important;
      left: 3px !important;
      right: 3px !important;
      border-color: #c28c53 !important;
    }
    .cert-frame-ring-mid {
      top: 10px !important;
      left: 10px !important;
      right: 10px !important;
      border-color: #3e6b51 !important;
    }
    .cert-frame-ring-inner {
      top: 17px !important;
      left: 17px !important;
      right: 17px !important;
      border-color: #c28c53 !important;
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
  // Real A4 size off-screen — 0×0 iframes break flex/gradient print layout
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;";
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
      // Allow layout + background paints to settle at real A4 size
      await new Promise((resolve) => setTimeout(resolve, 500));
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
