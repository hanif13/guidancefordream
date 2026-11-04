"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import SubpageHero from "../components/SubpageHero";
import { supabase } from "../lib/supabase";

/* ================================================================
   DATA: STICKY NOTES MOCKUP (เสียงสะท้อนจากน้อง)
   ================================================================ */

interface StickyNote {
  id: string;
  content: string;
  bgColor: string;
  textColor: string;
  rotateDeg: string;
  dateStr: string;
}

const INITIAL_NOTES: StickyNote[] = [
  {
    id: "note-1",
    content:
      "ค่ายนี้เปลี่ยนชีวิตหนูจริงๆ ค่ะ จากที่เคยไม่มั่นใจว่าตัวเองจะสอบแพทย์ได้ไหม พี่ๆ ฐานแพทย์ให้กำลังใจดีมาก ได้ลองจับหูฟัง Stethoscope ของจริง ประทับใจพี่เลี้ยงบ้าน 3 มากๆ ค่ะ สัญญาว่าจะพยายามให้เต็มที่เพื่อมาเจอกันในรั้วสีบลูนะคะ!",
    bgColor: "bg-amber-100 border-amber-300",
    textColor: "text-amber-950",
    rotateDeg: "-rotate-2",
    dateStr: "6 พ.ย. 68 • 16:45 น.",
  },
  {
    id: "note-2",
    content:
      "ชอบฐานวิศวะกับหุ่นยนต์มากครับ พี่ๆ สอนเข้าใจง่ายมาก แถมยังได้เรียนรู้เรื่องการแบ่งเวลาและการละหมาดในรั้วมหาวิทยาลัย คืนบายเนียร์น้ำตาซึมเลยครับ อบอุ่นเหมือนครอบครัวจริงๆ",
    bgColor: "bg-sky-100 border-sky-300",
    textColor: "text-sky-950",
    rotateDeg: "rotate-1",
    dateStr: "7 พ.ย. 68 • 19:20 น.",
  },
  {
    id: "note-3",
    content:
      "ขอบคุณพี่ๆ ทุกคนที่จัดค่ายดีๆ แบบนี้นะคะ อาหารฮาลาลอร่อยทุกมื้อ พี่ๆ ฝ่ายพยาบาลดูแลดีมาก ได้ทั้งความรู้ TCAS และเพื่อนใหม่จากหลายจังหวัดเลย เป็น 4 วันที่คุ้มค่าที่สุดในชีวิต ม.ปลาย ค่ะ",
    bgColor: "bg-pink-100 border-pink-300",
    textColor: "text-pink-950",
    rotateDeg: "-rotate-1",
    dateStr: "8 พ.ย. 68 • 12:30 น.",
  },
  {
    id: "note-4",
    content:
      "ได้เข้าใจกฎหมายและบทบาทของนักกฎหมายมุสลิมในการช่วยเหลือสังคมอย่างลึกซึ้ง พี่ๆ ถ่ายทอดด้วยหัวใจจริงๆ ขอบคุณคำแนะนำเรื่องรอบพอร์ตโฟลิโอครับ จะนำไปปรับใช้แน่นอนครับ",
    bgColor: "bg-emerald-100 border-emerald-300",
    textColor: "text-emerald-950",
    rotateDeg: "rotate-2",
    dateStr: "8 พ.ย. 68 • 15:10 น.",
  },
  {
    id: "note-5",
    content:
      "ฐานทันตะสนุกมากกก ได้ลองพิมพ์ฟันและกรอแบบจำลอง พี่ๆ ให้คำแนะนำการเตรียมตัวสอบแบบละเอียดสุดๆ ค่ายนี้ตอบโจทย์ทุกคำถามที่สงสัย ขอบคุณ Guidance for Dream มากๆ ค่ะ",
    bgColor: "bg-purple-100 border-purple-300",
    textColor: "text-purple-950",
    rotateDeg: "-rotate-2",
    dateStr: "9 พ.ย. 68 • 10:15 น.",
  },
  {
    id: "note-6",
    content:
      "ค่ายสอนให้รู้ว่า 'ความฝันที่ยิ่งใหญ่ ต้องเริ่มต้นด้วยศรัทธาและความพยายาม' ขอบคุณพี่ๆ ทุกฝ่ายที่เหน็ดเหนื่อยเพื่อพวกเรา อาหารอร่อย กิจกรรมสนุก ได้รับพลังใจกลับไปเต็มร้อยเลยครับ",
    bgColor: "bg-rose-100 border-rose-300",
    textColor: "text-rose-950",
    rotateDeg: "rotate-1",
    dateStr: "9 พ.ย. 68 • 13:40 น.",
  },
];

