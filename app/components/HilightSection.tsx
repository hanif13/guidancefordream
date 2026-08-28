"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const speakers = [
  {
    name: "วิทยากรท่านที่ 1",
    role: "ผู้เชี่ยวชาญด้านการศึกษา",
    desc: "แชร์ประสบการณ์การเรียนรู้และการพัฒนาตนเองสู่ความสำเร็จ",
    image: "/images/favicon.png",
  },
  {
    name: "วิทยากรท่านที่ 2",
    role: "นักจิตวิทยาการศึกษา",
    desc: "เทคนิคการค้นหาตัวเองและการวางแผนอนาคตอย่างมีเป้าหมาย",
    image: "/images/favicon.png",
  },
  {
    name: "วิทยากรท่านที่ 3",
    role: "ผู้นำชุมชนมุสลิม",
    desc: "สร้างแรงบันดาลใจในการใช้ชีวิตอย่างมีคุณค่าและเป้าหมาย",
    image: "/images/favicon.png",
  },
  {
    name: "วิทยากรท่านที่ 4",
    role: "ศิษย์เก่า GFD",
    desc: "ถ่ายทอดประสบการณ์จากน้องค่ายสู่การเป็นผู้นำรุ่นใหม่",
    image: "/images/favicon.png",
  },
];

export default function HilightSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
  }, []);

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
              key={speaker.name}
              className={`reveal-scale stagger-${i + 1} group text-center`}
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
                <p className="text-pink-accent text-sm font-semibold mb-2">
                  {speaker.role}
                </p>
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
