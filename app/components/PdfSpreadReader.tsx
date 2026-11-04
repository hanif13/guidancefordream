"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ================================================================
   DYNAMIC SCRIPTS LOADER FOR PDF.JS AND PDF-LIB
   ================================================================ */

let pdfjsPromise: Promise<any> | null = null;
export function getPdfJs(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).pdfjsLib) return Promise.resolve((window as any).pdfjsLib);

  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(lib);
        } else {
          reject(new Error("PDF.js failed to initialize"));
        }
      };
      script.onerror = () => {
        pdfjsPromise = null;
        reject(new Error("Failed to load PDF.js from CDN"));
      };
      document.head.appendChild(script);
    });
  }
  return pdfjsPromise;
}

let pdfLibPromise: Promise<any> | null = null;
export async function getPdfLib(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).PDFLib) return (window as any).PDFLib;

  if (!pdfLibPromise) {
    pdfLibPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
      script.async = true;
      script.onload = () => {
        const lib = (window as any).PDFLib;
        if (lib) {
          resolve(lib);
        } else {
          reject(new Error("PDF-Lib failed to initialize"));
        }
      };
      script.onerror = () => {
        pdfLibPromise = null;
        reject(new Error("Failed to load PDF-Lib from CDN"));
      };
      document.head.appendChild(script);
    });
  }
  return pdfLibPromise;
}

/**
 * In-Browser PDF Compressor
 */
export async function compressPdfInBrowser(
  file: File,
  onProgress?: (info: { current: number; total: number; percent: number }) => void
): Promise<File> {
  const pdfjs = await getPdfJs();
  const PDFLib = await getPdfLib();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
    cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
    cMapPacked: true,
  });
  const sourceDoc = await loadingTask.promise;
  const numPages = sourceDoc.numPages;

  const newDoc = await PDFLib.PDFDocument.create();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await sourceDoc.getPage(pageNum);
    const naturalVp = page.getViewport({ scale: 1 });
    const isLandscape = naturalVp.width > naturalVp.height;

    const renderScale = isLandscape ? 1.2 : 1.5;
    const viewport = page.getViewport({ scale: renderScale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;
    }

    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const jpegImage = await newDoc.embedJpg(jpegDataUrl);

    const newPage = newDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });

    if (onProgress) {
      const percent = Math.round((pageNum / numPages) * 100);
      onProgress({ current: pageNum, total: numPages, percent });
    }
  }

  const compressedBytes = await newDoc.save();
  const cleanName = file.name.replace(/\.pdf$/i, "") + "_web.pdf";
  return new File([compressedBytes], cleanName, { type: "application/pdf" });
}

/* ================================================================
   PDF COVER THUMBNAIL COMPONENT (RENDERS PAGE 1 AS BOOK COVER)
   ================================================================ */

