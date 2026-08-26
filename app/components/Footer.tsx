"use client";

import Image from "next/image";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/MSSPSU",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/msspsuhatyai/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:mss.guidancefordream@gmail.com",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="relative bg-gradient-to-b from-purple-dark to-purple-deeper pt-16 pb-8 overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-accent/50 to-transparent" />
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-pink-accent/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 mb-12">
          {/* Logo & Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/images/favicon.png"
                alt="Guidance for Dream 7th"
                width={60}
                height={60}
                className="rounded-xl"
              />
              <div>
                <h3 className="text-white font-bold text-xl">
                  Guidance for Dream <span className="text-pink-light">7th</span>
                </h3>
                <p className="text-white/50 text-sm">ค่ายสานฝันเพื่อน้อง ครั้งที่ 7</p>
              </div>
            </div>
            <p className="text-white/40 text-sm max-w-sm text-center md:text-left">
              ค่ายแนะแนวการศึกษาและพัฒนาศักยภาพ สำหรับน้องๆ ระดับมัธยมศึกษา
              จัดโดย ชมรมมุสลิม มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">
              ลิงก์ด่วน
            </h4>
            {[
              { label: "เกี่ยวกับค่าย", href: "#about" },
              { label: "ภาพกิจกรรม", href: "#gallery" },
              { label: "วันที่/สถานที่", href: "#details" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-pink-light text-sm transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Contacts (อมีร / อมีเราะฮฺ ค่าย) */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">
              ติดต่อสอบถาม
            </h4>
            <div className="flex flex-col gap-2.5">
              <a
                href="tel:091-046-3361"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-primary/40 flex items-center justify-center text-pink-light group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block text-white/90 text-xs font-semibold">อมีรค่าย (ประธานค่ายฝ่ายชาย)</span>
                  <span className="block text-pink-light font-mono text-xs">091-046-3361</span>
                </div>
              </a>

              <a
                href="tel:062-024-9308"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-accent/30 flex items-center justify-center text-pink-light group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block text-white/90 text-xs font-semibold">อมีเราะฮฺค่าย (ฝ่ายหญิง)</span>
                  <span className="block text-pink-light font-mono text-xs">062-024-9308</span>
                </div>
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">
              โซเชียลมีเดีย
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.name}
                  className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-purple-primary hover:to-pink-accent
                             rounded-xl flex items-center justify-center text-white/60 hover:text-white
                             transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-accent/20"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-white/40 text-xs">
              ติดตามข่าวสารและสอบถามเพิ่มเติม
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center">
          <p className="text-white/30 text-sm">
            © 2569 Guidance for Dream 7th — ค่ายสานฝันเพื่อน้อง ครั้งที่ 7
          </p>
          <p className="text-white/20 text-xs mt-2">
            Muslim Student Society PSU Hatyai × Prince of Songkla University × Muslim Young Blood
          </p>
        </div>
      </div>
    </footer>
  );
}
