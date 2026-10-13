import localFont from "next/font/local";

// Self-hosted (latin subset, from Google Fonts) rather than next/font/google:
// fetching the Google CSS at build time can return font URLs that Turbopack
// fails to resolve, which breaks the build. Licences: assets/fonts/site/OFL.txt.

export const playfair = localFont({
  src: "../assets/fonts/site/PlayfairDisplay-Variable.woff2",
  variable: "--font-playfair",
  display: "swap",
  weight: "400 800",
  adjustFontFallback: "Times New Roman",
});

export const dmSans = localFont({
  src: "../assets/fonts/site/DMSans-Variable.woff2",
  variable: "--font-dm-sans",
  display: "swap",
  weight: "300 600",
});

export const lora = localFont({
  src: [
    {
      path: "../assets/fonts/site/Lora-Variable.woff2",
      weight: "400 600",
      style: "normal",
    },
    {
      path: "../assets/fonts/site/Lora-Italic-Variable.woff2",
      weight: "400 600",
      style: "italic",
    },
  ],
  variable: "--font-lora",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Public site (cartspace-style editorial type): serif display, grotesk body,
// mono labels.
export const instrumentSerif = localFont({
  src: [
    {
      path: "../assets/fonts/site/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/site/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const geist = localFont({
  src: "../assets/fonts/site/Geist-Variable.woff2",
  variable: "--font-geist",
  display: "swap",
  weight: "100 900",
});

export const geistMono = localFont({
  src: "../assets/fonts/site/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});
