"use client";

import { useEffect, useRef, useState } from "react";

// Target date: November 6, 2026 (BE 2569) at 08:00 Bangkok time
const TARGET_DATE = new Date("2026-11-06T08:00:00+07:00");

const timeline = [
  {
    day: "Day 1",
    date: "6 พ.ย. 2569",
    title: "วันเปิดค่าย",
    desc: "ลงทะเบียน พิธีเปิด กิจกรรมทำความรู้จัก & Ice Breaking",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    day: "Day 2",
    date: "7 พ.ย. 2569",
    title: "วันแนะแนว",
    desc: "แนะแนวการศึกษา 16 คณะ",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    day: "Day 3",
    date: "8 พ.ย. 2569",
    title: "วันแนะแนว",
    desc: "แนะแนวการศึกษา 16 คณะ",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    day: "Day 4",
    date: "9 พ.ย. 2569",
    title: "วันปิดค่าย",
    desc: "สรุปค่าย พิธีปิด มอบเกียรติบัตร อำลา & ส่งน้องกลับ",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function DetailsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const countdown = useCountdown(TARGET_DATE);

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
      id="details"
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-gradient-to-b from-cream-bg via-white to-pink-pale overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-sm font-semibold rounded-full mb-4">
            รายละเอียด
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
              วันที่ & สถานที่
            </span>
          </h2>
          <div className="section-divider mb-6" />
        </div>

        {/* Countdown Timer */}
        <div className="reveal mb-16">
          <p className="text-center text-foreground/60 text-lg mb-6 font-medium">
            นับถอยหลังสู่วันค่าย
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {[
              { value: countdown.days, label: "วัน" },
              { value: countdown.hours, label: "ชั่วโมง" },
              { value: countdown.minutes, label: "นาที" },
              { value: countdown.seconds, label: "วินาที" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-primary to-pink-accent
                                rounded-2xl flex items-center justify-center shadow-lg shadow-purple-primary/20
                                hover:scale-105 transition-transform duration-300">
                  <span className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-foreground/50 text-xs sm:text-sm mt-2 font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Date Card */}
          <div className="reveal-left stagger-1 group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-primary/10
                          hover:shadow-xl hover:shadow-purple-primary/10 transition-all duration-500">
            <div className="w-12 h-12 bg-purple-primary/10 rounded-xl flex items-center justify-center mb-4
                            group-hover:bg-purple-primary group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6 text-purple-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-purple-dark mb-2">วันที่จัดค่าย</h3>
            <p className="text-foreground/80 font-semibold text-lg">6-9 พฤศจิกายน 2569</p>
            <p className="text-foreground/50 text-sm mt-1">4 วัน 3 คืน</p>
          </div>

          {/* Location Card */}
          <div className="reveal stagger-2 group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-primary/10
                          hover:shadow-xl hover:shadow-purple-primary/10 transition-all duration-500">
            <div className="w-12 h-12 bg-pink-accent/10 rounded-xl flex items-center justify-center mb-4
                            group-hover:bg-pink-accent group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6 text-pink-accent group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-purple-dark mb-2">สถานที่</h3>
            <p className="text-foreground/80 font-semibold text-lg">มหาวิทยาลัยสงขลานครินทร์</p>
            <p className="text-foreground/50 text-sm mt-1">วิทยาเขตหาดใหญ่ จ.สงขลา</p>
          </div>

          {/* Target Card */}
          <div className="reveal-right stagger-3 group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-primary/10
                          hover:shadow-xl hover:shadow-purple-primary/10 transition-all duration-500">
            <div className="w-12 h-12 bg-purple-primary/10 rounded-xl flex items-center justify-center mb-4
                            group-hover:bg-purple-primary group-hover:text-white transition-colors duration-300">
              <svg className="w-6 h-6 text-purple-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-purple-dark mb-2">กลุ่มเป้าหมาย</h3>
            <p className="text-foreground/80 font-semibold text-lg">น้องๆ ม.ปลาย</p>
            <p className="text-foreground/50 text-sm mt-1">รับจำนวนจำกัด</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-purple-dark mb-10 reveal">
            กำหนดการ 4 วัน
          </h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-primary via-pink-accent to-purple-light transform sm:-translate-x-1/2" />

            {timeline.map((item, i) => (
              <div
                key={item.day}
                className={`relative flex items-start gap-6 mb-10 last:mb-0 ${i % 2 === 0
                  ? "sm:flex-row"
                  : "sm:flex-row-reverse"
                  } ${i % 2 === 0 ? "reveal-left" : "reveal-right"} stagger-${i + 1}`}
              >
                {/* Content */}
                <div className={`flex-1 ml-14 sm:ml-0 ${i % 2 === 0 ? "sm:text-right sm:pr-12" : "sm:text-left sm:pl-12"}`}>
                  <div className="inline-block p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-primary/10
                                  hover:shadow-lg hover:shadow-purple-primary/10 transition-all duration-300">
                    <span className="text-purple-primary text-xs font-bold uppercase tracking-wider">
                      {item.day} — {item.date}
                    </span>
                    <h4 className="text-lg font-bold text-purple-dark mt-1">
                      {item.title}
                    </h4>
                    <p className="text-foreground/60 text-sm mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Circle */}
                <div className="absolute left-3 sm:left-1/2 top-2 w-7 h-7 bg-gradient-to-br from-purple-primary to-pink-accent
                                rounded-full flex items-center justify-center text-white transform sm:-translate-x-1/2
                                shadow-md shadow-purple-primary/30 z-10">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>

                {/* Spacer for the other side */}
                <div className="hidden sm:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
