"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";

export interface ActivityRatingItem {
  id: string;
  name: string;
  score: number;
  reason?: string;
}

export interface QuizResponsePayload {
  id?: string;
  camper_name: string;
  camper_nickname: string;
  camper_school: string;
  // Dimension 1: Self
  self_new_knowledge: string;
  self_commitment_score: number;
  self_mindset_takeaway: string;
  self_target_faculty: string;
  self_target_major: string;
  self_faculty_reason: string;
  // Dimension 2: Activities
  activities_ratings: ActivityRatingItem[];
  // Dimension 3: Mentors & Friends
  mentors_remembered: string[];
  mentors_remembered_count: number;
  friends_remembered: string[];
  friends_remembered_count: number;
  contact_mentors: string;
  mentor_review: string;
  mentor_dedication_score: number;
  created_at?: string;
}

const DEFAULT_ACTIVITIES: { id: string; name: string }[] = [
  { id: "act-1", name: "EP 1: Beginning of Us — จุดเริ่มต้นของเรา" },
  { id: "act-2", name: "หัลเกาะฮฺ \"เริ่มต้นด้วยเจตนาที่บริสุทธิ์\"" },
  { id: "act-3", name: "EP 2: Closer Than Ever — ผูกพันกว่าที่คิด" },
  { id: "act-4", name: "กิจกรรม \"TCAS Roadmap Session\"" },
  { id: "act-5", name: "หัลเกาะฮฺ \"พี่ ให้ น้อง วงล้อมเปลี่ยนชีวิต\"" },
  { id: "act-6", name: "กิจกรรม \"รู้จักตัวเอง ก่อนเลือกอนาคต\"" },
  { id: "act-7", name: "EP 3: Light of Guidance — บทเรียนชีวิต เข็มทิศสู่อนาคต" },
  { id: "act-8", name: "เสวนา \"เส้นทางนักศึกษาสู่ชีวิตจริงในสังคม\"" },
  { id: "act-9", name: "ฐานที่ 1 คณะแพทยศาสตร์" },
  { id: "act-10", name: "ฐานที่ 2 คณะเภสัชศาสตร์" },
  { id: "act-11", name: "ฐานที่ 3 คณะทันตแพทยศาสตร์" },
  { id: "act-12", name: "ฐานที่ 4 คณะพยาบาลศาสตร์" },
  { id: "act-13", name: "ฐานที่ 5 คณะการแพทย์แผนไทย" },
  { id: "act-14", name: "ฐานที่ 6 คณะสัตวแพทยศาสตร์" },
  { id: "act-15", name: "ฐานที่ 7 คณะเทคนิคการแพทย์" },
  { id: "act-16", name: "ฐานที่ 11 คณะทรัพยากรธรรมชาติ" },
  { id: "act-17", name: "ฐานที่ 12 คณะนิติศาสตร์" },
  { id: "act-18", name: "ฐานที่ 13 คณะวิทยาการจัดการ + คณะเศรษฐศาสตร์" },
  { id: "act-19", name: "ฐานที่ 14 ศิลปศาสตร์ + วิทยาลัยนานาชาติ" },
  { id: "act-20", name: "ฐานที่ 8 วิศวกรรมศาสตร์" },
  { id: "act-21", name: "ฐานที่ 9 วิทยาศาสตร์" },
  { id: "act-22", name: "ฐานที่ 10 อุตสาหกรรมเกษตร" },
];

