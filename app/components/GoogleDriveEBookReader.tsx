"use client";

import React, { useState, useEffect } from "react";

export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/id=([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}

export function getGoogleDrivePreviewUrl(url: string): string {
  const fileId = extractGoogleDriveId(url);
  if (!fileId) return url;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

interface GoogleDriveEBookReaderProps {
  fileUrl: string;
  title: string;
  subtitle?: string;
  author?: string;
  icon?: string;
  badge?: string;
  onClose: () => void;
  onDownload?: () => void;
}

export default function GoogleDriveEBookReader({
  fileUrl,
  title,
  subtitle,
  author,
  icon = "📖",
  badge = "E-BOOK",
  onClose,
  onDownload,
}: GoogleDriveEBookReaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const driveId = extractGoogleDriveId(fileUrl);
  const previewUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : fileUrl;

  const directViewUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/view`
    : fileUrl;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col animate-fade-in select-none">
      {/* ========================================================
          TOP NAVIGATION BAR (SLICK MODERN RESPONSIVE HEADER)
          ======================================================== */}
      <header className="flex-shrink-0 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-900/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between gap-3 text-white z-20">
        {/* Left: Icon, Badge, Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl shrink-0 p-1 rounded-xl bg-white/10">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
                {title}
              </span>
              {badge && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs">
                  {badge}
                </span>
              )}
            </div>
            {(subtitle || author) && (
              <p className="text-[11px] text-purple-200/80 truncate hidden sm:block">
                {subtitle ? `${subtitle} • ` : ""}
                {author || "ชมรมมุสลิม ม.อ. หาดใหญ่"}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Direct Google Drive Open Button */}
          <a
            href={directViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5"
            title="เปิดใน Google Drive แท็บใหม่"
          >
            <span>↗</span>
            <span className="hidden md:inline">เปิดใน Drive</span>
          </a>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            title="คัดลอกลิงก์หนังสือนี้"
          >
            <span>{copySuccess ? "✓" : "🔗"}</span>
            <span className="hidden md:inline">{copySuccess ? "คัดลอกแล้ว!" : "แชร์"}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
            title={isFullscreen ? "ออกจากโหมดเต็มจอ" : "โหมดเต็มจอ"}
          >
            <span>{isFullscreen ? "⤓" : "⤢"}</span>
            <span className="hidden lg:inline">{isFullscreen ? "ย่อจอ" : "เต็มจอ"}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
            title="ปิดหน้าต่างอ่านหนังสือ (ESC)"
          >
            <span>✕</span>
            <span className="hidden sm:inline">ปิด</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          EMBEDDED VIEWER CONTAINER (CLEAN FULLSCREEN IFRAME)
          ======================================================== */}
      <main className="flex-1 relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center p-1 sm:p-3">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3 z-10 bg-slate-900/80 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-white">กำลังโหลดหนังสือ E-Book จาก Google Drive...</p>
              <p className="text-xs text-purple-200/70">ประหยัดแบนด์วิธความเร็วสูง พร้อมแสดงผลในทันที</p>
            </div>
          </div>
        )}

        {/* Google Drive Preview Iframe */}
        <iframe
          src={previewUrl}
          title={title}
          allow="autoplay"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full rounded-xl sm:rounded-2xl border border-white/15 shadow-2xl bg-white"
        />
      </main>

      {/* Footer Info Pill for Campers */}
      <footer className="px-4 py-2 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200/60">
        <span className="truncate">
          📖 หนังสือ & เอกสารทางการ ค่าย Guidance for Dream ครั้งที่ 7
        </span>
        <span className="hidden sm:inline">
          💡 สามารถกดปุ่มซูม พลิกหน้า หรือพิมพ์เอกสารได้จากแถบเครื่องมือด้านบน
        </span>
      </footer>
    </div>
  );
}

