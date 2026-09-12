"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";

interface SpeakerItem {
  id: string;
  name: string;
  role: string;
  activity?: string;
  desc: string;
  image: string;
}

// Photo/text sizing shrinks automatically as more speakers are added,
// so everyone always fits on the page without paging or scrolling.
function getSizeTier(total: number) {
  if (total <= 3) {
    return {
      img: "w-[170px] sm:w-[190px] h-[280px] sm:h-[380px]",
      name: "text-xl sm:text-2xl",
      role: "text-xs sm:text-sm",
      gap: "gap-6 sm:gap-10 lg:gap-14",
      showVerticalLabel: true,
    };
  }
  if (total <= 6) {
    return {
      img: "w-[130px] sm:w-[150px] h-[220px] sm:h-[300px]",
      name: "text-base sm:text-lg",
      role: "text-xs",
      gap: "gap-5 sm:gap-8",
      showVerticalLabel: true,
    };
  }
  return {
    img: "w-[100px] sm:w-[120px] h-[170px] sm:h-[220px]",
    name: "text-sm sm:text-base",
    role: "text-[11px] sm:text-xs",
    gap: "gap-4 sm:gap-6",
    // Vertical side labels take up horizontal room per card; once cards get
    // this small, drop them so the row stays legible.
    showVerticalLabel: false,
  };
}

export default function HilightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [speakers, setSpeakers] = useState<SpeakerItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSpeakers() {
      try {
        const { data, error } = await supabase
          .from("speakers")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data) {
          setSpeakers(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              role: item.role,
              activity: item.activity || "",
              desc: item.description || "",
              image: item.image_url || "/images/favicon.png",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load speakers from Supabase:", err);
      } finally {
        setLoaded(true);
      }
    }

    loadSpeakers();

    const channel = supabase
      .channel("realtime-speakers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "speakers" },
        () => {
          loadSpeakers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
          }
        });
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (loaded && speakers.length === 0) {
    return null;
  }

  const total = speakers.length;
  const tier = getSizeTier(total);

  return (
    <section
      id="hilight"
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-gradient-to-b from-pink-pale via-cream-bg to-pink-pale overflow-hidden"
    >
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 reveal ${isRevealed ? "revealed" : ""}`}>
          <span className="inline-block px-4 py-1.5 bg-pink-accent/10 text-pink-accent text-sm font-semibold rounded-full mb-4">
            Hilight
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-accent to-purple-primary bg-clip-text text-transparent">
              Hilight Activity
            </span>
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
            พบกับวิทยากรผู้ทรงคุณวุฒิที่จะมาร่วมสร้างแรงบันดาลใจและแบ่งปันประสบการณ์ในทุกกิจกรรม
          </p>
        </div>

        {/* All speakers — wraps to additional rows and shrinks as the list grows */}
        <div className={`reveal-scale ${isRevealed ? "revealed" : ""} flex flex-wrap items-start justify-center ${tier.gap}`}>
          {!loaded ? (
            /* Skeleton Loader */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                <div className={`bg-purple-primary/10 rounded-2xl ${tier.img}`} />
                <div className="mt-4 w-24 h-5 bg-purple-primary/10 rounded" />
                <div className="mt-2 w-16 h-4 bg-purple-primary/10 rounded" />
              </div>
            ))
          ) : (
            speakers.map((speaker, i) => {
              // Alternate the diagonal cut direction and a slight vertical
            // offset so the row reads as a gentle zig-zag, like the reference.
            const clipPath =
              i % 2 === 0
                ? "polygon(0 0, 100% 0, 100% 88%, 0% 100%)"
                : "polygon(0 0, 100% 0, 100% 100%, 0% 88%)";
            const zigzagOffset = i % 2 === 1 ? "sm:translate-y-4" : "";

            return (
              <div
                key={speaker.id}
                className={`flex flex-col items-center flex-shrink-0 transition-transform duration-500 hover:-translate-y-1 ${zigzagOffset}`}
              >
                {/* Photo + vertical name tag */}
                <div className="relative flex items-end gap-2">
                  <div className={`relative overflow-hidden ${tier.img}`} style={{ clipPath }}>
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 140px, 190px"
                    />
                  </div>

                  {tier.showVerticalLabel && (
                    <span
                      className="block text-[10px] tracking-[0.25em] font-bold text-purple-primary/70 whitespace-nowrap max-h-[220px] overflow-hidden"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      title={speaker.desc}
                    >
                      {speaker.desc}
                    </span>
                  )}
                </div>

                {/* Caption */}
                <div className="mt-4 text-center px-2 max-w-[280px]">
                  {speaker.activity && (
                    <p className="text-foreground/50 text-xs mb-1 whitespace-nowrap">
                      {speaker.activity}
                    </p>
                  )}
                  <h3 className={`font-bold text-purple-dark ${tier.name}`}>{speaker.name}</h3>
                  <p className={`text-pink-accent font-semibold mt-1 ${tier.role}`}>
                    {speaker.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}