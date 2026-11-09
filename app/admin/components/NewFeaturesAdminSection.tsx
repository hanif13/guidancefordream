"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

interface CampFeedback {
  id: string;
  content: string;
  bg_color: string;
  text_color: string;
  rotate_deg: string;
  date_display: string;
  is_approved: boolean;
  created_at: string;
}

interface FutureLetter {
  id: string;
  name: string;
  email: string;
  school: string;
  dream_faculty: string;
  letter_content: string;
  delivery_timing: string;
  target_date?: string;
  delivered_at?: string;
  is_delivered: boolean;
  created_at: string;
}

interface CampStaffMember {
  id: string;
  gender: "male" | "female";
  name: string;
  nickname: string;
  year_level: string;
  faculty: string;
  student_id: string;
  phone: string;
  facebook: string;
  role: string;
  dept: string;
  sort_order: number;
  is_active: boolean;
}

interface CampMealAdmin {
  id: string;
  day_num: number;
  date_str: string;
  day_title: string;
  breakfast_menu: string;
  breakfast_time: string;
  breakfast_provided: boolean;
  lunch_menu: string;
  lunch_time: string;
  lunch_provided: boolean;
  dinner_menu: string;
  dinner_time: string;
  dinner_provided: boolean;
  snacks_menu: string;
  snacks_time: string;
}

export const STAFF_DEPARTMENTS = [
  "ฝ่ายบริหาร",
  "เหรัญญิก",
  "ฝ่ายกิจกรรม",
  "ฝ่ายทะเบียน",
  "ฝ่ายสื่อ",
  "ฝ่ายวิชาการ",
  "ฝ่ายพี่เลี้ยง",
  "ฝ่ายสถานที่",
  "ฝ่ายสวัสดิการ",
  "ฝ่ายพยาบาล",
];

export function normalizeStaffDept(rawDept?: string): string {
  if (!rawDept) return "ฝ่ายบริหารและเหรัญญิก";
  const trimmed = rawDept.trim();
  if (trimmed.includes("บริหาร") || trimmed.includes("เหรัญญิก") || trimmed.includes("อำนวยการ")) {
    return "ฝ่ายบริหารและเหรัญญิก";
  }
  if (trimmed.includes("กิจกรรม")) return "ฝ่ายกิจกรรม";
  if (trimmed.includes("ทะเบียน")) return "ฝ่ายทะเบียน";
  if (trimmed.includes("สื่อ")) return "ฝ่ายสื่อ";
  if (trimmed.includes("วิชาการ")) return "ฝ่ายวิชาการ";
  if (trimmed.includes("พี่เลี้ยง")) return "ฝ่ายพี่เลี้ยง";
  if (trimmed.includes("สถานที่") || trimmed.includes("คมนาคม")) return "ฝ่ายสถานที่";
  if (trimmed.includes("สวัสดิการ")) return "ฝ่ายสวัสดิการ";
  if (trimmed.includes("พยาบาล")) return "ฝ่ายพยาบาล";
  return trimmed;
}

