"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      id="navbar"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4"
    >
      <div
        className={`max-w-6xl mx-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-500 flex items-center justify-between ${
          scrolled ? "liquid-glass-nav-scrolled" : "liquid-glass-nav"
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <Image
            src="/images/GFD-7.png"
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
                         hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#details")}
            className="ml-3 px-5 py-2 liquid-glass-accent
                       text-white text-sm font-semibold rounded-full
                       hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <span className="relative z-10 drop-shadow-sm">สมัครเข้าร่วม</span>
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
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-500 overflow-hidden ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="liquid-glass-nav-scrolled mx-4 mt-3 rounded-2xl p-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10
                         rounded-xl text-sm font-medium transition-all duration-300 text-left cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#details")}
            className="mt-2 px-4 py-3 liquid-glass-accent
                       text-white text-sm font-semibold rounded-xl text-center cursor-pointer"
          >
            <span className="relative z-10">สมัครเข้าร่วม</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
