"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const ENTRANCE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

interface SubpageHeroProps {
  badge?: string;
  titleMain: string;
  titleHighlight: string;
  subtitle1: string;
  subtitle2?: string;
  subtitle3?: string;
  scrollTargetId?: string;
}

export default function SubpageHero({
  badge,
  titleMain,
  titleHighlight,
  subtitle1,
  subtitle2,
  subtitle3,
  scrollTargetId = "#content",
}: SubpageHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(mountTimer);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full h-[75vh] min-h-[540px] sm:h-[82vh] overflow-hidden flex items-center justify-center"
    >
      {/* Background Image — Exactly as in Home page Hero */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 1400ms ${ENTRANCE_EASING}`,
        }}
      >
        <Image
          src="/images/hero-bg.jpg"
          alt="Guidance For Dream SS7 Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay — Exactly as in Home page Hero */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/25 to-purple-deeper/85" />

      {/* Content — Centered */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl mx-auto pt-16 sm:pt-20">
        {/* Badge */}
        {badge && (
          <div
            className="mb-3 sm:mb-4 will-change-[opacity,transform]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 900ms ${ENTRANCE_EASING} 250ms, transform 900ms ${ENTRANCE_EASING} 250ms`,
            }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/15 text-pink-light text-xs sm:text-sm font-semibold rounded-full border border-white/20 backdrop-blur-sm">
              {badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className="text-glow-white text-[2.75rem] xs:text-[3.25rem] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider uppercase select-none leading-[1.1] sm:leading-tight mb-3 md:mb-5 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 400ms, transform 900ms ${ENTRANCE_EASING} 400ms`,
          }}
        >
          {titleMain}
          <br />
          <span className="text-pink-light">{titleHighlight}</span>
        </h1>

        {/* Subtitles */}
        {subtitle1 && (
          <p
            className="text-white text-lg sm:text-xl md:text-2xl font-semibold tracking-wide mb-1.5 md:mb-2 will-change-[opacity,transform]"
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(35, 10, 60, 0.9)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(32px)",
              transition: `opacity 900ms ${ENTRANCE_EASING} 600ms, transform 900ms ${ENTRANCE_EASING} 600ms`,
            }}
          >
            {subtitle1}
          </p>
        )}

        {subtitle2 && (
          <p
            className="text-white text-base sm:text-lg md:text-xl font-medium tracking-wide mb-1 md:mb-1.5 will-change-[opacity,transform]"
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(35, 10, 60, 0.9)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(32px)",
              transition: `opacity 900ms ${ENTRANCE_EASING} 700ms, transform 900ms ${ENTRANCE_EASING} 700ms`,
            }}
          >
            {subtitle2}
          </p>
        )}

        {subtitle3 && (
          <p
            className="text-white/80 text-sm sm:text-base tracking-wide will-change-[opacity,transform]"
            style={{
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(32px)",
              transition: `opacity 900ms ${ENTRANCE_EASING} 800ms, transform 900ms ${ENTRANCE_EASING} 800ms`,
            }}
          >
            {subtitle3}
          </p>
        )}
      </div>

      {/* Scroll Down Indicator — Exactly as in Home page Hero */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 2s ${ENTRANCE_EASING} 1.2s`,
        }}
      >
        <button
          onClick={() => scrollToSection(scrollTargetId)}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90
                     transition-colors duration-300 cursor-pointer group"
          aria-label="เลื่อนลงดูเนื้อหา"
        >
          <span className="text-xs tracking-widest uppercase">เลื่อนลง</span>
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce"
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

