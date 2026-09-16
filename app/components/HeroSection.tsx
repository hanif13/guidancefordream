"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const ENTRANCE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

// วันปิดรับสมัคร: 22 กันยายน 2569 (พ.ศ.) = 22 Sep 2026 (ค.ศ.) เวลา 23:59 น.
const DEADLINE = new Date("2026-09-22T23:59:00+07:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, DEADLINE - now);

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

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

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
      {/* Background Image */}
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/20 to-purple-deeper/70" />

      {/* Content — centered */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl mx-auto">
        {/* Title */}
        <h1
          className="text-glow-white text-[2.75rem] xs:text-[3.25rem] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider uppercase select-none leading-[1.1] sm:leading-tight mb-3 md:mb-5 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 400ms, transform 900ms ${ENTRANCE_EASING} 400ms`,
          }}
        >
          Guidance For Dream
          <br />
          <span className="text-pink-light">SS7</span>
        </h1>

        {/* Camp Name */}
        <p
          className="text-white text-lg sm:text-xl md:text-2xl font-semibold tracking-wide mb-2 md:mb-3 will-change-[opacity,transform]"
          style={{
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(35, 10, 60, 0.9)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 600ms, transform 900ms ${ENTRANCE_EASING} 600ms`,
          }}
        >
          ค่ายสานฝันเพื่อน้อง ปีที่ 7
        </p>

        {/* Open Registration */}
        <p
          className="text-white/90 text-base sm:text-lg md:text-xl font-medium tracking-wide mb-6 md:mb-8 will-change-[opacity,transform]"
          style={{
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 700ms, transform 900ms ${ENTRANCE_EASING} 700ms`,
          }}
        >
          เปิดรับสมัครแล้ววันนี้
        </p>

        {/* Register Button */}
        <div
          className="mb-8 md:mb-10 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 800ms, transform 900ms ${ENTRANCE_EASING} 800ms`,
          }}
        >
          <a
            href="https://forms.gle/TYCKm5ZazkK2wEFu5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 sm:px-10 sm:py-4 bg-gradient-to-r from-purple-primary to-pink-accent
                       text-white text-base sm:text-lg font-bold rounded-full
                       hover:scale-105 hover:shadow-xl hover:shadow-purple-primary/40
                       active:scale-95 transition-all duration-300 cursor-pointer
                       border border-white/20"
          >
            สมัครเข้าร่วมค่าย
          </a>
        </div>

        {/* Countdown Label */}
        <p
          className="text-white/80 text-sm sm:text-base tracking-wide mb-4 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 900ms, transform 900ms ${ENTRANCE_EASING} 900ms`,
          }}
        >
          {isExpired ? "ปิดรับสมัครแล้ว" : "นับถอยหลังวันปิดรับสมัคร"}
        </p>

        {/* Countdown Timer */}
        <div
          className="flex items-center justify-center gap-3 sm:gap-5 will-change-[opacity,transform]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 900ms ${ENTRANCE_EASING} 1000ms, transform 900ms ${ENTRANCE_EASING} 1000ms`,
          }}
        >
          {countdownUnits.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
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
