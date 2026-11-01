"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase, uploadMedia } from "../lib/supabase";
import { getPdfJs, compressPdfInBrowser } from "../components/PdfSpreadReader";
import ScheduleAdminSection from "./components/ScheduleAdminSection";

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

interface Video {
  id: string;
  title: string;
  description: string;
  videoType: "youtube" | "upload";
  videoUrl: string;
  thumbnailUrl: string;
  order: number;
  isActive: boolean;
}

interface AdminDocument {
  id: string;
  category: "academic" | "faculty_slides" | "camp_docs";
  title: string;
  subtitle: string;
  description: string;
  fileUrl: string;
  coverUrl: string;
  coverGradient: string;
  icon: string;
  badge: string;
  author: string;
  totalPages: number;
  fileSize: string;
  spreads: any[];
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
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "speakers" | "posters" | "partners" | "gallery" | "videos" | "documents"
  >("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Data States
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);

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

  // Video Modal State
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Document Modal State
  const [editingDocument, setEditingDocument] = useState<AdminDocument | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [docCategoryFilter, setDocCategoryFilter] = useState<"all" | "academic" | "faculty_slides" | "camp_docs">("all");
  const [selectedQrDoc, setSelectedQrDoc] = useState<AdminDocument | null>(null);
  
  // Permanent Production Domain for QR Code generation (Persisted in localStorage)
  const DEFAULT_PROD_DOMAIN = "https://guidance.msspsuhatyai.org";
  const [customDomain, setCustomDomain] = useState<string>(DEFAULT_PROD_DOMAIN);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);

  // Initialize and persist custom domain
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gfd_qr_custom_domain");
      if (saved && saved.trim()) {
        setCustomDomain(saved.trim());
      } else {
        setCustomDomain(DEFAULT_PROD_DOMAIN);
        localStorage.setItem("gfd_qr_custom_domain", DEFAULT_PROD_DOMAIN);
      }
    } catch {
      // ignore
    }
  }, []);

  const updateCustomDomain = (newDomain: string) => {
    setCustomDomain(newDomain);
    try {
      localStorage.setItem("gfd_qr_custom_domain", newDomain.trim());
    } catch {
      // ignore
    }
  };

  const getDocDirectLink = (docId: string): string => {
    const origin = (customDomain && customDomain.trim()) || DEFAULT_PROD_DOMAIN;
    return `${origin}/documents?book=${docId}`;
  };

  const handleCopyDirectLink = (doc: AdminDocument) => {
    const link = getDocDirectLink(doc.id);
    navigator.clipboard.writeText(link);
    showToast(`คัดลอกลิงก์ของ "${doc.title}" เรียบร้อยแล้ว! 🔗`);
  };

  const handleOpenQrModal = (doc: AdminDocument) => {
    try {
      const saved = localStorage.getItem("gfd_qr_custom_domain");
      if (saved && saved.trim()) {
        setCustomDomain(saved.trim());
      } else if (!customDomain || customDomain.includes("localhost")) {
        setCustomDomain(DEFAULT_PROD_DOMAIN);
      }
    } catch {
      // ignore
    }
    setSelectedQrDoc(doc);
  };

  const handleOpenNewDocument = () => {
    const newDoc: AdminDocument = {
      id: "",
      category: "academic",
      title: "",
      subtitle: "",
      description: "",
      fileUrl: "",
      coverUrl: "",
      coverGradient: "from-stone-900 via-amber-950 to-stone-950",
      icon: "📖",
      badge: "E-BOOK วิชาการ",
      author: "ฝ่ายวิชาการ ชมรมมุสลิม ม.อ. หาดใหญ่",
      totalPages: 1,
      fileSize: "",
      spreads: [],
      order: documents.length + 1,
      isActive: true,
    };
    setEditingDocument(newDoc);
    setIsDocumentModalOpen(true);
  };

  // Automated PDF Inspector, Compressor & Uploader
  const handleDocumentPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile || !editingDocument) return;

    let fileToUpload = rawFile;
    const isPdf =
      rawFile.type === "application/pdf" ||
      rawFile.name.toLowerCase().endsWith(".pdf");

    // Allow files up to 350MB (we will auto-compress in-browser if > 40MB)
    const MAX_ALLOWED_SIZE = 350 * 1024 * 1024;
    if (rawFile.size > MAX_ALLOWED_SIZE) {
      showToast("ขนาดไฟล์ใหญ่เกิน 350MB กรุณาใช้ไฟล์ขนาดไม่เกิน 350MB");
      return;
    }

    // 1. Auto calculate raw file size (MB / KB)
    const rawSizeInMB = rawFile.size / (1024 * 1024);
    const rawFormattedSize =
      rawSizeInMB >= 1
        ? `${rawSizeInMB.toFixed(1)} MB`
        : `${Math.round(rawFile.size / 1024)} KB`;

    // 2. Auto-detect title from file name if currently empty
    const cleanFileName = rawFile.name.replace(/\.[^/.]+$/, "");
    const updatedTitle = editingDocument.title.trim()
      ? editingDocument.title
      : cleanFileName;

    // 3. Auto-detect total pages via PDF.js client-side
    let detectedPages = editingDocument.totalPages || 1;
    if (isPdf) {
      try {
        const arrayBuffer = await rawFile.arrayBuffer();
        const pdfjs = await getPdfJs();
        const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        if (doc && doc.numPages) {
          detectedPages = doc.numPages;
        }
      } catch (err) {
        console.warn("Could not auto-read PDF page count:", err);
      }
    }

    // 4. In-Browser Auto Compression: If PDF is > 40MB (e.g. 158MB), compress client-side down to ~15MB!
    const COMPRESSION_THRESHOLD = 40 * 1024 * 1024; // 40MB
    if (isPdf && rawFile.size > COMPRESSION_THRESHOLD) {
      setIsUploading(true);
      showToast(`⚡ ตรวจพบไฟล์ขนาดใหญ่ (${rawFormattedSize}) กำลังบีบอัด PDF อัตโนมัติในเครื่อง...`);
      setUploadProgressMsg(`กำลังเตรียมบีบอัด PDF... (0/${detectedPages})`);

      try {
        fileToUpload = await compressPdfInBrowser(rawFile, ({ current, total, percent }) => {
          setUploadProgressMsg(`⚡ กำลังบีบอัดไฟล์ในเครื่อง: หน้า ${current}/${total} (${percent}%)`);
        });

        const compSizeInMB = fileToUpload.size / (1024 * 1024);
        const compFormattedSize = `${compSizeInMB.toFixed(1)} MB`;
        showToast(`บีบอัดสำเร็จ! ลดจาก ${rawFormattedSize} เหลือ ${compFormattedSize} 🎉 กำลังอัปโหลด...`);
      } catch (compErr: any) {
        console.error("In-browser compression error:", compErr);
        showToast("บีบอัดไม่สำเร็จ: กำลังพยายามอัปโหลดไฟล์ต้นฉบับ...");
        fileToUpload = rawFile;
      }
    }

    const finalSizeInMB = fileToUpload.size / (1024 * 1024);
    const finalFormattedSize =
      finalSizeInMB >= 1
        ? `${finalSizeInMB.toFixed(1)} MB`
        : `${Math.round(fileToUpload.size / 1024)} KB`;

    // Update state immediately with auto-detected values
    setEditingDocument((prev) =>
      prev
        ? {
            ...prev,
            title: updatedTitle,
            fileSize: finalFormattedSize,
            totalPages: detectedPages,
          }
        : null
    );

    // 5. Upload file to Supabase storage
    setIsUploading(true);
    setUploadProgressMsg("กำลังอัปโหลดไฟล์เข้าสู่ Cloud Storage...");

    try {
      const res = await uploadMedia(fileToUpload, "documents");
      if (res && res.url) {
        setEditingDocument((prev) =>
          prev ? { ...prev, fileUrl: res.url || "" } : null
        );
        showToast(`อัปโหลดไฟล์เรียบร้อยแล้ว! (${detectedPages} หน้า • ${finalFormattedSize}) ✅`);
      } else {
        showToast("อัปโหลดไม่สำเร็จ: " + (res?.error || "เกิดข้อผิดพลาด"));
      }
    } catch (err: any) {
      showToast("อัปโหลดไม่สำเร็จ: " + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgressMsg(null);
    }
  };

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

      // 5. Fetch Videos
      const { data: vidData } = await supabase
        .from("videos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (vidData) {
        setVideos(
          vidData.map((v) => ({
            id: v.id,
            title: v.title || "",
            description: v.description || "",
            videoType: (v.video_type as "youtube" | "upload") || "youtube",
            videoUrl: v.video_url || "",
            thumbnailUrl: v.thumbnail_url || "",
            order: v.sort_order || 0,
            isActive: v.is_active ?? true,
          }))
        );
      }

      // 6. Fetch Documents & E-Books
      try {
        const { data: docData, error: docError } = await supabase
          .from("documents")
          .select("*")
          .order("sort_order", { ascending: true });

        if (docData) {
          setDocuments(
            docData.map((d: any) => ({
              id: d.id,
              category: (d.category as "academic" | "faculty_slides" | "camp_docs") || "academic",
              title: d.title || "",
              subtitle: d.subtitle || "",
              description: d.description || "",
              fileUrl: d.file_url || "",
              coverUrl: d.cover_url || "",
              coverGradient: d.cover_gradient || "from-stone-900 via-amber-950 to-stone-950",
              icon: d.icon || "📖",
              badge: d.badge || "E-BOOK",
              author: d.author || "ชมรมมุสลิม ม.อ. หาดใหญ่",
              totalPages: d.total_pages || (Array.isArray(d.spreads) ? d.spreads.length * 2 : 1),
              fileSize: d.file_size || "",
              spreads: Array.isArray(d.spreads) ? d.spreads : [],
              order: d.sort_order || 0,
              isActive: d.is_active ?? true,
            }))
          );
        } else if (docError) {
          console.warn("Notice reading documents table:", docError.message);
        }
      } catch (err) {
        console.warn("Documents table not initialized yet or query error:", err);
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
    folder: "speakers" | "posters" | "partners" | "gallery" | "videos" | "documents",
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 100MB for docs/videos)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      showToast("ขนาดไฟล์เกิน 100MB กรุณาใช้ไฟล์ขนาดเล็กกว่านี้ หรือใช้ลิงก์ภายนอกแทน");
      return;
    }


    setIsUploading(true);
    showToast("กำลังอัปโหลดไฟล์...");
    try {
      const res = await uploadMedia(file, folder);
      if (res && res.url) {
        onSuccess(res.url);
        showToast("อัปโหลดสำเร็จ! ✅");
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-600">
        กำลังโหลดระบบ...
      </div>
    );
  }

  // 1. LOGIN GATE VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl relative z-10 text-zinc-900">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Image src="/images/favicon.png" alt="GFD Logo" width={40} height={40} className="object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">
              เข้าสู่ระบบ <span className="text-black underline underline-offset-4 decoration-zinc-400">Admin CMS</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5">
              Guidance for Dream 7th • เฉพาะทีมงานผู้ดูแลระบบ
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
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
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-300 text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm pr-12 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black p-1 text-xs cursor-pointer font-bold"
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer mt-2"
            >
              เข้าสู่ระบบ (Sign In)
            </button>
          </form>

          {/* Back to main website */}
          <div className="mt-6 pt-6 border-t border-zinc-200 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-black transition-colors inline-flex items-center gap-1.5 font-medium"
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-zinc-700">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Dedicated Left Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 md:z-30 w-72 md:w-64 min-w-[16rem] bg-white border-r border-zinc-200 flex flex-col h-screen transition-transform duration-200 ease-in-out shrink-0 ${
          isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center p-1.5 border border-zinc-300">
              <Image src="/images/favicon.png" alt="GFD Logo" width={32} height={32} className="rounded-lg object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base text-black leading-tight">
                  GFD 7th <span className="text-zinc-500 font-medium">Admin</span>
                </h1>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">ระบบจัดการเนื้อหาค่าย</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer"
            title="ปิดเมนู"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-black text-white shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>ภาพรวม (Overview)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("schedule");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-black text-white shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>ตารางกำหนดการค่าย</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${activeTab === "schedule" ? "bg-white/20 text-white border-white/30" : "bg-zinc-100 text-zinc-700 border-zinc-200"}`}>
                CMS
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("speakers");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "speakers"
                  ? "bg-black text-white shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span>Hilight วิทยากร</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "speakers" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"}`}>{speakers.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("posters");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "posters"
                  ? "bg-black text-white shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>ประชาสัมพันธ์ โปสเตอร์</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "posters" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"}`}>{posters.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("partners");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "partners"
                  ? "bg-black text-white shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>Blooming Partners</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "partners" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"}`}>{partners.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("gallery");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-black text-white shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span>ความทรงจำที่ผ่านมา</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "gallery" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"}`}>{gallery.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("videos");
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "videos"
                ? "bg-black text-white shadow-sm"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>คลิปวิดีโอประชาสัมพันธ์</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "videos" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"}`}>{videos.length}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("documents");
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "documents"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-zinc-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>เอกสารค่าย & E-Book</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "documents" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-700"}`}>{documents.length}</span>
        </button>
      </nav>

      {/* Sidebar Footer: Supabase Connected Status */}
      <div className="p-3 border-t border-zinc-200 shrink-0">
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
          <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>⚡</span>
            <span>Supabase Connected</span>
          </h4>
          <div className="text-[10px] text-zinc-500 font-mono space-y-0.5">
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="text-emerald-700 font-medium">tsedkch...</span>
            </div>
            <div className="flex justify-between">
              <span>Bucket:</span>
              <span className="text-zinc-800 font-medium">gfd-media</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    {/* Main Column (Full Viewport Width) */}
    <div className="flex-1 min-w-0 flex flex-col min-h-screen">
      {/* Sticky Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger button for mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 cursor-pointer"
            title="เปิดเมนูนำทาง"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Current Active Section Breadcrumb */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">หน้าจัดการ /</span>
              <h2 className="font-extrabold text-sm sm:text-base text-black">
                {activeTab === "overview" && "ภาพรวมระบบ (Overview)"}
                {activeTab === "schedule" && "ตารางกำหนดการค่าย (Schedule CMS)"}
                {activeTab === "speakers" && "จัดการข้อมูลวิทยากร (Speakers)"}
                {activeTab === "posters" && "ประชาสัมพันธ์ โปสเตอร์ (Posters)"}
                {activeTab === "partners" && "Blooming Partners"}
                {activeTab === "gallery" && "คลังภาพความทรงจำที่ผ่านมา (Gallery)"}
                {activeTab === "videos" && "คลิปวิดีโอประชาสัมพันธ์ (Videos)"}
                {activeTab === "documents" && "เอกสารค่าย & E-Book"}
              </h2>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              fetchData();
              showToast("รีเฟรชข้อมูลล่าสุดแล้ว");
            }}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-semibold transition-colors border border-zinc-300 cursor-pointer flex items-center gap-1.5"
            title="รีเฟรชข้อมูล"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border border-zinc-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">ดูหน้าเว็บจริง</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border border-rose-200 cursor-pointer"
            title="ออกจากระบบ"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {/* Content Area - 100% Full Width (No max-w-7xl constraint) */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          {loading && (
            <div className="p-12 text-center text-zinc-500 bg-white rounded-2xl border border-zinc-200 animate-pulse">
              กำลังโหลดข้อมูลจาก Supabase...
            </div>
          )}

          {/* OVERVIEW TAB */}
          {!loading && activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
                <h2 className="text-xl font-extrabold text-black mb-2">ยินดีต้อนรับสู่ระบบจัดการ Guidance for Dream 7th</h2>
                <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed">
                  ฐานข้อมูล Supabase เชื่อมต่อเรียบร้อยแล้ว คุณสามารถจัดการกำหนดการค่าย วิทยากร โปสเตอร์ ผู้สนับสนุน เอกสาร และคลังภาพความทรงจำได้ทันที
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div onClick={() => setActiveTab("schedule")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">ตารางกำหนดการค่าย</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold text-sm">
                      📅
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">4 วัน 3 คืน</div>
                  <p className="text-xs text-zinc-500 mt-1">กำหนดการหลัก 94 รายการ & หมุนเวียน 16 คณะ</p>
                </div>

                <div onClick={() => setActiveTab("speakers")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">วิทยากร (Hilight)</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
                      🎤
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">{speakers.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">ใช้งานอยู่ {speakers.filter(s => s.isActive).length} ท่าน</p>
                </div>

                <div onClick={() => setActiveTab("posters")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">โปสเตอร์ประชาสัมพันธ์</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
                      🖼️
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">{posters.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">แสดงผล {posters.filter(p => p.isActive).length} โปสเตอร์</p>
                </div>

                <div onClick={() => setActiveTab("partners")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">Blooming Partners</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
                      🌸
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">{partners.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">ผู้สนับสนุนทั้งหมด</p>
                </div>

                <div onClick={() => setActiveTab("gallery")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">ความทรงจำ (Gallery)</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
                      📸
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">{gallery.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">รูปภาพในดาต้าเบส</p>
                </div>

                <div onClick={() => setActiveTab("videos")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">คลิปวิดีโอ</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
                      🎬
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">{videos.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">แสดงผล {videos.filter(v => v.isActive).length} คลิป</p>
                </div>

                <div onClick={() => setActiveTab("documents")} className="p-5 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer transition-all hover:border-black hover:-translate-y-0.5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-600">เอกสารค่าย & E-Book</span>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 text-black flex items-center justify-center">
                      📚
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-black">{documents.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">แสดงผล {documents.filter(d => d.isActive).length} รายการ (2-Page Spread)</p>
                </div>
              </div>
            </div>
          )}

          {/* SPEAKERS TAB */}
          {!loading && activeTab === "speakers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-black">จัดการข้อมูลวิทยากร (Hilight ค่ายปีที่ 7)</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">เพิ่ม ลบ หรือแก้ไขข้อมูลวิทยากรที่จะมาแชร์ประสบการณ์ในค่าย</p>
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
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มวิทยากรใหม่</span>
                </button>
              </div>

              {speakers.length === 0 && (
                <div className="p-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-zinc-200">
                  ยังไม่มีข้อมูลวิทยากรในระบบ (กดปุ่ม &quot;เพิ่มวิทยากรใหม่&quot; ด้านบนเพื่อเพิ่ม)
                </div>
              )}

              {/* Speakers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((sp) => (
                  <div
                    key={sp.id}
                    className={`p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                      !sp.isActive ? "opacity-70" : ""
                    }`}
                  >
                    <div>
                      {/* Top Accent Line */}
                      <div className="h-1 -mx-4 -mt-4 mb-3.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-2xl" />

                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                          <Image src={sp.image || "/images/favicon.png"} alt={sp.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-black text-base truncate">{sp.name || "(ยังไม่ได้ระบุชื่อ)"}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                              sp.isActive
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-zinc-100 text-zinc-500 border-zinc-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sp.isActive ? "bg-purple-600" : "bg-zinc-400"}`} />
                              <span>{sp.isActive ? "แสดงผล" : "ซ่อน"}</span>
                            </span>
                          </div>
                          <p className="text-xs text-pink-600 font-semibold mt-0.5 truncate">{sp.role || "-"}</p>
                          {sp.activity && (
                            <div className="mt-1">
                              <span className="text-[11px] text-purple-800 font-medium bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 inline-block truncate max-w-full">
                                📌 {sp.activity}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">{sp.desc || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono text-[11px] font-bold">ลำดับ #{sp.order}</span>
                      <div className="flex items-center gap-1.5">
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
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer font-medium text-[11px]"
                        >
                          {sp.isActive ? "ซ่อน" : "แสดง"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSpeaker({ ...sp });
                            setIsSpeakerModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer text-[11px] shadow-xs"
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
                          className="px-2 py-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer text-[11px]"
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
                  <h2 className="text-xl font-extrabold text-black">จัดการโปสเตอร์ประชาสัมพันธ์โครงการ</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">เพิ่มโปสเตอร์ใหม่ๆ ที่จะแสดงใน Carousel หน้าเว็บหลัก</p>
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
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มโปสเตอร์ใหม่</span>
                </button>
              </div>

              {posters.length === 0 && (
                <div className="p-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-zinc-200">
                  ยังไม่มีโปสเตอร์ในระบบ (กดปุ่ม &quot;เพิ่มโปสเตอร์ใหม่&quot; ด้านบนเพื่อเพิ่ม)
                </div>
              )}

              {/* Posters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posters.map((pos) => (
                  <div key={pos.id} className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Top Accent Gradient Line */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500" />

                      <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                        {pos.image ? (
                          <Image src={pos.image} alt={pos.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">ไม่มีรูป</div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md flex items-center gap-1 ${
                            pos.isActive
                              ? "bg-white/95 text-purple-700 border-purple-200"
                              : "bg-white/95 text-zinc-600 border-zinc-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pos.isActive ? "bg-purple-600" : "bg-zinc-400"}`} />
                            <span>{pos.isActive ? "กำลังแสดง" : "ซ่อนอยู่"}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-black text-sm line-clamp-1">{pos.title || "(ไม่มีหัวข้อ)"}</h3>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">{pos.caption || "-"}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs bg-zinc-50/70">
                      <span className="text-zinc-400 font-mono text-[11px] font-bold">ลำดับ #{pos.order}</span>
                      <div className="flex items-center gap-1.5">
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
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer font-medium text-[11px]"
                        >
                          {pos.isActive ? "ซ่อน" : "แสดง"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPoster({ ...pos });
                            setIsPosterModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer text-[11px] shadow-xs"
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
                          className="px-2 py-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer text-[11px]"
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

          {/* PARTNERS TAB */}
          {!loading && activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-black">จัดการผู้สนับสนุน (Blooming Partners)</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">เพิ่มโลโก้ผู้สนับสนุนโครงการที่จะเลื่อนวนลูปในแถบ Blooming Partners</p>
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
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มผู้สนับสนุนใหม่</span>
                </button>
              </div>

              {partners.length === 0 && (
                <div className="p-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-zinc-200">
                  ยังไม่มีผู้สนับสนุนในระบบ
                </div>
              )}

              {/* Partners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((pt) => (
                  <div key={pt.id} className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Top Accent Gradient Line */}
                      <div className="h-1 -mx-4 -mt-4 mb-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-2xl" />

                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-zinc-50 p-2 flex items-center justify-center flex-shrink-0 border border-zinc-200">
                          {pt.logo ? (
                            <div className="relative w-full h-full">
                              <Image src={pt.logo} alt={pt.name} fill className="object-contain" sizes="64px" />
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-bold text-center">ไม่มีรูป</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              {pt.tier}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              pt.isActive
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-zinc-100 text-zinc-500 border-zinc-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pt.isActive ? "bg-purple-600" : "bg-zinc-400"}`} />
                              <span>{pt.isActive ? "แสดงผล" : "ซ่อน"}</span>
                            </span>
                          </div>
                          <h3 className="font-bold text-black text-sm mt-1 truncate">{pt.name || "(ไม่มีชื่อ)"}</h3>
                          {pt.websiteUrl ? (
                            <a href={pt.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-pink-600 hover:underline truncate block font-medium mt-0.5">
                              {pt.websiteUrl}
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400 block mt-0.5">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono text-[11px] font-bold">ลำดับ #{pt.order}</span>
                      <div className="flex items-center gap-1.5">
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
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer font-medium text-[11px]"
                        >
                          {pt.isActive ? "ซ่อน" : "แสดง"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPartner({ ...pt });
                            setIsPartnerModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer text-[11px] shadow-xs"
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
                          className="px-2 py-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer text-[11px]"
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
                  <h2 className="text-xl font-extrabold text-black">จัดการภาพความทรงจำที่ผ่านมา (Gallery)</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">จัดเก็บและอัปโหลดภาพกิจกรรมเก่าๆ เข้าสู่ดาต้าเบส</p>
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
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มรูปภาพใหม่</span>
                </button>
              </div>

              {gallery.length === 0 && (
                <div className="p-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-zinc-200">
                  ยังไม่มีรูปภาพในแกลเลอรี
                </div>
              )}

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all overflow-hidden group flex flex-col justify-between">
                    <div>
                      {/* Top Accent Gradient Line */}
                      <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-pink-500" />

                      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                        {item.src ? (
                          <Image src={item.src} alt={item.caption} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">ไม่มีรูป</div>
                        )}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingGallery({ ...item });
                              setIsGalleryModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
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
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-black text-xs font-bold shadow-xs cursor-pointer transition-colors"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white border-t border-zinc-100">
                      <p className="text-xs font-bold text-black truncate">{item.caption || "ภาพกิจกรรม"}</p>
                      <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">หมวด: {item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIDEOS TAB */}
          {!loading && activeTab === "videos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-black">จัดการคลิปวิดีโอประชาสัมพันธ์</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">เพิ่มคลิปวิดีโอจาก YouTube หรืออัปโหลดไฟล์วิดีโอเพื่อแสดงในหน้าเว็บหลัก</p>
                </div>
                <button
                  onClick={() => {
                    setEditingVideo({
                      id: "",
                      title: "",
                      description: "",
                      videoType: "youtube",
                      videoUrl: "",
                      thumbnailUrl: "",
                      order: videos.length + 1,
                      isActive: true,
                    });
                    setIsVideoModalOpen(true);
                  }}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer self-start"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>เพิ่มวิดีโอใหม่</span>
                </button>
              </div>

              {videos.length === 0 && (
                <div className="p-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200">
                  ยังไม่มีคลิปวิดีโอในระบบ (กดปุ่ม &quot;เพิ่มวิดีโอใหม่&quot; ด้านบนเพื่อเพิ่ม)
                </div>
              )}

              {/* Videos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <div key={vid.id} className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                    <div>
                      {/* Top Accent Gradient Line */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500" />

                      <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                        {vid.videoType === "youtube" && vid.videoUrl ? (
                          (() => {
                            const match = vid.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
                            const ytId = match ? match[1] : null;
                            return ytId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={vid.thumbnailUrl || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">ลิงก์ไม่ถูกต้อง</div>
                            );
                          })()
                        ) : vid.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <svg className="w-12 h-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {/* Type badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md ${
                            vid.videoType === "youtube"
                              ? "bg-white/95 text-pink-600 border-pink-200"
                              : "bg-white/95 text-purple-700 border-purple-200"
                          }`}>
                            {vid.videoType === "youtube" ? "▶ YouTube" : "📁 วิดีโอ"}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md flex items-center gap-1 ${
                            vid.isActive
                              ? "bg-white/95 text-purple-700 border-purple-200"
                              : "bg-white/95 text-zinc-600 border-zinc-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${vid.isActive ? "bg-purple-600" : "bg-zinc-400"}`} />
                            <span>{vid.isActive ? "กำลังแสดง" : "ซ่อนอยู่"}</span>
                          </span>
                        </div>
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-black text-sm line-clamp-1">{vid.title || "(ไม่มีชื่อ)"}</h3>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">{vid.description || "-"}</p>
                        {vid.videoUrl && (
                          <div className="mt-2.5 p-2 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-1.5 text-[11px] text-purple-800 font-medium truncate">
                            <span className="shrink-0">🔗</span>
                            <span className="truncate font-mono">{vid.videoUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs bg-zinc-50/70">
                      <span className="text-zinc-400 font-mono text-[11px] font-bold">ลำดับ #{vid.order}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async () => {
                            const newStatus = !vid.isActive;
                            const { error } = await supabase.from("videos").update({ is_active: newStatus }).eq("id", vid.id);
                            if (error) {
                              showToast("แก้ไขไม่สำเร็จ: " + error.message);
                            } else {
                              await fetchData();
                              showToast(newStatus ? "เปิดแสดงผลแล้ว" : "ซ่อนวิดีโอแล้ว");
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer font-medium text-[11px]"
                        >
                          {vid.isActive ? "ซ่อน" : "แสดง"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideo({ ...vid });
                            setIsVideoModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer text-[11px] shadow-xs"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`ยืนยันการลบวิดีโอ ${vid.title}?`)) {
                              const { error } = await supabase.from("videos").delete().eq("id", vid.id);
                              if (error) {
                                showToast("ลบไม่สำเร็จ: " + error.message);
                              } else {
                                await fetchData();
                                showToast("ลบวิดีโอเรียบร้อยแล้ว");
                              }
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer text-[11px]"
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

          {/* DOCUMENTS & E-BOOK TAB */}
          {!loading && activeTab === "documents" && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-black">จัดการเอกสารค่าย & E-Book</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                      {documents.length} รายการ
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    เพิ่ม ลบ หรือแก้ไขเอกสารวิชาการ สไลด์ 16 คณะ พร้อมแสดงผลสมุดจริง 2 หน้าคู่ และอัปโหลดไฟล์ PDF
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/documents"
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-zinc-200 shadow-xs"
                  >
                    <span>🌐</span>
                    <span>เปิดดูหน้าเอกสารจริง</span>
                  </Link>
                  <button
                    onClick={handleOpenNewDocument}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-90 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-purple-primary/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ เพิ่มเอกสารใหม่</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                {[
                  { id: "all" as const, label: "ทั้งหมด", icon: "📚", count: documents.length },
                  { id: "academic" as const, label: "เอกสารวิชาการ", icon: "📖", count: documents.filter(d => d.category === "academic").length },
                  { id: "faculty_slides" as const, label: "สไลด์นำเสนอ 16 คณะ", icon: "🩺", count: documents.filter(d => d.category === "faculty_slides").length },
                  { id: "camp_docs" as const, label: "เอกสารค่าย", icon: "📋", count: documents.filter(d => d.category === "camp_docs").length },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDocCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      docCategoryFilter === cat.id
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      docCategoryFilter === cat.id
                        ? "bg-white/25 text-white"
                        : "bg-zinc-200/80 text-zinc-700"
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Document Cards Grid */}
              {documents.filter(d => docCategoryFilter === "all" || d.category === docCategoryFilter).length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-4">
                  <div className="text-4xl">📚</div>
                  <h3 className="text-base font-bold text-black">ยังไม่มีเอกสารในหมวดนี้</h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    คุณสามารถกดปุ่ม &quot;+ เพิ่มเอกสารใหม่&quot; เพื่อเริ่มต้นเพิ่มเอกสารวิชาการ สไลด์นำเสนอ หรือเอกสารค่าย
                  </p>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleOpenNewDocument}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>+ เพิ่มเอกสารใหม่</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents
                    .filter(d => docCategoryFilter === "all" || d.category === docCategoryFilter)
                    .map((doc) => {
                      const categoryMap: Record<string, { label: string; badgeCls: string }> = {
                        academic: { label: "เอกสารวิชาการ", badgeCls: "bg-purple-50 text-purple-700 border-purple-200" },
                        faculty_slides: { label: "สไลด์ 16 คณะ", badgeCls: "bg-pink-50 text-pink-700 border-pink-200" },
                        camp_docs: { label: "เอกสารค่าย", badgeCls: "bg-zinc-100 text-zinc-800 border-zinc-200" },
                      };
                      const catInfo = categoryMap[doc.category] || categoryMap.academic;

                      return (
                        <div
                          key={doc.id}
                          className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            {/* Top Accent Gradient Line */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500" />

                            {/* Card Header */}
                            <div className="p-4 pb-3 bg-gradient-to-b from-purple-50/40 via-pink-50/15 to-white border-b border-zinc-100">
                              <div className="flex items-center justify-between gap-2 mb-2.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.badgeCls}`}>
                                  {catInfo.label}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                                  doc.isActive
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-zinc-100 text-zinc-500 border-zinc-200"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${doc.isActive ? "bg-purple-600" : "bg-zinc-400"}`} />
                                  <span>{doc.isActive ? "แสดงผล" : "ซ่อนอยู่"}</span>
                                </span>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-2xl flex items-center justify-center shrink-0 shadow-xs">
                                  {doc.icon || "📖"}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-black text-base leading-snug line-clamp-1">
                                    {doc.title}
                                  </h3>
                                  <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5 font-medium">
                                    {doc.subtitle || doc.description || "ไม่มีคำอธิบายย่อ"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed min-h-[32px]">
                                {doc.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                              </p>

                              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] space-y-1.5 text-zinc-700">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">ผู้จัดทำ:</span>
                                  <span className="font-semibold text-black truncate max-w-[170px]">{doc.author || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">ขนาด / จำนวนหน้า:</span>
                                  <span className="font-mono font-bold text-purple-700">{doc.fileSize || "-"} • {doc.totalPages} หน้า</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-500">หน้าคู่สมุดจริง:</span>
                                  <span className="font-semibold text-pink-600">{doc.spreads?.length || 0} คู่หน้า</span>
                                </div>
                              </div>

                              {/* File URL Attached Badge */}
                              {doc.fileUrl ? (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-[11px] text-purple-800 transition-colors truncate font-medium"
                                  title="คลิกเพื่อเปิดดูไฟล์ที่อัปโหลดไว้"
                                >
                                  📎 มีไฟล์แนบ: <span className="font-mono font-bold text-purple-900">{doc.fileUrl.split("/").pop()}</span>
                                </a>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-[11px] text-zinc-400 italic">
                                  (ยังไม่มีไฟล์ PDF แนบ — แสดงเฉพาะ 2-Page Reader)
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="p-3.5 border-t border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-zinc-50/70">
                            <span className="text-zinc-400 font-mono text-[11px] font-bold">#{doc.order}</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleOpenQrModal(doc)}
                                className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                title="ดูและดาวน์โหลด QR Code สำหรับพิมพ์ลงเล่มจริง"
                              >
                                <span>📱</span>
                                <span>QR Code</span>
                              </button>
                              <button
                                onClick={() => handleCopyDirectLink(doc)}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors cursor-pointer font-medium flex items-center gap-1 text-[11px]"
                                title="คัดลอกลิงก์ตรงไปยังเล่มนี้"
                              >
                                <span>🔗</span>
                                <span>คัดลอกลิงก์</span>
                              </button>
                              <button
                                onClick={async () => {
                                  const newStatus = !doc.isActive;
                                  const { error } = await supabase
                                    .from("documents")
                                    .update({ is_active: newStatus })
                                    .eq("id", doc.id);
                                  if (error) {
                                    showToast("แก้ไขไม่สำเร็จ: " + error.message);
                                  } else {
                                    await fetchData();
                                    showToast(newStatus ? "เปิดแสดงผลเอกสารแล้ว" : "ซ่อนเอกสารแล้ว");
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer font-medium text-[11px]"
                              >
                                {doc.isActive ? "ซ่อน" : "แสดง"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDocument({ ...doc });
                                  setIsDocumentModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer text-[11px] shadow-xs"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`ยืนยันการลบเอกสาร "${doc.title}"?`)) {
                                    const { error } = await supabase
                                      .from("documents")
                                      .delete()
                                      .eq("id", doc.id);
                                    if (error) {
                                      showToast("ลบไม่สำเร็จ: " + error.message);
                                    } else {
                                      await fetchData();
                                      showToast("ลบเอกสารเรียบร้อยแล้ว");
                                    }
                                  }
                                }}
                                className="px-2 py-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer text-[11px]"
                              >
                                ลบ
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* SCHEDULE MANAGEMENT TAB */}
          {!loading && activeTab === "schedule" && (
            <ScheduleAdminSection />
          )}
        </main>
      </div>

      {/* SPEAKER MODAL */}
      {isSpeakerModalOpen && editingSpeaker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 text-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black">
              {editingSpeaker.id ? "แก้ไขข้อมูลวิทยากร" : "เพิ่มวิทยากรใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ชื่อ - สกุล</label>
                <input
                  type="text"
                  value={editingSpeaker.name}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                  placeholder="เช่น ดร.สมชาย ใจดี"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">บทบาท / ตำแหน่ง</label>
                <input
                  type="text"
                  value={editingSpeaker.role}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                  placeholder="เช่น ผู้เชี่ยวชาญด้านจิตวิทยาการศึกษา"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">กิจกรรม / หัวข้อที่บรรยาย</label>
                <input
                  type="text"
                  value={editingSpeaker.activity}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, activity: e.target.value })}
                  placeholder="เช่น แนะแนวการศึกษา 16 คณะ"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">คำอธิบายสั้นๆ / ประวัติ</label>
                <textarea
                  value={editingSpeaker.desc}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, desc: e.target.value })}
                  rows={3}
                  placeholder="รายละเอียดประสบการณ์สั้นๆ..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500">อัปโหลดรูปภาพ (เลือกไฟล์จากเครื่อง)</label>
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
                  className="w-full text-xs text-zinc-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {editingSpeaker.image && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0">
                      <Image src={editingSpeaker.image} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-purple-700 font-semibold block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block max-w-xs">{editingSpeaker.image}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                onClick={() => setIsSpeakerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium cursor-pointer transition-colors"
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 text-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black">
              {editingPoster.id ? "แก้ไขโปสเตอร์" : "เพิ่มโปสเตอร์ใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ชื่อโปสเตอร์</label>
                <input
                  type="text"
                  value={editingPoster.title}
                  onChange={(e) => setEditingPoster({ ...editingPoster, title: e.target.value })}
                  placeholder="เช่น โปสเตอร์เปิดรับสมัครรุ่นที่ 1"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">รายละเอียด / เนื้อหาประชาสัมพันธ์</label>
                <textarea
                  rows={3}
                  value={editingPoster.caption}
                  onChange={(e) => setEditingPoster({ ...editingPoster, caption: e.target.value })}
                  placeholder="กรอกรายละเอียดข่าวสารประชาสัมพันธ์ หรือข้อความจากโพสต์..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ลิงก์โพสต์ Facebook (Facebook Post URL)</label>
                <input
                  type="text"
                  value={editingPoster.linkUrl}
                  onChange={(e) => setEditingPoster({ ...editingPoster, linkUrl: e.target.value })}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500">อัปโหลดรูปโปสเตอร์ (เลือกไฟล์จากเครื่อง)</label>
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
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {editingPoster.image && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="w-12 h-16 relative rounded-lg overflow-hidden border border-zinc-300 flex-shrink-0">
                      <Image src={editingPoster.image} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block max-w-xs">{editingPoster.image}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium cursor-pointer transition-colors"
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 text-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black">
              {editingPartner.id ? "แก้ไขข้อมูลผู้สนับสนุน" : "เพิ่มผู้สนับสนุนใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ชื่อหน่วยงาน / องค์กร</label>
                <input
                  type="text"
                  value={editingPartner.name}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  placeholder="เช่น บริษัท ABC จำกัด"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500">อัปโหลดโลโก้ (เลือกไฟล์จากเครื่อง)</label>
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
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {editingPartner.logo && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-zinc-300 bg-white p-1 flex-shrink-0">
                      <Image src={editingPartner.logo} alt="Preview" fill className="object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block max-w-xs">{editingPartner.logo}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ระดับผู้สนับสนุน (Tier)</label>
                <select
                  value={editingPartner.tier}
                  onChange={(e) => setEditingPartner({ ...editingPartner, tier: e.target.value as "Gold" | "Silver" | "General" })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer"
                >
                  <option value="Gold">Gold Partner</option>
                  <option value="Silver">Silver Partner</option>
                  <option value="General">General Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">เว็บไซต์ผู้สนับสนุน (ถ้ามี)</label>
                <input
                  type="text"
                  value={editingPartner.websiteUrl}
                  onChange={(e) => setEditingPartner({ ...editingPartner, websiteUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium cursor-pointer transition-colors"
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 text-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black">
              {editingGallery.id ? "แก้ไขรูปภาพ Gallery" : "เพิ่มรูปภาพ Gallery ใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">คำบรรยายภาพ (Caption)</label>
                <input
                  type="text"
                  value={editingGallery.caption}
                  onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                  placeholder="เช่น บรรยากาศกิจกรรมค่าย 6th"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={editingGallery.category}
                  onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                  placeholder="เช่น กิจกรรม, พิธีเปิด, ความทรงจำ"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500">อัปโหลดรูปภาพ (เลือกไฟล์จากเครื่อง)</label>
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
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {editingGallery.src && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="w-16 h-12 relative rounded-lg overflow-hidden border border-zinc-300 flex-shrink-0">
                      <Image src={editingGallery.src} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ รูปภาพพร้อมบันทึก</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block max-w-xs">{editingGallery.src}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium cursor-pointer transition-colors"
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
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

      {/* VIDEO MODAL */}
      {isVideoModalOpen && editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 text-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black">
              {editingVideo.id ? "แก้ไขวิดีโอ" : "เพิ่มวิดีโอใหม่"}
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ชื่อวิดีโอ</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  placeholder="เช่น คลิปแนะนำค่ายสานฝัน 7th"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">คำอธิบาย (ไม่บังคับ)</label>
                <textarea
                  rows={2}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  placeholder="รายละเอียดสั้นๆ เกี่ยวกับวิดีโอ..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                />
              </div>

              {/* Video Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-2">ประเภทวิดีโอ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingVideo({ ...editingVideo, videoType: "youtube", videoUrl: "" })}
                    className={`p-3 rounded-xl border-2 text-center text-xs font-semibold transition-all cursor-pointer ${
                      editingVideo.videoType === "youtube"
                        ? "border-pink-500 bg-pink-50 text-pink-700 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                        <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff"/>
                      </svg>
                      <span>ลิงก์ YouTube</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingVideo({ ...editingVideo, videoType: "upload", videoUrl: "" })}
                    className={`p-3 rounded-xl border-2 text-center text-xs font-semibold transition-all cursor-pointer ${
                      editingVideo.videoType === "upload"
                        ? "border-purple-600 bg-purple-50 text-purple-700 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>อัปโหลดไฟล์</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Link URL Input */}
              {editingVideo.videoType === "youtube" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">ลิงก์วิดีโอ (YouTube หรือ Google Drive)</label>
                  <input
                    type="text"
                    value={editingVideo.videoUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/... หรือ https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                  />
                  {editingVideo.videoUrl && (() => {
                    const ytMatch = editingVideo.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
                    const ytId = ytMatch ? ytMatch[1] : null;
                    
                    const driveMatch = editingVideo.videoUrl.match(/(?:\/file\/d\/|[?&]id=)([a-zA-Z0-9_-]+)/);
                    const driveId = driveMatch ? driveMatch[1] : null;

                    return ytId ? (
                      <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title="YouTube Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : driveId ? (
                      <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 aspect-video">
                        <iframe
                          src={`https://drive.google.com/file/d/${driveId}/preview`}
                          title="Google Drive Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] text-red-400 mt-1">⚠️ ลิงก์ไม่ถูกต้อง กรุณาใช้ลิงก์ YouTube หรือ Google Drive</p>
                    );
                  })()}
                </div>
              )}

              {/* Video File Upload */}
              {editingVideo.videoType === "upload" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-zinc-500">อัปโหลดไฟล์วิดีโอ (.mp4, .webm, .mov)</label>
                    {isUploading && (
                      <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                        <span>⏳</span> กำลังอัปโหลด...
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={(e) => handleFileUpload(e, "videos", (url) => setEditingVideo({ ...editingVideo, videoUrl: url }))}
                    className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />
                  {editingVideo.videoUrl && (
                    <div className="mt-2.5 p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ วิดีโอพร้อมบันทึก</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block max-w-full mt-0.5">{editingVideo.videoUrl}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnail Upload (optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500">ภาพปก Thumbnail (ไม่บังคับ — YouTube จะดึงภาพอัตโนมัติ)</label>
                  {isUploading && (
                    <span className="text-[11px] text-amber-400 font-medium animate-pulse flex items-center gap-1">
                      <span>⏳</span> กำลังอัปโหลด...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "videos", (url) => setEditingVideo({ ...editingVideo, thumbnailUrl: url }))}
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                {editingVideo.thumbnailUrl && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="w-16 h-10 relative rounded-lg overflow-hidden border border-zinc-300 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingVideo.thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-400 font-medium block">✓ ภาพปกพร้อมบันทึก</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block max-w-xs">{editingVideo.thumbnailUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">ลำดับการแสดง</label>
                <input
                  type="number"
                  min={1}
                  value={editingVideo.order}
                  onChange={(e) => setEditingVideo({ ...editingVideo, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                disabled={isUploading}
                onClick={async () => {
                  if (!editingVideo.title) {
                    alert("กรุณากรอกชื่อวิดีโอ");
                    return;
                  }
                  if (!editingVideo.videoUrl) {
                    alert("กรุณาใส่ลิงก์หรืออัปโหลดวิดีโอ");
                    return;
                  }

                  const row = {
                    title: editingVideo.title,
                    description: editingVideo.description,
                    video_type: editingVideo.videoType,
                    video_url: editingVideo.videoUrl,
                    thumbnail_url: editingVideo.thumbnailUrl,
                    sort_order: editingVideo.order,
                    is_active: editingVideo.isActive,
                  };

                  if (editingVideo.id) {
                    const { error } = await supabase.from("videos").update(row).eq("id", editingVideo.id);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  } else {
                    const { error } = await supabase.from("videos").insert([row]);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  }

                  await fetchData();
                  setIsVideoModalOpen(false);
                  showToast("บันทึกวิดีโอสำเร็จ! 🎬");
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <span>บันทึกวิดีโอ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT & E-BOOK MODAL */}
      {isDocumentModalOpen && editingDocument && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 text-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <span>{editingDocument.icon || "📚"}</span>
                  <span>{editingDocument.id ? "แก้ไขเอกสาร" : "เพิ่มเอกสารใหม่"}</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  อัปโหลดไฟล์ PDF ระบบจะตรวจจับขนาดไฟล์และจำนวนหน้าให้อัตโนมัติ
                </p>
              </div>
              <button
                onClick={() => setIsDocumentModalOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">หมวดหมู่เอกสาร *</label>
                  <select
                    value={editingDocument.category}
                    onChange={(e) => {
                      const cat = e.target.value as "academic" | "faculty_slides" | "camp_docs";
                      let defaultBadge = editingDocument.badge;
                      let defaultGradient = editingDocument.coverGradient;
                      if (cat === "academic") {
                        defaultBadge = "E-BOOK วิชาการ";
                        defaultGradient = "from-stone-900 via-amber-950 to-stone-950";
                      } else if (cat === "faculty_slides") {
                        defaultBadge = "SLIDES 16 คณะ";
                        defaultGradient = "from-blue-950 via-cyan-900 to-sky-950";
                      } else {
                        defaultBadge = "เอกสารค่าย";
                        defaultGradient = "from-purple-950 via-pink-950 to-purple-900";
                      }
                      setEditingDocument({
                        ...editingDocument,
                        category: cat,
                        badge: defaultBadge,
                        coverGradient: defaultGradient,
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                  >
                    <option value="academic">📖 เอกสารวิชาการ (Academic & Halqah)</option>
                    <option value="faculty_slides">🩺 เอกสารสไลด์นำเสนอแต่ละคณะ (16 Faculties)</option>
                    <option value="camp_docs">📋 เอกสารค่าย (Camp Docs & Handbook)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={editingDocument.badge}
                    onChange={(e) => setEditingDocument({ ...editingDocument, badge: e.target.value })}
                    placeholder="เช่น E-BOOK วิชาการ, SLIDES 16 คณะ"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">ชื่อเอกสาร / ชื่อหนังสือ *</label>
                <input
                  type="text"
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
                  placeholder="เช่น คู่มือค่าย Guidance for Dream 7th หรือ การทำงานศาสนา"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                />
              </div>

              {/* File / PDF Upload with Auto Inspection */}
              <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-900 flex items-center gap-1.5">
                    <span>📁</span>
                    <span>อัปโหลดไฟล์เอกสาร / PDF (Supabase Storage: gfd-media/documents)</span>
                  </label>
                  {isUploading && (
                    <span className="text-[11px] text-pink-600 font-medium animate-pulse flex items-center gap-1">
                      <span>⏳</span> {uploadProgressMsg || "กำลังวิเคราะห์และอัปโหลด..."}
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
                  onChange={handleDocumentPdfUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-zinc-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer disabled:opacity-50"
                />

                {isUploading && uploadProgressMsg && (
                  <div className="p-3 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 text-xs flex items-center gap-2.5 animate-pulse">
                    <span className="text-base animate-spin">🌀</span>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900">{uploadProgressMsg}</p>
                      <p className="text-[10px] text-purple-700 mt-0.5">ระบบกำลังประมวลผลให้พอดีกับหน้าจอเว็บ เพื่อให้อ่านบนมือถือได้ลื่นไหล</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">หรือระบุลิงก์ไฟล์ตรง (File URL / Google Drive / Supabase):</label>
                  <input
                    type="text"
                    value={editingDocument.fileUrl}
                    onChange={(e) => setEditingDocument({ ...editingDocument, fileUrl: e.target.value })}
                    placeholder="https://tsedkchdkghlkywlzqle.supabase.co/storage/v1/object/public/gfd-media/documents/..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-black font-mono text-[11px] focus:outline-none focus:border-purple-600"
                  />
                </div>

                {editingDocument.fileUrl && (
                  <div className="p-3 rounded-xl bg-white border border-purple-200 text-purple-900 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5 text-xs text-purple-900">
                        <span>✨</span>
                        <span>มีไฟล์ PDF เชื่อมต่อแล้ว ({editingDocument.totalPages} หน้า • {editingDocument.fileSize || "พร้อมเปิดอ่าน"})</span>
                      </span>
                      <a
                        href={editingDocument.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors font-semibold text-[11px] flex items-center gap-1 border border-purple-200"
                      >
                        <span>ทดสอบเปิดไฟล์จริง</span>
                        <span>↗</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      ระบบจะเรนเดอร์หน้าจริงจาก PDF นี้เป็นสมุด 2 หน้าคู่อัตโนมัติบนหน้าเว็บ
                    </p>
                  </div>
                )}
              </div>

              {/* Total Pages & File Size (Auto-detected, still editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                    <span>จำนวนหน้าทั้งหมด (Pages)</span>
                    <span className="text-[10px] text-purple-600 font-semibold">⚡ ตรวจจับอัตโนมัติ</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingDocument.totalPages}
                    onChange={(e) => setEditingDocument({ ...editingDocument, totalPages: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                    <span>ขนาดไฟล์ (File Size)</span>
                    <span className="text-[10px] text-purple-600 font-semibold">⚡ ตรวจจับอัตโนมัติ</span>
                  </label>
                  <input
                    type="text"
                    value={editingDocument.fileSize}
                    onChange={(e) => setEditingDocument({ ...editingDocument, fileSize: e.target.value })}
                    placeholder="เช่น 15.5 MB หรือ 850 KB"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">คำอธิบายเอกสาร / รายละเอียดสั้นๆ (Description)</label>
                <textarea
                  rows={2}
                  value={editingDocument.description}
                  onChange={(e) => setEditingDocument({ ...editingDocument, description: e.target.value })}
                  placeholder="คำอธิบายเนื้อหาโดยสรุปสำหรับแสดงผลบนการ์ด..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                />
              </div>

              {/* Author & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">ผู้จัดทำ / วิทยากร / สโมสร</label>
                  <input
                    type="text"
                    value={editingDocument.author}
                    onChange={(e) => setEditingDocument({ ...editingDocument, author: e.target.value })}
                    placeholder="เช่น ชมรมมุสลิม ม.อ. หาดใหญ่ หรือ ฝ่ายวิชาการ"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">ไอคอน Emoji</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingDocument.icon}
                      onChange={(e) => setEditingDocument({ ...editingDocument, icon: e.target.value })}
                      className="w-14 text-center px-2 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black text-base focus:outline-none focus:border-purple-600"
                    />
                    <div className="flex flex-wrap gap-1">
                      {["📖", "🕌", "🩺", "🎓", "📋", "📔"].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setEditingDocument({ ...editingDocument, icon: emo })}
                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs flex items-center justify-center cursor-pointer transition-colors"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">ลำดับการแสดง (Order)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingDocument.order}
                    onChange={(e) => setEditingDocument({ ...editingDocument, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xs"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingDocument.isActive}
                      onChange={(e) => setEditingDocument({ ...editingDocument, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                    />
                    <span className="font-semibold text-zinc-900">เปิดแสดงผลบนหน้าเว็บไซต์</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsDocumentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-xs sm:text-sm font-medium cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={async () => {
                  if (!editingDocument.title.trim()) {
                    alert("กรุณากรอกชื่อเอกสาร");
                    return;
                  }

                  const row = {
                    category: editingDocument.category,
                    title: editingDocument.title.trim(),
                    subtitle: editingDocument.subtitle?.trim() || "",
                    description: editingDocument.description.trim(),
                    file_url: editingDocument.fileUrl.trim(),
                    cover_url: editingDocument.coverUrl.trim(),
                    cover_gradient: editingDocument.coverGradient,
                    icon: editingDocument.icon || "📖",
                    badge: editingDocument.badge || "E-BOOK",
                    author: editingDocument.author || "ชมรมมุสลิม ม.อ. หาดใหญ่",
                    total_pages: editingDocument.totalPages || 1,
                    file_size: editingDocument.fileSize.trim(),
                    spreads: editingDocument.spreads || [],
                    sort_order: editingDocument.order || 1,
                    is_active: editingDocument.isActive,
                    updated_at: new Date().toISOString(),
                  };

                  if (editingDocument.id) {
                    const { error } = await supabase.from("documents").update(row).eq("id", editingDocument.id);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  } else {
                    const { error } = await supabase.from("documents").insert([row]);
                    if (error) {
                      showToast("บันทึกไม่สำเร็จ: " + error.message);
                      return;
                    }
                  }

                  await fetchData();
                  setIsDocumentModalOpen(false);
                  showToast("บันทึกเอกสารค่ายเรียบร้อยแล้ว! 📚");
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <span>บันทึกข้อมูลเอกสาร</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE & DEEP LINK MODAL */}
      {selectedQrDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedQrDoc(null)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in text-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl flex-shrink-0">{selectedQrDoc.icon || "📖"}</span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-black truncate">
                    {selectedQrDoc.title}
                  </h3>
                  <p className="text-xs text-purple-700 font-mono">
                    QR Code & ลิงก์ถาวรสำหรับพิมพ์ลงรูปเล่ม
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQrDoc(null)}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center text-sm transition-colors cursor-pointer flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* QR Code Graphic Box */}
            <div className="flex flex-col items-center justify-center p-5 bg-purple-50/50 rounded-2xl border border-purple-200 shadow-inner space-y-2.5">
              <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-purple-300">
                <img
                  src={"https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" + encodeURIComponent(getDocDirectLink(selectedQrDoc.id)) + "&margin=10"}
                  alt={"QR Code " + selectedQrDoc.title}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-zinc-600 text-center font-mono">
                เมื่อสแกนจะเปิดอ่าน <span className="text-purple-700 font-bold">&quot;{selectedQrDoc.title}&quot;</span> ทันที
              </p>
            </div>

            {/* Direct Link Input & Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700">
                  🔗 ลิงก์ตรงถาวร (Permanent Deep Link):
                </label>
                <span className="text-[10px] text-purple-600 font-mono font-bold">
                  ID: {selectedQrDoc.id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getDocDirectLink(selectedQrDoc.id)}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-purple-800 font-mono text-xs select-all focus:outline-none"
                />
                <button
                  onClick={() => handleCopyDirectLink(selectedQrDoc)}
                  className="px-3.5 py-2 rounded-xl bg-purple-primary hover:bg-purple-primary/80 text-white text-xs font-semibold shadow-md shadow-purple-primary/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  คัดลอก
                </button>
              </div>
            </div>

            {/* Change domain for production print option */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  🌐 โดเมนที่ใช้สร้าง QR (สำหรับสั่งพิมพ์ลงเล่มจริง):
                </label>
                <button
                  type="button"
                  onClick={() => updateCustomDomain("https://guidance.msspsuhatyai.org")}
                  className="text-[10px] text-purple-700 hover:text-black underline cursor-pointer font-medium"
                >
                  ⚡ รีเซ็ตเป็น guidance.msspsuhatyai.org
                </button>
              </div>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => updateCustomDomain(e.target.value)}
                placeholder="https://guidance.msspsuhatyai.org"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-black font-mono text-xs focus:outline-none focus:border-purple-600"
              />
              <p className="text-[10px] text-zinc-500">
                ระบบบันทึกโดเมนนี้ไว้ถาวรแล้ว แม้รีเฟรชหน้าเว็บก็จะไม่เปลี่ยนกลับเป็น localhost อีกต่อไป
              </p>
            </div>

            {/* Important Permanent Guarantee Notice */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs space-y-1 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-black text-[12px]">
                <span>💡</span>
                <span>มั่นใจได้เลย: สามารถพิมพ์ QR Code ลงในรูปเล่มได้ทันที!</span>
              </p>
              <p className="text-[11px] text-zinc-600">
                แม้ตอนนี้ไฟล์จะยังไม่สมบูรณ์ เมื่อทำหนังสือฉบับจริงเสร็จแล้ว เพียงกลับมาที่หน้า Admin นี้ แล้วกด <strong>&quot;แก้ไข&quot;</strong> เพื่ออัปโหลดไฟล์ PDF ฉบับสมบูรณ์แทนที่
                <strong> ลิงก์และ QR Code เดิมจะไม่เปลี่ยนแปลง</strong> และจะเปิดอ่านหนังสือฉบับใหม่ล่าสุดให้อัตโนมัติทันทีครับ
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
              <a
                href={"https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=" + encodeURIComponent(getDocDirectLink(selectedQrDoc.id)) + "&margin=15"}
                target="_blank"
                rel="noopener noreferrer"
                download={"QR-" + selectedQrDoc.title + ".png"}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span>
                <span>ดาวน์โหลดรูป QR Code ความละเอียดสูง</span>
              </a>

              <button
                onClick={() => setSelectedQrDoc(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 text-xs font-medium cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