export function PdfCoverThumbnail({
  fileUrl = "",
  fallbackGradient,
  badge,
  icon,
  title,
  subtitle,
  category,
}: {
  fileUrl?: string;
  fallbackGradient: string;
  badge?: string;
  icon?: string;
  title: string;
  subtitle?: string;
  category?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasPdfCover, setHasPdfCover] = useState(false);
  const [isLandscape, setIsLandscape] = useState(category === "faculty_slides");
  const [aspectRatio, setAspectRatio] = useState<number>(
    category === "faculty_slides" ? 16 / 9 : 1 / 1.414
  );

  useEffect(() => {
    let isCancelled = false;

    const loadCover = async () => {
      if (!fileUrl) {
        setHasError(true);
        return;
      }
      try {
        const pdfjs = await getPdfJs();
        const loadingTask = pdfjs.getDocument({
          url: fileUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (isCancelled) return;

        const page = await doc.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const naturalVp = page.getViewport({ scale: 1 });
        const landscape = naturalVp.width > naturalVp.height;
        const ratio = naturalVp.width / naturalVp.height;
        if (!isCancelled) {
          setIsLandscape(landscape);
          setAspectRatio(ratio);
        }

        // Render at high-DPI for sharp thumbnail preview
        const renderScale = landscape ? 1.5 : 1.8;
        const viewport = page.getViewport({ scale: renderScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        let pageIsBlank = true;
        try {
          const sampleStep = Math.max(10, Math.floor(canvas.width / 12));
          let darkPixelCount = 0;
          for (let x = sampleStep; x < canvas.width; x += sampleStep) {
            for (let y = sampleStep; y < canvas.height; y += sampleStep) {
              const p = ctx.getImageData(x, y, 1, 1).data;
              if (p[3] > 10 && (p[0] < 240 || p[1] < 240 || p[2] < 240)) {
                darkPixelCount++;
                if (darkPixelCount > 3) {
                  pageIsBlank = false;
                  break;
                }
              }
            }
            if (!pageIsBlank) break;
          }
        } catch {
          pageIsBlank = false;
        }

        if (!isCancelled) {
          if (pageIsBlank) {
            setHasPdfCover(false);
          } else {
            setHasPdfCover(true);
          }
          setLoaded(true);
        }
      } catch {
        if (!isCancelled) {
          setHasError(true);
          setHasPdfCover(false);
          setLoaded(true);
        }
      }
    };

    loadCover();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] shadow-[0_8px_25px_rgba(0,0,0,0.35)] group-hover:shadow-[0_16px_35px_rgba(123,94,167,0.35)] border border-white/10 ${
        isLandscape ? "aspect-[16/10]" : "aspect-[1/1.414]"
      }`}
      style={{
        aspectRatio: `${aspectRatio}`,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-white/10 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none z-20" />

      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-opacity duration-500 ${
          loaded && hasPdfCover ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        }`}
      />

      {(!loaded || !hasPdfCover || hasError) && (
        <div
          className={`w-full h-full p-4 flex flex-col justify-between text-white ${fallbackGradient} ${
            loaded && hasPdfCover ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
              {badge || "เอกสาร"}
            </span>
          </div>

          <div className="my-auto py-2">
            <h4 className="font-bold text-sm sm:text-base line-clamp-2 leading-tight drop-shadow-md">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-white/80 line-clamp-2 mt-1 drop-shadow-sm">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/70 pt-2 border-t border-white/15">
            <span>{isLandscape ? "สไลด์ 16:9" : "A5"}</span>
            <span className="font-mono">GUIDANCE 7</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   WEB AUDIO API SYNTHESIZER: REALISTIC CRISP PAPER RUSTLE SOUND
   Pre-cached buffer for 0ms latency instantaneous playback
   ================================================================ */

let sharedAudioCtx: AudioContext | null = null;
let paperAudioBuffer: AudioBuffer | null = null;

function initPaperAudio() {
  if (typeof window === "undefined" || paperAudioBuffer) return;
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    sharedAudioCtx = new AudioCtx();

    // Pre-calculate 150ms crisp paper friction buffer once
    const sampleRate = sharedAudioCtx.sampleRate;
    const len = Math.floor(sampleRate * 0.16);
    paperAudioBuffer = sharedAudioCtx.createBuffer(1, len, sampleRate);
    const d = paperAudioBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const envelope = Math.sin((Math.PI * i) / len);
      d[i] = (Math.random() * 2 - 1) * envelope * 0.15;
    }
  } catch {}
}

function playPaperSound() {
  if (typeof window === "undefined") return;
  try {
    if (!sharedAudioCtx || !paperAudioBuffer) {
      initPaperAudio();
    }
    if (!sharedAudioCtx || !paperAudioBuffer) return;

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    const src = sharedAudioCtx.createBufferSource();
    src.buffer = paperAudioBuffer;

    const filter = sharedAudioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, sharedAudioCtx.currentTime);
    filter.Q.setValueAtTime(1.4, sharedAudioCtx.currentTime);

    const gain = sharedAudioCtx.createGain();
    gain.gain.setValueAtTime(0.2, sharedAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + 0.14);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    src.start();
  } catch {}
}

/* ================================================================
   HIGH-DPI 3D REALISTIC E-BOOK READER COMPONENT
   - 100% vector-sharp text (Native Retina DPI, lossless PNG)
   - Real 3D paper curl, bend, sheen & cast shadow
   - Interactive dog-ear peeled corners on bottom edges
   - Strict 1..totalPages bounds (no 10/9 bug)
   - Zero emojis, clean UI with CI theme
   ================================================================ */

interface PdfSpreadReaderProps {
  fileUrl: string;
  title: string;
  subtitle?: string;
  author?: string;
  icon?: string;
  totalPagesHint?: number;
  onClose: () => void;
  onDownload?: () => void;
}

export default function PdfSpreadReader({
  fileUrl,
  title,
  subtitle,
  author,
  icon = "",
  totalPagesHint,
  onClose,
  onDownload,
}: PdfSpreadReaderProps) {
  const [totalPages, setTotalPages] = useState<number>(totalPagesHint || 1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"spread" | "single" | "embed">("spread");
  const [userSelectedMode, setUserSelectedMode] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(0.707);

  // 3D Flip state: direction ("next" | "prev" | null), turning leaf
  const [flipState, setFlipState] = useState<{
    direction: "next" | "prev";
    fromSpread: number;
    toSpread: number;
  } | null>(null);

  // Auto-detect mobile screen and default to Single Page Mode (<768px)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!userSelectedMode) {
        setViewMode(isMobile ? "single" : "spread");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [userSelectedMode]);

  // Load PDF and render pages with ultra-high resolution (Retina 300+ DPI, lossless PNG)
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setLoadingProgress(0);

    const loadDocument = async () => {
      try {
        const pdfjs = await getPdfJs();
        const loadingTask = pdfjs.getDocument({
          url: fileUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        const numPages = doc.numPages;
        setTotalPages(numPages);

        const imgs: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (isCancelled) return;
          const page = await doc.getPage(i);
          const naturalVp = page.getViewport({ scale: 1 });
          const ratio = naturalVp.width / naturalVp.height;
          if (i === 1) {
            setPageAspectRatio(ratio);
          }

          // Ultra-high DPI target: 1600px width for 100% crisp typography on Retina/4K displays
          const targetWidth = Math.min(1800, Math.max(1400, naturalVp.width * 2.2));
          const renderScale = targetWidth / naturalVp.width;
          const viewport = page.getViewport({ scale: renderScale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext("2d", { alpha: false });
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({
              canvasContext: ctx,
              viewport,
              background: "#ffffff",
            }).promise;
          }

          // Use Blob URL for instant GPU texture upload without base64 decoding freezes
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
          });
          if (blob) {
            imgs.push(URL.createObjectURL(blob));
          } else {
            imgs.push(canvas.toDataURL("image/png"));
          }
          setLoadingProgress(Math.round((i / numPages) * 100));
        }

        if (isCancelled) return;
        setPageImages(imgs);
        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF load error:", err);
          setLoadError(
            err.message || "ไม่สามารถโหลดไฟล์ PDF ได้ กรุณาลองเปิดโหมด PDF Reader"
          );
          setIsLoading(false);
          setViewMode("embed");
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  // Spread calculation: 1-indexed
  // spread 1: [1, 2], spread 2: [3, 4], etc.
  const currentSpreadStart = Math.floor((currentPage - 1) / 2) * 2 + 1;
  const currentSpreadEnd = Math.min(currentSpreadStart + 1, totalPages);

  // Bounds
  const canGoPrev =
    viewMode === "single" ? currentPage > 1 : currentSpreadStart > 1;
  const canGoNext =
    viewMode === "single"
      ? currentPage < totalPages
      : currentSpreadStart + 2 <= totalPages;

  // Navigation handlers with realistic 3D paper flip
  const goToNext = useCallback(() => {
    if (flipState) return;

    if (viewMode === "single") {
      if (currentPage >= totalPages) return;
      const nextPage = currentPage + 1;
      setFlipState({
        direction: "next",
        fromSpread: currentPage,
        toSpread: nextPage,
      });
      if (soundEnabled) playPaperSound();

      setTimeout(() => {
        setCurrentPage(nextPage);
        setFlipState(null);
      }, 420);
    } else {
      if (currentSpreadStart + 2 > totalPages) return;
      const nextSpread = currentSpreadStart + 2;
      setFlipState({
        direction: "next",
        fromSpread: currentSpreadStart,
        toSpread: nextSpread,
      });
      if (soundEnabled) playPaperSound();

      setTimeout(() => {
        setCurrentPage(nextSpread);
        setFlipState(null);
      }, 420);
    }
  }, [flipState, viewMode, currentPage, totalPages, currentSpreadStart, soundEnabled]);

  const goToPrev = useCallback(() => {
    if (flipState) return;

    if (viewMode === "single") {
      if (currentPage <= 1) return;
      const prevPage = currentPage - 1;
      setFlipState({
        direction: "prev",
        fromSpread: currentPage,
        toSpread: prevPage,
      });
      if (soundEnabled) playPaperSound();

      setTimeout(() => {
        setCurrentPage(prevPage);
        setFlipState(null);
      }, 420);
    } else {
      if (currentSpreadStart <= 1) return;
      const prevSpread = Math.max(1, currentSpreadStart - 2);
      setFlipState({
        direction: "prev",
        fromSpread: currentSpreadStart,
        toSpread: prevSpread,
      });
      if (soundEnabled) playPaperSound();

      setTimeout(() => {
        setCurrentPage(prevSpread);
        setFlipState(null);
      }, 420);
    }
  }, [flipState, viewMode, currentPage, currentSpreadStart, soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  // Helper page images
  const leftPageImg = pageImages[currentSpreadStart - 1] || null;
  const rightPageImg =
    currentSpreadStart < totalPages ? pageImages[currentSpreadStart] || null : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* 3D Paper Turn CSS Animations & Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flipLeafNext {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(-90deg) scale(1.02);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }
        @keyframes flipLeafPrev {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg) scale(1.02);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        @keyframes singleFlipNext {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          45% {
            transform: rotateY(-80deg) scale(1.02);
            opacity: 0.9;
          }
          100% {
            transform: rotateY(-140deg);
            opacity: 0;
          }
        }
        @keyframes singleFlipPrev {
          0% {
            transform: rotateY(-140deg);
            opacity: 0;
          }
          55% {
            transform: rotateY(-80deg) scale(1.02);
            opacity: 0.9;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        @keyframes sheenNext {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0.5;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.3) 100%);
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes shadowNext {
          0% { opacity: 0.45; }
          40% { opacity: 0.25; }
          100% { opacity: 0; }
        }
      `}} />

      {/* ========================================================
          TOP HEADER BAR (RESPONSIVE)
          ======================================================== */}
      <header
        className="w-full max-w-6xl flex items-center justify-between text-white z-40 py-2 px-2.5 sm:px-4 bg-black/75 backdrop-blur-lg rounded-2xl border border-white/15 shadow-2xl pointer-events-auto gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h2 className="font-bold text-xs sm:text-sm truncate text-white max-w-[140px] xs:max-w-[200px] sm:max-w-md">
              {title}
            </h2>
            <p className="text-[9px] sm:text-[10px] text-emerald-400 flex items-center gap-1 font-mono truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="hidden xs:inline">หนังสือจริง 3D</span> (PDF {totalPages} หน้า)
            </p>
          </div>
        </div>

        {/* View Mode & Page Status Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mode Switcher: Single vs Spread vs PDF */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-white/15 text-[11px] sm:text-xs">
            <button
              onClick={() => {
                setUserSelectedMode(true);
                setViewMode("single");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                viewMode === "single"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="เปิดอ่านทีละหน้าเดี่ยว (แนะนำสำหรับมือถือ)"
            >
              <span>หน้าเดี่ยว</span>
            </button>
            <button
              onClick={() => {
                setUserSelectedMode(true);
                setViewMode("spread");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                viewMode === "spread"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="เปิดอ่านแบบสมุด 2 หน้าคู่เสมือนจริง"
            >
              <span>2 หน้าคู่</span>
            </button>
            <button
              onClick={() => {
                setUserSelectedMode(true);
                setViewMode("embed");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                viewMode === "embed"
                  ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="โหมด PDF Reader ดั้งเดิม"
            >
              <span>PDF</span>
            </button>
          </div>

          {/* Page Counter Badge: STRICTLY CLAMPED TO totalPages */}
          <span className="bg-white/10 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono text-purple-light border border-white/10 whitespace-nowrap">
            {viewMode === "single"
              ? `${Math.min(totalPages, Math.max(1, currentPage))}/${totalPages}`
              : currentSpreadStart === currentSpreadEnd
              ? `${currentSpreadStart}/${totalPages}`
              : `${currentSpreadStart}-${currentSpreadEnd}/${totalPages}`}
          </span>

          {/* Zoom Controls */}
          {viewMode !== "embed" && (
            <div className="hidden md:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-white/10">
              <button
                onClick={() => setScale((s) => Math.max(0.75, Number((s - 0.15).toFixed(2))))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                title="ย่อขนาด"
              >
                -
              </button>
              <span className="text-[10px] font-mono text-slate-300 w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(2.0, Number((s + 0.15).toFixed(2))))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                title="ขยายขนาด"
              >
                +
              </button>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold flex items-center gap-1 ${
              soundEnabled
                ? "bg-purple-primary/25 text-purple-light border-purple-primary/40 hover:bg-purple-primary/40"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
            title={soundEnabled ? "ปิดเสียงเปิดกระดาษ" : "เปิดเสียงเปิดกระดาษ"}
          >
            <span>{soundEnabled ? "เสียงกระดาษ" : "ปิดเสียง"}</span>
          </button>

          {/* Copy Direct Link Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
              copiedLink
                ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/50"
                : "bg-white/10 hover:bg-white/20 text-white border-white/15"
            }`}
            title="คัดลอกลิงก์ตรงสำหรับแชร์เล่มนี้"
          >
            <span>{copiedLink ? "คัดลอกแล้ว" : "แชร์"}</span>
          </button>

          {/* Download Original PDF Button */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-3 py-1.5 rounded-xl bg-purple-primary/30 hover:bg-purple-primary/50 text-purple-light border border-purple-primary/40 transition-colors cursor-pointer text-xs font-semibold"
              title="ดาวน์โหลดไฟล์ PDF ต้นฉบับ"
            >
              <span>ดาวน์โหลด</span>
            </button>
          )}

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 flex items-center justify-center text-sm font-bold transition-all border border-red-800/40 cursor-pointer shadow-lg hover:scale-105"
            aria-label="ปิดสมุด"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN VIEWER AREA
          ======================================================== */}
      <div
        className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-2 overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Spinner with Progress */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 bg-black/75 rounded-3xl border border-white/15 backdrop-blur-md max-w-sm w-full mx-4 text-center">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-bold text-sm sm:text-base mb-1">
              กำลังจัดเตรียมหน้าหนังสือจริง 3D...
            </p>
            <p className="text-xs text-slate-400 mb-3">
              จำลองกระดาษเสมือนจริง พลิกโค้งงอพร้อมเงา 3D
            </p>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-primary to-pink-accent h-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-purple-light mt-2">
              {loadingProgress}%
            </span>
          </div>
        )}

        {/* Load Error Notification */}
        {loadError && !isLoading && viewMode !== "embed" && (
          <div className="text-center p-6 bg-red-950/80 rounded-3xl border border-red-800/50 max-w-md text-white space-y-3">
            <p className="text-sm font-semibold">{loadError}</p>
            <button
              onClick={() => setViewMode("embed")}
              className="px-4 py-2 rounded-xl bg-purple-primary text-white text-xs font-bold"
            >
              สลับไปยังโหมด PDF Reader
            </button>
          </div>
        )}

        {/* REALISTIC 3D E-BOOK FLIPBOOK CONTAINER */}
        {!isLoading && viewMode !== "embed" && pageImages.length > 0 && (
          <div className="relative w-full h-full flex items-center justify-center px-1 sm:px-4">
            {/* Left Chevron Button */}
            <button
              onClick={goToPrev}
              disabled={!canGoPrev || !!flipState}
              className={`absolute left-1 sm:left-3 md:left-5 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all shadow-2xl cursor-pointer ${
                !canGoPrev || !!flipState
                  ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                  : "bg-black/75 hover:bg-black/95 text-white border border-white/25 active:scale-95 hover:scale-105"
              }`}
              aria-label="หน้าก่อนหน้า"
              title="หน้าก่อนหน้า (หรือกดลูกศรซ้าย / คลิกมุมกระดาษ)"
            >
              ‹
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={goToNext}
              disabled={!canGoNext || !!flipState}
              className={`absolute right-1 sm:right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all shadow-2xl cursor-pointer ${
                !canGoNext || !!flipState
                  ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                  : "bg-black/75 hover:bg-black/95 text-white border border-white/25 active:scale-95 hover:scale-105"
              }`}
              aria-label="หน้าถัดไป"
              title="หน้าถัดไป (หรือกดลูกศรขวา / คลิกมุมกระดาษ)"
            >
              ›
            </button>

            {/* Book Frame with Shadow and Spine Crease */}
            <div
              className="relative max-h-[76vh] sm:max-h-[82vh] flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              {/* ========================================================
                  MODE A: 2-PAGE SPREAD (DOUBLE PAGE BOOK)
                  ======================================================== */}
              {viewMode === "spread" && (
                <div
                  className="relative flex items-center justify-center rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_5px_20px_rgba(0,0,0,0.6)] bg-white border border-stone-300"
                  style={{
                    height: "76vh",
                    width: `calc(76vh * ${pageAspectRatio * 2})`,
                    maxWidth: "94vw",
                    maxHeight: "78vh",
                    aspectRatio: `${pageAspectRatio * 2}`,
                    perspective: "2400px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Book Spine Crease & Shadow in Center Gutter */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 pointer-events-none z-30 flex">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-black/15 to-black/35" />
                    <div className="w-1/2 h-full bg-gradient-to-l from-transparent via-black/15 to-black/35" />
                  </div>

                  {/* LEFT PAGE (BASE) */}
                  <div
                    className="relative w-1/2 h-full overflow-hidden bg-white rounded-l-2xl border-r border-stone-200 flex flex-col justify-between"
                    onClick={goToPrev}
                  >
                    {/* Page Image */}
                    {leftPageImg ? (
                      <img
                        src={
                          flipState?.direction === "prev"
                            ? pageImages[flipState.toSpread - 1] || leftPageImg
                            : leftPageImg
                        }
                        alt={`หน้า ${currentSpreadStart}`}
                        className="w-full h-full object-contain pointer-events-none select-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 font-sans text-sm bg-stone-50">
                        — ปกใน —
                      </div>
                    )}

                    {/* Left Bottom Page Number */}
                    <span className="absolute bottom-3 left-8 text-[11px] font-mono text-stone-400 pointer-events-none">
                      หน้าที่ {currentSpreadStart}
                    </span>

                    {/* Interactive Bottom-Left Dog-Ear Corner */}
                    {canGoPrev && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          goToPrev();
                        }}
                        className="group absolute bottom-0 left-0 w-9 h-9 sm:w-11 sm:h-11 cursor-pointer z-35 transition-all duration-300 hover:w-13 hover:h-13"
                        title="คลิกมุมเพื่อเปิดหน้าก่อนหน้า"
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-tr from-amber-100 via-stone-200 to-white shadow-[3px_-3px_8px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:brightness-105"
                          style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
                        />
                        <div
                          className="absolute inset-0 bg-black/20 pointer-events-none -z-10 blur-[2px] -translate-x-1 translate-y-1"
                          style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* RIGHT PAGE (BASE) */}
                  <div
                    className="relative w-1/2 h-full overflow-hidden bg-white rounded-r-2xl border-l border-stone-200 flex flex-col justify-between"
                    onClick={goToNext}
                  >
                    {/* Page Image */}
                    {flipState?.direction === "next" ? (
                      pageImages[flipState.toSpread] ? (
                        <img
                          src={pageImages[flipState.toSpread]}
                          alt={`หน้า ${flipState.toSpread + 1}`}
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 font-sans text-sm bg-stone-50">
                          — สิ้นสุดเล่ม —
                        </div>
                      )
                    ) : rightPageImg ? (
                      <img
                        src={rightPageImg}
                        alt={`หน้า ${currentSpreadStart + 1}`}
                        className="w-full h-full object-contain pointer-events-none select-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 font-sans text-sm bg-stone-50">
                        — สิ้นสุดเล่ม —
                      </div>
                    )}

                    {/* Right Bottom Page Number */}
                    {currentSpreadStart < totalPages && (
                      <span className="absolute bottom-3 right-8 text-[11px] font-mono text-stone-400 pointer-events-none">
                        หน้าที่ {currentSpreadStart + 1}
                      </span>
                    )}

                    {/* Cast Shadow on base right page while turning next */}
                    {flipState?.direction === "next" && (
                      <div
                        className="absolute inset-0 pointer-events-none z-25 bg-gradient-to-r from-black/45 via-black/15 to-transparent"
                        style={{
                          animation: "shadowNext 0.55s ease-out forwards",
                        }}
                      />
                    )}

                    {/* Interactive Bottom-Right Dog-Ear Corner */}
                    {canGoNext && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          goToNext();
                        }}
                        className="group absolute bottom-0 right-0 w-9 h-9 sm:w-11 sm:h-11 cursor-pointer z-35 transition-all duration-300 hover:w-13 hover:h-13"
                        title="คลิกมุมเพื่อเปิดหน้าถัดไป"
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-tl from-amber-100 via-stone-200 to-white shadow-[-3px_-3px_8px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:brightness-105"
                          style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                        />
                        <div
                          className="absolute inset-0 bg-black/20 pointer-events-none -z-10 blur-[2px] translate-x-1 translate-y-1"
                          style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                      TURNING LEAF FOR SPREAD (3D HARDWARE ACCELERATED)
                      ======================================================== */}
                  {flipState?.direction === "next" && (
                    <div
                      className="absolute top-0 right-0 w-1/2 h-full pointer-events-none z-40"
                      style={{
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                        animation: "flipLeafNext 0.42s cubic-bezier(0.2, 0, 0.25, 1) forwards",
                        willChange: "transform",
                      }}
                    >
                      {/* FRONT FACE: Page turning off (Right page being lifted) */}
                      <div
                        className="absolute inset-0 w-full h-full bg-white rounded-r-2xl overflow-hidden shadow-2xl"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        {rightPageImg && (
                          <img
                            src={rightPageImg}
                            alt=""
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        )}
                        {/* Dynamic sheen gradient sweep */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ animation: "sheenNext 0.42s ease-out forwards" }}
                        />
                      </div>

                      {/* BACK FACE: Incoming left page folding onto the left */}
                      <div
                        className="absolute inset-0 w-full h-full bg-white rounded-l-2xl overflow-hidden shadow-2xl"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        {pageImages[flipState.toSpread - 1] && (
                          <img
                            src={pageImages[flipState.toSpread - 1]}
                            alt=""
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {flipState?.direction === "prev" && (
                    <div
                      className="absolute top-0 left-0 w-1/2 h-full pointer-events-none z-40"
                      style={{
                        transformOrigin: "right center",
                        transformStyle: "preserve-3d",
                        animation: "flipLeafPrev 0.42s cubic-bezier(0.2, 0, 0.25, 1) forwards",
                        willChange: "transform",
                      }}
                    >
                      {/* FRONT FACE: Current left page lifting back */}
                      <div
                        className="absolute inset-0 w-full h-full bg-white rounded-l-2xl overflow-hidden shadow-2xl"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        {leftPageImg && (
                          <img
                            src={leftPageImg}
                            alt=""
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        )}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ animation: "sheenNext 0.42s ease-out forwards" }}
                        />
                      </div>

                      {/* BACK FACE: Incoming right page */}
                      <div
                        className="absolute inset-0 w-full h-full bg-white rounded-r-2xl overflow-hidden shadow-2xl"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(-180deg)",
                        }}
                      >
                        {pageImages[flipState.toSpread] && (
                          <img
                            src={pageImages[flipState.toSpread]}
                            alt=""
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  MODE B: SINGLE PAGE (PORTRAIT E-BOOK)
                  ======================================================== */}
              {viewMode === "single" && (
                <div
                  className="relative flex items-center justify-center rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85),0_5px_20px_rgba(0,0,0,0.6)] bg-white border border-stone-300 overflow-hidden"
                  style={{
                    height: "76vh",
                    width: `calc(76vh * ${pageAspectRatio})`,
                    maxWidth: "92vw",
                    maxHeight: "78vh",
                    aspectRatio: `${pageAspectRatio}`,
                    perspective: "2000px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Single Base Page Image:
                      When flipping Next: shows target page IMMEDIATELY underneath!
                      When flipping Prev: shows current page underneath!
                  */}
                  <img
                    src={
                      flipState?.direction === "next"
                        ? pageImages[flipState.toSpread - 1]
                        : pageImages[currentPage - 1]
                    }
                    alt={`หน้า ${flipState?.direction === "next" ? flipState.toSpread : currentPage}`}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />

                  {/* Bottom Page Number */}
                  <span className="absolute bottom-3 right-8 text-[11px] font-mono text-stone-400 pointer-events-none">
                    หน้า {flipState?.direction === "next" ? flipState.toSpread : currentPage} จาก {totalPages}
                  </span>

                  {/* Interactive Bottom-Right Dog-Ear to go next */}
                  {canGoNext && !flipState && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="group absolute bottom-0 right-0 w-9 h-9 sm:w-11 sm:h-11 cursor-pointer z-35 transition-all duration-300 hover:w-13 hover:h-13"
                      title="คลิกมุมเพื่อเปิดหน้าถัดไป"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-tl from-amber-100 via-stone-200 to-white shadow-[-3px_-3px_8px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:brightness-105"
                        style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                      />
                      <div
                        className="absolute inset-0 bg-black/20 pointer-events-none -z-10 blur-[2px] translate-x-1 translate-y-1"
                        style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                      />
                    </div>
                  )}

                  {/* Interactive Bottom-Left Dog-Ear to go prev */}
                  {canGoPrev && !flipState && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="group absolute bottom-0 left-0 w-9 h-9 sm:w-11 sm:h-11 cursor-pointer z-35 transition-all duration-300 hover:w-13 hover:h-13"
                      title="คลิกมุมเพื่อเปิดหน้าก่อนหน้า"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-tr from-amber-100 via-stone-200 to-white shadow-[3px_-3px_8px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:brightness-105"
                        style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
                      />
                      <div
                        className="absolute inset-0 bg-black/20 pointer-events-none -z-10 blur-[2px] -translate-x-1 translate-y-1"
                        style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
                      />
                    </div>
                  )}

                  {/* Turning leaf for Single mode NEXT */}
                  {flipState?.direction === "next" && (
                    <div
                      className="absolute inset-0 w-full h-full pointer-events-none z-40 bg-white shadow-2xl"
                      style={{
                        transformOrigin: "left center",
                        animation: "singleFlipNext 0.42s cubic-bezier(0.2, 0, 0.25, 1) forwards",
                        willChange: "transform, opacity",
                      }}
                    >
                      <img
                        src={pageImages[flipState.fromSpread - 1]}
                        alt=""
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ animation: "sheenNext 0.42s ease-out forwards" }}
                      />
                    </div>
                  )}

                  {/* Turning leaf for Single mode PREV */}
                  {flipState?.direction === "prev" && (
                    <div
                      className="absolute inset-0 w-full h-full pointer-events-none z-40 bg-white shadow-2xl"
                      style={{
                        transformOrigin: "left center",
                        animation: "singleFlipPrev 0.42s cubic-bezier(0.2, 0, 0.25, 1) forwards",
                        willChange: "transform, opacity",
                      }}
                    >
                      <img
                        src={pageImages[flipState.toSpread - 1]}
                        alt=""
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ animation: "sheenNext 0.42s ease-out forwards" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE C: NATIVE EMBEDDED PDF VIEWER (IFRAME) */}
        {viewMode === "embed" && (
          <div className="w-full h-[76vh] sm:h-[80vh] rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-2xl">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full border-0"
              title={title}
            />
          </div>
        )}
      </div>

      {/* ========================================================
          BOTTOM SCRUBBER & SPREAD NAVIGATION BAR (RESPONSIVE)
          ======================================================== */}
      {viewMode !== "embed" && (
        <footer
          className="w-full max-w-xl flex items-center gap-2 sm:gap-3 bg-black/75 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-white/15 text-white shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={goToPrev}
            disabled={!canGoPrev || !!flipState}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
            title="หน้าก่อนหน้า"
          >
            ◀
          </button>

          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex-shrink-0">
            1
          </span>

          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const p = Math.min(
                totalPages,
                Math.max(1, parseInt(e.target.value) || 1)
              );
              setCurrentPage(p);
            }}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-accent"
          />

          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex-shrink-0">
            {totalPages}
          </span>

          <button
            onClick={goToNext}
            disabled={!canGoNext || !!flipState}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
            title="หน้าถัดไป"
          >
            ▶
          </button>
        </footer>
      )}
    </div>
  );
}
