"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const orgs = [
  {
    name: "Prince of Songkla University",
    abbr: "PSU",
    logo: "/images/psu.webp",
  },
  {
    name: "Muslim Student Society PSU Hatyai",
    abbr: "MSS",
    logo: "/images/MSS.jpg",
  },
  {
    name: "Muslim Young Blood",
    abbr: "MYB",
    logo: "/images/MYB.jpg",
  },
];

export default function ImplementedBySection() {
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

  return (
    <section
      id="implemented-by"
      ref={sectionRef}
      className="relative py-16 sm:py-20 bg-gradient-to-b from-cream-bg to-pink-pale overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-sm font-semibold rounded-full mb-4">
            ผู้จัดโครงการ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
              Implemented by
            </span>
          </h2>
          <div className="section-divider mb-6" />
        </div>

        {/* 3 Logos in a row */}
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 reveal-scale">
          {orgs.map((org) => (
            <div
              key={org.abbr}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-md shadow-purple-primary/5
                              p-3 flex items-center justify-center border border-purple-primary/10
                              group-hover:shadow-xl group-hover:shadow-purple-primary/15 group-hover:scale-105 group-hover:-translate-y-1
                              transition-[box-shadow,transform] duration-300 relative overflow-hidden">
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={96}
                  height={96}
                  className="object-contain w-full h-full rounded-xl"
                />
              </div>
              <span className="text-foreground/60 font-medium text-xs sm:text-sm text-center max-w-[160px] leading-snug
                               group-hover:text-purple-dark transition-colors">
                {org.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
