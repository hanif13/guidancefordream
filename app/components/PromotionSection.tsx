"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";

const posters = [
  {
    src: "/images/poster.jpg",
    alt: "โปสเตอร์ประชาสัมพันธ์ค่ายสานฝันเพื่อน้อง ครั้งที่ 7",
    caption: "ค่ายสานฝันเพื่อน้อง ครั้งที่ 7",
  },
  // เพิ่มโปสเตอร์เพิ่มเติมที่นี่:
  // { src: "/images/poster2.jpg", alt: "...", caption: "..." },
];

export default function PromotionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll(
              ".reveal, .reveal-scale"
            );
            reveals.forEach((el) => el.classList.add("revealed"));
          }
        });
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <section
      id="promotion"
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-gradient-to-b from-pink-pale to-cream-bg overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-sm font-semibold rounded-full mb-4">
            ประชาสัมพันธ์
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
              ประชาสัมพันธ์ค่าย
            </span>
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
            โปสเตอร์และสื่อประชาสัมพันธ์ค่ายสานฝันเพื่อน้อง ครั้งที่ 7
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative reveal-scale">
          {/* Navigation Buttons */}
          {posters.length > 1 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white
                           rounded-full shadow-lg flex items-center justify-center
                           text-purple-dark hover:text-purple-primary transition-colors duration-300 cursor-pointer"
                aria-label="เลื่อนซ้าย"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white
                           rounded-full shadow-lg flex items-center justify-center
                           text-purple-dark hover:text-purple-primary transition-colors duration-300 cursor-pointer"
                aria-label="เลื่อนขวา"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Scrollable Row */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4
                       scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]
                       [&::-webkit-scrollbar]:hidden"
          >
            {posters.map((poster, i) => (
              <div
                key={`poster-${i}`}
                className="flex-shrink-0 w-full sm:w-[80%] lg:w-[60%] mx-auto snap-center"
              >
                <div className="relative aspect-[3/4] sm:aspect-[2/3] rounded-2xl overflow-hidden shadow-xl
                                border border-purple-primary/10 group">
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                  />
                </div>
                <p className="text-center text-foreground/60 text-sm mt-4 font-medium">
                  {poster.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
