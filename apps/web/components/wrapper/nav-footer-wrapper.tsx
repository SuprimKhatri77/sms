"use client";

import { usePathname } from "next/navigation";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";

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
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
