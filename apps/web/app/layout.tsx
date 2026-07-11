import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { dmSans, lora, playfair } from "@/utils/font";
import NavFooterWrapper from "@/components/wrapper/nav-footer-wrapper";
import { getSiteUrl } from "@/lib/seo";
import { getCurrentUser } from "@/lib/queries/auth/get-current-user";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AdminNavigationShortcuts } from "@/components/admin/admin-navigation-shortcuts";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "nepali-datepicker-reactjs/dist/index.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  verification: {
    google: "Kqup0zVMASUI41BgW0WSjUY37K65Fjp254ODhRkfrjs",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

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
        <GoogleAnalytics />
        <ReactQueryProvider>
          <AuthProvider user={user} />
          <AdminNavigationShortcuts />
          <TooltipProvider>
            <NavFooterWrapper>{children}</NavFooterWrapper>
          </TooltipProvider>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
