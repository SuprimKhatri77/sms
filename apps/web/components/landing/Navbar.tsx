"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import Image from "next/image";
import { siteInfo } from "@/utils/site-info";
import { useAuthStore } from "@/store/auth";
import { Button } from "../ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Why Us", href: "#why-us" },
  { label: "Programs", href: "#programs" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Inquire", href: "#inquiry" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  console.log("user: ", user);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Set exact pixel height so CSS transition is smooth
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (menuOpen) {
      el.style.height = el.scrollHeight + "px";
      el.style.opacity = "1";
    } else {
      el.style.height = "0px";
      el.style.opacity = "0";
    }
  }, [menuOpen]);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-100 transition-all duration-300 
          bg-[#2d4a3e]/97 shadow-[0_2px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl
      "
    >
      <div className="mx-auto flex h-25 max-w-300 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="flex h-20 w-20 items-center justify-center overflow-hidden">
            <Image
              src={siteInfo.assets.whiteLogoNoBG}
              alt={siteInfo.company.shortName}
              width={120}
              height={120}
            />
          </span>
          {/* <span
            className="text-[1.15rem] font-semibold tracking-[0.01em] text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {siteInfo.company.shortName}
          </span> */}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[0.9rem] font-medium tracking-[0.02em] text-white/85 transition-colors duration-200 hover:text-[#d6cbb8]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 items-center">
            <Link
              href="/admission"
              className="rounded-lg bg-[#c28a4f] px-[1.4rem] py-[0.55rem] text-[0.9rem] font-semibold tracking-[0.02em] text-white transition-all duration-200 hover:-translate-y-px hover:opacity-90"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Apply Now
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-block rounded-[10px] border border-white/25 px-8 py-2 text-[0.95rem] font-medium text-white/85 transition-all duration-200 hover:border-[#d6cbb8] hover:text-[#d6cbb8]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Login
              </Link>
            )}
          </div>
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors duration-200 hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? (
            <X className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Mobile Menu — real height transition via ref */}
      <div
        ref={menuRef}
        className="overflow-hidden bg-[#2d4a3e] lg:hidden"
        style={{
          height: "0px",
          opacity: 0,
          transition:
            "height 260ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease",
        }}
      >
        <div className="flex flex-col gap-1 px-6 pb-6 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-white/10 py-3 text-[1rem] font-medium text-white/85 transition-colors duration-150 hover:text-[#d6cbb8]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3">
            <Link
              href="/admission"
              onClick={() => setMenuOpen(false)}
              className="mt-3 rounded-lg bg-[#e8552a] px-6 py-3  text-[1rem] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Apply Now
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-block rounded-[10px] border border-white/25 px-8 py-2 text-[0.95rem] font-medium text-white/85 transition-all duration-200 hover:border-[#d6cbb8] hover:text-[#d6cbb8]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
