"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase, uploadMedia } from "../lib/supabase";

// Types
interface Speaker {
  id: string;
  name: string;
  role: string;
  activity: string;
  desc: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface Poster {
  id: string;
  title: string;
  caption: string;
  image: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
}

interface Partner {
  id: string;
  name: string;
  logo: string;
  websiteUrl: string;
  tier: "Gold" | "Silver" | "General";
  order: number;
  isActive: boolean;
}

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  category: string;
  order: number;
  isActive: boolean;
}

export default function AdminPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "speakers" | "posters" | "partners" | "gallery">("overview");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Data States
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Speaker Modal State
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  // Poster Modal State
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  // Partner Modal State
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Gallery Modal State
  const [editingGallery, setEditingGallery] = useState<GalleryImage | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Check Auth on Mount
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("gfd_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch {
      // ignore
    } finally {
      setAuthChecking(false);
    }
  }, []);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "gfd7thadmin";

    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("gfd_admin_auth", "true");
      setLoginError(null);
      fetchData();
      showToast("เข้าสู่ระบบผู้ดูแลระบบสำเร็จ! 👋");
    } else {
      setLoginError("รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("gfd_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
    showToast("ออกจากระบบเรียบร้อยแล้ว");
  };

  // Load all data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Speakers
      const { data: spData } = await supabase
        .from("speakers")
        .select("*")
        .order("sort_order", { ascending: true });
      if (spData) {
        setSpeakers(
          spData.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            activity: s.activity || "",
            desc: s.description || "",
            image: s.image_url || "/images/favicon.png",
            order: s.sort_order || 0,
            isActive: s.is_active ?? true,
          }))
        );
      }

      // 2. Fetch Posters
      const { data: posData } = await supabase
        .from("posters")
        .select("*")
        .order("sort_order", { ascending: true });
      if (posData) {
        setPosters(
          posData.map((p) => ({
            id: p.id,
            title: p.title,
            caption: p.caption || "",
            image: p.image_url || "",
            linkUrl: p.link_url || "",
            order: p.sort_order || 0,
            isActive: p.is_active ?? true,
          }))
        );
      }

      // 3. Fetch Partners
      const { data: ptData } = await supabase
        .from("partners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (ptData) {
        setPartners(
          ptData.map((pt) => ({
            id: pt.id,
            name: pt.name,
            logo: pt.logo_url || "",
            websiteUrl: pt.website_url || "",
            tier: (pt.tier as "Gold" | "Silver" | "General") || "General",
            order: pt.sort_order || 0,
            isActive: pt.is_active ?? true,
          }))
        );
      }

      // 4. Fetch Gallery
      const { data: galData } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (galData) {
        setGallery(
          galData.map((g) => ({
            id: g.id,
            src: g.image_url || "",
            caption: g.caption || "",
            category: g.category || "กิจกรรม",
            order: g.sort_order || 0,
            isActive: g.is_active ?? true,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // File Upload Handlers
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: "speakers" | "posters" | "partners" | "gallery",
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast("กำลังอัปโหลดรูปภาพ...");
    try {
      const res = await uploadMedia(file, folder);
      if (res && res.url) {
        onSuccess(res.url);
        showToast("อัปโหลดรูปภาพสำเร็จ! ✅");
      } else {
        showToast("อัปโหลดไม่สำเร็จ: " + (res?.error || "เกิดข้อผิดพลาด"));
      }
    } catch (err: any) {
      showToast("อัปโหลดไม่สำเร็จ: " + (err?.message || "เกิดข้อผิดพลาด"));
    } finally {
      setIsUploading(false);
    }
  };

  // Loading auth state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        กำลังโหลดระบบ...
      </div>
    );
  }

  // 1. LOGIN GATE VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-primary/30 to-pink-accent/20 border border-purple-primary/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-primary/20">
              <Image src="/images/favicon.png" alt="GFD Logo" width={40} height={40} className="object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              เข้าสู่ระบบ <span className="bg-gradient-to-r from-purple-light to-pink-light bg-clip-text text-transparent">Admin CMS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Guidance for Dream 7th • เฉพาะทีมงานผู้ดูแลระบบ
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รหัสผ่านผู้ดูแลระบบ (Admin Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="กรอกรหัสผ่านเพื่อเข้าใช้งาน..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-primary focus:ring-2 focus:ring-purple-primary/20 text-sm pr-12 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 text-xs cursor-pointer"
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-primary via-purple-dark to-pink-accent hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-primary/25 transition-all cursor-pointer mt-2"
            >
              เข้าสู่ระบบ (Sign In)
            </button>
          </form>

          {/* Back to main website */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-pink-light transition-colors inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>กลับสู่หน้าหลัก Guidance for Dream</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW (AUTHENTICATED)
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-primary to-pink-accent text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-white/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-primary/30 flex items-center justify-center p-1.5 border border-purple-primary/40">
              <Image src="/images/favicon.png" alt="GFD Logo" width={32} height={32} className="rounded-lg object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white leading-tight">
                  GFD 7th <span className="text-pink-light">Admin CMS</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Supabase
                </span>
              </div>
              <p className="text-xs text-slate-400">ระบบจัดการเนื้อหาหน้าเว็บค่ายสานฝันเพื่อน้อง</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                fetchData();
                showToast("รีเฟรชข้อมูลล่าสุดแล้ว");
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700 cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">ดูหน้าเว็บจริง</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 border border-red-800/40 cursor-pointer"
              title="ออกจากระบบ"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-lg shadow-purple-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>ภาพรวม (Overview)</span>
            </button>

            <button
              onClick={() => setActiveTab("speakers")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "speakers"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-lg shadow-purple-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span>Hilight วิทยากร</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">{speakers.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("posters")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "posters"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-lg shadow-purple-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>ประชาสัมพันธ์ โปสเตอร์</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">{posters.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("partners")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "partners"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-lg shadow-purple-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>Blooming Partners</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">{partners.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-lg shadow-purple-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>ความทรงจำที่ผ่านมา</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">{gallery.length}</span>
            </button>
          </nav>

          {/* Connected Status */}
          <div className="mt-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Supabase Connected</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              ข้อมูลทุกอย่างที่แก้ไขในหน้านี้จะบันทึกและอัปเดตไปยังหน้าเว็บหลักแบบเรียลไทม์
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-emerald-400 font-medium font-mono">tsedkch...</span>
              </div>
              <div className="flex justify-between">
                <span>Bucket:</span>
                <span className="text-purple-light font-medium font-mono">gfd-media</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {loading && (
            <div className="p-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800 animate-pulse">
              กำลังโหลดข้อมูลจาก Supabase...
            </div>
          )}

          {/* OVERVIEW TAB */}
          {!loading && activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-deeper/70 to-slate-900 p-6 rounded-2xl border border-purple-primary/20">
                <h2 className="text-xl font-bold text-white mb-2">ยินดีต้อนรับสู่ระบบจัดการ Guidance for Dream 7th</h2>
                <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                  ฐานข้อมูล Supabase เชื่อมต่อเรียบร้อยแล้ว คุณสามารถจัดการวิทยากร โปสเตอร์ ผู้สนับสนุน และคลังภาพความทรงจำได้ทันที
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab("speakers")} className="p-5 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl border border-slate-800 cursor-pointer transition-all hover:border-purple-primary/40 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400">วิทยากร (Hilight)</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-primary/20 text-pink-light flex items-center justify-center">
                      🎤
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{speakers.length}</div>
                  <p className="text-xs text-slate-500 mt-1">ใช้งานอยู่ {speakers.filter(s => s.isActive).length} ท่าน</p>
                </div>

                <div onClick={() => setActiveTab("posters")} className="p-5 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl border border-slate-800 cursor-pointer transition-all hover:border-purple-primary/40 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400">โปสเตอร์ประชาสัมพันธ์</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-accent/20 text-pink-accent flex items-center justify-center">
                      🖼️
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{posters.length}</div>
                  <p className="text-xs text-slate-500 mt-1">แสดงผล {posters.filter(p => p.isActive).length} โปสเตอร์</p>
                </div>

                <div onClick={() => setActiveTab("partners")} className="p-5 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl border border-slate-800 cursor-pointer transition-all hover:border-purple-primary/40 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400">Blooming Partners</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      🌸
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{partners.length}</div>
                  <p className="text-xs text-slate-500 mt-1">ผู้สนับสนุนทั้งหมด</p>
                </div>

                <div onClick={() => setActiveTab("gallery")} className="p-5 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl border border-slate-800 cursor-pointer transition-all hover:border-purple-primary/40 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400">ความทรงจำ (Gallery)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      📸
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{gallery.length}</div>
                  <p className="text-xs text-slate-500 mt-1">รูปภาพในดาต้าเบส</p>
                </div>
              </div>
            </div>
          )}

          {/* SPEAKERS TAB */}
          {!loading && activeTab === "speakers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">จัดการข้อมูลวิทยากร (Hilight ค่ายปีที่ 7)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">เพิ่ม ลบ หรือแก้ไขข้อมูลวิทยากรที่จะมาแชร์ประสบการณ์ในค่าย</p>
                </div>
                <button
                  onClick={() => {
                    setEditingSpeaker({
                      id: "",
                      name: "",
                      role: "",
                      activity: "",
                      desc: "",
                      image: "/images/favicon.png",
                      order: speakers.length + 1,
                      isActive: true,
                    });
                    setIsSpeakerModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-primary/25 cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มวิทยากรใหม่</span>
                </button>
              </div>

              {speakers.length === 0 && (
                <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  ยังไม่มีข้อมูลวิทยากรในระบบ (กดปุ่ม &quot;เพิ่มวิทยากรใหม่&quot; ด้านบนเพื่อเพิ่ม)
                </div>
              )}

              {/* Speakers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((sp) => (
                  <div
                    key={sp.id}
                    className={`p-4 bg-slate-950/70 rounded-2xl border transition-all ${
                      sp.isActive ? "border-slate-800 hover:border-purple-primary/30" : "border-red-900/30 opacity-60"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                        <Image src={sp.image || "/images/favicon.png"} alt={sp.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-base truncate">{sp.name || "(ยังไม่ได้ระบุชื่อ)"}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sp.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                            {sp.isActive ? "แสดงผล" : "ซ่อน"}
                          </span>
                        </div>
                        <p className="text-xs text-pink-light font-medium mt-0.5 truncate">{sp.role || "-"}</p>
                        {sp.activity && <p className="text-xs text-purple-light/90 font-mono mt-0.5 truncate">📌 {sp.activity}</p>}
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sp.desc || "-"}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">ลำดับที่: {sp.order}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const newStatus = !sp.isActive;
                            const { error } = await supabase.from("speakers").update({ is_active: newStatus }).eq("id", sp.id);
                            if (error) {
                              showToast("แก้ไขไม่สำเร็จ: " + error.message);
                            } else {
                              await fetchData();
                              showToast(newStatus ? "เปิดแสดงผลแล้ว" : "ซ่อนวิทยากรแล้ว");
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        >
                          {sp.isActive ? "ซ่อน" : "แสดง"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSpeaker({ ...sp });
                            setIsSpeakerModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-primary/30 hover:bg-purple-primary/50 text-purple-light transition-colors cursor-pointer"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`ยืนยันการลบ ${sp.name}?`)) {
                              const { error } = await supabase.from("speakers").delete().eq("id", sp.id);
                              if (error) {
                                showToast("ลบไม่สำเร็จ: " + error.message);
                              } else {
                                await fetchData();
                                showToast("ลบข้อมูลวิทยากรเรียบร้อยแล้ว");
                              }
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POSTERS TAB */}
          {!loading && activeTab === "posters" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">จัดการโปสเตอร์ประชาสัมพันธ์โครงการ</h2>
                  <p className="text-xs text-slate-400 mt-0.5">เพิ่มโปสเตอร์ใหม่ๆ ที่จะแสดงใน Carousel หน้าเว็บหลัก</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPoster({
                      id: "",
                      title: "",
                      caption: "",
                      image: "",
                      linkUrl: "",
                      order: posters.length + 1,
                      isActive: true,
                    });
                    setIsPosterModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-primary/25 cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มโปสเตอร์ใหม่</span>
                </button>
              </div>

              {posters.length === 0 && (
                <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  ยังไม่มีโปสเตอร์ในระบบ (กดปุ่ม &quot;เพิ่มโปสเตอร์ใหม่&quot; ด้านบนเพื่อเพิ่ม)
                </div>
              )}

              {/* Posters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posters.map((pos) => (
                  <div key={pos.id} className="bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
                    <div className="relative aspect-[3/4] bg-slate-900">
                      {pos.image ? (
                        <Image src={pos.image} alt={pos.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">ไม่มีรูป</div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pos.isActive ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                          {pos.isActive ? "กำลังแสดง" : "ซ่อนอยู่"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{pos.title || "(ไม่มีหัวข้อ)"}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pos.caption || "-"}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono">ลำดับ #{pos.order}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const newStatus = !pos.isActive;
                              const { error } = await supabase.from("posters").update({ is_active: newStatus }).eq("id", pos.id);
                              if (error) {
                                showToast("แก้ไขไม่สำเร็จ: " + error.message);
                              } else {
                                await fetchData();
                                showToast(newStatus ? "เปิดแสดงผลแล้ว" : "ซ่อนโปสเตอร์แล้ว");
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          >
                            {pos.isActive ? "ซ่อน" : "แสดง"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingPoster({ ...pos });
                              setIsPosterModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-primary/30 hover:bg-purple-primary/50 text-purple-light transition-colors cursor-pointer"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`ยืนยันการลบโปสเตอร์ ${pos.title}?`)) {
                                const { error } = await supabase.from("posters").delete().eq("id", pos.id);
                                if (error) {
                                  showToast("ลบไม่สำเร็จ: " + error.message);
                                } else {
                                  await fetchData();
                                  showToast("ลบโปสเตอร์เรียบร้อยแล้ว");
                                }
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTNERS TAB */}
          {!loading && activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">จัดการผู้สนับสนุน (Blooming Partners)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">เพิ่มโลโก้ผู้สนับสนุนโครงการที่จะเลื่อนวนลูปในแถบ Blooming Partners</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPartner({
                      id: "",
                      name: "",
                      logo: "",
                      websiteUrl: "",
                      tier: "General",
                      order: partners.length + 1,
                      isActive: true,
                    });
                    setIsPartnerModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-primary/25 cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มผู้สนับสนุนใหม่</span>
                </button>
              </div>

              {partners.length === 0 && (
                <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  ยังไม่มีผู้สนับสนุนในระบบ
                </div>
              )}

              {/* Partners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((pt) => (
                  <div key={pt.id} className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center flex-shrink-0 border border-slate-700">
                        {pt.logo ? (
                          <div className="relative w-full h-full">
                            <Image src={pt.logo} alt={pt.name} fill className="object-contain" sizes="64px" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold text-center">ไม่มีรูป</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-primary/30 text-purple-light border border-purple-primary/40">
                            {pt.tier}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm mt-1 truncate">{pt.name || "(ไม่มีชื่อ)"}</h3>
                        {pt.websiteUrl && (
                          <a href={pt.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-pink-light hover:underline truncate block">
                            {pt.websiteUrl}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">ลำดับ #{pt.order}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const newStatus = !pt.isActive;
                            const { error } = await supabase.from("partners").update({ is_active: newStatus }).eq("id", pt.id);
                            if (error) {
                              showToast("แก้ไขไม่สำเร็จ: " + error.message);
                            } else {
                              await fetchData();
                              showToast(newStatus ? "เปิดแสดงผลแล้ว" : "ซ่อนแล้ว");
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        >
                          {pt.isActive ? "ซ่อน" : "แสดง"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPartner({ ...pt });
                            setIsPartnerModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-primary/30 hover:bg-purple-primary/50 text-purple-light transition-colors cursor-pointer"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`ยืนยันการลบ ${pt.name}?`)) {
                              const { error } = await supabase.from("partners").delete().eq("id", pt.id);
                              if (error) {
                                showToast("ลบไม่สำเร็จ: " + error.message);
                              } else {
                                await fetchData();
                                showToast("ลบผู้สนับสนุนเรียบร้อยแล้ว");
                              }
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {!loading && activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">จัดการภาพความทรงจำที่ผ่านมา (Gallery)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">จัดเก็บและอัปโหลดภาพกิจกรรมเก่าๆ เข้าสู่ดาต้าเบส</p>
                </div>
                <button
                  onClick={() => {
                    setEditingGallery({
                      id: "",
                      src: "",
                      caption: "Guidance for Dream 6th",
                      category: "กิจกรรม",
                      order: gallery.length + 1,
                      isActive: true,
                    });
                    setIsGalleryModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-primary/25 cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มรูปภาพใหม่</span>
                </button>
              </div>

              {gallery.length === 0 && (
                <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  ยังไม่มีรูปภาพในแกลเลอรี
                </div>
              )}

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden group">
                    <div className="relative aspect-[4/3] bg-slate-900">
                      {item.src ? (
                        <Image src={item.src} alt={item.caption} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">ไม่มีรูป</div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingGallery({ ...item });
                            setIsGalleryModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-primary text-white text-xs font-semibold cursor-pointer"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("ลบรูปนี้หรือไม่?")) {
                              const { error } = await supabase.from("gallery_images").delete().eq("id", item.id);
                              if (error) {
                                showToast("ลบไม่สำเร็จ: " + error.message);
                              } else {
                                await fetchData();
                                showToast("ลบรูปภาพเรียบร้อยแล้ว");
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-white truncate">{item.caption}</p>
                      <span className="text-[10px] text-slate-500 block mt-0.5">หมวด: {item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SPEAKER MODAL */}
      {isSpeakerModalOpen && editingSpeaker && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingSpeaker.id ? "แก้ไขข้อมูลวิทยากร" : "เพิ่มวิทยากรใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ชื่อ - สกุล</label>
                <input
                  type="text"
                  value={editingSpeaker.name}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                  placeholder="เช่น ดร.สมชาย ใจดี"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">บทบาท / ตำแหน่ง</label>
                <input
                  type="text"
                  value={editingSpeaker.role}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                  placeholder="เช่น ผู้เชี่ยวชาญด้านจิตวิทยาการศึกษา"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">กิจกรรม / หัวข้อที่บรรยาย</label>
                <input
                  type="text"
                  value={editingSpeaker.activity}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, activity: e.target.value })}
                  placeholder="เช่น แนะแนวการศึกษา 16 คณะ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">คำอธิบายสั้นๆ / ประวัติ</label>
                <textarea
                  value={editingSpeaker.desc}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, desc: e.target.value })}
                  rows={3}
                  placeholder="รายละเอียดประสบการณ์สั้นๆ..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">อัปโหลดรูปภาพ (เลือกไฟล์จากเครื่อง)</label>
                  {isUploading && (
                    <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                      <span>⏳</span> กำลังอัปโหลด...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "speakers", (url) => setEditingSpeaker({ ...editingSpeaker, image: url }))}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-primary/30 file:text-purple-light hover:file:bg-purple-primary/50 cursor-pointer"
                />
                {editingSpeaker.image && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                      <Image src={editingSpeaker.image} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block max-w-xs">{editingSpeaker.image}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsSpeakerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={isUploading}
                onClick={async () => {
                  if (!editingSpeaker.name) {
                    alert("กรุณากรอกชื่อวิทยากร");
                    return;
                  }

                  const row = {
                    name: editingSpeaker.name,
                    role: editingSpeaker.role,
                    activity: editingSpeaker.activity,
                    description: editingSpeaker.desc,
                    image_url: editingSpeaker.image,
                    sort_order: editingSpeaker.order,
                    is_active: editingSpeaker.isActive,
                  };

                  if (editingSpeaker.id) {
                    const { error } = await supabase.from("speakers").update(row).eq("id", editingSpeaker.id);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  } else {
                    const { error } = await supabase.from("speakers").insert([row]);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  }

                  await fetchData();
                  setIsSpeakerModalOpen(false);
                  showToast("บันทึกข้อมูลวิทยากรสำเร็จ! 🎉");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white text-sm font-semibold shadow-lg shadow-purple-primary/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>กำลังอัปโหลดรูป...</span>
                  </>
                ) : (
                  <span>บันทึกข้อมูล</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POSTER MODAL */}
      {isPosterModalOpen && editingPoster && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingPoster.id ? "แก้ไขโปสเตอร์" : "เพิ่มโปสเตอร์ใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ชื่อโปสเตอร์</label>
                <input
                  type="text"
                  value={editingPoster.title}
                  onChange={(e) => setEditingPoster({ ...editingPoster, title: e.target.value })}
                  placeholder="เช่น โปสเตอร์เปิดรับสมัครรุ่นที่ 1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">รายละเอียด / เนื้อหาประชาสัมพันธ์</label>
                <textarea
                  rows={3}
                  value={editingPoster.caption}
                  onChange={(e) => setEditingPoster({ ...editingPoster, caption: e.target.value })}
                  placeholder="กรอกรายละเอียดข่าวสารประชาสัมพันธ์ หรือข้อความจากโพสต์..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ลิงก์โพสต์ Facebook (Facebook Post URL)</label>
                <input
                  type="text"
                  value={editingPoster.linkUrl}
                  onChange={(e) => setEditingPoster({ ...editingPoster, linkUrl: e.target.value })}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">อัปโหลดรูปโปสเตอร์ (เลือกไฟล์จากเครื่อง)</label>
                  {isUploading && (
                    <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                      <span>⏳</span> กำลังอัปโหลด...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "posters", (url) => setEditingPoster({ ...editingPoster, image: url }))}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-primary/30 file:text-purple-light hover:file:bg-purple-primary/50 cursor-pointer"
                />
                {editingPoster.image && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="w-12 h-16 relative rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                      <Image src={editingPoster.image} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block max-w-xs">{editingPoster.image}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={isUploading}
                onClick={async () => {
                  if (!editingPoster.title) {
                    alert("กรุณากรอกชื่อโปสเตอร์");
                    return;
                  }

                  const row = {
                    title: editingPoster.title,
                    caption: editingPoster.caption,
                    image_url: editingPoster.image,
                    link_url: editingPoster.linkUrl,
                    sort_order: editingPoster.order,
                    is_active: editingPoster.isActive,
                  };

                  if (editingPoster.id) {
                    const { error } = await supabase.from("posters").update(row).eq("id", editingPoster.id);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  } else {
                    const { error } = await supabase.from("posters").insert([row]);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  }

                  await fetchData();
                  setIsPosterModalOpen(false);
                  showToast("บันทึกโปสเตอร์สำเร็จ! 🎉");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white text-sm font-semibold shadow-lg shadow-purple-primary/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>กำลังอัปโหลดรูป...</span>
                  </>
                ) : (
                  <span>บันทึกโปสเตอร์</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARTNER MODAL */}
      {isPartnerModalOpen && editingPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingPartner.id ? "แก้ไขข้อมูลผู้สนับสนุน" : "เพิ่มผู้สนับสนุนใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ชื่อหน่วยงาน / องค์กร</label>
                <input
                  type="text"
                  value={editingPartner.name}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  placeholder="เช่น บริษัท ABC จำกัด"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">อัปโหลดโลโก้ (เลือกไฟล์จากเครื่อง)</label>
                  {isUploading && (
                    <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                      <span>⏳</span> กำลังอัปโหลด...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "partners", (url) => setEditingPartner({ ...editingPartner, logo: url }))}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-primary/30 file:text-purple-light hover:file:bg-purple-primary/50 cursor-pointer"
                />
                {editingPartner.logo && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-slate-700 bg-white p-1 flex-shrink-0">
                      <Image src={editingPartner.logo} alt="Preview" fill className="object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block max-w-xs">{editingPartner.logo}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ระดับผู้สนับสนุน (Tier)</label>
                <select
                  value={editingPartner.tier}
                  onChange={(e) => setEditingPartner({ ...editingPartner, tier: e.target.value as "Gold" | "Silver" | "General" })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary cursor-pointer"
                >
                  <option value="Gold">Gold Partner</option>
                  <option value="Silver">Silver Partner</option>
                  <option value="General">General Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">เว็บไซต์ผู้สนับสนุน (ถ้ามี)</label>
                <input
                  type="text"
                  value={editingPartner.websiteUrl}
                  onChange={(e) => setEditingPartner({ ...editingPartner, websiteUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={isUploading}
                onClick={async () => {
                  if (!editingPartner.name) {
                    alert("กรุณากรอกชื่อผู้สนับสนุน");
                    return;
                  }

                  const row = {
                    name: editingPartner.name,
                    logo_url: editingPartner.logo,
                    website_url: editingPartner.websiteUrl,
                    tier: editingPartner.tier,
                    sort_order: editingPartner.order,
                    is_active: editingPartner.isActive,
                  };

                  if (editingPartner.id) {
                    const { error } = await supabase.from("partners").update(row).eq("id", editingPartner.id);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  } else {
                    const { error } = await supabase.from("partners").insert([row]);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  }

                  await fetchData();
                  setIsPartnerModalOpen(false);
                  showToast("บันทึกผู้สนับสนุนสำเร็จ! 🎉");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white text-sm font-semibold shadow-lg shadow-purple-primary/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>กำลังอัปโหลดรูป...</span>
                  </>
                ) : (
                  <span>บันทึกผู้สนับสนุน</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY MODAL */}
      {isGalleryModalOpen && editingGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingGallery.id ? "แก้ไขรูปภาพ Gallery" : "เพิ่มรูปภาพ Gallery ใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">คำบรรยายภาพ (Caption)</label>
                <input
                  type="text"
                  value={editingGallery.caption}
                  onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                  placeholder="เช่น บรรยากาศกิจกรรมค่าย 6th"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={editingGallery.category}
                  onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                  placeholder="เช่น กิจกรรม, พิธีเปิด, ความทรงจำ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">อัปโหลดรูปภาพ (เลือกไฟล์จากเครื่อง)</label>
                  {isUploading && (
                    <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                      <span>⏳</span> กำลังอัปโหลด...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "gallery", (url) => setEditingGallery({ ...editingGallery, src: url }))}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-primary/30 file:text-purple-light hover:file:bg-purple-primary/50 cursor-pointer"
                />
                {editingGallery.src && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                    <div className="w-16 h-12 relative rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                      <Image src={editingGallery.src} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block max-w-xs">{editingGallery.src}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={isUploading}
                onClick={async () => {
                  const row = {
                    caption: editingGallery.caption,
                    alt_text: editingGallery.caption,
                    image_url: editingGallery.src,
                    category: editingGallery.category,
                    sort_order: editingGallery.order,
                    is_active: editingGallery.isActive,
                  };

                  if (editingGallery.id) {
                    const { error } = await supabase.from("gallery_images").update(row).eq("id", editingGallery.id);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  } else {
                    const { error } = await supabase.from("gallery_images").insert([row]);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  }

                  await fetchData();
                  setIsGalleryModalOpen(false);
                  showToast("บันทึกรูปภาพเรียบร้อย! 🎉");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white text-sm font-semibold shadow-lg shadow-purple-primary/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>กำลังอัปโหลดรูป...</span>
                  </>
                ) : (
                  <span>บันทึกรูปภาพ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
