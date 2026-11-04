"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SubpageHero from "../components/SubpageHero";
import { supabase } from "../lib/supabase";
import PdfSpreadReader, { PdfCoverThumbnail } from "../components/PdfSpreadReader";

/* ================================================================
   DATA TYPES FOR REAL 2-PAGE SPREAD E-BOOK
   ================================================================ */

export type DocumentCategory =
  | "all"
  | "academic"
  | "faculty_slides"
  | "camp_docs";

export interface BookPageContent {
  pageNumber: number;
  headerLeft?: string;
  headerRight?: string;
  showOrnament?: boolean;
  title?: string;
  subtitle?: string;
  authorCredits?: string[];
  publisherCredits?: string;
  arabicVerse?: {
    arabic: string;
    transliteration?: string;
    translation?: string;
  };
  paragraphs?: string[];
  bulletPoints?: string[];
  photoUrl?: string;
  photoCaption?: string;
  quoteBox?: {
    text: string;
    author: string;
  };
  decorativeLeaf?: boolean;
  footerNote?: string;
}

export interface BookSpread {
  spreadNumber: number;
  leftPage: BookPageContent;
  rightPage: BookPageContent;
}

export interface DocumentItem {
  id: string;
  category: "academic" | "faculty_slides" | "camp_docs";
  categoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  fileUrl?: string;
  coverUrl?: string;
  coverGradient: string;
  accentColor: string;
  icon: string;
  badge: string;
  author: string;
  totalPages: number;
  fileSize: string;
  releaseDate: string;
  spreads: BookSpread[];
}

