"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const galleryItems = [
  {
    src: "/images/1.jpg",
    alt: "โปสเตอร์ค่าย Guidance for Dream",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/11.jpg",
    alt: "ทริปเดินป่า",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/111.jpg",
    alt: "ทิวทัศน์ภูเขา",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/2.jpg",
    alt: "เส้นทางสู่ยอดเขา",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/22.jpg",
    alt: "กิจกรรมค่าย",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/222.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/3.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },
  {
    src: "/images/33.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },

  {
    src: "/images/333.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },

  {
    src: "/images/4.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },

  {
    src: "/images/44.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },

  {
    src: "/images/444.jpg",
    alt: "วิวภูเขาดอกไม้",
    caption: "Guidance for Dream 6th",
  },
];

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <section
        id="gallery"
        ref={sectionRef}
        className="relative py-20 sm:py-28 bg-gradient-to-b from-pink-pale to-cream-bg overflow-hidden"
      >
        {/* Decorative */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-accent/10 text-pink-accent text-sm font-semibold rounded-full mb-4">
              ภาพกิจกรรม
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-accent to-purple-primary bg-clip-text text-transparent">
                ความทรงจำที่ผ่านมา
              </span>
            </h2>
            <div className="section-divider mb-6" />
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              ภาพบรรยากาศกิจกรรมค่ายสานฝันเพื่อน้องที่ผ่านมา เต็มไปด้วยรอยยิ้มและความสุข
            </p>
          </div>
        </div>

        {/* Infinite Gallery Marquee */}
        <div className="relative reveal-scale overflow-hidden">
          {/* Edge fade gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-pink-pale to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-cream-bg to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="flex animate-marquee-gallery hover:[animation-play-state:paused] py-2">
            {[...galleryItems, ...galleryItems].map((item, i) => (
              <div
                key={`gallery-${i}`}
                className="flex-shrink-0 mx-3 sm:mx-4"
              >
                <button
                  onClick={() => setSelectedImage(i % galleryItems.length)}
                  className="group relative w-64 sm:w-80 aspect-[4/3] rounded-2xl overflow-hidden
                             cursor-pointer border border-purple-primary/15 shadow-md shadow-purple-primary/5
                             hover:shadow-xl hover:shadow-purple-primary/15 hover:scale-105
                             transition-[transform,box-shadow] duration-300 block"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 256px, 320px"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-deeper/85 via-purple-deeper/25 to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                  flex items-end p-4 sm:p-5 text-left">
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {item.caption}
                      </p>
                      <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                        คลิกเพื่อดูรูปใหญ่
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-[fade-in_0.3s_ease-out]"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white text-4xl font-light cursor-pointer
                       w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div
            className="relative max-w-4xl w-full aspect-[4/3] rounded-2xl overflow-hidden animate-[scale-in_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryItems[selectedImage].src}
              alt={galleryItems[selectedImage].alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <p className="absolute bottom-8 text-white/80 text-lg font-medium">
            {galleryItems[selectedImage].caption}
          </p>
        </div>
      )}
    </>
  );
}
