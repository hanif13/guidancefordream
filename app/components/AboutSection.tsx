"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "แนะแนวการศึกษา",
    desc: "ให้คำปรึกษาและแนะแนวทางการศึกษาต่อในระดับมหาวิทยาลัย พร้อมแชร์ประสบการณ์จากรุ่นพี่",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "กิจกรรมกลุ่มสัมพันธ์",
    desc: "สร้างมิตรภาพผ่านกิจกรรมกลุ่มที่สนุกสนาน เสริมทักษะการทำงานเป็นทีมและภาวะผู้นำ",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    title: "การค้นหาตัวเอง",
    desc: "เวิร์กช็อปพัฒนาทักษะชีวิต การสื่อสาร และความคิดสร้างสรรค์ เพื่อเตรียมพร้อมสู่รั้วมหาวิทยาลัย",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "สร้างแรงบันดาลใจสู่อนาคต",
    desc: "ถ่ายทอดประสบการณ์จากวิทยากรผู้มากประสบการณ์และมีบทบาในสังคมมุสลิมไทย",
  },
];

const infoCards = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    iconBg: "bg-purple-primary/10",
    iconHoverBg: "group-hover:bg-purple-primary",
    iconColor: "text-purple-primary",
    title: "วันที่จัดค่าย",
    value: "6-9 พฤศจิกายน 2569",
    sub: "4 วัน 3 คืน",
    animation: "reveal-left stagger-1",
  },
  {
    icon: (
      <>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </>
    ),
    iconBg: "bg-pink-accent/10",
    iconHoverBg: "group-hover:bg-pink-accent",
    iconColor: "text-pink-accent",
    title: "สถานที่",
    value: "มหาวิทยาลัยสงขลานครินทร์",
    sub: "วิทยาเขตหาดใหญ่ จ.สงขลา",
    animation: "reveal stagger-2",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: "bg-purple-primary/10",
    iconHoverBg: "group-hover:bg-purple-primary",
    iconColor: "text-purple-primary",
    title: "กลุ่มเป้าหมาย",
    value: "น้องๆ ม.ปลาย",
    sub: "รับจำนวนจำกัด",
    animation: "reveal-right stagger-3",
  },
];


export default function AboutSection() {
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
      id="about"
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-gradient-to-b from-cream-bg to-pink-pale overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-sm font-semibold rounded-full mb-4">
            เกี่ยวกับค่าย
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-darker mb-4">
            <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
              Guidance for Dream
            </span>{" "}
            7th
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
            ค่ายสานฝันเพื่อน้อง เป็นค่ายที่จัดขึ้นเพื่อแนะแนวการศึกษา สร้างแรงบันดาลใจ
            และพัฒนาศักยภาพให้กับน้องๆ ระดับมัธยมศึกษา ก้าวสู่ปีที่ 7 ด้วยความมุ่งมั่นและตั้งใจ
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`reveal-scale stagger-${i + 1} group p-6 bg-white/70 rounded-2xl border border-purple-primary/10
                          hover:bg-white hover:shadow-xl hover:shadow-purple-primary/10 hover:-translate-y-2
                          transition-[background-color,box-shadow,transform] duration-500 cursor-default`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-primary to-pink-accent rounded-xl flex items-center justify-center text-white mb-4
                              group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-purple-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Info Cards — Date / Location / Target */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoCards.map((card) => (
            <div
              key={card.title}
              className={`${card.animation} group p-6 bg-white/80 rounded-2xl border border-purple-primary/10
                          hover:shadow-xl hover:shadow-purple-primary/10 transition-[box-shadow] duration-500`}
            >
              <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center mb-4
                              ${card.iconHoverBg} group-hover:text-white transition-colors duration-300`}>
                <span className={`${card.iconColor} group-hover:text-white transition-colors`}>
                  {card.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-purple-dark mb-2">{card.title}</h3>
              <p className="text-foreground/80 font-semibold text-lg">{card.value}</p>
              <p className="text-foreground/50 text-sm mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
