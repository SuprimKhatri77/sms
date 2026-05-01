import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { dmSans, lora, playfair } from "@/utils/font";
import NavFooterWrapper from "@/components/wrapper/nav-footer-wrapper";
import { siteInfo } from "@/utils/site-info";

export const metadata: Metadata = {
  title: `${siteInfo.company.shortName} | Professional Training`,
  description:
    "Apply for professional barista, bakery, and hospitality training. Send an inquiry to start your journey with Brew & Bake Academy.",
  keywords: ["barista", "bakery", "hospitality", "training", "admission"],
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
