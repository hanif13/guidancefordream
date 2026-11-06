"use client";

import { useCallback } from "react";
import Image from "next/image";

export default function HeroSection() {
  const scrollToSection = useCallback((id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Guidance For Dream SS7 Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/20 to-purple-deeper/70" />

      {/* Content — centered */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-5xl mx-auto -mt-4 sm:-mt-8">
        {/* Title */}
        <h1 className="text-glow-white text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-black tracking-wider uppercase select-none leading-[1.08] sm:leading-tight mb-4 md:mb-6">
          Guidance For Dream
          <br />
          <span className="text-pink-light tracking-widest inline-block mt-1 sm:mt-2">SS7</span>
        </h1>

        {/* Camp Name & Dates */}
        <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-6">
          <p
            className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide"
            style={{
              textShadow: "0 2px 14px rgba(0, 0, 0, 0.85), 0 4px 24px rgba(35, 10, 60, 0.95)",
            }}
          >
            ค่ายสานฝันเพื่อน้อง ปีที่ 7
          </p>
          <p
            className="text-white/95 text-base sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-wider"
            style={{
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(35, 10, 60, 0.9)",
            }}
          >
            วันที่  6 - 9 พฤศจิกายน 2569
          </p>
          <p
            className="text-white/95 text-base sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-wider"
            style={{
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(35, 10, 60, 0.9)",
            }}
          >
            ณ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่
          </p>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => scrollToSection("#about")}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90
                     transition-colors duration-300 cursor-pointer group"
        >
          <span className="text-xs tracking-widest uppercase">เลื่อนลง</span>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
