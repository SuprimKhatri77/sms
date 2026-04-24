"use client";

import { usePathname } from "next/navigation";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";

export default function NavFooterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return !pathname.startsWith("/admin") && !pathname.startsWith("/auth") ? (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  ) : (
    children
  );
}
