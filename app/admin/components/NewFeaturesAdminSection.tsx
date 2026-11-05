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
  const [feedbacks, setFeedbacks] = useState<CampFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

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
          is_delivered: ll.is_delivered || false,
          created_at: ll.created_at || new Date().toISOString(),
        });
      }
    });

    setLetters(combined);
    setLoadingLetters(false);
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
    if (activeSubTab === "feedbacks") fetchFeedbacks();
    if (activeSubTab === "letters") fetchLetters();
    if (activeSubTab === "staff") fetchStaff();
    if (activeSubTab === "meals") fetchMeals();
  }, [activeSubTab]);

  // Realtime subscription for feedbacks
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
          SUBTAB 1: FEEDBACKS (เสียงสะท้อนจากน้อง)
          ======================================================== */}
      {activeSubTab === "feedbacks" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                เสียงสะท้อนจากน้อง (Camper Feedbacks)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                จัดการข้อความโพสต์อิทที่น้องๆ หรือผู้เข้าชมเขียนแปะบนบอร์ด
              </p>
            </div>
            <button
              onClick={fetchFeedbacks}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors"
            >
              รีเฟรชข้อมูล
            </button>
          </div>

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

      {/* ========================================================
          SUBTAB 2: LETTERS (จดหมายถึงตัวฉันในอนาคต)
          ======================================================== */}
      {activeSubTab === "letters" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                จดหมาย Time Capsule (จดหมายถึงตัวฉันในอนาคต)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                กล่องเก็บฝันและข้อความที่น้องๆ ส่งถึงตัวเองในอนาคต
              </p>
            </div>
            <button
              onClick={fetchLetters}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors"
            >
              รีเฟรชข้อมูล
            </button>
          </div>

          {loadingLetters ? (
            <div className="py-12 text-center text-sm text-zinc-400">กำลังโหลดจดหมาย...</div>
          ) : letters.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">ยังไม่มีจดหมายถูกส่งเข้ามา</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                    <th className="p-3">วันที่ส่ง</th>
                    <th className="p-3">ชื่อน้องค่าย</th>
                    <th className="p-3">อีเมล</th>
                    <th className="p-3">โรงเรียน/คณะในฝัน</th>
                    <th className="p-3">กำหนดส่งกลับ</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {letters.map((ltr) => (
                    <tr key={ltr.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-mono text-zinc-400">
                        {new Date(ltr.created_at).toLocaleDateString("th-TH")}
                      </td>
                      <td className="p-3 font-bold text-zinc-900">{ltr.name}</td>
                      <td className="p-3 font-mono text-purple-700">{ltr.email}</td>
                      <td className="p-3 text-zinc-600">
                        {ltr.school} {ltr.dream_faculty ? `(${ltr.dream_faculty})` : ""}
                      </td>
                      <td className="p-3 text-zinc-700 font-medium">
                        <span className="px-2 py-1 rounded bg-purple-50 text-purple-800 text-[11px]">
                          {ltr.delivery_timing}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedLetter(ltr)}
                          className="px-3 py-1.5 rounded-xl bg-purple-deeper text-white text-[11px] font-bold hover:bg-purple-900 transition-colors"
                        >
                          อ่านจดหมาย
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Read Letter */}
          {selectedLetter && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="my-5 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <p className="text-xs sm:text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {selectedLetter.letter_content}
                  </p>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700"
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

