"use client";

import { useEffect, useState, useCallback } from "react";

const ENTRANCE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260819_212700_3bb9329b-5c50-4257-a09b-ca85cf3654a3.mp4";

// วันเปิดรับสมัคร: 16 กันยายน 2569 (พ.ศ.) = 16 Sep 2026 (ค.ศ.)
const TARGET_DATE = new Date("2026-09-16T00:00:00+07:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, TARGET_DATE - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  // Initialize with zeros to avoid hydration mismatch (Date.now() differs server vs client)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(mountTimer);
  }, []);

  // Only start countdown on client after mount
  useEffect(() => {
    setTimeLeft(getTimeLeft()); // set real value immediately on client
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const countdownUnits = [
    { value: timeLeft.days, label: "วัน" },
    { value: timeLeft.hours, label: "ชั่วโมง" },
    { value: timeLeft.minutes, label: "นาที" },
    { value: timeLeft.seconds, label: "วินาที" },
  ];

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Background Video — use will-change + GPU layer for smooth playback */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 1400ms ${ENTRANCE_EASING}`,
        }}
      >
        <video
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay — simple, no blur */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-purple-light/40 via-purple-primary/25 to-purple-deeper/80" />

      {/* Content — centered */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl mx-auto">
        {/* Coming Soon */}
        <h1
          className="text-glow-white text-[3.75rem] xs:text-[4.25rem] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider uppercase select-none leading-[0.95] sm:leading-tight mb-4 md:mb-6 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 400ms, transform 900ms ${ENTRANCE_EASING} 400ms`,
          }}
        >
          COMING
          <br className="sm:hidden" />
          {" "}SOON
        </h1>

        {/* Camp Name */}
        <p
          className="text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide mb-8 md:mb-10 will-change-[opacity,transform]"
          style={{
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(35, 10, 60, 0.9)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 600ms, transform 900ms ${ENTRANCE_EASING} 600ms`,
          }}
        >
          ค่ายสานฝันเพื่อน้อง ครั้งที่ 7
        </p>

        {/* Countdown Label */}
        <p
          className="text-white/70 text-sm sm:text-base tracking-wide mb-4 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 750ms, transform 900ms ${ENTRANCE_EASING} 750ms`,
          }}
        >
          นับถอยหลังวันเปิดรับสมัคร
        </p>

        {/* Countdown Timer — no backdrop-blur for mobile performance */}
        <div
          className="flex items-center justify-center gap-3 sm:gap-5 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 900ms, transform 900ms ${ENTRANCE_EASING} 900ms`,
          }}
        >
          {countdownUnits.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl bg-white/15 border border-white/20">
                <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums drop-shadow-md">
                  {String(unit.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-white/60 text-xs sm:text-sm mt-2">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transition: `opacity 2s ${ENTRANCE_EASING} 1.5s`,
        }}
      >
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