/* ================================================================
   DATA: WALL OF MEMORIES (แกลเลอรีภาพความทรงจำ)
   ================================================================ */

interface MemoryPhoto {
  id: string;
  title: string;
  category: "opening" | "stations" | "night" | "friendship";
  categoryLabel: string;
  edition: string;
  imageUrl: string;
  caption: string;
}

const MEMORY_PHOTOS: MemoryPhoto[] = [
  {
    id: "p-1",
    title: "พิธีเปิดอันยิ่งใหญ่และอบอุ่น",
    category: "opening",
    categoryLabel: "พิธีเปิด-ปิด",
    edition: "Guidance 6th",
    imageUrl: "/images/hero-bg.jpg",
    caption: "ช่วงเวลาที่น้องๆ ทุกคนรวมพลังร้องเพลงค่ายและรับฟังคำกล่าวเปิดงาน",
  },
  {
    id: "p-2",
    title: "กิจกรรมฐานทดลองคณะแพทยศาสตร์",
    category: "stations",
    categoryLabel: "ฐานกิจกรรม 16 คณะ",
    edition: "Guidance 6th",
    imageUrl: "/images/hero-bg.jpg",
    caption: "ทดลองฟังเสียงหัวใจด้วยหูฟังแพทย์ Stethoscope ภายใต้คำแนะนำของพี่ๆ หมอ",
  },
  {
    id: "p-3",
    title: "ค่ำคืนบายเนียร์แห่งสายใย",
    category: "night",
    categoryLabel: "ค่ำคืนบายเนียร์",
    edition: "Guidance 5th",
    imageUrl: "/images/hero-bg.jpg",
    caption: "แสงเทียนและคำอวยพรจากใจพี่เลี้ยงสู่ใจน้องค่าย ในคืนสุดท้ายของกิจกรรม",
  },
  {
    id: "p-4",
    title: "รอยยิ้มและเสียงหัวเราะช่วง Ice Breaking",
    category: "friendship",
    categoryLabel: "มิตรภาพ & รอยยิ้ม",
    edition: "Guidance 7th",
    imageUrl: "/images/hero-bg.jpg",
    caption: "ละลายพฤติกรรม สานมิตรภาพใหม่กับเพื่อนๆ จากต่างโรงเรียน",
  },
  {
    id: "p-5",
    title: "ฐานวิศวกรรมศาสตร์และหุ่นยนต์",
    category: "stations",
    categoryLabel: "ฐานกิจกรรม 16 คณะ",
    edition: "Guidance 6th",
    imageUrl: "/images/hero-bg.jpg",
    caption: "ลงมือต่อวงจรและเขียนโปรแกรมควบคุมระบบเซนเซอร์อัตโนมัติ",
  },
  {
    id: "p-6",
    title: "ภาพถ่ายหมู่รวมประวัติศาสตร์",
    category: "friendship",
    categoryLabel: "มิตรภาพ & รอยยิ้ม",
    edition: "Guidance 6th",
    imageUrl: "/images/hero-bg.jpg",
    caption: "ภาพความทรงจำที่ไม่มีวันลืมเลือนของพี่น้องครอบครัว Guidance for Dream",
  },
];

/* ================================================================
   MAIN MEMORIES PAGE COMPONENT
   ================================================================ */

