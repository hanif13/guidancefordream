"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoType: "youtube" | "upload";
  videoUrl: string;
  thumbnailUrl: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extract Google Drive file ID from URL
 */
function getDriveId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load Videos from Supabase
  useEffect(() => {
    async function loadVideos() {
      try {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data) {
          setVideos(
            data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description || "",
              videoType: item.video_type as "youtube" | "upload",
              videoUrl: item.video_url,
              thumbnailUrl: item.thumbnail_url || "",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load videos from Supabase:", err);
      } finally {
        setLoaded(true);
      }
    }

    loadVideos();

    // Realtime live sync
    const channel = supabase
      .channel("realtime-videos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => {
          loadVideos();
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
  }, [videos]);

  // Scroll thumbnail into view when changing index
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const container = thumbnailScrollRef.current;
      const thumbEl = container.children[currentIndex] as HTMLElement;
      if (thumbEl) {
        const scrollLeft = thumbEl.offsetLeft - container.offsetWidth / 2 + thumbEl.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  // Navigation
  const prevSlide = useCallback(() => {
    if (videos.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  }, [videos.length]);

  const nextSlide = useCallback(() => {
    if (videos.length <= 1) return;
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  }, [videos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond if section is in viewport
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isInView) return;

      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Thumbnail scroll buttons
  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbnailScrollRef.current) return;
    const scrollAmount = 200;
    thumbnailScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // If loaded and no active videos, hide section
  if (loaded && videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex] || videos[0];

  // Render video player based on type
  const renderPlayer = (video: VideoItem) => {
    if (video.videoType === "youtube") {
      const ytId = getYouTubeId(video.videoUrl);
      const driveId = getDriveId(video.videoUrl);

      if (ytId) {
        return (
          <iframe
            key={`yt-${video.id}`}
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-2xl"
          />
        );
      } else if (driveId) {
        return (
          <iframe
            key={`drive-${video.id}`}
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            title={video.title}
            allow="autoplay"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-2xl bg-black"
          />
        );
      } else {
        return <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">ลิงก์ไม่ถูกต้อง (รองรับ YouTube หรือ Google Drive)</div>;
      }
    } else {
      return (
        <video
          key={`vid-${video.id}`}
          src={video.videoUrl}
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-contain rounded-2xl bg-black"
          title={video.title}
        />
      );
    }
  };

  // Get thumbnail for a video
  const getThumbnail = (video: VideoItem): string => {
    if (video.thumbnailUrl) return video.thumbnailUrl;
    if (video.videoType === "youtube") {
      const ytId = getYouTubeId(video.videoUrl);
      if (ytId) return getYouTubeThumbnail(ytId);
    }
    return "";
  };

  return (
    <section
      id="videos"
      ref={sectionRef}
      className="relative py-16 sm:py-24 bg-gradient-to-b from-cream-bg to-pink-pale overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-pink-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 reveal">
          <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-sm font-semibold rounded-full mb-4">
            🎬 คลิปวิดีโอ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
              วิดีโอประชาสัมพันธ์
            </span>
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
            รวมคลิปวิดีโอกิจกรรมและสื่อประชาสัมพันธ์ค่ายสานฝันเพื่อน้อง ครั้งที่ 7
          </p>
        </div>

        {/* Main Video Player */}
        {currentVideo && (
          <div className="reveal-scale">
            {/* Video Player Container */}
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-purple-dark/25 border border-purple-primary/20 bg-slate-950">
                {/* 16:9 Aspect Ratio Container */}
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  {renderPlayer(currentVideo)}
                </div>
              </div>

              {/* Navigation Arrows (left/right of the video) */}
              {videos.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/90 hover:bg-white shadow-xl shadow-purple-dark/15 border border-purple-primary/15 flex items-center justify-center text-purple-dark hover:text-purple-primary hover:scale-110 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                    aria-label="คลิปก่อนหน้า"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/90 hover:bg-white shadow-xl shadow-purple-dark/15 border border-purple-primary/15 flex items-center justify-center text-purple-dark hover:text-purple-primary hover:scale-110 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                    aria-label="คลิปถัดไป"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>


            {/* Thumbnail Carousel (shown only if > 1 video) */}
            {videos.length > 1 && (
              <div className="max-w-4xl mx-auto mt-6 relative">
                {/* Scroll Left Button */}
                <button
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-purple-primary/15 flex items-center justify-center text-purple-dark hover:text-purple-primary transition-all cursor-pointer"
                  aria-label="เลื่อนซ้าย"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Thumbnails */}
                <div
                  ref={thumbnailScrollRef}
                  className="flex gap-3 overflow-x-auto px-6 sm:px-8 py-2 scrollbar-hide scroll-smooth"
                >
                  {videos.map((video, idx) => {
                    const thumb = getThumbnail(video);
                    return (
                      <button
                        key={`thumb-${video.id}`}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative flex-shrink-0 w-28 sm:w-36 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group ${
                          currentIndex === idx
                            ? "border-purple-primary shadow-lg shadow-purple-primary/30 scale-105 ring-2 ring-purple-primary/20"
                            : "border-transparent hover:border-purple-primary/30 opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`ดูคลิป: ${video.title}`}
                      >
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt={video.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/20 to-pink-accent/20 flex items-center justify-center">
                              <svg className="w-8 h-8 text-purple-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          {/* Play icon overlay */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                            currentIndex === idx ? "opacity-0" : "opacity-100 group-hover:opacity-80"
                          }`}>
                            <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                              <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>

                          {/* Active indicator */}
                          {currentIndex === idx && (
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-purple-primary to-pink-accent" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Scroll Right Button */}
                <button
                  onClick={() => scrollThumbnails("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-purple-primary/15 flex items-center justify-center text-purple-dark hover:text-purple-primary transition-all cursor-pointer"
                  aria-label="เลื่อนขวา"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Pagination Dots */}
            {videos.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {videos.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    onClick={() => setCurrentIndex(i)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === i
                        ? "w-7 h-2.5 bg-gradient-to-r from-purple-primary to-pink-accent shadow-md shadow-pink-accent/30"
                        : "w-2.5 h-2.5 bg-purple-primary/25 hover:bg-purple-primary/50"
                    }`}
                    aria-label={`ไปยังคลิปที่ ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
