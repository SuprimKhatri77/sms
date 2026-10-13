"use client";

import { usePathname } from "next/navigation";
import { MotionProvider } from "../motion/motion-provider";
import { SiteHeader } from "../site/site-header";
import { SiteFooter } from "../site/site-footer";
import WhatsAppFloat from "../landing/WhatsAppFloat";

const EXCLUDE_NAV_FOOTER_ROUTES = ["/admin", "/auth", "/dashboard"];
export default function NavFooterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavFooter = EXCLUDE_NAV_FOOTER_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  return hideNavFooter ? (
    <>{children}</>
  ) : (
    <MotionProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </MotionProvider>
  );
}