export default function CampQuizSection({
  onBackToVoices,
}: {
  onBackToVoices?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Camper Info
  const [camperName, setCamperName] = useState("");
  const [camperNickname, setCamperNickname] = useState("");
  const [camperSchool, setCamperSchool] = useState("");

  // Dimension 1: มิติตัวเอง
  const [selfNewKnowledge, setSelfNewKnowledge] = useState("");
  const [selfCommitmentScore, setSelfCommitmentScore] = useState<number>(10);
  const [selfMindsetTakeaway, setSelfMindsetTakeaway] = useState("");
  const [selfTargetFaculty, setSelfTargetFaculty] = useState("");
  const [selfTargetMajor, setSelfTargetMajor] = useState("");
  const [selfFacultyReason, setSelfFacultyReason] = useState("");

  // Dimension 2: มิติกิจกรรม
  const [activitiesList, setActivitiesList] = useState<ActivityRatingItem[]>(
    DEFAULT_ACTIVITIES.map((act) => ({
      id: act.id,
      name: act.name,
      score: 0,
    }))
  );

  // Dimension 3: มิติพี่ค่ายและเพื่อน
  const [mentorsRemembered, setMentorsRemembered] = useState<string[]>([]);
  const [friendsRemembered, setFriendsRemembered] = useState<string[]>([]);
  const [contactMentors, setContactMentors] = useState("");
  const [mentorReview, setMentorReview] = useState("");
  const [mentorDedicationScore, setMentorDedicationScore] = useState<number>(10);

  // Timed Modal States
  const [activeTimedModal, setActiveTimedModal] = useState<"mentors" | "friends" | null>(null);
  const [timedModalSecondsLeft, setTimedModalSecondsLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timedInputText, setTimedInputText] = useState("");
  const [tempTimedList, setTempTimedList] = useState<string[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timedInputRef = useRef<HTMLInputElement | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer Tick Handler
  useEffect(() => {
    if (isTimerRunning && timedModalSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimedModalSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timedModalSecondsLeft]);

  // Open Timed Challenge Modal
  const handleOpenTimedChallenge = (type: "mentors" | "friends") => {
    const totalSec = type === "mentors" ? 60 : 120; // 1 min for mentors, 2 mins for friends
    setActiveTimedModal(type);
    setTimedModalSecondsLeft(totalSec);
    setTimedInputText("");
    setIsTimerRunning(false);
    setTempTimedList(type === "mentors" ? [...mentorsRemembered] : [...friendsRemembered]);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setTimeout(() => {
      if (timedInputRef.current) timedInputRef.current.focus();
    }, 100);
  };

  const handleAddTimedItem = () => {
    const trimmed = timedInputText.trim();
    if (!trimmed) return;
    if (!tempTimedList.includes(trimmed)) {
      setTempTimedList((prev) => [...prev, trimmed]);
    }
    setTimedInputText("");
  };

  const handleRemoveTimedItem = (index: number) => {
    setTempTimedList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAndCloseTimedModal = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerRunning(false);
    if (activeTimedModal === "mentors") {
      setMentorsRemembered(tempTimedList);
    } else if (activeTimedModal === "friends") {
      setFriendsRemembered(tempTimedList);
    }
    setActiveTimedModal(null);
  };

  // Activity rating helpers
  const handleUpdateActivityScore = (id: string, score: number) => {
    setActivitiesList((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, score: act.score === score ? 0 : score } : act
      )
    );
  };

  // Submission
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const submissionId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const submissionTime = new Date().toISOString();

    const payload: QuizResponsePayload = {
      id: submissionId,
      camper_name: camperName.trim() || "น้องค่าย GFD 7",
      camper_nickname: camperNickname.trim(),
      camper_school: camperSchool.trim(),
      // Dimension 1
      self_new_knowledge: selfNewKnowledge.trim(),
      self_commitment_score: selfCommitmentScore,
      self_mindset_takeaway: selfMindsetTakeaway.trim(),
      self_target_faculty: selfTargetFaculty.trim(),
      self_target_major: selfTargetMajor.trim(),
      self_faculty_reason: selfFacultyReason.trim(),
      // Dimension 2
      activities_ratings: activitiesList,
      // Dimension 3
      mentors_remembered: mentorsRemembered,
      mentors_remembered_count: mentorsRemembered.length,
      friends_remembered: friendsRemembered,
      friends_remembered_count: friendsRemembered.length,
      contact_mentors: contactMentors.trim(),
      mentor_review: mentorReview.trim(),
      mentor_dedication_score: mentorDedicationScore,
      created_at: submissionTime,
    };

    // 1. Always backup to localStorage
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("gfd_quiz_responses") || "[]");
        existing.push(payload);
        localStorage.setItem("gfd_quiz_responses", JSON.stringify(existing));
        localStorage.setItem("gfd_my_quiz_result", JSON.stringify(payload));
      } catch (e) {
        console.warn("localStorage quiz backup failed:", e);
      }
    }

    // 2. Insert to Supabase table `camp_quiz_responses`
    try {
      const { error } = await supabase.from("camp_quiz_responses").insert([
        {
          id: submissionId,
          camper_name: payload.camper_name,
          camper_nickname: payload.camper_nickname,
          camper_school: payload.camper_school,
          self_new_knowledge: payload.self_new_knowledge,
          self_commitment_score: payload.self_commitment_score,
          self_mindset_takeaway: payload.self_mindset_takeaway,
          self_target_faculty: payload.self_target_faculty,
          self_target_major: payload.self_target_major,
          self_faculty_reason: payload.self_faculty_reason,
          activities_ratings: payload.activities_ratings,
          mentors_remembered: payload.mentors_remembered,
          mentors_remembered_count: payload.mentors_remembered_count,
          friends_remembered: payload.friends_remembered,
          friends_remembered_count: payload.friends_remembered_count,
          contact_mentors: payload.contact_mentors,
          mentor_review: payload.mentor_review,
          mentor_dedication_score: payload.mentor_dedication_score,
          created_at: submissionTime,
        },
      ]);

      if (error) {
        console.warn("Supabase insert warning (saved locally):", error.message);
      }
    } catch (e: any) {
      console.warn("Supabase insert catch (saved locally):", e);
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setCurrentStep(4); // Show completion screen
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quiz Header Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white p-6 sm:p-10 shadow-xl border border-purple-primary/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-pink-300">
              <span>🎯</span>
              <span>Camp Quiz & 3-Dimension Reflection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              ควิซถามตอบ & บันทึกเสียงสะท้อนใจค่าย 3 มิติ
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              ร่วมทบทวนประสบการณ์ ประเมินความรู้สึก และเก็บเกี่ยวคุณค่าที่ได้จากค่าย Guidance for Dream ครั้งที่ 7
              ผ่าน 3 มิติสำคัญ: ตัวเอง • กิจกรรม • พี่ค่ายและเพื่อน
            </p>
          </div>

          {onBackToVoices && (
            <button
              onClick={onBackToVoices}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-2 self-start md:self-center"
            >
              <span>←</span>
              <span>กลับสู่บอร์ดข้อความ</span>
            </button>
          )}
        </div>

        {/* 3 Steps Navigation Bar */}
        {currentStep !== 4 && (
          <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 mt-8 pt-6 border-t border-white/15">
            {/* Step 1 */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`p-3 sm:p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                currentStep === 1
                  ? "bg-white text-purple-950 border-white shadow-lg"
                  : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep === 1 ? "bg-purple-900 text-white" : "bg-white/20 text-white"
                  }`}
                >
                  1
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  มิติที่ 1
                </span>
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm mt-1 truncate">
                1. มิติตัวเอง
              </h4>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => setCurrentStep(2)}
              className={`p-3 sm:p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                currentStep === 2
                  ? "bg-white text-purple-950 border-white shadow-lg"
                  : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep === 2 ? "bg-purple-900 text-white" : "bg-white/20 text-white"
                  }`}
                >
                  2
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  มิติที่ 2
                </span>
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm mt-1 truncate">
                2. มิติกิจกรรม
              </h4>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => setCurrentStep(3)}
              className={`p-3 sm:p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                currentStep === 3
                  ? "bg-white text-purple-950 border-white shadow-lg"
                  : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep === 3 ? "bg-purple-900 text-white" : "bg-white/20 text-white"
                  }`}
                >
                  3
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  มิติที่ 3
                </span>
              </div>
              <h4 className="font-extrabold text-xs sm:text-sm mt-1 truncate">
                3. พี่ค่ายและเพื่อน
              </h4>
            </button>
          </div>
        )}
      </div>

      {/* Basic Camper Info Box (Visible on Steps 1-3) */}
      {currentStep !== 4 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-primary/15 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-purple-deeper font-bold text-sm">
            <span>👤</span>
            <span>ข้อมูลเบื้องต้นของน้องค่าย (ไม่บังคับ — สามารถระบุหรือไม่ระบุก็ได้)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">ชื่อ - สกุล</label>
              <input
                type="text"
                value={camperName}
                onChange={(e) => setCamperName(e.target.value)}
                placeholder="เช่น นายฟารุก มั่นคง"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={camperNickname}
                onChange={(e) => setCamperNickname(e.target.value)}
                placeholder="เช่น น้องรุก"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">โรงเรียน / ชั้นปี</label>
              <input
                type="text"
                value={camperSchool}
                onChange={(e) => setCamperSchool(e.target.value)}
                placeholder="เช่น โรงเรียนหาดใหญ่วิทยาลัย ม.6"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 1: มิติตัวเอง (SELF DIMENSION)
          ======================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-primary/15 shadow-md space-y-8 animate-fade-in">
          <div className="border-b border-zinc-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black mb-2">
              <span>🌟 มิติที่ 1</span>
              <span>•</span>
              <span>มิติตัวเอง (Self Dimension)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900">
              สำรวจตนเอง การเติบโต และเป้าหมายชีวิต
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              ทบทวนมุมมองของตัวเองตั้งแต่ก้าวแรกที่เข้าสู่ค่ายจนถึงปัจจุบัน
            </p>
          </div>

          {/* Question 1.1 */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-zinc-900">
              1. จากวันแรกตั้งแต่มาค่ายเราได้รับความรู้อะไรใหม่ที่ไม่เคยรู้มาก่อนบ้าง ?
            </label>
            <p className="text-xs text-zinc-500">
              เช่น เรื่องระบบการสอบเข้ามหาวิทยาลัย (TCAS), การใช้ชีวิตในรั้วมหาวิทยาลัย, วิชาการเฉพาะด้าน หรือทักษะการใช้ชีวิต
            </p>
            <textarea
              rows={4}
              value={selfNewKnowledge}
              onChange={(e) => setSelfNewKnowledge(e.target.value)}
              placeholder="พิมพ์เล่าความรู้ใหม่ๆ ที่น้องได้รับจากค่ายที่นี่..."
              className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary leading-relaxed"
            />
          </div>

          {/* Question 1.2: Commitment Score (1-10) */}
          <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-sm sm:text-base font-bold text-purple-950">
                  2. ลองให้คะแนนความมุ่งมั่นในการอยู่ค่ายของเราหน่อย (1 - 10 คะแนน)
                </label>
                <p className="text-xs text-purple-800/70 mt-0.5">
                  ความตั้งใจในการเข้าร่วมกิจกรรม การเปิดรับสิ่งใหม่ และความพยายามในตลอดค่าย
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-purple-primary">
                  {selfCommitmentScore}
                </span>
                <span className="text-xs font-bold text-zinc-400"> / 10 คะแนน</span>
              </div>
            </div>

            {/* Score Selector Pills */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setSelfCommitmentScore(score)}
                  className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                    selfCommitmentScore === score
                      ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white border-transparent shadow-md scale-105"
                      : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-center font-semibold text-purple-900 pt-1">
              {selfCommitmentScore <= 4 && "🌱 เริ่มต้นก้าวแรก กำลังปรับตัวเข้ากับบรรยากาศค่าย"}
              {selfCommitmentScore >= 5 && selfCommitmentScore <= 6 && "💪 ตั้งใจดี ร่วมกิจกรรมอย่างต่อเนื่อง"}
              {selfCommitmentScore >= 7 && selfCommitmentScore <= 8 && "🔥 มุ่งมั่นเกินร้อย เปิดรับและเก็บเกี่ยวเต็มที่"}
              {selfCommitmentScore >= 9 && "🚀 ทุ่มเทสุดใจ พร้อมพุ่งชนทุกความฝันอย่างไม่ลังเล!"}
            </p>
          </div>

          {/* Question 1.3 */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-zinc-900">
              3. แนวคิดหรือกระบวนการอะไรที่ได้จากค่ายนี้และคิดว่าสามารถต่อยอดได้หลังจากนี้ ?
            </label>
            <p className="text-xs text-zinc-500">
              เช่น การจัดการเวลา, กรอบความคิดแบบ Growth Mindset, การตั้งเป้าหมาย หรือการสร้างวินัยให้ตัวเอง
            </p>
            <textarea
              rows={4}
              value={selfMindsetTakeaway}
              onChange={(e) => setSelfMindsetTakeaway(e.target.value)}
              placeholder="แชร์แนวคิด เทคนิค หรือกระบวนการที่ได้เรียนรู้และจะนำไปปรับใช้จริง..."
              className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary leading-relaxed"
            />
          </div>

          {/* Question 1.4: Fill in the Blanks for Target Faculty & Major */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-white border border-pink-200/60 space-y-4">
            <label className="block text-sm sm:text-base font-extrabold text-zinc-900">
              4. เป้าหมายคณะและสาขาในฝัน (เป้าหมายของฉัน)
            </label>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    ตอนนี้ฉันคิดว่าคณะ...
                  </label>
                  <input
                    type="text"
                    value={selfTargetFaculty}
                    onChange={(e) => setSelfTargetFaculty(e.target.value)}
                    placeholder="เช่น คณะแพทยศาสตร์, คณะวิศวกรรมศาสตร์..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-zinc-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    สาขา...
                  </label>
                  <input
                    type="text"
                    value={selfTargetMajor}
                    onChange={(e) => setSelfTargetMajor(e.target.value)}
                    placeholder="เช่น สาขาวิชาเทคโนโลยีสารสนเทศ, ทันตแพทยศาสตร์..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-zinc-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-900 mb-1">
                  ...นี้แหละที่ฉันอยากจะเข้า เพราะว่า:
                </label>
                <textarea
                  rows={3}
                  value={selfFacultyReason}
                  onChange={(e) => setSelfFacultyReason(e.target.value)}
                  placeholder="บอกเหตุผลและความตั้งใจของน้อง เช่น เป็นสิ่งที่รักและมีความสุขที่ได้ทำ, อยากนำความรู้ไปช่วยเหลือผู้อื่น..."
                  className="w-full p-4 rounded-xl bg-white border border-purple-200 text-zinc-900 text-xs sm:text-sm focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>ถัดไป: 2. มิติกิจกรรม</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 2: มิติกิจกรรม (ACTIVITIES DIMENSION)
          ======================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-primary/15 shadow-md space-y-8 animate-fade-in">
          <div className="border-b border-zinc-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-900 text-xs font-black mb-2">
              <span>มิติที่ 2</span>
              <span>•</span>
              <span>มิติกิจกรรม (Activities Dimension)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900">
              ให้คะแนนความประทับใจในแต่ละกิจกรรม
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              กดเลือกระดับคะแนน 1 - 5 ดาว สำหรับแต่ละกิจกรรมและฐานการเรียนรู้ที่ได้เข้าร่วม
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-purple-50/60 p-3 sm:p-4 rounded-2xl border border-purple-100">
            <div>
              <span className="text-xs font-bold text-purple-950 block">
                กิจกรรมและฐานทั้งหมด ({activitiesList.length} รายการ)
              </span>
              <span className="text-[11px] text-zinc-500">
                (แตะดาวซ้ำเพื่อรีเซ็ตกลับเป็น 0 ได้)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActivitiesList((prev) => prev.map((act) => ({ ...act, score: 0 })))
                }
                className="text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 px-3.5 py-1.5 rounded-xl border border-zinc-200 transition-all cursor-pointer shadow-2xs"
              >
                รีเซ็ตเป็น 0
              </button>
              <button
                type="button"
                onClick={() =>
                  setActivitiesList((prev) => prev.map((act) => ({ ...act, score: 5 })))
                }
                className="text-xs font-extrabold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-100/60 px-3.5 py-1.5 rounded-xl border border-purple-200 transition-all cursor-pointer shadow-2xs"
              >
                ให้ 5 ดาวทั้งหมด
              </button>
            </div>
          </div>

          {/* Activities List (Stars Only) */}
          <div className="space-y-2.5">
            {activitiesList.map((act, index) => (
              <div
                key={act.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/80 hover:bg-white border border-zinc-200/80 hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-900 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 leading-snug">
                    {act.name}
                  </h4>
                </div>

                {/* Interactive Star Rating (1-5, default 0) */}
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shrink-0 self-end sm:self-auto shadow-2xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleUpdateActivityScore(act.id, star)}
                      className={`p-1 transition-transform hover:scale-125 cursor-pointer ${
                        star <= act.score
                          ? "text-amber-400"
                          : "text-zinc-200 hover:text-amber-200"
                      }`}
                      title={`${star} ดาว (แตะซ้ำเพื่อรีเซ็ต)`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 drop-shadow-2xs"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ))}
                  <span
                    className={`text-xs font-black ml-1.5 min-w-[34px] text-center ${
                      act.score > 0 ? "text-purple-950" : "text-zinc-400"
                    }`}
                  >
                    {act.score} / 5
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              ← ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-primary to-pink-accent text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>ถัดไป: 3. มิติพี่ค่ายและเพื่อน</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 3: มิติพี่ค่ายและเพื่อน (MENTORS & FRIENDS DIMENSION)
          ======================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-primary/15 shadow-md space-y-8 animate-fade-in">
          <div className="border-b border-zinc-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black mb-2">
              <span>🤝 มิติที่ 3</span>
              <span>•</span>
              <span>มิติพี่ค่ายและเพื่อน (Mentors & Friends Dimension)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900">
              ความผูกพัน มิตรภาพ และความประทับใจ
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              ท้าทายความจำจับเวลารายชื่อคนสำคัญในค่าย และส่งต่อข้อความถึงพี่ๆ
            </p>
          </div>

          {/* Question 3.1: TIMED CHALLENGE 1 (Mentors within 1 Min) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border-2 border-purple-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  <span>⏱️ 1-Minute Challenge</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-purple-950">
                  1. ลิสต์รายชื่อพี่ค่ายที่จำได้มาภายใน 1 นาที
                </h4>
                <p className="text-xs text-purple-900/70">
                  กดปุ่มเพื่อเริ่มเปิดหน้าต่างจับเวลาถอยหลัง 1 นาที และพิมพ์รายชื่อพี่ค่ายให้ได้มากที่สุด!
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenTimedChallenge("mentors")}
                className="px-5 py-3 rounded-2xl bg-purple-primary hover:bg-purple-dark text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span>⏱️</span>
                <span>{mentorsRemembered.length > 0 ? "ท้าทายใหม่ / แก้ไขรายชื่อพี่ค่าย" : "เริ่มจับเวลา 1 นาที!"}</span>
              </button>
            </div>

            {/* Display recorded mentor names */}
            {mentorsRemembered.length > 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                  <span>รายชื่อพี่ค่ายที่จำได้ ({mentorsRemembered.length} คน):</span>
                  <span className="text-emerald-600 font-extrabold">✓ บันทึกผลเรียบร้อย</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {mentorsRemembered.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 shadow-2xs"
                    >
                      <span>👤 พี่{name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/70 border border-dashed border-purple-200 text-center text-xs text-purple-900/60 font-medium">
                ยังไม่ได้เริ่มจับเวลา กดปุ่ม &quot;เริ่มจับเวลา 1 นาที!&quot; เพื่อทดสอบความจำ
              </div>
            )}
          </div>

          {/* Question 3.2: TIMED CHALLENGE 2 (Friends within 2 Mins) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50/40 to-white border-2 border-pink-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  <span>⏱️ 2-Minutes Challenge</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-pink-950">
                  2. ลิสต์รายชื่อเพื่อนในค่ายที่จำได้มาภายใน 2 นาที
                </h4>
                <p className="text-xs text-pink-900/70">
                  กดปุ่มเพื่อเริ่มเปิดหน้าต่างจับเวลาถอยหลัง 2 นาที และพิมพ์รายชื่อเพื่อนๆ ให้ได้มากที่สุด!
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenTimedChallenge("friends")}
                className="px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span>⏱️</span>
                <span>{friendsRemembered.length > 0 ? "ท้าทายใหม่ / แก้ไขรายชื่อเพื่อน" : "เริ่มจับเวลา 2 นาที!"}</span>
              </button>
            </div>

            {/* Display recorded friend names */}
            {friendsRemembered.length > 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-pink-950">
                  <span>รายชื่อเพื่อนที่จำได้ ({friendsRemembered.length} คน):</span>
                  <span className="text-emerald-600 font-extrabold">✓ บันทึกผลเรียบร้อย</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {friendsRemembered.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-100 text-pink-900 text-xs font-bold border border-pink-200 shadow-2xs"
                    >
                      <span>🤝 {name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/70 border border-dashed border-pink-200 text-center text-xs text-pink-900/60 font-medium">
                ยังไม่ได้เริ่มจับเวลา กดปุ่ม &quot;เริ่มจับเวลา 2 นาที!&quot; เพื่อทดสอบความจำ
              </div>
            )}
          </div>

          {/* Question 3.3: Contact mentors */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-zinc-900">
              3. พี่ค่ายที่เราอยากมีคอนแทค หรืออยากให้ติดตามเราหลังจากค่าย
            </label>
            <p className="text-xs text-zinc-500">
              ระบุชื่อพี่ค่ายที่อยากปรึกษาต่อ หรือช่องทางที่น้องสะดวกให้พี่ๆ ติดตาม (เช่น ชื่อพี่..., ช่องทาง IG, Facebook)
            </p>
            <textarea
              rows={3}
              value={contactMentors}
              onChange={(e) => setContactMentors(e.target.value)}
              placeholder="ระบุชื่อพี่ค่ายที่อยากติดต่อ หรือเรื่องที่อยากให้พี่ๆ ช่วยให้คำแนะนำต่อ..."
              className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary leading-relaxed"
            />
          </div>

          {/* Question 3.4: Review mentors */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-zinc-900">
              4. รีวิวพี่ค่ายหน่อยย 💕
            </label>
            <p className="text-xs text-zinc-500">
              ความรู้สึก ความประทับใจ การดูแลเอาใจใส่ หรือคำขอบคุณที่อยากบอกพี่ๆ ทุกคน
            </p>
            <textarea
              rows={4}
              value={mentorReview}
              onChange={(e) => setMentorReview(e.target.value)}
              placeholder="เขียนความในใจ รีวิวความน่ารัก ความทุ่มเทของพี่ๆ ค่ายได้เต็มที่เลย..."
              className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary leading-relaxed"
            />
          </div>

          {/* Question 3.5: Mentor dedication score (1-10) */}
          <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-sm sm:text-base font-bold text-indigo-950">
                  5. ให้คะแนนความตั้งใจของพี่ค่ายหน่อย (1 - 10 คะแนน)
                </label>
                <p className="text-xs text-indigo-900/70 mt-0.5">
                  การเตรียมงาน การดูแลต้อนรับ และความอบอุ่นที่พี่ๆ มอบให้ตลอดค่าย
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                  {mentorDedicationScore}
                </span>
                <span className="text-xs font-bold text-zinc-400"> / 10 คะแนน</span>
              </div>
            </div>

            {/* Score Selector Pills */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMentorDedicationScore(score)}
                  className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                    mentorDedicationScore === score
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                      : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-center font-semibold text-indigo-950 pt-1">
              {mentorDedicationScore === 10
                ? "💖 ให้เต็ม 10 ไม่หัก! พี่ๆ ดูแลดีมาก อบอุ่นเหมือนครอบครัว"
                : `🌟 ให้ ${mentorDedicationScore}/10 ขอบคุณพี่ๆ ทุกคนที่เหนื่อยเพื่อพวกเรา`}
            </p>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Navigation & Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              ← ย้อนกลับไปมิติกิจกรรม
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitQuiz}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-primary via-indigo-600 to-pink-accent hover:from-purple-dark hover:to-pink-600 text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังส่งข้อมูลแบบประเมิน...</span>
                </>
              ) : (
                <>
                  <span>✨ ส่งคำตอบแบบประเมินควิซ (ครบ 3 มิติ)</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 4: COMPLETION SCREEN (CERTIFICATE / SUMMARY)
          ======================================================== */}
      {currentStep === 4 && submitSuccess && (
        <div className="bg-white rounded-3xl p-6 sm:p-12 border-2 border-purple-200 shadow-xl space-y-8 text-center animate-fade-in max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
            🎉
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper">
              ส่งแบบประเมิน & ควิซเรียบร้อยแล้ว!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              ขอบคุณน้อง{camperNickname || camperName || ""} มากๆ ที่ร่วมสะท้อนความรู้สึก
              ทุกคำตอบและทุกเสียงของน้องมีคุณค่าอย่างยิ่งต่อค่าย Guidance for Dream
            </p>
          </div>

          {/* Summary Badge Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-purple-200/50 pb-3">
              <span className="text-xs font-black text-purple-900 uppercase">
                สรุปผลการตอบควิซของฉัน
              </span>
              <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
                GFD SS7 Camper
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-purple-100">
                <span className="text-zinc-500 block text-[11px]">คะแนนความมุ่งมั่นตัวเอง:</span>
                <span className="text-base font-black text-purple-primary">
                  {selfCommitmentScore} / 10
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-purple-100">
                <span className="text-zinc-500 block text-[11px]">คะแนนความตั้งใจพี่ค่าย:</span>
                <span className="text-base font-black text-pink-600">
                  {mentorDedicationScore} / 10
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-purple-100">
                <span className="text-zinc-500 block text-[11px]">จำชื่อพี่ค่ายใน 1 นาที:</span>
                <span className="text-base font-black text-indigo-700">
                  {mentorsRemembered.length} คน
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-purple-100">
                <span className="text-zinc-500 block text-[11px]">จำชื่อเพื่อนใน 2 นาที:</span>
                <span className="text-base font-black text-rose-600">
                  {friendsRemembered.length} คน
                </span>
              </div>
            </div>

            {selfTargetFaculty && (
              <div className="p-3 bg-white/90 rounded-xl border border-purple-100 text-xs">
                <span className="text-zinc-500 block text-[11px]">เป้าหมายในฝัน:</span>
                <span className="font-extrabold text-purple-950">
                  คณะ{selfTargetFaculty} {selfTargetMajor ? `สาขา${selfTargetMajor}` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentStep(1);
                setSubmitSuccess(false);
                setActivitiesList(
                  DEFAULT_ACTIVITIES.map((act) => ({ id: act.id, name: act.name, score: 0 }))
                );
              }}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto"
            >
              ทำแบบประเมินใหม่อีกครั้ง
            </button>
            {onBackToVoices && (
              <button
                onClick={onBackToVoices}
                className="px-6 py-2.5 rounded-xl bg-purple-primary text-white text-xs font-bold shadow-md hover:bg-purple-dark transition-colors cursor-pointer w-full sm:w-auto"
              >
                ดูบอร์ดข้อความเสียงสะท้อนจากน้อง →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP MODAL: TIMED CHALLENGE (1 MIN OR 2 MINS)
          ======================================================== */}
      {activeTimedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-200 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="text-center space-y-1">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  activeTimedModal === "mentors"
                    ? "bg-purple-100 text-purple-900"
                    : "bg-pink-100 text-pink-900"
                }`}
              >
                <span>⏱️</span>
                <span>
                  {activeTimedModal === "mentors"
                    ? "ภารกิจจำชื่อพี่ค่าย 1 นาที"
                    : "ภารกิจจำชื่อเพื่อนในค่าย 2 นาที"}
                </span>
              </div>
              <h3 className="text-xl font-black text-zinc-900">
                {activeTimedModal === "mentors"
                  ? "พิมพ์รายชื่อพี่ค่ายที่คุณจำได้"
                  : "พิมพ์รายชื่อเพื่อนในค่ายที่คุณจำได้"}
              </h3>
              <p className="text-xs text-zinc-500">
                {activeTimedModal === "mentors"
                  ? "มีเวลา 60 วินาที พิมพ์ชื่อแล้วกด Enter หรือปุ่ม + เพื่อเพิ่มชื่อ"
                  : "มีเวลา 120 วินาที พิมพ์ชื่อแล้วกด Enter หรือปุ่ม + เพื่อเพิ่มชื่อ"}
              </p>
            </div>

            {/* Big Countdown Clock Display */}
            <div
              className={`p-6 rounded-2xl text-center border-2 transition-all ${
                timedModalSecondsLeft <= 10 && timedModalSecondsLeft > 0
                  ? "bg-rose-50 border-rose-300 animate-pulse text-rose-600"
                  : isTimerRunning
                  ? "bg-purple-50 border-purple-300 text-purple-900"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700"
              }`}
            >
              <div className="font-mono text-4xl sm:text-5xl font-black tracking-wider">
                {formatTime(timedModalSecondsLeft)}
              </div>
              <p className="text-xs font-bold mt-1">
                {!isTimerRunning && timedModalSecondsLeft > 0 && "กดปุ่ม 'เริ่มจับเวลา' ด้านล่างเพื่อเริ่มเกม"}
                {isTimerRunning && timedModalSecondsLeft > 0 && "กำลังจับเวลา... เร่งพิมพ์เลย!"}
                {timedModalSecondsLeft === 0 && "หมดเวลาแล้ว! 🏁 ดูรายชื่อที่คุณจำได้ด้านล่าง"}
              </p>
            </div>

            {/* Start Timer / Running Input Area */}
            {!isTimerRunning && timedModalSecondsLeft > 0 && (
              <button
                type="button"
                onClick={handleStartTimer}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-primary to-pink-accent hover:from-purple-dark hover:to-pink-600 text-white text-sm sm:text-base font-extrabold shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀 กดเพื่อเริ่มจับเวลา</span>
                <span>({activeTimedModal === "mentors" ? "60 วินาที" : "120 วินาที"})</span>
              </button>
            )}

            {/* Fast Name Input Form */}
            {(isTimerRunning || timedModalSecondsLeft === 0) && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    ref={timedInputRef}
                    type="text"
                    disabled={timedModalSecondsLeft === 0}
                    value={timedInputText}
                    onChange={(e) => setTimedInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTimedItem();
                      }
                    }}
                    placeholder={
                      timedModalSecondsLeft > 0
                        ? activeTimedModal === "mentors"
                          ? "พิมพ์ชื่อพี่ค่าย เช่น พี่บัสรี, พี่ฮานีฟ..."
                          : "พิมพ์ชื่อเพื่อน เช่น ไอนัน, มารียา..."
                        : "หมดเวลาแล้ว"
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={timedModalSecondsLeft === 0 || !timedInputText.trim()}
                    onClick={handleAddTimedItem}
                    className="px-4 py-2.5 rounded-xl bg-purple-primary text-white text-xs font-bold shadow-xs hover:bg-purple-dark disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    + เพิ่ม
                  </button>
                </div>
              </div>
            )}

            {/* Badges of remembered items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                <span>
                  รายชื่อที่พิมพ์แล้ว (
                  <span className="text-purple-primary font-black">{tempTimedList.length}</span> คน):
                </span>
                {tempTimedList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTempTimedList([])}
                    className="text-[11px] text-zinc-400 hover:text-rose-500 cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              <div className="min-h-[90px] max-h-48 overflow-y-auto p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-wrap gap-2 content-start">
                {tempTimedList.length === 0 ? (
                  <p className="text-xs text-zinc-400 m-auto text-center">
                    ยังไม่มีรายชื่อ เริ่มพิมพ์แล้วกด Enter ได้เลย!
                  </p>
                ) : (
                  tempTimedList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-purple-200 text-purple-950 text-xs font-bold shadow-2xs animate-scale-up"
                    >
                      <span>
                        {activeTimedModal === "mentors" ? `พี่${item}` : item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimedItem(idx)}
                        className="text-zinc-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        title="ลบชื่อนี้"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                  setIsTimerRunning(false);
                  setActiveTimedModal(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveAndCloseTimedModal}
                className="px-6 py-2.5 rounded-xl bg-purple-primary hover:bg-purple-dark text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                บันทึกผล ({tempTimedList.length} คน)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

