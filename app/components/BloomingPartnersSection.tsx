"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";

interface PartnerItem {
  id: string;
  name: string;
  logo: string | null;
  tier?: string;
}

export default function BloomingPartnersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadPartners() {
      try {
        const { data, error } = await supabase
          .from("partners")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data) {
          setPartners(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              logo: item.logo_url || null,
              tier: item.tier || "General",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load partners from Supabase:", err);
      } finally {
        setLoaded(true);
      }
    }

    loadPartners();

    // Realtime live sync
    const channel = supabase
      .channel("realtime-partners")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partners" },
        () => {
          loadPartners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
  }, [partners]);

  // If loaded and no partners, hide section
  if (loaded && partners.length === 0) {
    return null;
  }

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
          </p>
        </div>

        {/* Infinite Marquee */}
        <div className="relative reveal-scale overflow-hidden">
          {/* Edge fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-pink-pale to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-pink-pale to-transparent z-10 pointer-events-none" />

          {/* Marquee track (Dual tracks for 100% seamless scroll) */}
          <div className="flex w-max group py-2">
            {/* Track 1 */}
            <div className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused] gap-6 pr-6">
              {partners.map((partner, i) => (
                <div
                  key={`p1-${partner.id || i}`}
                  className="flex-shrink-0"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-md shadow-purple-primary/5
                                  border border-purple-primary/10 flex items-center justify-center p-3 sm:p-4
                                  hover:shadow-lg hover:shadow-purple-primary/10 hover:scale-105
                                  transition-[box-shadow,transform] duration-300">
                    {partner.logo ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          className="object-contain"
                          sizes="128px"
                        />
                      </div>
                    ) : (
                      <span className="text-foreground/40 text-xs sm:text-sm font-semibold text-center leading-tight">
                        {partner.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Track 2 (Duplicate for infinite seamless loop) */}
            <div aria-hidden="true" className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused] gap-6 pr-6">
              {partners.map((partner, i) => (
                <div
                  key={`p2-${partner.id || i}`}
                  className="flex-shrink-0"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-md shadow-purple-primary/5
                                  border border-purple-primary/10 flex items-center justify-center p-3 sm:p-4
                                  hover:shadow-lg hover:shadow-purple-primary/10 hover:scale-105
                                  transition-[box-shadow,transform] duration-300">
                    {partner.logo ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          className="object-contain"
                          sizes="128px"
                        />
                      </div>
                    ) : (
                      <span className="text-foreground/40 text-xs sm:text-sm font-semibold text-center leading-tight">
                        {partner.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