export default function MemoriesPage() {
  const [activeTab, setActiveTab] = useState<"voices" | "wall" | "timecapsule">("voices");

  // Sticky Notes state (Local storage supported)
  const [notes, setNotes] = useState<StickyNote[]>(INITIAL_NOTES);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("amber");

  // Time Capsule Form state
  const [capsuleName, setCapsuleName] = useState("");
  const [capsuleEmail, setCapsuleEmail] = useState("");
  const [capsuleSchool, setCapsuleSchool] = useState("");
  const [capsuleDreamFaculty, setCapsuleDreamFaculty] = useState("");
  const [capsuleLetter, setCapsuleLetter] = useState("");
  const [capsuleOpenDate, setCapsuleOpenDate] = useState("");
  const [capsuleSubmitted, setCapsuleSubmitted] = useState(false);

  // Wall of memories filter
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<MemoryPhoto | null>(null);

  // Load saved notes from Supabase & LocalStorage on mount
  useEffect(() => {
    let isMounted = true;

    const fetchFeedbacks = async () => {
      try {
        const { data, error } = await supabase
          .from("camp_feedbacks")
          .select("*")
          .eq("is_approved", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: StickyNote[] = data.map((d: any) => ({
            id: d.id,
            content: d.content,
            bgColor: d.bg_color || "bg-amber-100 border-amber-300",
            textColor: d.text_color || "text-amber-950",
            rotateDeg: d.rotate_deg || "rotate-0",
            dateStr: d.date_display || new Date(d.created_at).toLocaleDateString("th-TH"),
          }));
          setNotes(mapped);
        }
      } catch (err) {
        console.warn("Using offline notes fallback:", err);
      }
    };

    fetchFeedbacks();

    // Subscribe to realtime updates for instant feedback broadcast
    const channel = supabase
      .channel("camp_feedbacks_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "camp_feedbacks" },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.is_approved) {
            const newNote: StickyNote = {
              id: newRow.id,
              content: newRow.content,
              bgColor: newRow.bg_color,
              textColor: newRow.text_color,
              rotateDeg: newRow.rotate_deg,
              dateStr: newRow.date_display,
            };
            setNotes((prev) => [newNote, ...prev.filter((n) => n.id !== newRow.id)]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "camp_feedbacks" },
        (payload) => {
          const oldRow = payload.old as any;
          if (oldRow && oldRow.id) {
            setNotes((prev) => prev.filter((n) => n.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const colorMap: Record<string, { bg: string; text: string }> = {
      amber: { bg: "bg-amber-100 border-amber-300", text: "text-amber-950" },
      pink: { bg: "bg-pink-100 border-pink-300", text: "text-pink-950" },
      sky: { bg: "bg-sky-100 border-sky-300", text: "text-sky-950" },
      emerald: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-950" },
      purple: { bg: "bg-purple-100 border-purple-300", text: "text-purple-950" },
    };

    const chosen = colorMap[selectedColor] || colorMap.amber;
    const rotations = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-0"];
    const randomRot = rotations[Math.floor(Math.random() * rotations.length)];

    // บันทึกวันและเวลาปัจจุบัน (เช่น "4 พ.ย. 69 • 09:05 น.")
    const now = new Date();
    const day = now.getDate();
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const month = thaiMonths[now.getMonth()];
    const year = (now.getFullYear() + 543).toString().slice(-2);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const formattedDateTime = `${day} ${month} ${year} • ${hours}:${minutes} น.`;

    const newNoteObj: StickyNote = {
      id: `user-${Date.now()}`,
      content: newContent.trim(),
      bgColor: chosen.bg,
      textColor: chosen.text,
      rotateDeg: randomRot,
      dateStr: formattedDateTime,
    };

    // อัปเดต UI ทันทีแบบ Optimistic
    const updated = [newNoteObj, ...notes];
    setNotes(updated);

    // บันทึกลง Supabase Database
    try {
      await supabase.from("camp_feedbacks").insert([
        {
          content: newContent.trim(),
          bg_color: chosen.bg,
          text_color: chosen.text,
          rotate_deg: randomRot,
          date_display: formattedDateTime,
          is_approved: true,
        },
      ]);
    } catch (err) {
      console.warn("Supabase feedback insert offline fallback:", err);
    }

    try {
      const userNotes = updated.filter((n) => n.id.startsWith("user-"));
      localStorage.setItem("gfd_user_notes", JSON.stringify(userNotes));
    } catch {}

    // Reset Form
    setNewContent("");
    setIsWriteModalOpen(false);
  };

  const handleTimeCapsuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleName || !capsuleLetter || !capsuleEmail) return;

    // บันทึกจดหมายลง Supabase Database (future_letters)
    try {
      await supabase.from("future_letters").insert([
        {
          name: capsuleName.trim(),
          email: capsuleEmail.trim(),
          school: capsuleSchool.trim(),
          dream_faculty: capsuleDreamFaculty.trim(),
          letter_content: capsuleLetter.trim(),
          delivery_timing: capsuleOpenDate.trim(),
        },
      ]);
    } catch (err) {
      console.warn("Supabase future_letters insert offline fallback:", err);
    }

    setCapsuleSubmitted(true);
  };

  const filteredPhotos = MEMORY_PHOTOS.filter((p) => {
    if (photoFilter === "all") return true;
    return p.category === photoFilter;
  });

  return (
    <div className="min-h-screen bg-cream-bg text-foreground flex flex-col justify-between">
      {/* Hero Banner */}
      <SubpageHero
        badge="ความทรงจำและเสียงสะท้อน"
        titleMain="MEMORIES"
        titleHighlight="GUIDANCE FOR DREAM"
        subtitle1="รวมทุกช่วงเวลาแห่งความประทับใจ เสียงสะท้อนจากใจน้องค่าย และจดหมายถึงตัวฉันในอนาคต"
        subtitle2="บันทึกความทรงจำแห่งมิตรภาพในรั้วมหาวิทยาลัยสงขลานครินทร์"
        scrollTargetId="#memories-content"
      />

      {/* Main Container */}
      <main id="memories-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center mb-10 sm:mb-14">
          <div className="inline-flex p-1.5 rounded-2xl bg-purple-deeper/10 border border-purple-primary/20 backdrop-blur-md shadow-inner gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("voices")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "voices"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                  : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
              }`}
            >
              เสียงสะท้อนจากน้อง
            </button>
            <button
              onClick={() => setActiveTab("wall")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "wall"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                  : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
              }`}
            >
              Wall of Memories
            </button>
            <button
              onClick={() => setActiveTab("timecapsule")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "timecapsule"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                  : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
              }`}
            >
              จดหมายถึงตัวฉันในอนาคต
            </button>
          </div>
        </div>

        {/* ========================================================
            SECTION 1: เสียงสะท้อนจากน้อง (STICKY NOTE BOARD)
            ======================================================== */}
        {activeTab === "voices" && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Bar with Add Note Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white shadow-md border border-purple-primary/15">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-purple-deeper">
                  บอร์ดกระดาษเสียงสะท้อนจากน้องๆ (Camper&apos;s Voice Wall)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                  ความรู้สึก ความประทับใจ และแรงบันดาลใจจากน้องๆ ที่เคยผ่านค่าย Guidance for Dream
                </p>
              </div>

              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span>+ เขียนความรู้สึกของคุณ</span>
              </button>
            </div>

            {/* Corkboard / Paper Note Wall Grid */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#EFE6D8] border-4 border-[#D4C3A3] shadow-inner relative overflow-hidden min-h-[500px]">
              {/* Background texture line */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-6 rounded-2xl border-2 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:z-20 ${note.bgColor} ${note.rotateDeg} flex flex-col justify-between min-h-[200px]`}
                  >
                    {/* Pin / Tape graphic on top */}
                    <div className="flex justify-center -mt-8 mb-3">
                      <div className="w-4 h-4 rounded-full bg-red-600 border border-red-800 shadow-md ring-2 ring-white/60" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-start">
                      <p className={`text-xs sm:text-[13px] leading-relaxed font-medium ${note.textColor}`}>
                        &ldquo;{note.content}&rdquo;
                      </p>
                    </div>

                    {/* Card Footer: Anonymous & Date-Time in bottom-right corner */}
                    <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-zinc-500/80 font-medium tracking-wide flex items-center gap-1">
                        <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        ไม่ระบุตัวตน
                      </span>
                      {/* มุมขวาล่าง: แสดงสถานะวัน เวลา ที่เขียน */}
                      <span className="text-[11px] text-zinc-600 font-mono font-medium flex items-center gap-1.5 bg-black/5 px-2.5 py-1 rounded-lg">
                        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {note.dateStr}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal: Write Your Note (Anonymous, 2 fields only) */}
            {isWriteModalOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setIsWriteModalOpen(false)}
              >
                <div
                  className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div>
                      <h4 className="font-bold text-lg text-purple-deeper">
                        เขียนความรู้สึกของคุณแปะบนบอร์ด
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        ส่งความรู้สึกแบบไม่ระบุตัวตน (Anonymous)
                      </p>
                    </div>
                    <button
                      onClick={() => setIsWriteModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-5 mt-5">
                    {/* 1. เลือกสีกระดาษโน้ต */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-2">
                        1. เลือกสีกระดาษโน้ต:
                      </label>
                      <div className="flex items-center gap-3">
                        {[
                          { id: "amber", bg: "bg-amber-200 border-amber-400" },
                          { id: "pink", bg: "bg-pink-200 border-pink-400" },
                          { id: "sky", bg: "bg-sky-200 border-sky-400" },
                          { id: "emerald", bg: "bg-emerald-200 border-emerald-400" },
                          { id: "purple", bg: "bg-purple-200 border-purple-400" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedColor(c.id)}
                            className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer ${c.bg} ${
                              selectedColor === c.id ? "scale-125 ring-2 ring-purple-600 shadow-md" : "hover:scale-105"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* 2. ข้อความความรู้สึกของคุณ */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-2">
                        2. ข้อความความรู้สึกของคุณ:
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="เขียนความประทับใจ กำลังใจ หรือคำขอบคุณถึงพี่ๆ และเพื่อนค่าย..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30 leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWriteModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold text-xs shadow-md hover:shadow-purple-500/25 transition-all cursor-pointer"
                      >
                        แปะลงบอร์ดทันที
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION 2: WALL OF MEMORIES (แกลเลอรีภาพความทรงจำ)
            ======================================================== */}
        {activeTab === "wall" && (
          <div className="space-y-8 animate-fade-in">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { key: "all", label: "ทั้งหมด" },
                { key: "opening", label: "พิธีเปิด-ปิด" },
                { key: "stations", label: "ฐานกิจกรรม 16 คณะ" },
                { key: "night", label: "ค่ำคืนบายเนียร์" },
                { key: "friendship", label: "มิตรภาพ & รอยยิ้ม" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setPhotoFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    photoFilter === f.key
                      ? "bg-purple-primary text-white shadow-md shadow-purple-primary/30"
                      : "bg-white text-zinc-600 hover:text-purple-dark hover:bg-zinc-100 border border-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo)}
                  className="rounded-3xl overflow-hidden bg-white border border-zinc-200 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {photo.edition}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[10px] font-bold text-pink-accent uppercase tracking-wider block mb-1">
                      {photo.categoryLabel}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-purple-deeper group-hover:text-purple-primary transition-colors">
                      {photo.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxPhoto && (
              <div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setLightboxPhoto(null)}
              >
                <div
                  className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative aspect-[16/10] w-full bg-black">
                    <Image
                      src={lightboxPhoto.imageUrl}
                      alt={lightboxPhoto.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-6 flex items-center justify-between bg-white">
                    <div>
                      <span className="text-xs font-bold text-pink-accent block font-mono">
                        {lightboxPhoto.edition} • {lightboxPhoto.categoryLabel}
                      </span>
                      <h4 className="font-bold text-base sm:text-lg text-purple-deeper">
                        {lightboxPhoto.title}
                      </h4>
                      <p className="text-xs text-zinc-600 mt-0.5">{lightboxPhoto.caption}</p>
                    </div>
                    <button
                      onClick={() => setLightboxPhoto(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION 3: จดหมายถึงตัวฉันในอนาคต (TIME CAPSULE)
            ======================================================== */}
        {activeTab === "timecapsule" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="p-8 sm:p-12 rounded-3xl bg-white shadow-2xl border-2 border-purple-primary/20 relative overflow-hidden">
              {/* Envelope styling details */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-accent/20 to-transparent pointer-events-none" />

              {!capsuleSubmitted ? (
                <div>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-purple-deeper text-white flex items-center justify-center mx-auto mb-3 shadow-lg border border-purple-500/40">
                      <svg className="w-7 h-7 text-pink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-pink-accent uppercase tracking-widest bg-pink-pale px-3 py-1 rounded-full border border-pink-light">
                      Time Capsule • กล่องเก็บฝัน
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-3">
                      จดหมายถึงตัวฉันในอนาคต
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md mx-auto leading-relaxed">
                      เขียนข้อความส่งถึงตัวเธอในวันที่ก้าวสู่รั้วมหาวิทยาลัยในฝัน ฝากความหวังและกำลังใจไว้ในกล่องกาลเวลา
                    </p>
                  </div>

                  <form onSubmit={handleTimeCapsuleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          ชื่อ - นามสกุล หรือชื่อเล่น:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="เช่น มารียัม / อัชรอฟ"
                          value={capsuleName}
                          onChange={(e) => setCapsuleName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          อีเมลสำหรับส่งจดหมายกลับ:
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="yourname@gmail.com"
                          value={capsuleEmail}
                          onChange={(e) => setCapsuleEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          โรงเรียน / ชั้นปีปัจจุบัน:
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น ม.5 รร.เบญจมราชูทิศ"
                          value={capsuleSchool}
                          onChange={(e) => setCapsuleSchool(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          คณะและมหาวิทยาลัยในฝัน:
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น แพทยศาสตร์ ม.อ. / วิศวะ ม.อ."
                          value={capsuleDreamFaculty}
                          onChange={(e) => setCapsuleDreamFaculty(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        ข้อความถึงตัวฉันในอนาคต:
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="ถึงตัวฉันในอนาคต... จำวันนั้นที่เธอเข้าร่วมค่าย Guidance for Dream ได้ไหม? วันที่เธอตั้งใจอ่านหนังสือดึกๆ เพื่อคณะนี้ ขอให้เธอภูมิใจในทุกหยาดเหงื่อ..."
                        value={capsuleLetter}
                        onChange={(e) => setCapsuleLetter(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30 leading-relaxed font-sans"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-zinc-700">
                          กำหนดเวลาหรือวันที่ส่งจดหมายฉบับนี้กลับไปหาคุณ:
                        </label>
                        <span className="text-[11px] text-purple-700 font-medium hidden sm:inline">
                          พิมพ์ระบุวันที่ หรือช่วงเวลาได้ตามใจชอบ
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="เช่น 1 พฤษภาคม 2568, วันประกาศผล TCAS รอบ 3, วันเกิดอายุ 19 ปี หรือช่วงเวลาที่ต้องการ..."
                        value={capsuleOpenDate}
                        onChange={(e) => setCapsuleOpenDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                      />
                      {/* แท็กตัวเลือกด่วน ช่วยพิมพ์อัตโนมัติ */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-zinc-500 mr-1">หรือคลิกเลือกตัวอย่าง:</span>
                        {[
                          "วันประกาศผล TCAS",
                          "อีก 1 ปีข้างหน้า",
                          "ก่อนสอบ A-Level",
                          "วันเปิดค่าย Guidance 8th",
                          "1 พฤษภาคม 2568",
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCapsuleOpenDate(preset)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-deeper text-[11px] font-medium border border-purple-200/60 transition-all cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold text-sm shadow-xl hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
                    >
                      ผนึกจดหมายลงในกล่อง Time Capsule
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto font-bold shadow-md">
                    ✓
                  </div>
                  <h4 className="text-2xl font-black text-purple-deeper">
                    ผนึกจดหมายลงใน Time Capsule เรียบร้อยแล้ว!
                  </h4>
                  <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                    ขอบคุณ <strong>{capsuleName}</strong> สำหรับจดหมายอันเปี่ยมด้วยความหวัง จดหมายฉบับนี้จะถูกเก็บรักษาไว้อย่างปลอดภัย และจะส่งกลับไปที่ <strong>{capsuleEmail}</strong> {capsuleOpenDate ? `ตามกำหนดเวลา: "${capsuleOpenDate}"` : "ตามที่ระบุไว้"}
                  </p>
                  <p className="text-xs text-purple-primary font-bold">
                    &ldquo;ขอให้ทุกความพยายามของเธอ เบ่งบานบนยอดเขาแห่งความฝัน&rdquo;
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setCapsuleSubmitted(false);
                        setCapsuleLetter("");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold"
                    >
                      เขียนจดหมายฉบับอื่นเพิ่มเติม
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

