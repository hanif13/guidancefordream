"use client";

import { useEffect, useRef } from "react";

// Placeholder partners — replace with real logos when available
const partners = [
  { name: "Partner A", logo: null },
  { name: "Partner B", logo: null },
  { name: "Partner C", logo: null },
  { name: "Partner D", logo: null },
  { name: "Partner E", logo: null },
  { name: "Partner F", logo: null },
];

export default function BloomingPartnersSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Duplicate partners for seamless infinite loop
  const marqueeItems = [...partners, ...partners];

  return (
    <section
      id="partners"
      ref={sectionRef}
      className="relative py-16 sm:py-20 bg-gradient-to-b from-pink-pale to-cream-bg overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block px-4 py-1.5 bg-pink-accent/10 text-pink-accent text-sm font-semibold rounded-full mb-4">
            ผู้สนับสนุน
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-accent to-purple-primary bg-clip-text text-transparent">
              Blooming Partners
            </span>
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
            ขอขอบคุณผู้สนับสนุนทุกท่านที่ร่วมเป็นส่วนหนึ่งในการสร้างฝันให้น้องๆ
            <br />ทุกการเดินทางสู่ยอดเขา ล้วนมีผู้ร่วมเดินทางอยู่เบื้องหลัง
          </p>
        </div>

        {/* Infinite Marquee */}
        <div className="relative reveal-scale overflow-hidden">
          {/* Edge fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-pink-pale to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-pink-pale to-transparent z-10 pointer-events-none" />

          {/* Marquee track */}
          <div className="flex animate-marquee hover:[animation-play-state:paused]">
            {marqueeItems.map((partner, i) => (
              <div
                key={`partner-${i}`}
                className="flex-shrink-0 mx-5 sm:mx-8"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-md shadow-purple-primary/5
                                border border-purple-primary/10 flex items-center justify-center p-4
                                hover:shadow-lg hover:shadow-purple-primary/10 hover:scale-105
                                transition-[box-shadow,transform] duration-300">
                  {partner.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-foreground/30 text-sm font-semibold text-center leading-tight">
                      {partner.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
