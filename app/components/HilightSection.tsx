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

    // Realtime live sync
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll(
              ".reveal, .reveal-left, .reveal-right, .reveal-scale"
            );
            reveals.forEach((el) => el.classList.add("revealed"));
          }
        });
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [speakers]);

  // If loaded and no active speakers, hide section
  if (loaded && speakers.length === 0) {
    return null;
  }

  return (
    <section
      id="hilight"
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-gradient-to-b from-pink-pale via-cream-bg to-pink-pale overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block px-4 py-1.5 bg-pink-accent/10 text-pink-accent text-sm font-semibold rounded-full mb-4">
            Hilight
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-accent to-purple-primary bg-clip-text text-transparent">
              Hilight ค่ายปีที่ 7
            </span>
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
            พบกับวิทยากรผู้ทรงคุณวุฒิที่จะมาร่วมสร้างแรงบันดาลใจและแบ่งปันประสบการณ์ในทุกกิจกรรม
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {speakers.map((speaker, i) => (
            <div
              key={speaker.id}
              className={`reveal-scale stagger-${(i % 4) + 1} group text-center`}
            >
              {/* Avatar */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-primary to-pink-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg
                                group-hover:border-pink-accent/50 transition-colors duration-300">
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-white/60 rounded-2xl border border-purple-primary/10
                              group-hover:bg-white group-hover:shadow-lg group-hover:shadow-purple-primary/10
                              transition-[background-color,box-shadow] duration-500">
                <h3 className="text-lg font-bold text-purple-dark mb-1">
                  {speaker.name}
                </h3>
                <p className="text-pink-accent text-sm font-semibold mb-1">
                  {speaker.role}
                </p>
                {speaker.activity && (
                  <p className="text-purple-primary text-xs font-medium mb-2">
                    📌 {speaker.activity}
                  </p>
                )}
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {speaker.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
