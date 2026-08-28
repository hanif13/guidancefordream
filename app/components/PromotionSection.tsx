"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface PosterItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  linkUrl?: string;
}

export default function PromotionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [posters, setPosters] = useState<PosterItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);

  // Load Posters from Supabase
  useEffect(() => {
    async function loadPosters() {
      try {
        const { data, error } = await supabase
          .from("posters")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data) {
          setPosters(
            data.map((item) => ({
              id: item.id,
              src: item.image_url,
              alt: item.title,
              caption: item.caption || item.title,
              linkUrl: item.link_url,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load posters from Supabase:", err);
      } finally {
        setLoaded(true);
      }
    }

    loadPosters();

    // Realtime live sync
    const channel = supabase
      .channel("realtime-posters")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posters" },
        () => {
          loadPosters();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Intersection Observer for scroll animations
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
  }, [posters]);

  // Next / Previous Navigation
  const prevSlide = useCallback(() => {
    if (posters.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? posters.length - 1 : prev - 1));
  }, [posters.length]);

  const nextSlide = useCallback(() => {
    if (posters.length <= 1) return;
    setCurrentIndex((prev) => (prev === posters.length - 1 ? 0 : prev + 1));
  }, [posters.length]);

  // Auto-play every 5 seconds (paused if hovered or modal is open)
  useEffect(() => {
    if (posters.length <= 1 || isHovered || selectedPoster !== null) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [posters.length, isHovered, selectedPoster, nextSlide]);

  // Keyboard navigation & escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPoster(null);
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  // If loaded and no active posters, hide section
  if (loaded && posters.length === 0) {
    return null;
  }

  const currentPoster = posters[currentIndex] || posters[0];

  return (
    <>
      <section
        id="promotion"
        ref={sectionRef}
        className="relative py-20 sm:py-28 bg-gradient-to-b from-pink-pale to-cream-bg overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-pink-accent/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10 reveal">
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
              โปสเตอร์และสื่อประชาสัมพันธ์ค่ายสานฝันเพื่อน้อง ครั้งที่ 7 (คลิกที่ภาพเพื่อดูรายละเอียด)
            </p>
          </div>

          {/* HWKS-Style Featured Banner Slider */}
          {currentPoster && (
            <div
              className="relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px] mx-auto reveal-scale"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Main Banner Card */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-purple-dark/25 border border-purple-primary/25 bg-slate-950 group cursor-pointer">
                {/* Poster Image Container */}
                <div
                  onClick={() => setSelectedPoster(currentPoster)}
                  className="relative w-full overflow-hidden group/img block"
                  title="คลิกเพื่อดูภาพใหญ่และรายละเอียด"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={`img-${currentPoster.id || currentIndex}`}
                    src={currentPoster.src}
                    alt={currentPoster.alt || currentPoster.caption}
                    className="w-full h-auto object-cover block transition-all duration-700 animate-fade-in group-hover/img:scale-[1.02]"
                  />

                  {/* Hover hint badge */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-white text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1.5 shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span>คลิกเพื่อดูภาพเต็ม</span>
                  </div>
                </div>

                {/* Navigation Left Chevron Arrow */}
                {posters.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/40 hover:bg-slate-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg"
                    aria-label="Previous Poster"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Navigation Right Chevron Arrow */}
                {posters.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/40 hover:bg-slate-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg"
                    aria-label="Next Poster"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Bottom Overlay with Title, Link, and Pagination Indicators */}
                <div
                  onClick={() => setSelectedPoster(currentPoster)}
                  className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent pt-12 pb-4 px-5 sm:px-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Title & Link */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-sm sm:text-base md:text-lg truncate tracking-wide drop-shadow-md">
                        {currentPoster.alt || currentPoster.caption}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs text-pink-light hover:underline mt-0.5">
                        <span>ดูรายละเอียด & ลิงก์โพสต์</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>

                    {/* Pagination Dots (HWKS Style) */}
                    {posters.length > 1 && (
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {posters.map((_, i) => (
                          <button
                            key={`dot-${i}`}
                            onClick={() => setCurrentIndex(i)}
                            className={`transition-all duration-300 rounded-full cursor-pointer ${
                              currentIndex === i
                                ? "w-6 h-2 bg-gradient-to-r from-purple-light to-pink-accent shadow-md shadow-pink-accent/50"
                                : "w-2 h-2 bg-white/40 hover:bg-white/75"
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FULL-SCREEN DETAIL LIGHTBOX MODAL */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fade-in"
          onClick={() => setSelectedPoster(null)}
        >
          {/* Modal Container */}
          <div
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-[scale-in_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPoster(null)}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              aria-label="ปิดหน้าต่าง"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Side: Large Full Poster Image */}
            <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto max-h-[50vh] md:max-h-[85vh] border-b md:border-b-0 md:border-r border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPoster.src}
                alt={selectedPoster.alt}
                className="max-h-[46vh] md:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-xl"
              />
            </div>

            {/* Right Side: Details & Facebook CTA */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-[85vh] bg-slate-900">
              <div>
                {/* Tag Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-primary/30 to-pink-accent/30 text-pink-light text-xs font-semibold rounded-full border border-purple-primary/40">
                    📢 ประชาสัมพันธ์โครงการ
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Guidance for Dream 7th
                  </span>
                </div>

                {/* Poster Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight mb-4">
                  {selectedPoster.alt}
                </h2>

                <div className="w-12 h-1 bg-gradient-to-r from-purple-primary to-pink-accent rounded-full mb-5" />

                {/* Description / Caption */}
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                  <p>{selectedPoster.caption || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
                </div>
              </div>

              {/* Action Buttons at Bottom */}
              <div className="pt-6 mt-6 border-t border-slate-800 space-y-3">
                {/* Facebook Post Button */}
                <a
                  href={selectedPoster.linkUrl || "https://www.facebook.com/MSSPSU"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {/* Facebook SVG Icon */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>ดูโพสต์บน Facebook</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <button
                  onClick={() => setSelectedPoster(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  ปิดหน้าต่างนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
