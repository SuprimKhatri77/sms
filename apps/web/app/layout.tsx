import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { dmSans, lora, playfair } from "@/utils/font";
import NavFooterWrapper from "@/components/wrapper/nav-footer-wrapper";

export const metadata: Metadata = {
  title: "Greenfield Academy | Excellence in Education",
  description:
    "Empowering students through quality education. Apply now or send us an inquiry to begin your journey at Greenfield Academy.",
  keywords: ["school", "academy", "admission", "education", "enrollment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        playfair.variable,
        dmSans.variable,
        lora.variable,
      )}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <TooltipProvider>
            <NavFooterWrapper>{children}</NavFooterWrapper>
          </TooltipProvider>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
