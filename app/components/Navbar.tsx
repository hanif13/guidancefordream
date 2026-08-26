"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const navLinks = [
  { label: "เกี่ยวกับค่าย", href: "#about" },
  { label: "กิจกรรม", href: "#gallery" },
  { label: "วันที่/สถานที่", href: "#details" },
  { label: "ติดต่อ", href: "#footer" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      // Use rAF to avoid layout thrashing on mobile
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-500 ${scrolled
        ? "bg-purple-deeper/85 backdrop-blur-md shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <Image
            src="/images/favicon.png"
            alt="Guidance for Dream 7th"
            width={48}
            height={48}
            className="rounded-lg transition-transform duration-300 group-hover:scale-110"
          />
          <span className="hidden sm:block text-white font-semibold text-sm tracking-wide">
            Guidance for Dream
            <span className="text-pink-light"> 7th</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 text-white/80 hover:text-white text-sm font-medium rounded-full
                         hover:bg-white/10 transition-colors duration-300 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#hero")}
            className="ml-3 px-5 py-2 bg-gradient-to-r from-purple-primary to-pink-accent
                       text-white text-sm font-semibold rounded-full
                       hover:scale-105 hover:shadow-lg hover:shadow-purple-primary/30
                       transition-all duration-300 cursor-pointer"
          >
            สมัครเข้าร่วม
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer z-10"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-[max-height,opacity] duration-500 overflow-hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-purple-deeper/90 backdrop-blur-md mx-4 mt-1 rounded-2xl p-4 flex flex-col gap-1 border border-white/10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10
                         rounded-xl text-sm font-medium transition-colors duration-300 text-left cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#hero")}
            className="mt-2 px-4 py-3 bg-gradient-to-r from-purple-primary to-pink-accent
                       text-white text-sm font-semibold rounded-xl text-center cursor-pointer"
          >
            สมัครเข้าร่วม
          </button>
        </div>
      </div>
    </nav>
  );
}
