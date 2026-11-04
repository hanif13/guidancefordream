"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

const navLinks: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "CAMP", href: "/camp" },
  { label: "KNOWLEDGE", href: "/documents" },
  { label: "MEMORIES", href: "/memories" },
  { label: "RUPRAO", href: "https://ruprao.guidance.msspsuhatyai.org/", isExternal: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Hide main website Navbar on admin dashboard pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-purple-deeper/90 backdrop-blur-md shadow-xl border-b border-white/10 py-2 sm:py-2.5"
          : "bg-gradient-to-b from-purple-deeper/75 via-purple-deeper/35 to-transparent py-3 sm:py-3.5"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo — icon only without text */}
        <Link
          href="/"
          className="flex items-center group cursor-pointer focus:outline-none"
          aria-label="HOME Guidance for Dream"
        >
          <div className="relative p-0.5 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-pink-light/50">
            <Image
              src="/images/favicon.png"
              alt="Guidance for Dream 7th"
              width={42}
              height={42}
              className="rounded-lg shadow-md shadow-black/20"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-black/20 backdrop-blur-md border border-white/15">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                (link.href === "/documents" && (pathname === "/documents" || pathname === "/knowledge")) ||
                (link.href === "/camp" && (pathname === "/camp" || pathname === "/schedule" || pathname === "/activities"));

            if (link.isExternal) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1 group"
                  title="เปิดเว็บไซต์ RUPRAO ในแท็บใหม่"
                >
                  <span>{link.label}</span>
                  <span className="text-[10px] text-pink-light transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 text-xs xl:text-sm font-semibold tracking-wide rounded-full transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-deeper/30 border border-white/25"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 cursor-pointer z-10 transition-colors hover:bg-white/15"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
              }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"
              }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1"
              }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${mobileOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-purple-deeper/95 backdrop-blur-xl mx-4 rounded-2xl p-3 flex flex-col gap-1.5 border border-white/15 shadow-2xl">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                (link.href === "/documents" && (pathname === "/documents" || pathname === "/knowledge")) ||
                (link.href === "/camp" && (pathname === "/camp" || pathname === "/schedule" || pathname === "/activities"));

            if (link.isExternal) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left text-white/85 hover:text-white hover:bg-white/10 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-pink-light">↗</span>
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${isActive
                    ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-sm font-bold"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
