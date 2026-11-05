"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import SubpageHero from "../components/SubpageHero";
import { supabase } from "../lib/supabase";

/* ================================================================
   DATA TYPES: STICKY NOTES & WALL OF MEMORIES
   ================================================================ */

interface StickyNote {
  id: string;
  content: string;
  bgColor: string;
  textColor: string;
  rotateDeg: string;
  dateStr: string;
}

interface MemoryPhoto {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
  edition?: string;
  imageUrl: string;
  caption: string;
}

/* ================================================================
   MAIN MEMORIES PAGE COMPONENT
   ================================================================ */

export default function MemoriesPage() {
  const [activeTab, setActiveTab] = useState<"voices" | "wall" | "timecapsule">("voices");

  // Sticky Notes state
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("amber");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Time Capsule Form state
  const [capsuleName, setCapsuleName] = useState("");
  const [capsuleEmail, setCapsuleEmail] = useState("");
  const [capsuleSchool, setCapsuleSchool] = useState("");
  const [capsuleDreamFaculty, setCapsuleDreamFaculty] = useState("");
  const [capsuleLetter, setCapsuleLetter] = useState("");
  const [capsuleOpenDate, setCapsuleOpenDate] = useState("");
  const [capsuleTargetDate, setCapsuleTargetDate] = useState("");
  const [capsuleSubmitted, setCapsuleSubmitted] = useState(false);

  // Wall of memories filter & dynamic data
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<MemoryPhoto | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);

  // Load dynamic categories & photos from Supabase & LocalStorage
  useEffect(() => {
    let isMounted = true;

    const loadWallData = async () => {
      let loadedCats: string[] = [];

      // 1. Fetch categories from Supabase
      try {
        const { data: catData } = await supabase
          .from("gallery_categories")
          .select("name")
          .order("sort_order", { ascending: true });
        if (catData && catData.length > 0) {
          loadedCats = catData.map((c: any) => c.name);
        }
      } catch (err) {
        console.warn("fetch gallery_categories fallback:", err);
      }

      // Fallback to localStorage if Supabase category table is empty
      if (loadedCats.length === 0 && typeof window !== "undefined") {
        const stored = localStorage.getItem("gfd_gallery_categories");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) loadedCats = parsed;
          } catch {}
        }
      }

      // 2. Fetch photos from Supabase gallery_images
      try {
        const { data: imgData, error: imgErr } = await supabase
          .from("gallery_images")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!imgErr && imgData && imgData.length > 0 && isMounted) {
          const mapped: MemoryPhoto[] = imgData.map((img: any) => ({
            id: img.id,
            title: img.caption || img.alt_text || "ภาพความทรงจำ",
            category: img.category || "ทั่วไป",
            categoryLabel: img.category || "ทั่วไป",
            edition: "Guidance 7th",
            imageUrl: img.image_url,
            caption: img.caption || "",
          }));
          setPhotos(mapped);

          // Include any categories present in image rows
          imgData.forEach((img: any) => {
            if (img.category && !loadedCats.includes(img.category)) {
              loadedCats.push(img.category);
            }
          });
        } else if (isMounted) {
          setPhotos([]);
        }
      } catch (err) {
        console.warn("fetch gallery_images fallback:", err);
        if (isMounted) setPhotos([]);
      }

      // Default daily categories if totally empty
      if (loadedCats.length === 0) {
        loadedCats = ["วันที่ 6", "วันที่ 7", "วันที่ 8", "วันที่ 9"];
      }

      if (isMounted) {
        setCategories(loadedCats);
      }
    };

    loadWallData();

    // Realtime subscriptions
    const wallChannel = supabase
      .channel("memories_wall_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_images" },
        () => loadWallData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_categories" },
        () => loadWallData()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(wallChannel);
    };
  }, []);

  // Load saved notes from Supabase & LocalStorage on mount
  useEffect(() => {
    let isMounted = true;

    const fetchFeedbacks = async () => {
      let dbNotes: StickyNote[] = [];
      try {
        const { data, error } = await supabase
          .from("camp_feedbacks")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          dbNotes = data
            .filter((d: any) => d.is_approved !== false)
            .map((d: any) => ({
              id: d.id,
              content: d.content,
              bgColor: d.bg_color || "bg-amber-100 border-amber-300",
              textColor: d.text_color || "text-amber-950",
              rotateDeg: d.rotate_deg || "rotate-0",
              dateStr: d.date_display || new Date(d.created_at).toLocaleDateString("th-TH"),
            }));
        }
      } catch (err) {
        console.warn("Using offline notes fallback:", err);
      }

      // Check localStorage for any cached user notes
      let localNotes: StickyNote[] = [];
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("gfd_user_notes");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) localNotes = parsed;
          }
        } catch {}
      }

      // Merge: dbNotes + localNotes (that aren't already in dbNotes)
      const combined: StickyNote[] = [...dbNotes];

      localNotes.forEach((ln) => {
        if (!combined.some((c) => c.id === ln.id || c.content.trim() === ln.content.trim())) {
          combined.push(ln);
        }
      });

      if (isMounted) {
        setNotes(combined);
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
          if (newRow && newRow.is_approved !== false) {
            const newNote: StickyNote = {
              id: newRow.id,
              content: newRow.content,
              bgColor: newRow.bg_color || "bg-amber-100 border-amber-300",
              textColor: newRow.text_color || "text-amber-950",
              rotateDeg: newRow.rotate_deg || "rotate-0",
              dateStr: newRow.date_display || new Date(newRow.created_at).toLocaleDateString("th-TH"),
            };
            setNotes((prev) => {
              // 1. If note with this exact ID already exists, do nothing
              if (prev.some((n) => n.id === newRow.id)) return prev;
              // 2. Remove any optimistic note that has matching content
              const filtered = prev.filter(
                (n) => !(n.id.startsWith("user-") && n.content.trim() === newRow.content.trim())
              );
              // 3. Prepend the new realtime note
              return [newNote, ...filtered];
            });
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
    if (!newContent.trim() || isSubmittingNote) return;
    setIsSubmittingNote(true);

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

    const tempId = `user-${Date.now()}`;
    const trimmedContent = newContent.trim();

    const newNoteObj: StickyNote = {
      id: tempId,
      content: trimmedContent,
      bgColor: chosen.bg,
      textColor: chosen.text,
      rotateDeg: randomRot,
      dateStr: formattedDateTime,
    };

    // 1. Optimistic update (deduplicated against existing content)
    setNotes((prev) => {
      if (prev.some((n) => n.content.trim() === trimmedContent)) return prev;
      return [newNoteObj, ...prev];
    });

    // 2. Persist to localStorage immediately so it survives page refresh
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_notes");
        let list: StickyNote[] = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        list = [newNoteObj, ...list.filter((n) => n.content.trim() !== trimmedContent)];
        localStorage.setItem("gfd_user_notes", JSON.stringify(list));
      } catch {}
    }

    // 3. Insert into Supabase Database
    try {
      const { data: inserted, error } = await supabase
        .from("camp_feedbacks")
        .insert([
          {
            content: trimmedContent,
            bg_color: chosen.bg,
            text_color: chosen.text,
            rotate_deg: randomRot,
            date_display: formattedDateTime,
            is_approved: true,
          },
        ])
        .select()
        .single();

      if (!error && inserted) {
        // Upgrade tempId to actual DB id
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? { ...n, id: inserted.id } : n))
        );
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("gfd_user_notes");
            let list: StickyNote[] = stored ? JSON.parse(stored) : [];
            if (Array.isArray(list)) {
              list = list.map((n) => (n.id === tempId ? { ...n, id: inserted.id } : n));
              localStorage.setItem("gfd_user_notes", JSON.stringify(list));
            }
          } catch {}
        }
      } else if (error) {
        console.warn("Supabase feedback insert error:", error);
      }
    } catch (err) {
      console.warn("Supabase feedback insert offline fallback:", err);
    }

    // Reset Form
    setNewContent("");
    setIsWriteModalOpen(false);
    setIsSubmittingNote(false);
  };

  const handleTimeCapsuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleName || !capsuleLetter || !capsuleEmail) return;

    // คำนวณ target_date หากยังไม่ได้ระบุ ให้เป็น 1 ปีข้างหน้า
    let finalTargetDate = capsuleTargetDate;
    if (!finalTargetDate) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      finalTargetDate = nextYear.toISOString().split("T")[0];
    }

    const fullTimingStr = capsuleOpenDate
      ? capsuleOpenDate.trim()
      : `วันที่ ${finalTargetDate}`;

    const newLetterObj = {
      id: `letter-${Date.now()}`,
      name: capsuleName.trim(),
      email: capsuleEmail.trim(),
      school: capsuleSchool.trim(),
      dream_faculty: capsuleDreamFaculty.trim(),
      letter_content: capsuleLetter.trim(),
      delivery_timing: fullTimingStr.trim(),
      target_date: finalTargetDate,
      is_delivered: false,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_letters");
        let list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];
        list = [newLetterObj, ...list];
        localStorage.setItem("gfd_user_letters", JSON.stringify(list));
      } catch {}
    }

    // บันทึกจดหมายลง Supabase Database (future_letters)
    try {
      const basePayload = {
        name: capsuleName.trim(),
        email: capsuleEmail.trim(),
        school: capsuleSchool.trim(),
        dream_faculty: capsuleDreamFaculty.trim(),
        letter_content: capsuleLetter.trim(),
        delivery_timing: fullTimingStr.trim(),
      };

      // ลองบันทึกพร้อม target_date ก่อน
      const { error: insertErr } = await supabase.from("future_letters").insert([
        {
          ...basePayload,
          target_date: finalTargetDate,
        },
      ]);

      // หาก Supabase แจ้งว่ายังไม่มีคอลัมน์ target_date ให้บันทึกแบบไม่ใส่ target_date สำรอง
      if (insertErr && (insertErr.code === "PGRST204" || insertErr.message?.includes("target_date"))) {
        await supabase.from("future_letters").insert([basePayload]);
      }
    } catch (err) {
      console.warn("Supabase future_letters insert offline fallback:", err);
    }

    // หากกำหนดเวลาส่งคือ 'วันนี้หรือในอดีต' ให้สั่งส่งเข้าอีเมลทันทีอัตโนมัติ!
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const isDueImmediately = finalTargetDate <= todayStr;

    if (isDueImmediately) {
      try {
        fetch("/api/letters/send-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ letterData: newLetterObj }),
        }).then((res) => {
          if (res.ok) {
            try {
              const stored = localStorage.getItem("gfd_user_letters");
              if (stored) {
                const list = JSON.parse(stored);
                if (Array.isArray(list)) {
                  const updated = list.map((l: any) =>
                    l.id === newLetterObj.id ? { ...l, is_delivered: true } : l
                  );
                  localStorage.setItem("gfd_user_letters", JSON.stringify(updated));
                }
              }
            } catch {}
          }
        });
      } catch (err) {
        console.warn("Auto-send immediate letter error:", err);
      }
    }

    setCapsuleSubmitted(true);
  };

  const filteredPhotos = photos.filter((p) => {
    if (photoFilter === "all") return true;
    return p.category === photoFilter || p.categoryLabel === photoFilter;
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
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "voices"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                  : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              เสียงสะท้อนจากน้อง
            </button>
            <button
              onClick={() => setActiveTab("wall")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "wall"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                  : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              Wall of Memories
            </button>
            <button
              onClick={() => setActiveTab("timecapsule")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "timecapsule"
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

              {notes.length === 0 ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[380px] text-center p-8">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100/90 border-2 border-amber-300 flex items-center justify-center mb-4 shadow-sm text-amber-800">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-amber-950">ยังไม่มีข้อความบนบอร์ด</h4>
                  <p className="text-xs text-amber-900/70 mt-1 max-w-sm">
                    ร่วมเป็นคนแรกที่ส่งต่อความรู้สึก ความประทับใจ หรือคำขอบคุณ โดยกดปุ่ม &quot;+ เขียนความรู้สึกของคุณ&quot; ด้านบนได้เลย
                  </p>
                </div>
              ) : (
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
              )}
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
                            className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer ${c.bg} ${selectedColor === c.id ? "scale-125 ring-2 ring-purple-600 shadow-md" : "hover:scale-105"
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
                        disabled={isSubmittingNote}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold text-xs shadow-md hover:shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingNote ? "กำลังแปะลงบอร์ด..." : "แปะลงบอร์ดทันที"}
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
              <button
                onClick={() => setPhotoFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  photoFilter === "all"
                    ? "bg-purple-primary text-white shadow-md shadow-purple-primary/30"
                    : "bg-white text-zinc-600 hover:text-purple-dark hover:bg-zinc-100 border border-zinc-200"
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    photoFilter === cat
                      ? "bg-purple-primary text-white shadow-md shadow-purple-primary/30"
                      : "bg-white text-zinc-600 hover:text-purple-dark hover:bg-zinc-100 border border-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            {filteredPhotos.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-zinc-300 max-w-xl mx-auto p-8 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-zinc-800">ยังไม่มีรูปภาพในหมวดหมู่นี้</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  ทีมงานกำลังเตรียมประมวลภาพกิจกรรม โปรดติดตามเร็วๆ นี้
                </p>
              </div>
            ) : (
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
                          {photo.categoryLabel || photo.category || photo.edition || "Guidance"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <span className="text-[10px] font-bold text-pink-accent uppercase tracking-wider block mb-1">
                        {photo.categoryLabel || photo.category}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-purple-deeper group-hover:text-purple-primary transition-colors">
                        {photo.title}
                      </h4>
                      {photo.caption && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                        {lightboxPhoto.edition || "Guidance 7th"} • {lightboxPhoto.categoryLabel || lightboxPhoto.category}
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
                      ถึงตัวฉันในอนาคต ขอให้เธอเชื่อมั่นในตัวเอง พยายามอย่างเต็มที่ และมอบหมายทุกสิ่งแด่อัลลอฮฺ ขอพระองค์ทรงประทานสิ่งที่ดีที่สุด และนำพาเธอไปสู่ความสำเร็จในเส้นทางที่พระองค์ทรงกำหนด
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-zinc-700">
                          ระบุวันที่ต้องการให้ระบบส่งจดหมายฉบับนี้กลับไปหาคุณ:
                        </label>
                        <span className="text-[11px] text-purple-700 font-semibold hidden sm:inline">
                          ส่งอัตโนมัติเมื่อถึงวันที่กำหนด
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 1. Date Picker */}
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1 font-medium">
                            วันที่ส่งในปฏิทิน:
                          </label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split("T")[0]}
                            value={capsuleTargetDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCapsuleTargetDate(val);
                              if (val) {
                                const [y, m, d] = val.split("-");
                                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                const formatted = dateObj.toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                });
                                setCapsuleOpenDate(`วันที่ ${formatted}`);
                              }
                            }}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                          />
                        </div>

                        {/* 2. Event / Label */}
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1 font-medium">
                            โอกาส / คำอธิบาย (ถ้ามี):
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น วันประกาศผล TCAS, อีก 1 ปีข้างหน้า..."
                            value={capsuleOpenDate}
                            onChange={(e) => setCapsuleOpenDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                          />
                        </div>
                      </div>

                      {/* Live Preview Notification Badge */}
                      <div className="mt-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-2 text-xs text-purple-950">
                        <span className="text-base shrink-0 mt-0.5">📬</span>
                        <div className="leading-relaxed">
                          <strong>กำหนดการส่งอัตโนมัติ:</strong>{" "}
                          จดหมายจะถูกส่งเข้าอีเมล{" "}
                          <span className="font-mono font-bold text-purple-800">
                            {capsuleEmail ? capsuleEmail : "อีเมลที่คุณระบุ"}
                          </span>{" "}
                          ในวันที่{" "}
                          <span className="font-bold text-purple-900">
                            {capsuleTargetDate
                              ? new Date(capsuleTargetDate).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "1 ปีข้างหน้า"}
                          </span>{" "}
                          {capsuleOpenDate ? `(${capsuleOpenDate})` : ""}
                        </div>
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