export default function NewFeaturesAdminSection({
  activeSubTab,
  showToast,
}: {
  activeSubTab: "feedbacks" | "letters" | "staff" | "meals";
  showToast: (msg: string) => void;
}) {
  // Feedbacks state
  const [feedbackViewMode, setFeedbackViewMode] = useState<"quiz" | "notes">("quiz");
  const [feedbacks, setFeedbacks] = useState<CampFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Quiz Responses state
  const [quizResponses, setQuizResponses] = useState<any[]>([]);
  const [loadingQuizResponses, setLoadingQuizResponses] = useState(false);
  const [selectedQuizResponse, setSelectedQuizResponse] = useState<any | null>(null);

  // Future Letters state
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);

  // Staff state
  const [staffList, setStaffList] = useState<CampStaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CampStaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<CampStaffMember>>({
    gender: "male",
    name: "",
    nickname: "",
    year_level: "ชั้นปีที่ 1",
    faculty: "",
    student_id: "",
    phone: "",
    facebook: "",
    role: "",
    dept: "ฝ่ายบริหารและเหรัญญิก",
    sort_order: 1,
    is_active: true,
  });

  // Meals state
  const [meals, setMeals] = useState<CampMealAdmin[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [editingMeal, setEditingMeal] = useState<CampMealAdmin | null>(null);
  const [mealModalOpen, setMealModalOpen] = useState(false);

  // Mail Automation state
  const [isSendingDueMail, setIsSendingDueMail] = useState(false);
  const [isTestingMail, setIsTestingMail] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [sendingSingleId, setSendingSingleId] = useState<string | null>(null);

  // Fetch Feedbacks
  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    let dbFeedbacks: CampFeedback[] = [];
    try {
      const { data, error } = await supabase
        .from("camp_feedbacks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) dbFeedbacks = data;
    } catch (e) {
      console.warn("fetchFeedbacks error:", e);
    }

    // Merge with localStorage cached notes
    let localNotes: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_notes");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localNotes = parsed;
        }
      } catch {}
    }

    const combined: CampFeedback[] = [...dbFeedbacks];

    localNotes.forEach((ln: any) => {
      if (!combined.some((c) => c.id === ln.id || c.content.trim() === ln.content?.trim())) {
        combined.push({
          id: ln.id,
          content: ln.content,
          bg_color: ln.bgColor || ln.bg_color || "bg-amber-100 border-amber-300",
          text_color: ln.textColor || ln.text_color || "text-amber-950",
          rotate_deg: ln.rotateDeg || ln.rotate_deg || "rotate-0",
          date_display: ln.dateStr || ln.date_display || "",
          is_approved: ln.is_approved !== false,
          created_at: ln.created_at || new Date().toISOString(),
        });
      }
    });

    setFeedbacks(combined);
    setLoadingFeedbacks(false);
  };

  // Fetch Quiz Responses
  const fetchQuizResponses = async () => {
    setLoadingQuizResponses(true);
    let dbResponses: any[] = [];
    try {
      const { data, error } = await supabase
        .from("camp_quiz_responses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) dbResponses = data;
    } catch (e) {
      console.warn("fetchQuizResponses error:", e);
    }

    let localQuizzes: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_quiz_responses");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localQuizzes = parsed;
        }
      } catch {}
    }

    const combined = [...dbResponses];
    localQuizzes.forEach((lq: any) => {
      const isDuplicate = combined.some((c) => {
        // 1. Same ID
        if (lq.id && c.id === lq.id) return true;

        // 2. Exact same camper and core answers
        const sameCamper =
          (c.camper_name || "").trim() === (lq.camper_name || "").trim() &&
          (c.camper_nickname || "").trim() === (lq.camper_nickname || "").trim();

        const sameContent =
          (c.self_target_faculty || "").trim() === (lq.self_target_faculty || "").trim() &&
          (c.self_new_knowledge || "").trim() === (lq.self_new_knowledge || "").trim();

        if (sameCamper && sameContent) return true;

        // 3. Time difference less than 2 minutes for the same camper
        if (sameCamper && c.created_at && lq.created_at) {
          const timeDiff = Math.abs(new Date(c.created_at).getTime() - new Date(lq.created_at).getTime());
          if (!isNaN(timeDiff) && timeDiff < 120000) return true;
        }

        return false;
      });

      if (!isDuplicate) {
        combined.push({
          id: lq.id || `quiz-local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...lq,
        });
      }
    });

    setQuizResponses(combined);
    setLoadingQuizResponses(false);
  };

  const deleteQuizResponse = async (id: string) => {
    if (!confirm("ต้องการลบคำตอบควิซนี้หรือไม่?")) return;
    const target = quizResponses.find((q) => q.id === id);

    try {
      await supabase.from("camp_quiz_responses").delete().eq("id", id);
    } catch (e) {
      console.warn("deleteQuizResponse error:", e);
    }

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("gfd_quiz_responses") || "[]");
        const filtered = stored.filter((q: any) => {
          if (q.id === id) return false;
          if (
            target &&
            (q.camper_name || "").trim() === (target.camper_name || "").trim() &&
            (q.self_target_faculty || "").trim() === (target.self_target_faculty || "").trim()
          ) {
            return false;
          }
          return true;
        });
        localStorage.setItem("gfd_quiz_responses", JSON.stringify(filtered));
      } catch {}
    }

    setQuizResponses((prev) => prev.filter((q) => q.id !== id));
    if (selectedQuizResponse?.id === id) setSelectedQuizResponse(null);
    showToast("ลบคำตอบควิซเรียบร้อยแล้ว");
  };

  // Fetch Letters
  const fetchLetters = async () => {
    setLoadingLetters(true);
    let dbLetters: FutureLetter[] = [];
    try {
      const { data, error } = await supabase
        .from("future_letters")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) dbLetters = data;
    } catch (e) {
      console.warn("fetchLetters error:", e);
    }

    let localLetters: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_letters");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localLetters = parsed;
        }
      } catch {}
    }

    const combined: FutureLetter[] = [...dbLetters];
    localLetters.forEach((ll: any) => {
      if (!combined.some((c) => c.id === ll.id || (c.email === ll.email && c.letter_content === ll.letter_content))) {
        combined.push({
          id: ll.id || `letter-${Date.now()}`,
          name: ll.name || "",
          email: ll.email || "",
          school: ll.school || "",
          dream_faculty: ll.dream_faculty || "",
          letter_content: ll.letter_content || "",
          delivery_timing: ll.delivery_timing || "",
          target_date: ll.target_date,
          delivered_at: ll.delivered_at,
          is_delivered: ll.is_delivered || false,
          created_at: ll.created_at || new Date().toISOString(),
        });
      }
    });

    setLetters(combined);
    setLoadingLetters(false);
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) return;
    setIsTestingMail(true);
    try {
      const res = await fetch("/api/letters/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmailAddress.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งอีเมลทดสอบไม่สำเร็จ");
      showToast(data.message || "ส่งอีเมลทดสอบสำเร็จแล้ว!");
      setTestModalOpen(false);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsTestingMail(false);
    }
  };

  const handleSendSingleLetter = async (letter: FutureLetter) => {
    if (!confirm(`ยืนยันการส่งจดหมาย Time Capsule ฉบับนี้ไปยัง ${letter.email} ทันที?`)) return;
    setSendingSingleId(letter.id);
    try {
      const res = await fetch("/api/letters/send-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterId: letter.id, letterData: letter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งจดหมาย");
      showToast(data.message || "ส่งจดหมายสำเร็จแล้ว!");
      setLetters((prev) =>
        prev.map((l) => (l.id === letter.id ? { ...l, is_delivered: true } : l))
      );
      if (selectedLetter && selectedLetter.id === letter.id) {
        setSelectedLetter({ ...selectedLetter, is_delivered: true });
      }
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSendingSingleId(null);
    }
  };

  const handleSendDueLetters = async (forceAll: boolean = false) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const dueCount = letters.filter(
      (l) => !l.is_delivered && (forceAll || !l.target_date || l.target_date <= todayStr)
    ).length;

    if (dueCount === 0) {
      showToast("ไม่มีจดหมายที่ถึงกำหนดส่งในวันนี้");
      return;
    }

    if (
      !confirm(
        forceAll
          ? `ต้องการส่งจดหมายที่ยังไม่ได้ส่งทั้งหมด (${dueCount} ฉบับ) ทันทีใช่หรือไม่?`
          : `พบจดหมายที่ถึงกำหนดส่ง ${dueCount} ฉบับ ยืนยันการส่งตอนนี้เลยหรือไม่?`
      )
    )
      return;

    setIsSendingDueMail(true);
    try {
      const res = await fetch("/api/letters/send-due", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceAll, letters }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งจดหมาย");
      showToast(data.message || `ส่งจดหมายสำเร็จแล้ว ${data.sent} ฉบับ`);
      fetchLetters();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSendingDueMail(false);
    }
  };

  const deleteLetter = async (id: string) => {
    if (!confirm("ต้องการลบจดหมายฉบับนี้ใช่หรือไม่?")) return;
    setLetters((prev) => prev.filter((l) => l.id !== id));
    if (selectedLetter && selectedLetter.id === id) {
      setSelectedLetter(null);
    }

    // 1. Remove from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_letters");
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const updated = list.filter((l: any) => l.id !== id);
            localStorage.setItem("gfd_user_letters", JSON.stringify(updated));
          }
        }
      } catch {}
    }

    // 2. Delete from Supabase Database
    try {
      if (!id.startsWith("letter-")) {
        await supabase.from("future_letters").delete().eq("id", id);
      }
    } catch (e) {
      console.warn("Delete letter error:", e);
    }

    showToast("ลบจดหมายเรียบร้อยแล้ว");
  };

  const clearAllLetters = async () => {
    if (!confirm("ต้องการลบจดหมายทั้งหมดในระบบให้โล่งใช่หรือไม่?")) return;
    setLetters([]);
    setSelectedLetter(null);

    // 1. Clear localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("gfd_user_letters");
      } catch {}
    }

    // 2. Clear Supabase
    try {
      await supabase
        .from("future_letters")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Clear all letters error:", e);
    }

    showToast("เคลียร์จดหมายทั้งหมดเรียบร้อยแล้ว");
  };

  // Fetch Staff
  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const { data, error } = await supabase
        .from("camp_staff")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) setStaffList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Fetch Meals
  const fetchMeals = async () => {
    setLoadingMeals(true);
    try {
      const { data, error } = await supabase
        .from("camp_meals")
        .select("*")
        .order("day_num", { ascending: true });
      if (!error && data) setMeals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "feedbacks") {
      fetchFeedbacks();
      fetchQuizResponses();
    }
    if (activeSubTab === "letters") {
      fetchLetters();
      // Auto check and send due letters every 20s while admin is on letters tab
      const interval = setInterval(() => {
        fetch("/api/letters/send-due")
          .then((r) => r.json())
          .then((res) => {
            if (res.sent > 0) fetchLetters();
          })
          .catch(() => {});
      }, 20000);
      return () => clearInterval(interval);
    }
    if (activeSubTab === "staff") fetchStaff();
    if (activeSubTab === "meals") fetchMeals();
  }, [activeSubTab]);

  // Realtime subscription for feedbacks & quiz responses
  useEffect(() => {
    const channel = supabase
      .channel("admin_feedbacks_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "camp_feedbacks" },
        () => {
          fetchFeedbacks();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "camp_quiz_responses" },
        () => {
          fetchQuizResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Actions for Feedbacks
  const toggleFeedbackApproval = async (id: string, current: boolean) => {
    const updatedApproved = !current;
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_approved: updatedApproved } : f))
    );

    // Update localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_notes");
        if (stored) {
          let list = JSON.parse(stored);
          if (Array.isArray(list)) {
            list = list.map((n: any) =>
              n.id === id ? { ...n, is_approved: updatedApproved } : n
            );
            localStorage.setItem("gfd_user_notes", JSON.stringify(list));
          }
        }
      } catch {}
    }

    // Update Supabase
    try {
      await supabase
        .from("camp_feedbacks")
        .update({ is_approved: updatedApproved })
        .eq("id", id);
    } catch {}

    showToast(updatedApproved ? "แสดงข้อความบนบอร์ดแล้ว" : "ซ่อนข้อความเรียบร้อย");
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("ต้องการลบข้อความนี้ใช่หรือไม่?")) return;
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));

    // Remove from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gfd_user_notes");
        if (stored) {
          let list = JSON.parse(stored);
          if (Array.isArray(list)) {
            list = list.filter((n: any) => n.id !== id);
            localStorage.setItem("gfd_user_notes", JSON.stringify(list));
          }
        }
      } catch {}
    }

    // Remove from Supabase
    try {
      await supabase.from("camp_feedbacks").delete().eq("id", id);
    } catch {}

    showToast("ลบข้อความเรียบร้อย");
  };

  // Actions for Staff
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.role) return;

    const payload = {
      ...staffForm,
      dept: staffForm.dept ? staffForm.dept.trim() : "ฝ่ายบริหาร",
    };

    if (editingStaff) {
      const { error } = await supabase
        .from("camp_staff")
        .update(payload)
        .eq("id", editingStaff.id);
      if (!error) {
        showToast("แก้ไขข้อมูลทีมงานสำเร็จ");
        fetchStaff();
        setStaffModalOpen(false);
      }
    } else {
      const { error } = await supabase.from("camp_staff").insert([payload]);
      if (!error) {
        showToast("เพิ่มทีมงานสำเร็จ");
        fetchStaff();
        setStaffModalOpen(false);
      }
    }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm("ต้องการลบรายชื่อทีมงานคนนี้ใช่หรือไม่?")) return;
    const { error } = await supabase.from("camp_staff").delete().eq("id", id);
    if (!error) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      showToast("ลบรายชื่อสำเร็จ");
    }
  };

  // Actions for Meals
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    const { error } = await supabase
      .from("camp_meals")
      .update(editingMeal)
      .eq("id", editingMeal.id);
    if (!error) {
      showToast("บันทึกตารางอาหารสำเร็จ");
      fetchMeals();
      setMealModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          SUBTAB 1: FEEDBACKS & QUIZ (เสียงสะท้อนจากน้อง & ควิซ 3 มิติ)
          ======================================================== */}
      {activeSubTab === "feedbacks" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 space-y-6">
          {/* Header & Mode Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>เสียงสะท้อนจากน้อง & ผลควิซค่าย (Camper Feedbacks & Quiz)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                ติดตามผลการประเมินควิซ 3 มิติ (ตัวเอง • กิจกรรม • พี่ค่าย) และข้อความบนบอร์ด
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchFeedbacks();
                  fetchQuizResponses();
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                รีเฟรชข้อมูล
              </button>
            </div>
          </div>

          {/* Sub-toggle: Quiz Responses vs Sticky Notes */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 w-fit">
            <button
              type="button"
              onClick={() => setFeedbackViewMode("quiz")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                feedbackViewMode === "quiz"
                  ? "bg-black text-white shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <span>🎯</span>
              <span>ผลควิซสะท้อนคิด 3 มิติ ({quizResponses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackViewMode("notes")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                feedbackViewMode === "notes"
                  ? "bg-black text-white shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <span>📝</span>
              <span>บอร์ดกระดาษโพสต์อิท ({feedbacks.length})</span>
            </button>
          </div>

          {/* 1. QUIZ RESPONSES VIEW */}
          {feedbackViewMode === "quiz" && (
            <div className="space-y-6">
              {/* Analytics Summary Stats */}
              {quizResponses.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                    <span className="text-[11px] font-bold text-purple-800 block">ผู้ส่งควิซทั้งหมด</span>
                    <span className="text-2xl font-black text-purple-950 mt-1 block">
                      {quizResponses.length} <span className="text-xs font-normal text-purple-800">คน</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <span className="text-[11px] font-bold text-indigo-800 block">ความมุ่งมั่นตัวเองเฉลี่ย</span>
                    <span className="text-2xl font-black text-indigo-950 mt-1 block">
                      {(
                        quizResponses.reduce((sum, q) => sum + (Number(q.self_commitment_score) || 0), 0) /
                        quizResponses.length
                      ).toFixed(1)}{" "}
                      <span className="text-xs font-normal text-indigo-700">/ 10</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100">
                    <span className="text-[11px] font-bold text-pink-800 block">ความตั้งใจพี่ค่ายเฉลี่ย</span>
                    <span className="text-2xl font-black text-pink-950 mt-1 block">
                      {(
                        quizResponses.reduce((sum, q) => sum + (Number(q.mentor_dedication_score) || 0), 0) /
                        quizResponses.length
                      ).toFixed(1)}{" "}
                      <span className="text-xs font-normal text-pink-700">/ 10</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-800 block">จำพี่ค่ายเฉลี่ยใน 1 นาที</span>
                    <span className="text-2xl font-black text-emerald-950 mt-1 block">
                      {(
                        quizResponses.reduce(
                          (sum, q) =>
                            sum +
                            (Array.isArray(q.mentors_remembered)
                              ? q.mentors_remembered.length
                              : q.mentors_remembered_count || 0),
                          0
                        ) / quizResponses.length
                      ).toFixed(1)}{" "}
                      <span className="text-xs font-normal text-emerald-700">คน</span>
                    </span>
                  </div>
                </div>
              )}

              {loadingQuizResponses ? (
                <div className="py-12 text-center text-sm text-zinc-400">กำลังโหลดข้อมูลควิซ...</div>
              ) : quizResponses.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 space-y-2">
                  <div className="text-3xl">🎯</div>
                  <h4 className="text-sm font-bold text-zinc-700">ยังไม่มีข้อมูลคำตอบควิซ</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    เมื่อน้องค่ายทำควิซ 3 มิติจากหน้าเว็บ Memories ข้อมูลจะเข้ามาแสดงที่นี่แบบ Realtime ทันที
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizResponses.map((item, idx) => {
                    const mentorsCount = Array.isArray(item.mentors_remembered)
                      ? item.mentors_remembered.length
                      : item.mentors_remembered_count || 0;
                    const friendsCount = Array.isArray(item.friends_remembered)
                      ? item.friends_remembered.length
                      : item.friends_remembered_count || 0;

                    return (
                      <div
                        key={item.id || idx}
                        className="bg-zinc-50/70 hover:bg-white rounded-2xl border border-zinc-200 hover:border-purple-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Camper Title */}
                          <div className="flex items-start justify-between gap-2 border-b border-zinc-200/60 pb-3">
                            <div>
                              <h4 className="font-extrabold text-sm text-zinc-900">
                                {item.camper_name || "น้องค่าย GFD 7"}{" "}
                                {item.camper_nickname && (
                                  <span className="text-purple-700 font-bold">({item.camper_nickname})</span>
                                )}
                              </h4>
                              {item.camper_school && (
                                <p className="text-[11px] text-zinc-500 mt-0.5">{item.camper_school}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString("th-TH", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>

                          {/* Quick Dimension Snapshot */}
                          <div className="space-y-2 text-xs">
                            {/* D1: Target Faculty */}
                            {item.self_target_faculty && (
                              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-950 font-medium">
                                <span className="text-[10px] text-purple-700 font-bold block">
                                  🎯 คณะในฝัน:
                                </span>
                                <span className="font-extrabold">
                                  คณะ{item.self_target_faculty} {item.self_target_major ? `สาขา${item.self_target_major}` : ""}
                                </span>
                              </div>
                            )}

                            {/* Scores badge row */}
                            <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
                              <div className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700">
                                มุ่งมั่นตัวเอง: <span className="text-purple-700 font-black">{item.self_commitment_score || 0}/10</span>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700">
                                ความตั้งใจพี่: <span className="text-pink-600 font-black">{item.mentor_dedication_score || 0}/10</span>
                              </div>
                            </div>

                            {/* Challenge Memory summary */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200 text-[11px]">
                              <span>⏱️ จำพี่ค่าย (1 น.): <b className="text-indigo-700 font-black">{mentorsCount} คน</b></span>
                              <span>⏱️ จำเพื่อน (2 น.): <b className="text-rose-600 font-black">{friendsCount} คน</b></span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-zinc-200/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedQuizResponse(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-primary text-white text-xs font-bold shadow-xs hover:bg-purple-dark transition-colors cursor-pointer"
                          >
                            ดูคำตอบฉบับเต็ม →
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuizResponse(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                            title="ลบคำตอบนี้"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. STICKY NOTES VIEW */}
          {feedbackViewMode === "notes" && (
            <div>
              {loadingFeedbacks ? (
                <div className="py-12 text-center text-sm text-zinc-400">กำลังโหลดข้อความ...</div>
              ) : feedbacks.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-400">
                  ยังไม่มีข้อความบนบอร์ด หรือยังไม่ได้รัน SQL Migration
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className={`p-5 rounded-2xl border ${fb.bg_color} flex flex-col justify-between min-h-[170px] shadow-sm relative`}
                    >
                      <p className={`text-xs leading-relaxed font-medium ${fb.text_color}`}>
                        &ldquo;{fb.content}&rdquo;
                      </p>
                      <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-zinc-500">{fb.date_display}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleFeedbackApproval(fb.id, fb.is_approved)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              fb.is_approved
                                ? "bg-emerald-600 text-white"
                                : "bg-zinc-300 text-zinc-700"
                            }`}
                          >
                            {fb.is_approved ? "แสดงบนเว็บ" : "ซ่อนอยู่"}
                          </button>
                          <button
                            onClick={() => deleteFeedback(fb.id)}
                            className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Quiz Detail Modal */}
          {selectedQuizResponse && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-purple-200 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-black mb-1">
                      <span>🎯 คำตอบควิซสะท้อนคิด 3 มิติ</span>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900">
                      {selectedQuizResponse.camper_name}{" "}
                      {selectedQuizResponse.camper_nickname && `(${selectedQuizResponse.camper_nickname})`}
                    </h3>
                    <p className="text-xs text-zinc-500">{selectedQuizResponse.camper_school || "ไม่ระบุโรงเรียน"}</p>
                  </div>
                  <button
                    onClick={() => setSelectedQuizResponse(null)}
                    className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6 text-xs sm:text-sm">
                  {/* Dimension 1: Self */}
                  <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3">
                    <h4 className="font-extrabold text-purple-950 text-sm flex items-center gap-1.5">
                      <span>🌟 มิติที่ 1: มิติตัวเอง (Self Dimension)</span>
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-bold text-zinc-700 block">1. ความรู้ใหม่ที่ไม่เคยรู้มาก่อน:</span>
                        <p className="text-zinc-900 bg-white p-3 rounded-xl border border-purple-100 mt-1 whitespace-pre-line leading-relaxed">
                          {selectedQuizResponse.self_new_knowledge || "- ไม่ได้ระบุ -"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-700">2. คะแนนความมุ่งมั่นในการอยู่ค่าย:</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-primary text-white font-black">
                          {selectedQuizResponse.self_commitment_score || 0} / 10
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-zinc-700 block">3. แนวคิด/กระบวนการที่สามารถต่อยอดได้:</span>
                        <p className="text-zinc-900 bg-white p-3 rounded-xl border border-purple-100 mt-1 whitespace-pre-line leading-relaxed">
                          {selectedQuizResponse.self_mindset_takeaway || "- ไม่ได้ระบุ -"}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-zinc-700 block">4. คณะ & สาขาในฝัน และเหตุผล:</span>
                        <div className="bg-white p-3 rounded-xl border border-purple-100 mt-1 space-y-1">
                          <p className="font-bold text-purple-900">
                            คณะ: {selectedQuizResponse.self_target_faculty || "-"} | สาขา: {selectedQuizResponse.self_target_major || "-"}
                          </p>
                          <p className="text-zinc-700 text-xs">
                            <b>เพราะว่า:</b> {selectedQuizResponse.self_faculty_reason || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimension 2: Activities */}
                  <div className="p-5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-3">
                    <h4 className="font-extrabold text-pink-950 text-sm flex items-center gap-1.5">
                      <span>🎪 มิติที่ 2: มิติกิจกรรม (Activities Dimension)</span>
                    </h4>
                    {Array.isArray(selectedQuizResponse.activities_ratings) &&
                    selectedQuizResponse.activities_ratings.length > 0 ? (
                      <div className="space-y-2">
                        {selectedQuizResponse.activities_ratings.map((act: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-white border border-pink-100 space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-zinc-900">{act.name}</span>
                              <span className="text-amber-500 font-black">⭐ {act.score} / 5</span>
                            </div>
                            {act.reason && <p className="text-xs text-zinc-600">เหตุผล: {act.reason}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">ไม่มีข้อมูลการให้คะแนนกิจกรรม</p>
                    )}
                  </div>

                  {/* Dimension 3: Mentors & Friends */}
                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                    <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5">
                      <span>🤝 มิติที่ 3: พี่ค่ายและเพื่อน (Mentors & Friends Dimension)</span>
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-bold text-zinc-700 block">
                          1. รายชื่อพี่ค่ายที่จำได้ใน 1 นาที (
                          {Array.isArray(selectedQuizResponse.mentors_remembered)
                            ? selectedQuizResponse.mentors_remembered.length
                            : selectedQuizResponse.mentors_remembered_count || 0}{" "}
                          คน):
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {Array.isArray(selectedQuizResponse.mentors_remembered) &&
                          selectedQuizResponse.mentors_remembered.length > 0 ? (
                            selectedQuizResponse.mentors_remembered.map((m: string, i: number) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 text-xs font-bold"
                              >
                                👤 พี่{m}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-400 italic">ไม่มีรายชื่อพี่ค่ายที่บันทึก</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-zinc-700 block">
                          2. รายชื่อเพื่อนที่จำได้ใน 2 นาที (
                          {Array.isArray(selectedQuizResponse.friends_remembered)
                            ? selectedQuizResponse.friends_remembered.length
                            : selectedQuizResponse.friends_remembered_count || 0}{" "}
                          คน):
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {Array.isArray(selectedQuizResponse.friends_remembered) &&
                          selectedQuizResponse.friends_remembered.length > 0 ? (
                            selectedQuizResponse.friends_remembered.map((f: string, i: number) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-900 text-xs font-bold"
                              >
                                🤝 {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-400 italic">ไม่มีรายชื่อเพื่อนที่บันทึก</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-zinc-700 block">3. พี่ค่ายที่อยากมีคอนแทค/ให้ติดตาม:</span>
                        <p className="text-zinc-900 bg-white p-3 rounded-xl border border-indigo-100 mt-1 whitespace-pre-line leading-relaxed">
                          {selectedQuizResponse.contact_mentors || "- ไม่ได้ระบุ -"}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-zinc-700 block">4. รีวิวพี่ค่าย:</span>
                        <p className="text-zinc-900 bg-white p-3 rounded-xl border border-indigo-100 mt-1 whitespace-pre-line leading-relaxed">
                          {selectedQuizResponse.mentor_review || "- ไม่ได้ระบุ -"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-700">5. คะแนนความตั้งใจของพี่ค่าย:</span>
                        <span className="px-2 py-0.5 rounded-md bg-pink-600 text-white font-black">
                          {selectedQuizResponse.mentor_dedication_score || 0} / 10 คะแนน
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-zinc-100">
                  <button
                    onClick={() => setSelectedQuizResponse(null)}
                    className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: LETTERS (จดหมายถึงตัวฉันในอนาคต & Auto Mail)
          ======================================================== */}
      {activeSubTab === "letters" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 space-y-6">
          {/* Header & Global Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>จดหมาย Time Capsule (จดหมายถึงตัวฉันในอนาคต)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                  Gmail Auto Mail
                </span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                กล่องเก็บฝันและระบบส่งอีเมลอัตโนมัติถึงน้องตามวันเวลาที่กำหนด
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors cursor-pointer"
              >
                ✉️ ทดสอบระบบส่งอีเมล
              </button>

              <button
                type="button"
                onClick={() => handleSendDueLetters(false)}
                disabled={isSendingDueMail}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSendingDueMail ? "กำลังส่งจดหมาย..." : "🚀 สั่งส่งจดหมายที่ถึงกำหนดทันที"}
              </button>

              {letters.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllLetters}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
                >
                  🗑️ ล้างทั้งหมด
                </button>
              )}

              <button
                type="button"
                onClick={fetchLetters}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
              >
                รีเฟรชข้อมูล
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          {(() => {
            const todayStr = new Date().toISOString().split("T")[0];
            const total = letters.length;
            const delivered = letters.filter((l) => l.is_delivered).length;
            const dueNow = letters.filter(
              (l) => !l.is_delivered && (!l.target_date || l.target_date <= todayStr)
            ).length;
            const waiting = total - delivered;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 block mb-0.5 font-medium">จดหมายทั้งหมด:</span>
                  <span className="text-xl font-black text-zinc-900">{total}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">ฉบับในกล่องฝัน</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 block mb-0.5 font-medium">ถึงกำหนดส่งแล้ว:</span>
                  <span className="text-xl font-black text-amber-900">{dueNow}</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">พร้อมส่งวันนี้</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-purple-700 block mb-0.5 font-medium">รอส่งตามกำหนด:</span>
                  <span className="text-xl font-black text-purple-900">{waiting}</span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">ยังไม่ถึงเวลาส่ง</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block mb-0.5 font-medium">ส่งออกสำเร็จแล้ว:</span>
                  <span className="text-xl font-black text-emerald-900">{delivered}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">ส่งถึงมือน้องแล้ว</span>
                </div>
              </div>
            );
          })()}

          {loadingLetters ? (
            <div className="py-12 text-center text-sm text-zinc-400">กำลังโหลดจดหมาย...</div>
          ) : letters.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">ยังไม่มีจดหมายถูกส่งเข้ามา</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <th className="p-3">วันที่เขียน</th>
                    <th className="p-3">ชื่อน้องค่าย</th>
                    <th className="p-3">อีเมลปลายทาง</th>
                    <th className="p-3">โรงเรียน/คณะในฝัน</th>
                    <th className="p-3">กำหนดส่งกลับ</th>
                    <th className="p-3">สถานะส่งเมล</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {letters.map((ltr) => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const isDue =
                      !ltr.is_delivered && (!ltr.target_date || ltr.target_date <= todayStr);

                    return (
                      <tr key={ltr.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-3 font-mono text-zinc-400 whitespace-nowrap">
                          {new Date(ltr.created_at).toLocaleDateString("th-TH")}
                        </td>
                        <td className="p-3 font-bold text-zinc-900">{ltr.name}</td>
                        <td className="p-3 font-mono text-purple-700">{ltr.email}</td>
                        <td className="p-3 text-zinc-600">
                          {ltr.school} {ltr.dream_faculty ? `(${ltr.dream_faculty})` : ""}
                        </td>
                        <td className="p-3 text-zinc-700 font-medium">
                          <span className="px-2 py-1 rounded bg-purple-50 text-purple-800 text-[11px] block truncate max-w-[200px]">
                            {ltr.delivery_timing}
                          </span>
                          {ltr.target_date && (
                            <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                              📅 {ltr.target_date}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {ltr.is_delivered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                              <span>✓</span> ส่งแล้ว
                            </span>
                          ) : isDue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200 animate-pulse">
                              <span>!</span> ถึงกำหนดส่ง
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium text-[10px]">
                              <span>⏳</span> รอตามกำหนด
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedLetter(ltr)}
                              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 text-[11px] font-bold border border-purple-200 transition-colors cursor-pointer"
                            >
                              อ่าน
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendSingleLetter(ltr)}
                              disabled={sendingSingleId === ltr.id}
                              className="px-3 py-1.5 rounded-xl bg-purple-deeper text-white text-[11px] font-bold hover:bg-purple-900 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {sendingSingleId === ltr.id ? "กำลังส่ง..." : "ส่งทันที"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteLetter(ltr.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold border border-red-200 transition-colors cursor-pointer"
                              title="ลบจดหมายฉบับนี้"
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Read Letter */}
          {selectedLetter && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setSelectedLetter(null)}
            >
              <div
                className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h4 className="font-bold text-lg text-purple-deeper">
                      จดหมายจาก {selectedLetter.name}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      อีเมล: {selectedLetter.email} • ส่งกลับเมื่อ: {selectedLetter.delivery_timing}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="my-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-2">
                    เนื้อความในจดหมาย Time Capsule:
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {selectedLetter.letter_content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {selectedLetter.is_delivered ? (
                      <span className="text-xs text-emerald-600 font-bold">✓ ส่งอีเมลแล้ว</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">⏳ ยังไม่ได้ส่ง</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteLetter(selectedLetter.id)}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
                    >
                      ลบจดหมายนี้
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLetter(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer"
                    >
                      ปิดหน้าต่าง
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendSingleLetter(selectedLetter)}
                      disabled={sendingSingleId === selectedLetter.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {sendingSingleId === selectedLetter.id
                        ? "กำลังส่งอีเมล..."
                        : "ส่งอีเมลฉบับนี้ทันที"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Test Email */}
          {testModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setTestModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                  <h4 className="font-bold text-base text-purple-deeper">
                    ทดสอบการส่งอีเมลผ่าน Gmail SMTP
                  </h4>
                  <button
                    onClick={() => setTestModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleTestEmail} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1.5">
                      ใส่อีเมลปลายทางที่ต้องการรับเมลทดสอบ:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="เช่น your-email@gmail.com"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-primary/30"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      ระบบจะลองยิงข้อความทดสอบจาก Gmail ของค่ายไปยังอีเมลนี้ เพื่อยืนยันว่ารหัสผ่านแอปถูกต้อง
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setTestModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-bold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isTestingMail}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold shadow-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {isTestingMail ? "กำลังส่ง..." : "ส่งอีเมลทดสอบ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 3: STAFF (ทีมงานพี่เลี้ยง)
          ======================================================== */}
      {activeSubTab === "staff" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">ข้อมูลทีมงาน (Camp Staff Directory)</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                จัดการรายชื่อทีมงานมุสลีมีน (ชาย) และมุสลิมะฮ์ (หญิง)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStaff}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200"
              >
                รีเฟรช
              </button>
              <button
                onClick={() => {
                  setEditingStaff(null);
                  setStaffForm({
                    gender: "male",
                    name: "",
                    nickname: "",
                    year_level: "ชั้นปีที่ 1",
                    faculty: "",
                    student_id: "",
                    phone: "",
                    facebook: "",
                    role: "",
                    dept: "ฝ่ายบริหารและเหรัญญิก",
                    sort_order: staffList.length + 1,
                    is_active: true,
                  });
                  setStaffModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white text-xs font-bold shadow-md hover:brightness-105"
              >
                + เพิ่มทีมงาน
              </button>
            </div>
          </div>

          {loadingStaff ? (
            <div className="py-12 text-center text-sm text-zinc-400">กำลังโหลดรายชื่อ...</div>
          ) : staffList.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              ยังไม่มีรายชื่อในฐานข้อมูล หรือยังไม่ได้รัน SQL Migration
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <th className="p-3">เพศ</th>
                    <th className="p-3">ชื่อ-สกุล (ชื่อเล่น)</th>
                    <th className="p-3">ชั้นปี / คณะ</th>
                    <th className="p-3">ตำแหน่ง / ฝ่าย</th>
                    <th className="p-3">เบอร์โทร</th>
                    <th className="p-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.gender === "male"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {st.gender === "male" ? "มุสลีมีน" : "มุสลิมะฮ์"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-zinc-900">
                        {st.name} <span className="text-purple-700 font-normal">({st.nickname})</span>
                      </td>
                      <td className="p-3 text-zinc-600">
                        {st.year_level} • {st.faculty}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-zinc-800 block">{st.role}</span>
                        <span className="text-[10px] text-zinc-400 block">{st.dept}</span>
                      </td>
                      <td className="p-3 font-mono text-zinc-700">{st.phone || "-"}</td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setEditingStaff(st);
                            setStaffForm(st);
                            setStaffModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => deleteStaff(st.id)}
                          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Add/Edit Staff */}
          {staffModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setStaffModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                  <h4 className="font-bold text-base text-purple-deeper">
                    {editingStaff ? "แก้ไขข้อมูลทีมงาน" : "เพิ่มทีมงานใหม่"}
                  </h4>
                  <button
                    onClick={() => setStaffModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">สัดส่วน (เพศ):</label>
                      <select
                        value={staffForm.gender}
                        onChange={(e) =>
                          setStaffForm({ ...staffForm, gender: e.target.value as any })
                        }
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      >
                        <option value="male">มุสลีมีน (ชาย)</option>
                        <option value="female">มุสลิมะฮ์ (หญิง)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">ชื่อเล่น:</label>
                      <input
                        type="text"
                        required
                        value={staffForm.nickname}
                        onChange={(e) => setStaffForm({ ...staffForm, nickname: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">ชื่อ - สกุล:</label>
                    <input
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">ชั้นปี:</label>
                      <input
                        type="text"
                        value={staffForm.year_level}
                        onChange={(e) => setStaffForm({ ...staffForm, year_level: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">คณะ:</label>
                      <input
                        type="text"
                        value={staffForm.faculty}
                        onChange={(e) => setStaffForm({ ...staffForm, faculty: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">ตำแหน่งในค่าย:</label>
                      <input
                        type="text"
                        required
                        value={staffForm.role}
                        onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">ฝ่าย:</label>
                      <select
                        value={staffForm.dept || "ฝ่ายบริหาร"}
                        onChange={(e) => setStaffForm({ ...staffForm, dept: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200 font-medium"
                      >
                        {STAFF_DEPARTMENTS.map((deptName) => (
                          <option key={deptName} value={deptName}>
                            {deptName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">เบอร์โทรศัพท์:</label>
                      <input
                        type="text"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Facebook:</label>
                      <input
                        type="text"
                        value={staffForm.facebook}
                        onChange={(e) => setStaffForm({ ...staffForm, facebook: e.target.value })}
                        className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setStaffModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-bold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold"
                    >
                      บันทึกข้อมูล
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 4: MEALS (ตารางมื้ออาหาร)
          ======================================================== */}
      {activeSubTab === "meals" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">ตารางมื้ออาหารค่าย (Camp Meals Schedule)</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                แก้ไขเมนูอาหาร 4 วัน 5 คอลัมน์ (เช้า, เที่ยง, เย็น, ของว่าง)
              </p>
            </div>
            <button
              onClick={fetchMeals}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100"
            >
              รีเฟรชข้อมูล
            </button>
          </div>

          {loadingMeals ? (
            <div className="py-12 text-center text-sm text-zinc-400">กำลังโหลดตารางอาหาร...</div>
          ) : meals.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              ยังไม่มีข้อมูลในตารางอาหาร หรือยังไม่ได้รัน SQL Migration
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
                    <div>
                      <span className="text-xs font-bold text-pink-accent">วันที่ {m.day_num}</span>
                      <h4 className="font-bold text-sm text-zinc-900">
                        {m.date_str} • {m.day_title}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setEditingMeal(m);
                        setMealModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-deeper text-white text-xs font-bold hover:bg-purple-900"
                    >
                      แก้ไขเมนู
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-zinc-100">
                      <span className="font-bold text-zinc-500 block mb-1">มื้อเช้า:</span>
                      <p className="text-zinc-800">{m.breakfast_menu || "— ไม่มีจัดเลี้ยง —"}</p>
                      <span className="text-[10px] text-zinc-400 block mt-1">{m.breakfast_time}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-zinc-100">
                      <span className="font-bold text-zinc-500 block mb-1">มื้อเที่ยง:</span>
                      <p className="text-zinc-800">{m.lunch_menu || "— ไม่มีจัดเลี้ยง —"}</p>
                      <span className="text-[10px] text-zinc-400 block mt-1">{m.lunch_time}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-zinc-100">
                      <span className="font-bold text-zinc-500 block mb-1">มื้อเย็น:</span>
                      <p className="text-zinc-800">{m.dinner_menu || "— ไม่มีจัดเลี้ยง —"}</p>
                      <span className="text-[10px] text-zinc-400 block mt-1">{m.dinner_time}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-zinc-100">
                      <span className="font-bold text-zinc-500 block mb-1">ของว่าง:</span>
                      <p className="text-zinc-800">{m.snacks_menu || "—"}</p>
                      <span className="text-[10px] text-zinc-400 block mt-1">{m.snacks_time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Edit Meal */}
          {mealModalOpen && editingMeal && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setMealModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                  <h4 className="font-bold text-base text-purple-deeper">
                    แก้ไขเมนูอาหาร วันที่ {editingMeal.day_num} ({editingMeal.date_str})
                  </h4>
                  <button
                    onClick={() => setMealModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveMeal} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">เมนูมื้อเช้า:</label>
                    <textarea
                      rows={2}
                      value={editingMeal.breakfast_menu}
                      onChange={(e) =>
                        setEditingMeal({ ...editingMeal, breakfast_menu: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">เมนูมื้อเที่ยง:</label>
                    <textarea
                      rows={2}
                      value={editingMeal.lunch_menu}
                      onChange={(e) =>
                        setEditingMeal({ ...editingMeal, lunch_menu: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">เมนูมื้อเย็น:</label>
                    <textarea
                      rows={2}
                      value={editingMeal.dinner_menu}
                      onChange={(e) =>
                        setEditingMeal({ ...editingMeal, dinner_menu: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">ของว่าง & เครื่องดื่ม:</label>
                    <textarea
                      rows={2}
                      value={editingMeal.snacks_menu}
                      onChange={(e) =>
                        setEditingMeal({ ...editingMeal, snacks_menu: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMealModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-bold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold"
                    >
                      บันทึกเมนูอาหาร
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

