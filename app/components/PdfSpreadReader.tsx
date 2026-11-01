"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ================================================================
   PDF.JS DYNAMIC SCRIPT LOADER (ZERO DEPENDENCY / RUNS IN BROWSER)
   ================================================================ */

let pdfjsPromise: Promise<any> | null = null;

export function getPdfJs(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }
  if ((window as any).pdfjsLib) {
    return Promise.resolve((window as any).pdfjsLib);
  }

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
 * Downsamples high-resolution print PDFs (e.g. 158MB) down to 10-25MB for web streaming
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

    // Web-optimal scale: 1.25 gives ~150 DPI sharp reading with dramatic size reduction
    const renderScale = isLandscape ? 1.0 : 1.25;
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

    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.76);
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

        // Auto-detect natural aspect ratio from page viewport (Landscape slides vs Portrait books)
        const naturalVp = page.getViewport({ scale: 1 });
        const landscape = naturalVp.width > naturalVp.height;
        const ratio = naturalVp.width / naturalVp.height;
        if (!isCancelled) {
          setIsLandscape(landscape);
          setAspectRatio(ratio);
        }

        // Render at crisp high-DPI
        const renderScale = landscape ? 1.2 : 1.5;
        const viewport = page.getViewport({ scale: renderScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        // Check if page 1 has actual graphic content, or if it is a blank/empty placeholder page
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
          if (!pageIsBlank) {
            setHasPdfCover(true);
          }
          setLoaded(true);
        }
      } catch (err) {
        if (!isCancelled) {
          setHasError(true);
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
      style={{ aspectRatio: `${aspectRatio}` }}
      className={`relative overflow-hidden select-none transition-all duration-300 ${
        isLandscape
          ? "w-full max-w-full max-h-full rounded-xl shadow-[0_10px_25px_-5px_rgba(20,10,40,0.18),0_4px_10px_-4px_rgba(0,0,0,0.1)] border border-stone-200/90 bg-[#FAF8F5]"
          : "h-full max-h-full max-w-full rounded-r-xl rounded-l-sm shadow-[0_12px_24px_-4px_rgba(25,10,40,0.2),0_6px_12px_-4px_rgba(0,0,0,0.12),-2px_0_6px_rgba(0,0,0,0.1)] border-r-[4px] border-b-2 border-stone-200/90 bg-[#FAF8F5]"
      }`}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-opacity duration-500 ${
          loaded && hasPdfCover ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        }`}
      />

      {/* PORTRAIT BOOK DETAILS (Only shown for portrait documents) */}
      {!isLandscape && (
        <>
          {/* Book Spine Crease & Fold Highlight (Left Edge) */}
          <div className="absolute left-0 top-0 bottom-0 w-3.5 z-20 pointer-events-none bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
          <div className="absolute left-3 top-0 bottom-0 w-[1px] z-20 pointer-events-none bg-white/25 shadow-[1px_0_2px_rgba(0,0,0,0.2)]" />

          {/* Right Page Stack Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-2 z-20 pointer-events-none bg-gradient-to-l from-black/20 via-black/5 to-transparent border-r border-stone-300/60" />
        </>
      )}

      {/* LANDSCAPE SLIDE DETAILS (Only shown for 16:9 / presentation slides) */}
      {isLandscape && (
        <div className="absolute top-2 right-2 z-20 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] text-white font-mono flex items-center shadow">
          <span>สไลด์ 16:9</span>
        </div>
      )}

      {/* Surface Sheen & Lighting */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-black/10 via-transparent to-white/15" />

      {/* Fallback stylish gradient when loading, failed, OR if PDF page 1 is blank placeholder */}
      {(!loaded || hasError || !hasPdfCover) && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} flex flex-col justify-between p-4 text-white`}
        >
          {!isLandscape && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10" />
              <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/25 z-10" />
            </>
          )}

          <div className="flex items-center justify-between pl-2 relative z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm border border-white/25 text-white shadow-sm">
              {badge || (isLandscape ? "SLIDES" : "E-BOOK")}
            </span>
          </div>

          <div className="pl-2 my-auto relative z-10 text-center">
            <div className="w-8 h-0.5 bg-white/40 mx-auto mb-2" />
            <h4 className="text-sm sm:text-base font-extrabold leading-snug drop-shadow-md line-clamp-2">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[10px] text-white/85 line-clamp-2 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="w-8 h-0.5 bg-white/40 mx-auto mt-2" />
          </div>

          <div className="flex items-center justify-between pl-2 pt-1.5 border-t border-white/20 text-[9px] text-white/70 relative z-10 font-mono">
            <span>{isLandscape ? "Widescreen" : "A5 Edition"}</span>
            <span>{badge || "Guidance 7th"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   REALISTIC 2-PAGE SPREAD PDF VIEWER (FLIP REAL BOOK PAGES)
   ================================================================ */

interface PdfSpreadReaderProps {
  fileUrl: string;
  title: string;
  subtitle?: string;
  icon?: string;
  author?: string;
  totalPagesHint?: number;
  onClose: () => void;
  onDownload?: () => void;
}

export default function PdfSpreadReader({
  fileUrl,
  title,
  icon = "",
  totalPagesHint,
  onClose,
  onDownload,
}: PdfSpreadReaderProps) {
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [totalPages, setTotalPages] = useState<number>(totalPagesHint || 1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"spread" | "single" | "embed">("spread");
  const [userSelectedMode, setUserSelectedMode] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.4);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement>(null);

  const leftRenderTaskRef = useRef<any>(null);
  const rightRenderTaskRef = useRef<any>(null);
  const singleRenderTaskRef = useRef<any>(null);

  // Touch gesture coordinates
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  // Load PDF document on mount
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

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

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF load error:", err);
          setLoadError(
            err.message || "ไม่สามารถโหลดไฟล์ PDF ได้ กรุณาลองเปิดโหมด PDF Reader"
          );
          setIsLoading(false);
          // Auto fallback to native embed viewer if canvas load fails
          setViewMode("embed");
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  // Total spreads calculation
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));
  const currentSpreadIndex = Math.floor((currentPage - 1) / 2);
  const leftPageNum = currentSpreadIndex * 2 + 1;
  const rightPageNum = currentSpreadIndex * 2 + 2;

  // Navigation helpers
  const canGoPrev = viewMode === "single" ? currentPage > 1 : currentSpreadIndex > 0;
  const canGoNext =
    viewMode === "single"
      ? currentPage < totalPages
      : currentSpreadIndex < totalSpreads - 1;

  const goToPrev = useCallback(() => {
    if (viewMode === "single") {
      setCurrentPage((p) => Math.max(1, p - 1));
    } else {
      setCurrentPage((p) => {
        const currentIdx = Math.floor((p - 1) / 2);
        const prevSpreadLeft = (currentIdx - 1) * 2 + 1;
        return Math.max(1, prevSpreadLeft);
      });
    }
  }, [viewMode]);

  const goToNext = useCallback(() => {
    if (viewMode === "single") {
      setCurrentPage((p) => Math.min(totalPages, p + 1));
    } else {
      setCurrentPage((p) => {
        const currentIdx = Math.floor((p - 1) / 2);
        const nextSpreadLeft = (currentIdx + 1) * 2 + 1;
        return Math.min(totalPages, nextSpreadLeft);
      });
    }
  }, [viewMode, totalPages]);

  // Touch Swipe Handlers for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Minimum swipe distance of 35px, and must be predominantly horizontal
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Swiped left -> Next page
        goToNext();
      } else {
        // Swiped right -> Previous page
        goToPrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Render a specific page to a canvas
  const renderPageToCanvas = useCallback(
    async (
      pageNum: number,
      canvas: HTMLCanvasElement,
      renderTaskRef: React.MutableRefObject<any>
    ) => {
      if (!pdfDoc) return;

      // Cancel ongoing render task on this canvas if any and wait for it to release graphics context
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
          await renderTaskRef.current.promise.catch(() => {});
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      if (pageNum > totalPages) {
        // Blank page at the end of spread
        canvas.width = 400;
        canvas.height = 560;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#FAF8F5";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#A89F91";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("— สิ้นสุดเล่ม —", canvas.width / 2, canvas.height / 2);
        }
        return;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        // Slightly higher render scale on small screens to ensure ultra-sharp crisp text
        const deviceScaleBonus =
          typeof window !== "undefined" && window.innerWidth < 768 ? 1.5 : 1.3;
        const effectiveScale = scale * deviceScaleBonus;

        const viewport = page.getViewport({ scale: effectiveScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (
          err.name === "RenderingCancelledException" ||
          err.message?.includes("cancelled") ||
          err.message?.includes("Cannot use the same canvas")
        ) {
          // Normal expected event when user clicks or swipes quickly
          return;
        }
        console.warn(`Notice rendering page ${pageNum}:`, err);
      }
    },
    [pdfDoc, totalPages, scale]
  );

  // Render active pages whenever currentPage, scale, viewMode or pdfDoc updates
  useEffect(() => {
    if (!pdfDoc || isLoading) return;

    if (viewMode === "spread") {
      if (leftCanvasRef.current) {
        renderPageToCanvas(leftPageNum, leftCanvasRef.current, leftRenderTaskRef);
      }
      if (rightCanvasRef.current) {
        renderPageToCanvas(rightPageNum, rightCanvasRef.current, rightRenderTaskRef);
      }
    } else if (viewMode === "single") {
      if (singleCanvasRef.current) {
        renderPageToCanvas(currentPage, singleCanvasRef.current, singleRenderTaskRef);
      }
    }
  }, [
    pdfDoc,
    currentPage,
    scale,
    viewMode,
    isLoading,
    renderPageToCanvas,
    leftPageNum,
    rightPageNum,
  ]);

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

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-fade-in"
      onClick={onClose}
    >
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
              <span className="hidden xs:inline">หนังสือจริง</span> (PDF {totalPages} หน้า)
            </p>
          </div>
        </div>

        {/* View Mode & Page Status Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mode Switcher: Visible and usable on ALL screen sizes */}
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

          {/* Page Counter Badge */}
          <span className="bg-white/10 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono text-purple-light border border-white/10 whitespace-nowrap">
            {viewMode === "single"
              ? `${currentPage}/${totalPages}`
              : `${leftPageNum}-${Math.min(rightPageNum, totalPages)}/${totalPages}`}
          </span>

          {/* Zoom Controls (hidden on mobile, visible on desktop) */}
          {viewMode !== "embed" && (
            <div className="hidden md:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-white/10">
              <button
                onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                title="ย่อขนาด"
              >
                -
              </button>
              <span className="text-[10px] font-mono text-slate-300 w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                title="ขยายขนาด"
              >
                +
              </button>
            </div>
          )}

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
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 bg-black/60 rounded-3xl border border-white/15 backdrop-blur-md">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-white font-bold text-sm">กำลังดาวน์โหลดหนังสือจริง...</p>
            <p className="text-xs text-slate-400 mt-1">ไฟล์ PDF คุณภาพสูง กำลังเตรียมหน้าคู่</p>
          </div>
        )}
        )}

        {/* Load Error Notification */}
        {loadError && !isLoading && viewMode !== "embed" && (
          <div className="text-center p-6 bg-red-950/80 rounded-3xl border border-red-800/50 max-w-md text-white space-y-3">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-semibold">{loadError}</p>
            <button
              onClick={() => setViewMode("embed")}
              className="px-4 py-2 rounded-xl bg-purple-primary text-white text-xs font-bold"
            >
              สลับไปยังโหมด PDF Reader
            </button>
          </div>
        )}

        {/* MODE 1: REALISTIC 2-PAGE SPREAD (DOUBLE FACING PAGES) */}
        {!isLoading && viewMode === "spread" && (
          <div
            className="relative w-full h-full flex items-center justify-center px-1 sm:px-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Chevron Button */}
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all shadow-2xl cursor-pointer ${
                !canGoPrev
                  ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                  : "bg-black/70 hover:bg-black/90 text-white border border-white/25 active:scale-95"
              }`}
              aria-label="หน้าก่อนหน้า"
            >
              ‹
            </button>

            {/* Right Chevron Button */}
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all shadow-2xl cursor-pointer ${
                !canGoNext
                  ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                  : "bg-black/70 hover:bg-black/90 text-white border border-white/25 active:scale-95"
              }`}
              aria-label="หน้าถัดไป"
            >
              ›
            </button>

            {/* Realistic 2-Page Book Mockup */}
            <div className="relative w-full max-w-5xl h-[74vh] sm:h-[82vh] flex flex-row bg-[#FAF8F5] rounded-2xl sm:rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.85)] border-2 sm:border-4 border-[#3E2723] overflow-hidden">
              {/* Central Spine Fold / Crease Shadow */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 sm:w-8 z-30 pointer-events-none bg-gradient-to-r from-transparent via-black/20 to-transparent shadow-inner" />
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px z-30 pointer-events-none bg-black/30" />

              {/* LEFT PAGE */}
              <div className="w-1/2 h-full relative flex flex-col justify-between bg-[#FCFAF7] border-r border-[#E0D7C9] overflow-hidden p-1 sm:p-3 md:p-4">
                <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={leftCanvasRef}
                    className="max-w-full max-h-full object-contain shadow-md rounded"
                  />
                </div>
                <div className="text-center pt-1 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                  หน้าที่ {leftPageNum}
                </div>
              </div>

              {/* RIGHT PAGE */}
              <div className="w-1/2 h-full relative flex flex-col justify-between bg-[#FAF8F5] overflow-hidden p-1 sm:p-3 md:p-4">
                <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                  <canvas
                    ref={rightCanvasRef}
                    className="max-w-full max-h-full object-contain shadow-md rounded"
                  />
                </div>
                <div className="text-center pt-1 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                  {rightPageNum <= totalPages ? `หน้าที่ ${rightPageNum}` : "สิ้นสุด"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: SINGLE PAGE FLIP (ULTRA RESPONSIVE FOR MOBILE) */}
        {!isLoading && viewMode === "single" && (
          <div
            className="relative w-full h-full flex items-center justify-center px-1 sm:px-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Prev Button */}
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className={`absolute left-1 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all shadow-xl cursor-pointer ${
                !canGoPrev
                  ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                  : "bg-black/70 hover:bg-black/90 text-white border border-white/25 active:scale-95"
              }`}
              aria-label="หน้าก่อนหน้า"
            >
              ‹
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`absolute right-1 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all shadow-xl cursor-pointer ${
                !canGoNext
                  ? "opacity-20 cursor-not-allowed bg-black/20 text-white/40"
                  : "bg-black/70 hover:bg-black/90 text-white border border-white/25 active:scale-95"
              }`}
              aria-label="หน้าถัดไป"
            >
              ›
            </button>

            {/* Single Page Book Card */}
            <div className="w-full max-w-sm sm:max-w-md md:max-w-xl h-[74vh] sm:h-[80vh] bg-[#FAF8F5] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border-2 sm:border-4 border-[#3E2723] p-2 sm:p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                <canvas
                  ref={singleCanvasRef}
                  className="max-w-full max-h-full object-contain shadow-md rounded"
                />
              </div>
              <div className="text-center pt-1.5 sm:pt-2 text-[10px] sm:text-xs font-mono text-slate-600 flex items-center justify-between px-1">
                <span className="text-[10px] text-slate-400">ปัดเพื่อเปลี่ยนหน้า</span>
                <span className="font-bold text-slate-700">หน้า {currentPage} / {totalPages}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">PDF E-Book</span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: NATIVE EMBEDDED PDF VIEWER (IFRAME) */}
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
            disabled={!canGoPrev}
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
              const p = parseInt(e.target.value) || 1;
              setCurrentPage(p);
            }}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-accent"
          />

          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex-shrink-0">
            {totalPages}
          </span>

          <button
            onClick={goToNext}
            disabled={!canGoNext}
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

