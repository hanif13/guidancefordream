"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import SubpageHero from "@/app/components/SubpageHero";
import {
  ALL_CAMP_SCHEDULE,
  CampScheduleItem,
} from "./campScheduleData";
import {
  MASTER_CAMP_SCHEDULE,
  MasterScheduleItem,
} from "./masterScheduleData";
import { supabase } from "@/app/lib/supabase";

/* ================================================================
   BANGKOK TIME UTILS
   ================================================================ */

function getBangkokNow(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utcMs + 7 * 3600_000);
}

function formatBangkokTimeString(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export interface DayMeta {
  dayNum: number;
  title: string;
  subtitle: string;
  dateISO: string;
}

export const DAYS_META: DayMeta[] = [
  { dayNum: 1, title: "ศุกร์ 6 พ.ย.", subtitle: "วันรายงานตัว & พิธีเปิด", dateISO: "2026-11-06" },
  { dayNum: 2, title: "เสาร์ 7 พ.ย.", subtitle: "กิจกรรมฐานวิทยาศาสตร์สุขภาพ", dateISO: "2026-11-07" },
  { dayNum: 3, title: "อาทิตย์ 8 พ.ย.", subtitle: "กิจกรรมฐานวิทย์-เทคโน & มนุษย์-สังคม", dateISO: "2026-11-08" },
  { dayNum: 4, title: "จันทร์ 9 พ.ย.", subtitle: "เสวนาวิชาการ & พิธีปิดค่าย", dateISO: "2026-11-09" },
];

export interface DisplayScheduleItem {
  id: string;
  dayNum: number;
  dateStr: string;
  dateISO: string;
  time: string;
  startTime: string;
  endTime: string;
  duration?: string;
  title: string;
  desc: string;
  location: string;
  dept?: string;
  note?: string;
  group?: string;
}

function mapMasterItemToDisplay(
  it: MasterScheduleItem,
  gender: "all" | "male" | "female"
): DisplayScheduleItem {
  let location = "";
  if (gender === "male") {
    location = it.locMale || it.locFemale;
  } else if (gender === "female") {
    location = it.locFemale || it.locMale;
  } else {
    // "all"
    if (it.locMale && it.locFemale && it.locMale !== it.locFemale) {
      location = `${it.locMale} (ชาย) / ${it.locFemale} (หญิง)`;
    } else {
      location = it.locMale || it.locFemale || "-";
    }
  }

  return {
    id: it.id,
    dayNum: it.dayNum,
    dateStr: it.dateStr,
    dateISO: it.dateISO,
    time: it.time,
    startTime: it.startTime,
    endTime: it.endTime,
    duration: it.duration,
    title: it.title,
    desc: it.desc,
    location,
    dept: it.dept,
    note: it.note,
    group: "main",
  };
}

/* ================================================================
   MAIN SCHEDULE PAGE COMPONENT
   ================================================================ */

export default function SchedulePage() {
  // Level 1: Day selection (0 = รวมทั้ง 4 วัน, 1..4 = วันที่ 1..4)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(0);

  // Level 2: Gender selection ("all" = รวมทั้งสองฝ่าย, "male" = มุสลีมีน, "female" = มุสลีมะฮฺ)
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");

  // Level 3: Group selection ("main" = กำหนดการหลักภาพรวม, or specific group e.g. "มุสลีมีน กลุ่ม 1")
  const [selectedGroup, setSelectedGroup] = useState<string>("main");

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live timer for current activity highlight
  const [now, setNow] = useState<Date>(getBangkokNow());
  const [mounted, setMounted] = useState<boolean>(false);
  const currentItemRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Master Schedule (synced with Admin changes via localStorage & Supabase)
  const [masterSchedule, setMasterSchedule] = useState<MasterScheduleItem[]>(MASTER_CAMP_SCHEDULE);
  // Dynamic Subgroup Schedule (synced with Admin changes via localStorage & Supabase)
  const [subgroupSchedule, setSubgroupSchedule] = useState<CampScheduleItem[]>(ALL_CAMP_SCHEDULE);

  useEffect(() => {
    setMounted(true);
    setNow(getBangkokNow());
    const timer = setInterval(() => setNow(getBangkokNow()), 1_000);
    return () => clearInterval(timer);
  }, []);

  // Sync custom schedule if updated from Admin
  useEffect(() => {
    const loadSchedule = async () => {
      // 1. Try local storage cache for immediate rendering
      try {
        const cached = localStorage.getItem("gfd_admin_master_schedule_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMasterSchedule(parsed);
          }
        }
      } catch (err) {
        console.warn("Could not read local schedule cache:", err);
      }

      try {
        const cachedSub = localStorage.getItem("gfd_admin_subgroup_schedule_v1");
        if (cachedSub) {
          const parsed = JSON.parse(cachedSub);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSubgroupSchedule(parsed);
          }
        }
      } catch (err) {}

      // 2. Try Supabase
      try {
        // Fetch Master Schedule
        const { data: masterData, error: masterError } = await supabase
          .from("camp_schedule")
          .select("*")
          .eq("schedule_type", "master")
          .order("sort_order", { ascending: true });

        if (!masterError && masterData && masterData.length > 0) {
          const mapped: MasterScheduleItem[] = masterData.map((d: any) => ({
            id: d.id,
            dayNum: d.day_num,
            dateStr: d.date_str,
            dateISO: d.date_iso,
            time: d.time,
            startTime: d.start_time,
            endTime: d.end_time,
            duration: d.duration,
            title: d.title,
            desc: d.description || d.title,
            locMale: d.loc_male || "",
            locFemale: d.loc_female || "",
            dept: d.dept || "",
            note: d.note || "",
            category: d.category || "activity",
          }));
          setMasterSchedule(mapped);
          try {
            localStorage.setItem("gfd_admin_master_schedule_v1", JSON.stringify(mapped));
          } catch (e) {}
        }

        // Fetch Subgroup Schedule
        const { data: subData, error: subError } = await supabase
          .from("camp_schedule")
          .select("*")
          .eq("schedule_type", "subgroup")
          .order("sort_order", { ascending: true });

        if (!subError && subData && subData.length > 0) {
          const mappedSub: CampScheduleItem[] = subData.map((d: any) => ({
            dayNum: d.day_num,
            dayLabel: d.date_str || `วันที่ ${d.day_num}`,
            dateISO: d.date_iso || "",
            gender: (d.gender as any) || "male",
            group: d.target_group || "มุสลีมีน",
            startTime: d.start_time || "08:00",
            endTime: d.end_time || "09:00",
            time: d.time || `${d.start_time} - ${d.end_time}`,
            duration: d.duration || "60",
            title: d.title || "",
            desc: d.description || d.title || "",
            location: d.location || (d.gender === "female" ? (d.loc_female || d.loc_male || "") : (d.loc_male || d.loc_female || "")) || "",
            dept: d.dept || "",
            note: d.note || "",
            category: (d.category as any) || "activity",
          }));
          setSubgroupSchedule(mappedSub);
          try {
            localStorage.setItem("gfd_admin_subgroup_schedule_v1", JSON.stringify(mappedSub));
          } catch (e) {}
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    loadSchedule();

    // Supabase Realtime channel for live instant schedule updates
    let channel: any = null;
    try {
      channel = supabase
        .channel("public:camp_schedule:live_site")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "camp_schedule" },
          () => {
            loadSchedule();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Could not subscribe to schedule realtime:", e);
    }

    const handleStorageUpdate = () => {
      try {
        const cached = localStorage.getItem("gfd_admin_master_schedule_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMasterSchedule(parsed);
          }
        }
      } catch (e) {}

      try {
        const cachedSub = localStorage.getItem("gfd_admin_subgroup_schedule_v1");
        if (cachedSub) {
          const parsed = JSON.parse(cachedSub);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSubgroupSchedule(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener("gfd_schedule_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("gfd_schedule_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // 1. Available subgroups (Only on Day 2 & Day 3 where 16-faculty rotations happen)
  const availableGroups = useMemo(() => {
    if (selectedDayNum !== 2 && selectedDayNum !== 3) return [];

    const groupsSet = new Set<string>();
    subgroupSchedule.forEach((item) => {
      if (item.dayNum !== selectedDayNum) return;
      if (selectedGender !== "all" && item.gender !== selectedGender) return;
      // Exclude pure gender labels so "มุสลีมีน" or "มุสลีมะฮฺ" never appear as a sub-group button
      if (item.group === "มุสลีมีน" || item.group === "มุสลีมะฮฺ") return;
      groupsSet.add(item.group);
    });

    const list = Array.from(groupsSet);
    list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    return list;
  }, [selectedDayNum, selectedGender, subgroupSchedule]);

  // Keep selectedGroup valid when day/gender changes
  useEffect(() => {
    if (selectedDayNum !== 2 && selectedDayNum !== 3) {
      setSelectedGroup("main");
    } else {
      if (selectedGroup !== "main" && !availableGroups.includes(selectedGroup)) {
        setSelectedGroup("main");
      }
    }
  }, [selectedDayNum, selectedGender, availableGroups, selectedGroup]);

  // 2. Filter & Assemble Items
  const filteredItems = useMemo(() => {
    const isMaster =
      selectedDayNum === 0 ||
      selectedDayNum === 1 ||
      selectedDayNum === 4 ||
      selectedGroup === "main" ||
      !selectedGroup;

    let list: DisplayScheduleItem[] = [];

    if (isMaster) {
      // Use Master Camp Schedule (กำหนดการหลักภาพรวม)
      const baseMaster = masterSchedule.filter((it) => {
        if (selectedDayNum !== 0 && it.dayNum !== selectedDayNum) return false;
        return true;
      });
      list = baseMaster.map((it) => mapMasterItemToDisplay(it, selectedGender));
    } else {
      // Use detailed subgroup rotation schedule
      const baseGroup = subgroupSchedule.filter((item) => {
        if (item.dayNum !== selectedDayNum) return false;
        if (selectedGender !== "all" && item.gender !== selectedGender) return false;
        if (item.group !== selectedGroup) return false;
        return true;
      });
      list = baseGroup.map((item, idx) => ({
        id: `grp-${item.dayNum}-${item.group}-${idx}`,
        dayNum: item.dayNum,
        dateStr: item.dayLabel,
        dateISO: item.dateISO,
        time: item.time,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.duration,
        title: item.title,
        desc: item.desc,
        location: item.location,
        dept: item.dept,
        note: item.note,
        group: item.group,
      }));
    }

    // Filter by Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const combined = `${item.title} ${item.desc} ${item.location} ${item.note || ""} ${item.dept || ""}`.toLowerCase();
        return combined.includes(q);
      });
    }

    return list;
  }, [selectedDayNum, selectedGender, selectedGroup, searchQuery, masterSchedule, subgroupSchedule]);

  // 3. Live time check & dynamic highlight
  const nowTimeStr = mounted ? formatBangkokTimeString(now) : "";
  const nowDateISO = mounted
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    : "";

  const isActualCampDate = useMemo(() => {
    return ["2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09"].includes(nowDateISO);
  }, [nowDateISO]);

  const getItemLiveStatus = (item: DisplayScheduleItem): "current" | "past" | "upcoming" => {
    if (!item.startTime) return "upcoming";

    // 1. Date comparison
    if (isActualCampDate) {
      if (item.dateISO < nowDateISO) return "past";
      if (item.dateISO > nowDateISO) return "upcoming";
      // Same date as today, continue to time check below
    } else {
      // Preview mode (outside actual camp dates):
      const targetDay = selectedDayNum === 0 ? 1 : selectedDayNum;
      if (item.dayNum < targetDay) return "past";
      if (item.dayNum > targetDay) return "upcoming";
    }

    // 2. Time comparison within the active day:
    const [sh, sm] = item.startTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(sm)) return "upcoming";
    const startMinutes = sh * 60 + sm;

    let endMinutes: number;
    if (item.endTime && item.endTime.includes(":")) {
      const [eh, em] = item.endTime.split(":").map(Number);
      endMinutes = isNaN(eh) || isNaN(em) ? startMinutes + 30 : eh * 60 + em;
    } else {
      const dur = item.duration ? parseInt(item.duration, 10) : 60;
      endMinutes = startMinutes + (isNaN(dur) ? 60 : dur);
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return "current";
    }
    if (currentMinutes >= endMinutes) {
      return "past";
    }
    return "upcoming";
  };

  // Group items by Day when selectedDayNum === 0
  const itemsByDay = useMemo(() => {
    if (selectedDayNum !== 0) return null;
    const map = new Map<number, DisplayScheduleItem[]>();
    DAYS_META.forEach((d: DayMeta) => map.set(d.dayNum, []));
    filteredItems.forEach((it) => {
      const arr = map.get(it.dayNum) || [];
      arr.push(it);
      map.set(it.dayNum, arr);
    });
    return map;
  }, [selectedDayNum, filteredItems]);

  return (
    <main className="relative min-h-screen bg-cream-bg text-foreground">
      {/* Subpage Hero Header */}
      <SubpageHero
        badge="Guidance for Dream 7th Schedule"
        titleMain="ตารางกำหนดการ"
        titleHighlight="ค่ายสานฝันเพื่อน้อง"
        subtitle1="ครั้งที่ 7 • ประจำปีการศึกษา 2569 ณ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่"
        subtitle2="กำหนดการหลักภาพรวมทั้งค่าย 4 วัน 3 คืน และตารางหมุนเวียนฐาน 16 คณะ"
      />

      {/* Container: max-w-4xl for focused, modern proportions */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-10 space-y-4 sm:space-y-5">
        
        {/* ==============================================================
            CONTROLS PANEL: STRUCTURED FILTERING (CENTERED ON MOBILE)
            ============================================================== */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 shadow-xs border border-purple-primary/10 space-y-3.5 sm:space-y-4">
          
          {/* LEVEL 1: เลือกวันของค่าย */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-1">
              <span className="text-xs font-bold text-purple-primary tracking-wide">
                ระดับที่ 1: เลือกวันของค่าย
              </span>
              <span className="text-[11px] text-foreground/50 font-medium">
                4 วัน 3 คืน (6 - 9 พ.ย. 2569)
              </span>
            </div>

            {/* Mobile: Full-width row for "รวม 4 วัน" + 2x2 grid for Days 1-4 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
              
              {/* Option: รวมทั้ง 4 วัน (แถวยาวเต็มบนมือถือ col-span-2) */}
              <button
                onClick={() => setSelectedDayNum(0)}
                className={`col-span-2 sm:col-span-1 p-2 sm:p-2.5 rounded-xl border text-center sm:text-left transition-all cursor-pointer ${
                  selectedDayNum === 0
                    ? "bg-purple-primary text-white border-purple-primary shadow-xs"
                    : "bg-white hover:bg-purple-primary/5 text-foreground/80 border-purple-primary/10 hover:border-purple-primary/20"
                }`}
              >
                <div className="flex sm:block items-center justify-center sm:justify-start gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                      selectedDayNum === 0
                        ? "bg-white/20 text-white"
                        : "bg-purple-primary/10 text-purple-dark"
                    }`}
                  >
                    ภาพรวมค่าย
                  </span>
                  <div className="font-bold text-xs sm:text-sm mt-0 sm:mt-1">รวมทั้ง 4 วัน</div>
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    selectedDayNum === 0 ? "text-white/80" : "text-foreground/50"
                  }`}
                >
                  กำหนดการหลักทั้งค่าย
                </div>
              </button>

              {/* Individual Days 1 to 4 (บล็อก 4 บล็อก 2x2 บนมือถือ) */}
              {DAYS_META.map((d: DayMeta) => {
                const isSelected = selectedDayNum === d.dayNum;
                return (
                  <button
                    key={d.dayNum}
                    onClick={() => setSelectedDayNum(d.dayNum)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center sm:text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-primary text-white border-purple-primary shadow-xs"
                        : "bg-white hover:bg-purple-primary/5 text-foreground/80 border-purple-primary/10 hover:border-purple-primary/20"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-purple-primary/10 text-purple-dark"
                      }`}
                    >
                      วันที่ {d.dayNum}
                    </span>
                    <div className="font-bold text-xs sm:text-sm mt-0.5 sm:mt-1">{d.title}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? "text-white/80" : "text-foreground/50"
                      }`}
                    >
                      {d.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-purple-primary/10" />

          {/* LEVEL 2 & LEVEL 3 (GENDER & SUB-GROUPS - CENTERED ON MOBILE) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5 items-start">
            
            {/* LEVEL 2: กำหนดการแยก ชาย - หญิง */}
            <div className="md:col-span-5 space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-bold text-purple-primary tracking-wide block">
                ระดับที่ 2: กำหนดการแยก ชาย - หญิง
              </span>
              <div className="inline-flex p-1 bg-slate-50 rounded-xl border border-purple-primary/10 w-full justify-center">
                <button
                  onClick={() => setSelectedGender("all")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 text-center ${
                    selectedGender === "all"
                      ? "bg-purple-primary text-white shadow-xs"
                      : "text-foreground/70 hover:text-purple-primary"
                  }`}
                >
                  รวมทั้งสองฝ่าย
                </button>
                <button
                  onClick={() => setSelectedGender("male")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 text-center ${
                    selectedGender === "male"
                      ? "bg-purple-primary text-white shadow-xs"
                      : "text-foreground/70 hover:text-purple-primary"
                  }`}
                >
                  มุสลีมีน (ชาย)
                </button>
                <button
                  onClick={() => setSelectedGender("female")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 text-center ${
                    selectedGender === "female"
                      ? "bg-purple-primary text-white shadow-xs"
                      : "text-foreground/70 hover:text-purple-primary"
                  }`}
                >
                  มุสลีมะฮฺ (หญิง)
                </button>
              </div>
            </div>

            {/* LEVEL 3: แยกกลุ่ม / กำหนดการหลัก */}
            <div className="md:col-span-7 space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-bold text-purple-primary tracking-wide block">
                ระดับที่ 3: เลือกกลุ่มย่อย {availableGroups.length > 0 ? `(${availableGroups.length} กลุ่ม)` : ""}
              </span>

              {availableGroups.length === 0 ? (
                <div className="py-2 px-3 rounded-xl bg-purple-primary/5 border border-purple-primary/10 text-xs text-purple-dark font-medium text-center">
                  {selectedDayNum === 0
                    ? "กำหนดการหลักภาพรวมทั้งค่าย 4 วัน 3 คืน"
                    : "กำหนดการหลักภาพรวม (ทุกกลุ่มทำกิจกรรมร่วมกัน)"}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 p-1 bg-slate-50 rounded-xl border border-purple-primary/10">
                  {/* Button for Master Overview */}
                  <button
                    onClick={() => setSelectedGroup("main")}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedGroup === "main"
                        ? "bg-purple-primary text-white shadow-xs"
                        : "bg-white hover:bg-white text-foreground/70 hover:text-purple-primary border border-purple-primary/10"
                    }`}
                  >
                    กำหนดการหลัก
                  </button>

                  {/* Individual sub-groups strictly without 'มุสลีมีน' label */}
                  {availableGroups.map((grp) => {
                    const isSelected = selectedGroup === grp;
                    const shortName = grp
                      .replace("มุสลีมีน ", "")
                      .replace("มุสลีมะฮฺ ", "")
                      .trim();
                    return (
                      <button
                        key={grp}
                        onClick={() => setSelectedGroup(grp)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-primary text-white shadow-xs"
                            : "bg-white hover:bg-white text-foreground/70 hover:text-purple-primary border border-purple-primary/10"
                        }`}
                      >
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* SEARCH BOX */}
          <div className="pt-2 border-t border-purple-primary/10 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground/50 text-center sm:text-left">
              ค้นหากิจกรรม:
            </span>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="พิมพ์ชื่อกิจกรรม หรือสถานที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-purple-primary/15 focus:outline-none focus:ring-2 focus:ring-purple-primary/30 focus:border-purple-primary transition-all text-foreground placeholder:text-foreground/40 text-center sm:text-left"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-foreground/40 hover:text-foreground cursor-pointer font-bold"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

        </section>

        {/* ==============================================================
            ACTIVE BANNER / STATS (CENTERED ON MOBILE)
            ============================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2 px-1">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-purple-dark">
              {selectedDayNum === 0 ? (
                "กำหนดการหลักภาพรวมทั้งค่าย (4 วัน 3 คืน)"
              ) : (
                <>
                  {DAYS_META.find((d: DayMeta) => d.dayNum === selectedDayNum)?.title} —{" "}
                  {selectedGroup === "main" || !selectedGroup
                    ? "กำหนดการหลัก"
                    : selectedGroup.replace("มุสลีมีน ", "").replace("มุสลีมะฮฺ ", "")}
                </>
              )}
            </h2>
            <p className="text-xs text-foreground/60">
              ฝ่าย:{" "}
              {selectedGender === "all"
                ? "รวมทั้งสองฝ่าย"
                : selectedGender === "male"
                ? "มุสลีมีน (ชาย)"
                : "มุสลีมะฮฺ (หญิง)"}{" "}
              • พบ {filteredItems.length} รายการ
            </p>
          </div>

          {/* Live Clock Badge (Centered on mobile) */}
          {mounted && (
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl bg-purple-primary/5 border border-purple-primary/10 text-xs text-purple-dark font-medium mx-auto sm:mx-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>เวลาปัจจุบัน: <strong className="font-mono font-bold">{nowTimeStr} น.</strong></span>
            </div>
          )}
        </div>

        {/* ==============================================================
            SCHEDULE ITEMS LIST WITH 3-COLUMN TABLE LAYOUT
            (เวลา | กิจกรรม | สถานที่ — SINGLE ROW ON BOTH MOBILE & DESKTOP)
            ============================================================== */}
        {selectedDayNum === 0 && itemsByDay ? (
          /* Render 4 Days grouped sequentially */
          <div className="space-y-6 sm:space-y-7">
            {DAYS_META.map((d: DayMeta) => {
              const dayList = itemsByDay.get(d.dayNum) || [];
              if (dayList.length === 0) return null;
              return (
                <div key={d.dayNum} className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b-2 border-purple-primary/15">
                    <div>
                      <span className="text-[10px] font-bold text-purple-primary uppercase tracking-wider block">
                        วันที่ {d.dayNum}
                      </span>
                      <h3 className="text-xs sm:text-base font-bold text-purple-dark">
                        {d.title} • {d.subtitle}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-purple-primary/5 text-purple-dark text-[11px] sm:text-xs font-bold border border-purple-primary/10">
                      {dayList.length} รายการ
                    </span>
                  </div>

                  {/* Column Header: เวลา | กิจกรรม | สถานที่ (VISIBLE ON MOBILE & DESKTOP) */}
                  <ScheduleColumnHeaders />

                  <div className="space-y-1.5 sm:space-y-2">
                    {dayList.map((item, idx) => (
                      <ScheduleItemRow
                        key={`${item.dayNum}-${item.time}-${idx}`}
                        item={item}
                        status={getItemLiveStatus(item)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Render single day list */
          <div className="space-y-2">
            {/* Column Header: เวลา | กิจกรรม | สถานที่ (VISIBLE ON MOBILE & DESKTOP) */}
            <ScheduleColumnHeaders />

            <div className="space-y-1.5 sm:space-y-2">
              {filteredItems.map((item, idx) => (
                <ScheduleItemRow
                  key={`${item.dayNum}-${item.time}-${idx}`}
                  item={item}
                  ref={getItemLiveStatus(item) === "current" ? currentItemRef : undefined}
                  status={getItemLiveStatus(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State when filters yield no results */}
        {filteredItems.length === 0 && (
          <div className="p-8 sm:p-10 text-center rounded-2xl bg-white/70 border border-purple-primary/15 space-y-2 mt-4">
            <h4 className="text-sm font-bold text-purple-dark">ไม่พบกำหนดการตามคำค้นหา</h4>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              ลองล้างคำค้นหาเพื่อดูกิจกรรมทั้งหมด
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGroup("main");
              }}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-purple-primary text-white text-xs font-bold cursor-pointer hover:bg-purple-dark transition-colors"
            >
              รีเซ็ตการค้นหา
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

/* ================================================================
   COLUMN HEADERS COMPONENT: เวลา | กิจกรรม | สถานที่
   (Visible on both mobile & desktop)
   ================================================================ */

function ScheduleColumnHeaders() {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-purple-primary tracking-wide bg-purple-primary/5 rounded-xl border border-purple-primary/10">
      <div className="w-[84px] sm:w-[130px] flex-shrink-0 text-center">
        เวลา
      </div>
      <div className="flex-1 min-w-0 pl-1 sm:pl-2">
        กิจกรรม
      </div>
      <div className="w-[80px] sm:w-[160px] flex-shrink-0 text-right pr-1">
        สถานที่
      </div>
    </div>
  );
}

/* ================================================================
   ROW COMPONENT: STRICTLY SINGLE-ROW 3 COLUMNS ON MOBILE & DESKTOP
   ================================================================ */

interface RowProps {
  item: DisplayScheduleItem;
  status: "current" | "past" | "upcoming";
  ref?: React.Ref<HTMLDivElement>;
}

function ScheduleItemRow({
  item,
  status,
  ref,
}: RowProps) {
  const isCurrent = status === "current";
  const isPast = status === "past";

  return (
    <div
      ref={ref}
      className={`group px-2.5 py-2 sm:px-4 sm:py-3 rounded-xl border transition-all duration-300 ${
        isCurrent
          ? "bg-emerald-50/95 border-emerald-500 shadow-md ring-2 ring-emerald-400/30"
          : isPast
          ? "bg-white/35 border-purple-primary/5 opacity-40 hover:opacity-100 hover:bg-white/85 transition-opacity"
          : "bg-white/90 hover:bg-white border-purple-primary/10 hover:border-purple-primary/25 hover:shadow-xs"
      }`}
    >
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
        
        {/* Column 1: เวลา (Time & Duration) */}
        <div className="w-[84px] sm:w-[130px] flex-shrink-0 flex flex-col items-center justify-center whitespace-nowrap">
          <div
            className={`py-1 px-1 sm:px-2 rounded-lg font-mono text-[9px] sm:text-xs font-bold text-center tracking-tight sm:tracking-normal w-full whitespace-nowrap border transition-colors ${
              isCurrent
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : isPast
                ? "bg-purple-primary/5 text-purple-dark/45 border-purple-primary/5"
                : "bg-purple-primary/5 text-purple-dark border-purple-primary/10"
            }`}
          >
            {item.time}
          </div>
          {item.duration && (
            <span
              className={`text-[9px] sm:text-[10px] font-medium whitespace-nowrap mt-0.5 ${
                isCurrent
                  ? "text-emerald-800 font-bold"
                  : isPast
                  ? "text-foreground/30"
                  : "text-foreground/40"
              }`}
            >
              {item.duration} นาที
            </span>
          )}
        </div>

        {/* Column 2: กิจกรรม (Activity & Details) */}
        <div className="flex-1 min-w-0 pl-1 sm:pl-2 space-y-0.5">
          
          {/* Live Highlight Tag with pulsing dot */}
          {isCurrent && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>กำลังดำเนินอยู่ ณ เวลานี้</span>
            </div>
          )}

          {/* Activity Description (Bold & Prominent) */}
          <h2
            className={`text-xs sm:text-sm md:text-base font-bold leading-tight tracking-tight line-clamp-2 sm:line-clamp-none ${
              isCurrent
                ? "text-emerald-950 font-extrabold"
                : isPast
                ? "text-foreground/50 group-hover:text-foreground transition-colors"
                : "text-foreground group-hover:text-purple-dark transition-colors"
            }`}
          >
            {item.desc || item.title}
          </h2>

          {/* Activity Title (Subtle Subtitle if distinct) */}
          {item.desc && item.title && item.desc.trim() !== item.title.trim() && (
            <h3
              className={`text-[10px] sm:text-xs font-medium truncate sm:whitespace-normal ${
                isCurrent
                  ? "text-emerald-900 font-semibold"
                  : isPast
                  ? "text-purple-dark/40 group-hover:text-purple-dark transition-colors"
                  : "text-purple-dark/75 group-hover:text-purple-primary transition-colors"
              }`}
            >
              {item.title}
            </h3>
          )}

          {/* Tags: Note, Responsibility (Hidden or ultra-compact on mobile) */}
          {(item.note || item.dept) && (
            <div className={`flex flex-wrap items-center gap-1 pt-0.5 ${isPast ? "opacity-60 group-hover:opacity-100 transition-opacity" : ""}`}>
              {item.note && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[9px] sm:text-[10px] font-medium border border-amber-200/70 truncate max-w-[140px] sm:max-w-none">
                  {item.note}
                </span>
              )}

              {item.dept && (
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded bg-purple-primary/5 text-purple-dark text-[10px] border border-purple-primary/10 truncate">
                  ฝ่าย: {item.dept}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Column 3: สถานที่ (Location Only, Right Aligned) */}
        <div className="w-[80px] sm:w-[160px] flex-shrink-0 flex items-center justify-end">
          {item.location && item.location !== "-" ? (
            <span
              title={item.location}
              className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold border text-right transition-colors ${
                isCurrent
                  ? "bg-emerald-100/90 text-emerald-900 border-emerald-300 font-bold"
                  : isPast
                  ? "bg-purple-primary/5 text-purple-dark/45 border-purple-primary/5"
                  : "bg-purple-primary/5 text-purple-dark border-purple-primary/15"
              }`}
            >
              <span className="max-w-[75px] sm:max-w-[155px] truncate">{item.location}</span>
            </span>
          ) : (
            <span className="text-xs text-foreground/30">-</span>
          )}
        </div>

      </div>
    </div>
  );
}
