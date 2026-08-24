"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/mountian.png"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
      </div>

      {/* Gradient Overlay for smooth fade */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-purple-deeper/40 via-purple-primary/15 to-cream-bg" />

      {/* Realistic Animated Floating Clouds & Fog Layers */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {/* Fog Layer 1 - Low Valley Mist (Drifting Left-Right) */}
        <div 
          className="absolute -bottom-10 -left-1/4 w-[160%] h-96 opacity-60 mix-blend-screen blur-3xl rounded-[100%]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(242, 196, 208, 0.45) 0%, rgba(255, 240, 245, 0.3) 40%, rgba(255, 255, 255, 0) 75%)",
            animation: "fog-drift-1 26s ease-in-out infinite"
          }}
        />

        {/* Fog Layer 2 - Mid Ridge Cloud Stream (Drifting Opposite) */}
        <div 
          className="absolute top-1/3 -right-1/4 w-[150%] h-80 opacity-50 mix-blend-screen blur-2xl rounded-[100%]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(212, 133, 154, 0.35) 0%, rgba(180, 154, 209, 0.25) 45%, rgba(255, 255, 255, 0) 70%)",
            animation: "fog-drift-2 32s ease-in-out infinite"
          }}
        />

        {/* Fog Layer 3 - Mountain Peak Soft Cloud Ambient */}
        <div 
          className="absolute top-12 left-0 w-full h-72 opacity-40 mix-blend-screen blur-3xl"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(242, 196, 208, 0.15) 50%, rgba(255, 255, 255, 0) 80%)",
            animation: "fog-drift-3 20s ease-in-out infinite"
          }}
        />
      </div>

      {/* Decorative Light Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-primary/20 rounded-full blur-3xl animate-float-slow z-[2]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-accent/20 rounded-full blur-3xl animate-float-delay-2 z-[2]" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-light/15 rounded-full blur-2xl animate-float-delay-1 z-[2]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto">

        {/* Coming Soon Pure Text in Lucian Schoenschrift */}
        <div className="animate-float mb-2 sm:mb-4 flex flex-col items-center justify-center overflow-visible">
          <h1 className="font-lucian text-gradient-coming-soon text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] tracking-wide select-none leading-[1.3] pt-6 pb-4 px-6 sm:px-10 overflow-visible inline-block">
            Coming Soon
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-white/90 text-lg sm:text-xl lg:text-2xl font-light mb-3 animate-[fade-in-up_1s_ease-out_0.3s_both] tracking-wide">
          ค่ายสานฝันเพื่อน้อง ครั้งที่ 7
        </p>

        {/* Date & Location */}
        <div className="liquid-glass inline-flex items-center gap-3 px-7 py-3.5 rounded-full mb-8 animate-[fade-in-up_1s_ease-out_0.5s_both]">
          <svg
            className="w-5 h-5 text-pink-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-white text-sm sm:text-base font-semibold drop-shadow-sm">
            6-9 พฤศจิกายน 2569
          </span>
          <span className="text-white/50">|</span>
          <svg
            className="w-5 h-5 text-pink-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-white text-sm sm:text-base font-semibold drop-shadow-sm">
            ม.สงขลานครินทร์ หาดใหญ่
          </span>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-[fade-in_2s_ease-out_1.5s_both]">
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