/* ================================================================
   PAGE COMPONENT WITH 2-PAGE SPREAD REALISTIC E-BOOK READER
   ================================================================ */

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEBook, setActiveEBook] = useState<DocumentItem | null>(null);
  const [currentSpreadIdx, setCurrentSpreadIdx] = useState(0);
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fetch documents from Supabase on mount & listen for Realtime changes
  useEffect(() => {
    const fetchLiveDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) {
          console.warn("Notice fetching Supabase documents:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const categoryLabels: Record<string, string> = {
            academic: "เอกสารวิชาการ",
            faculty_slides: "เอกสารสไลด์นำเสนอแต่ละคณะ",
            camp_docs: "เอกสารค่าย",
          };

          const mapped: DocumentItem[] = data.map((d: any) => ({
            id: d.id,
            category: (d.category as "academic" | "faculty_slides" | "camp_docs") || "academic",
            categoryLabel: categoryLabels[d.category] || "เอกสารค่าย",
            title: d.title || "เอกสารไม่มีชื่อ",
            subtitle: d.subtitle || "",
            description: d.description || "",
            fileUrl: d.file_url || "",
            coverUrl: d.cover_url || "",
            coverGradient: d.cover_gradient || "from-stone-900 via-amber-950 to-stone-950",
            accentColor:
              d.category === "academic"
                ? "#D97706"
                : d.category === "faculty_slides"
                ? "#0EA5E9"
                : "#EC4899",
            icon: d.icon || "",
            badge: d.badge || "E-BOOK",
            author: d.author || "ชมรมมุสลิม ม.อ. หาดใหญ่",
            totalPages: d.total_pages || (Array.isArray(d.spreads) ? d.spreads.length * 2 : 1),
            fileSize: d.file_size || "",
            releaseDate: "พฤศจิกายน 2569",
            spreads: Array.isArray(d.spreads) && d.spreads.length > 0 ? d.spreads : [],
          }));

          setDocumentsList(mapped);
          setIsLiveConnected(true);
        } else {
          setDocumentsList([]);
        }
      } catch (err) {
        console.warn("Could not connect to Supabase documents:", err);
        setDocumentsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveDocuments();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel("documents-realtime-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents" },
        () => {
          fetchLiveDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter documents by category and search query
  const filteredDocs = documentsList.filter((doc) => {
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto-open book from URL direct link / QR code (?book=<id> or ?id=<id>)
  useEffect(() => {
    if (typeof window === "undefined" || documentsList.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("book") || params.get("id");
    if (bookId) {
      const target = documentsList.find(
        (d) =>
          d.id.toLowerCase() === bookId.toLowerCase() ||
          d.id.toLowerCase().startsWith(bookId.toLowerCase())
      );
      if (target) {
        setActiveEBook(target);
        setCurrentSpreadIdx(0);
      }
    }
  }, [documentsList]);

  // Open E-Book modal & update URL to permanent deep link
  const openEBook = (doc: DocumentItem) => {
    setActiveEBook(doc);
    setCurrentSpreadIdx(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("book", doc.id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Close E-Book modal & clean up URL parameter
  const closeEBook = () => {
    setActiveEBook(null);
    setCurrentSpreadIdx(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("book");
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.pathname);
    }
  };

  // Keyboard navigation inside 2-page modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeEBook) return;
      if (e.key === "Escape") closeEBook();
      if (e.key === "ArrowLeft") {
        setCurrentSpreadIdx((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentSpreadIdx((prev) =>
          Math.min(activeEBook.spreads.length - 1, prev + 1)
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeEBook]);

  // Download or view full file handler
  const handleDownload = (doc: DocumentItem) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      alert(`กำลังดาวน์โหลดไฟล์ฉบับเต็ม: ${doc.title} (${doc.fileSize || "PDF"})`);
    }
  };

  const activeSpread = activeEBook ? activeEBook.spreads[currentSpreadIdx] : null;

  return (
    <main className="relative min-h-screen bg-cream-bg">
      {/* Hero Banner — Exact Home Page Style */}
      <SubpageHero
        badge="คลังความรู้ดิจิทัล"
        titleMain="KNOWLEDGE"
        titleHighlight="Guidance 7th"
        subtitle1="ค่ายสานฝันเพื่อน้อง ปีที่ 7"
        subtitle2="เอกสารวิชาการ • สไลด์นำเสนอ 16 คณะ • คู่มือและเอกสารค่าย"
        subtitle3="ณ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่"
        scrollTargetId="#docs-section"
      />

      {/* Main Content Section */}
      <section
        id="docs-section"
        className="relative py-20 sm:py-28 bg-gradient-to-b from-cream-bg via-pink-pale to-cream-bg overflow-hidden"
      >
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-sm font-semibold rounded-full mb-4 border border-purple-primary/15">
              KNOWLEDGE REPOSITORY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
                KNOWLEDGE & E-Book ค่าย
              </span>
            </h2>
            <div className="section-divider mb-6" />
            <p className="text-foreground/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              เปิดอ่านในรูปแบบสมุดเสมือนจริง 2 หน้าคู่ (Double-page spread) หรือดาวน์โหลดเก็บไว้อ่าน
            </p>
          </div>

          {/* 3 Categories Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-8">
            {[
              { id: "all" as const, label: "เอกสารทั้งหมด", count: documentsList.length },
              { id: "academic" as const, label: "เอกสารวิชาการ", count: documentsList.filter(d => d.category === "academic").length },
              { id: "faculty_slides" as const, label: "เอกสารสไลด์นำเสนอแต่ละคณะ", count: documentsList.filter(d => d.category === "faculty_slides").length },
              { id: "camp_docs" as const, label: "เอกสารค่าย", count: documentsList.filter(d => d.category === "camp_docs").length },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-xl shadow-purple-primary/25 scale-105 border border-white/30"
                      : "bg-white/80 hover:bg-white text-purple-dark border border-purple-primary/15 hover:shadow-md"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-purple-primary/10 text-purple-primary"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อเอกสาร, หมวดหมู่, หรือเนื้อหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-white/90 border border-purple-primary/15 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-primary/30 shadow-sm placeholder:text-foreground/40"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-foreground/40 hover:text-foreground bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Documents Grid — Displayed as 3D E-Books */}
          {isLoading ? (
            <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-purple-primary/10 max-w-md mx-auto p-8 shadow-sm animate-pulse">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-purple-dark font-bold text-base">กำลังโหลดคลังเอกสาร...</p>
              <p className="text-foreground/50 text-xs mt-1">กำลังเชื่อมต่อฐานข้อมูล Supabase</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-purple-primary/10 max-w-lg mx-auto p-8 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-primary/10 flex items-center justify-center text-purple-primary">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-purple-dark font-bold text-xl mb-1">
                {searchQuery ? "ไม่พบเอกสารที่ค้นหา" : "ขณะนี้ยังไม่มีเอกสารในหมวดนี้"}
              </p>
              <p className="text-foreground/60 text-sm max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูรายการเอกสาร"
                  : "คณะทำงานกำลังจัดเตรียมเอกสารและสื่อการเรียนรู้ กรุณาติดตามการอัปเดตเร็วๆ นี้"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-3xl border border-purple-primary/15 p-5 shadow-md shadow-purple-primary/5 hover:shadow-xl hover:shadow-purple-primary/15 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Dynamic Responsive Showcase Stage (Slide 16:9 or Book A5/A4) */}
                    <div
                      onClick={() => openEBook(doc)}
                      className="relative w-full h-48 sm:h-52 mb-4 rounded-2xl bg-gradient-to-b from-purple-primary/5 via-stone-100/30 to-transparent flex items-center justify-center p-2.5 overflow-hidden cursor-pointer group/stage"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <PdfCoverThumbnail
                          fileUrl={doc.fileUrl || ""}
                          fallbackGradient={doc.coverGradient}
                          badge={doc.badge}
                          icon={doc.icon}
                          title={doc.title}
                          subtitle={doc.subtitle}
                          category={doc.category}
                        />
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-purple-deeper/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 z-30">
                        <span className="px-3.5 py-2 rounded-xl bg-white text-purple-deeper font-bold text-xs shadow-xl flex items-center group-hover:scale-105 transition-transform text-center">
                          <span>คลิกเปิดอ่านสมุดจริง</span>
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-primary/10 text-purple-primary border border-purple-primary/15">
                        {doc.categoryLabel}
                      </span>
                      <span className="text-[11px] text-foreground/50 font-medium">
                        {doc.fileSize}
                      </span>
                    </div>

                    <h3
                      onClick={() => openEBook(doc)}
                      className="text-base font-bold text-purple-dark group-hover:text-purple-primary transition-colors cursor-pointer mb-1.5 leading-snug line-clamp-1"
                    >
                      {doc.title}
                    </h3>
                    <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4">
                      {doc.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-purple-primary/10 flex items-center gap-2">
                    <button
                      onClick={() => openEBook(doc)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent hover:from-purple-dark hover:to-purple-primary text-white text-xs font-bold shadow-md shadow-purple-primary/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center"
                    >
                      <span>เปิดอ่านสมุดจริง</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      title="ดาวน์โหลดไฟล์ PDF"
                      className="py-2 px-3 rounded-xl bg-white hover:bg-purple-primary/10 border border-purple-primary/20 text-purple-dark text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          REALISTIC 2-PAGE SPREAD E-BOOK MODAL (OPEN BOOK VIEW)
          ======================================================== */}
      {activeEBook && activeEBook.fileUrl && (activeEBook.fileUrl.toLowerCase().includes(".pdf") || activeEBook.fileUrl.includes("/documents/")) ? (
        <PdfSpreadReader
          fileUrl={activeEBook.fileUrl}
          title={activeEBook.title}
          subtitle={activeEBook.subtitle}
          icon={activeEBook.icon}
          author={activeEBook.author}
          totalPagesHint={activeEBook.totalPages}
          onClose={closeEBook}
          onDownload={() => handleDownload(activeEBook)}
        />
      ) : activeEBook && activeSpread ? (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in"
          onClick={closeEBook}
        >
          {/* Top Bar with Title & Close Button */}
          <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between text-white pointer-events-none">
            <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 pointer-events-auto shadow-lg">
              <span className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                {activeEBook.title}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-mono border border-white/15 text-white/90">
                หน้าที่ {activeSpread.leftPage.pageNumber}-{activeSpread.rightPage.pageNumber} จาก {activeEBook.totalPages}
              </span>
              <button
                onClick={closeEBook}
                className="w-10 h-10 rounded-2xl bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-base font-bold transition-all border border-white/20 cursor-pointer shadow-lg hover:scale-105"
                aria-label="ปิดสมุด"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Floating Left Arrow (<) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSpreadIdx((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentSpreadIdx === 0}
            className={`absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-2xl cursor-pointer ${
              currentSpreadIdx === 0
                ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                : "bg-black/60 hover:bg-black/85 text-white border border-white/25 hover:scale-110 active:scale-95"
            }`}
            aria-label="หน้าก่อนหน้า"
          >
            ‹
          </button>

          {/* Floating Right Arrow (>) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSpreadIdx((prev) =>
                Math.min(activeEBook.spreads.length - 1, prev + 1)
              );
            }}
            disabled={currentSpreadIdx === activeEBook.spreads.length - 1}
            className={`absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-2xl cursor-pointer ${
              currentSpreadIdx === activeEBook.spreads.length - 1
                ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                : "bg-black/60 hover:bg-black/85 text-white border border-white/25 hover:scale-110 active:scale-95"
            }`}
            aria-label="หน้าถัดไป"
          >
            ›
          </button>

          {/* Real 2-Page Book Container (Facing Pages) */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] my-auto flex flex-col md:flex-row bg-[#FAF8F5] rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.65)] border border-[#E2DBD0] overflow-hidden animate-[scale-in_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ========================================================
                LEFT PAGE OF SPREAD
                ======================================================== */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-11 relative flex flex-col justify-between bg-[#FAF8F3] border-b md:border-b-0 md:border-r border-[#E8E2D5] overflow-y-auto max-h-[42vh] md:max-h-[82vh]">
              {/* Inner spine shadow on right edge of left page */}
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/12 via-black/[0.04] to-transparent pointer-events-none" />

              <div>
                {/* Header with Title */}
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#E8E2D5] text-[11px] font-semibold text-[#8B6B58]">
                  <span>{activeSpread.leftPage.headerLeft || "Guidance for Dream 7th"}</span>
                  <span className="text-xs">✦</span>
                </div>

                {/* Decorative Emblem / Ornament */}
                {activeSpread.leftPage.showOrnament && (
                  <div className="text-center my-3 text-[#B45309] text-sm select-none">
                    ۞
                  </div>
                )}

                {/* Main Page Title */}
                {activeSpread.leftPage.title && (
                  <div className="text-center mb-6">
                    <div className="w-16 h-0.5 bg-[#B45309]/30 mx-auto mb-2" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#78350F] leading-snug">
                      {activeSpread.leftPage.title}
                    </h2>
                    <div className="w-16 h-0.5 bg-[#B45309]/30 mx-auto mt-2" />
                  </div>
                )}

                {/* Author Credits Box (as in uploaded image) */}
                {activeSpread.leftPage.authorCredits && (
                  <div className="text-center space-y-1 mb-5 text-xs text-[#78350F]/80">
                    {activeSpread.leftPage.authorCredits.map((credit, cIdx) => (
                      <p key={cIdx} className={cIdx === 0 ? "font-bold text-[#92400E] text-sm" : ""}>
                        {credit}
                      </p>
                    ))}
                  </div>
                )}

                {/* Arabic Verse / Callout */}
                {activeSpread.leftPage.arabicVerse && (
                  <div className="my-5 p-5 rounded-2xl bg-[#F5EFEB] border border-[#E5D7CA] text-center shadow-inner">
                    <div
                      dir="rtl"
                      className="font-serif text-2xl sm:text-3xl text-[#5F2A10] font-bold leading-loose mb-3 tracking-wide"
                    >
                      {activeSpread.leftPage.arabicVerse.arabic}
                    </div>
                    {activeSpread.leftPage.arabicVerse.transliteration && (
                      <div className="text-xs font-semibold text-[#B45309] mb-1">
                        {activeSpread.leftPage.arabicVerse.transliteration}
                      </div>
                    )}
                    {activeSpread.leftPage.arabicVerse.translation && (
                      <p className="text-xs text-[#451A03]/80 leading-relaxed italic">
                        {activeSpread.leftPage.arabicVerse.translation}
                      </p>
                    )}
                  </div>
                )}

                {/* Paragraphs */}
                {activeSpread.leftPage.paragraphs && (
                  <div className="space-y-3 text-xs sm:text-sm text-[#451A03]/85 leading-relaxed text-center sm:text-left">
                    {activeSpread.leftPage.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                )}

                {/* Bullet Points */}
                {activeSpread.leftPage.bulletPoints && (
                  <div className="my-4 space-y-2 text-xs sm:text-sm text-[#451A03]/85 bg-[#F5EFEB]/70 p-4 rounded-xl border border-[#E5D7CA]">
                    {activeSpread.leftPage.bulletPoints.map((bp, bpIdx) => (
                      <div key={bpIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{bp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Publisher credits at bottom */}
                {activeSpread.leftPage.publisherCredits && (
                  <div className="text-center my-6 text-[11px] font-bold tracking-wider text-[#92400E] whitespace-pre-line leading-relaxed">
                    {activeSpread.leftPage.publisherCredits}
                  </div>
                )}


              </div>

              {/* Left Page Footer & Number */}
              <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-[#A89F91]">
                <span>{activeSpread.leftPage.footerNote || ""}</span>
                <span className="font-mono font-bold text-xs px-2 py-0.5 border-b border-[#A89F91]/50">
                  {activeSpread.leftPage.pageNumber}
                </span>
              </div>
            </div>

            {/* ========================================================
                CENTER SPINE CREASE & GUTTER SHADOW
                ======================================================== */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[#D5CBB9] z-20 pointer-events-none shadow-[0_0_12px_rgba(0,0,0,0.2)]" />

            {/* ========================================================
                RIGHT PAGE OF SPREAD
                ======================================================== */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-11 relative flex flex-col justify-between bg-[#FCFBF7] overflow-y-auto max-h-[42vh] md:max-h-[82vh]">
              {/* Inner spine shadow on left edge of right page */}
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/12 via-black/[0.04] to-transparent pointer-events-none" />

              <div>
                {/* Header with Reference */}
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#E8E2D5] text-[11px] font-semibold text-[#8B6B58]">
                  <span className="text-xs">✦</span>
                  <span>{activeSpread.rightPage.headerRight || "Guidance for Dream 7th"}</span>
                </div>

                {/* Decorative Ornament */}
                {activeSpread.rightPage.showOrnament && (
                  <div className="text-center my-3 text-[#B45309] text-sm select-none">
                    ۞
                  </div>
                )}

                {/* Main Page Title (if any) */}
                {activeSpread.rightPage.title && (
                  <div className="text-center mb-6">
                    <div className="w-16 h-0.5 bg-[#B45309]/30 mx-auto mb-2" />
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#78350F] leading-snug">
                      {activeSpread.rightPage.title}
                    </h2>
                    <div className="w-16 h-0.5 bg-[#B45309]/30 mx-auto mt-2" />
                  </div>
                )}

                {/* Embedded Camp Photo (in grayscale/duotone like the uploaded reference image) */}
                {activeSpread.rightPage.photoUrl && (
                  <div className="my-5 rounded-2xl overflow-hidden border border-[#E5D7CA] shadow-md bg-black/5">
                    <div className="relative w-full aspect-[16/9]">
                      <Image
                        src={activeSpread.rightPage.photoUrl}
                        alt="Camp photo spread"
                        fill
                        className="object-cover grayscale contrast-110 brightness-95"
                      />
                    </div>
                    {activeSpread.rightPage.photoCaption && (
                      <p className="p-3 text-[11px] text-[#78350F]/70 text-center bg-[#F5EFEB]/90 italic">
                        {activeSpread.rightPage.photoCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Arabic Verse / Callout */}
                {activeSpread.rightPage.arabicVerse && (
                  <div className="my-5 p-5 rounded-2xl bg-[#F5EFEB] border border-[#E5D7CA] text-center shadow-inner">
                    <div
                      dir="rtl"
                      className="font-serif text-2xl sm:text-3xl text-[#5F2A10] font-bold leading-loose mb-3 tracking-wide"
                    >
                      {activeSpread.rightPage.arabicVerse.arabic}
                    </div>
                    {activeSpread.rightPage.arabicVerse.transliteration && (
                      <div className="text-xs font-semibold text-[#B45309] mb-1">
                        {activeSpread.rightPage.arabicVerse.transliteration}
                      </div>
                    )}
                    {activeSpread.rightPage.arabicVerse.translation && (
                      <p className="text-xs text-[#451A03]/80 leading-relaxed italic">
                        {activeSpread.rightPage.arabicVerse.translation}
                      </p>
                    )}
                  </div>
                )}

                {/* Quote Box (as shown in book spreads) */}
                {activeSpread.rightPage.quoteBox && (
                  <div className="my-5 p-5 rounded-2xl bg-[#F5EFEB] border-l-4 border-[#B45309] text-center">
                    <p className="text-sm font-semibold text-[#78350F] italic leading-relaxed mb-2">
                      {activeSpread.rightPage.quoteBox.text}
                    </p>
                    <span className="text-xs font-bold text-[#B45309]">
                      — {activeSpread.rightPage.quoteBox.author}
                    </span>
                  </div>
                )}

                {/* Paragraphs */}
                {activeSpread.rightPage.paragraphs && (
                  <div className="space-y-3 text-xs sm:text-sm text-[#451A03]/85 leading-relaxed">
                    {activeSpread.rightPage.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                )}

                {/* Bullet Points */}
                {activeSpread.rightPage.bulletPoints && (
                  <div className="my-4 space-y-2 text-xs sm:text-sm text-[#451A03]/85 bg-[#F5EFEB]/70 p-4 rounded-xl border border-[#E5D7CA]">
                    {activeSpread.rightPage.bulletPoints.map((bp, bpIdx) => (
                      <div key={bpIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed">{bp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Decorative Emblem */}
                {activeSpread.rightPage.showOrnament && (
                  <div className="text-center my-4 text-[#B45309] text-sm select-none">
                    ۞
                  </div>
                )}

                {/* Publisher credits at bottom */}
                {activeSpread.rightPage.publisherCredits && (
                  <div className="text-center my-4 text-[11px] font-bold tracking-wider text-[#92400E] whitespace-pre-line leading-relaxed">
                    {activeSpread.rightPage.publisherCredits}
                  </div>
                )}
              </div>

              {/* Right Page Footer & Number */}
              <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-[#A89F91]">
                <span className="font-mono font-bold text-xs px-2 py-0.5 border-b border-[#A89F91]/50">
                  {activeSpread.rightPage.pageNumber}
                </span>
                <span>{activeSpread.rightPage.footerNote || ""}</span>
              </div>
            </div>
          </div>

          {/* Bottom Spread Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
            {activeEBook.spreads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSpreadIdx(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSpreadIdx === i
                    ? "w-8 h-2.5 bg-gradient-to-r from-purple-primary to-pink-accent shadow-md shadow-pink-accent/50"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`เปิดแผ่นที่ ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
