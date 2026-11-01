"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MASTER_CAMP_SCHEDULE,
  MasterScheduleItem,
} from "@/app/schedule/masterScheduleData";
import {
  ALL_CAMP_SCHEDULE,
  CampScheduleItem,
} from "@/app/schedule/campScheduleData";
import { supabase } from "@/app/lib/supabase";

export type ScheduleCategory = "activity" | "prayer" | "meal_break" | "travel";

export interface EditableSubgroupItem extends CampScheduleItem {
  id: string;
}

export const CATEGORY_MAP: Record<
  ScheduleCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  activity: {
    label: "กิจกรรม",
    bg: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-200",
  },
  prayer: {
    label: "ละหมาด & ศาสนกิจ",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
  },
  meal_break: {
    label: "อาหาร & พักผ่อน",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
  },
  travel: {
    label: "เดินทาง & รวมตัว",
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
  },
};

const DAYS_META = [
  { dayNum: 1, title: "ศุกร์ 6 พ.ย. 2569", subtitle: "วันรายงานตัว & พิธีเปิด", dateISO: "2026-11-06" },
  { dayNum: 2, title: "เสาร์ 7 พ.ย. 2569", subtitle: "กิจกรรมฐานวิทยาศาสตร์สุขภาพ", dateISO: "2026-11-07" },
  { dayNum: 3, title: "อาทิตย์ 8 พ.ย. 2569", subtitle: "กิจกรรมฐานวิทย์-เทคโน & มนุษย์-สังคม", dateISO: "2026-11-08" },
  { dayNum: 4, title: "จันทร์ 9 พ.ย. 2569", subtitle: "เสวนาวิชาการ & พิธีปิดค่าย", dateISO: "2026-11-09" },
];

const LOCAL_STORAGE_KEY = "gfd_admin_master_schedule_v1";
const LOCAL_STORAGE_SUBGROUP_KEY = "gfd_admin_subgroup_schedule_v1";

const DEFAULT_SUBGROUP_ITEMS: EditableSubgroupItem[] = ALL_CAMP_SCHEDULE.map((it, idx) => ({
  ...it,
  id: `sub-${it.dayNum}-${it.group.replace(/\s+/g, "_")}-${idx}`,
}));

// Time manipulation helpers
function extractEndAndStartTime(timeStr: string, fallbackStart = "09:00", fallbackEnd = "10:00") {
  if (!timeStr) return { start: fallbackStart, end: fallbackEnd };
  const parts = timeStr.split("-").map((s) => s.trim());
  const start = parts[0] || fallbackStart;
  const end = parts[1] || parts[0] || fallbackEnd;
  return { start, end };
}

function addMinutesToTime(timeStr: string, minutesToAdd = 60): string {
  if (!timeStr) return "10:00";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  let mins = parseInt(match[2], 10);
  let totalMins = hours * 60 + mins + minutesToAdd;
  totalMins = (totalMins + 1440) % 1440;
  const newHours = Math.floor(totalMins / 60);
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

function calculateDurationMinutes(startStr: string, endStr: string, fallback = 60): number {
  const mStart = (startStr || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  const mEnd = (endStr || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!mStart || !mEnd) return fallback;
  const startMins = parseInt(mStart[1], 10) * 60 + parseInt(mStart[2], 10);
  const endMins = parseInt(mEnd[1], 10) * 60 + parseInt(mEnd[2], 10);
  const diff = endMins - startMins;
  return diff > 0 ? diff : fallback;
}

export default function ScheduleAdminSection() {
  // Master schedule items (94 items)
  const [scheduleItems, setScheduleItems] = useState<MasterScheduleItem[]>([]);
  // Subgroup schedule items (725 items)
  const [subgroupItems, setSubgroupItems] = useState<EditableSubgroupItem[]>(DEFAULT_SUBGROUP_ITEMS);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Level 1: เลือกวันของค่าย (0 = รวมทั้ง 4 วัน, 1..4 = วันที่ 1..4)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(0);

  // Level 2: กำหนดการแยก ชาย - หญิง ("all" = รวมทั้งสองฝ่าย, "male" = มุสลีมีน, "female" = มุสลีมะฮฺ)
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");

  // Level 3: เลือกกลุ่มย่อย ("main" = กำหนดการหลักภาพรวม, or specific group e.g. "มุสลีมีน กลุ่ม 1")
  const [selectedGroup, setSelectedGroup] = useState<string>("main");

  // Secondary Filters
  const [selectedCategory, setSelectedCategory] = useState<"all" | ScheduleCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State (Purely for Adding New Items)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding
  const [formDayNum, setFormDayNum] = useState<number>(1);
  const [formTime, setFormTime] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLocMale, setFormLocMale] = useState("");
  const [formLocFemale, setFormLocFemale] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formGroup, setFormGroup] = useState("");
  const [formGender, setFormGender] = useState<"male" | "female">("male");
  const [formDept, setFormDept] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formCategory, setFormCategory] = useState<ScheduleCategory>("activity");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Available subgroups on Day 2 & Day 3
  const availableGroups = useMemo(() => {
    if (selectedDayNum !== 2 && selectedDayNum !== 3) return [];

    const groupsSet = new Set<string>();
    subgroupItems.forEach((item) => {
      if (item.dayNum !== selectedDayNum) return;
      if (selectedGender !== "all" && item.gender !== selectedGender) return;
      if (item.group === "มุสลีมีน" || item.group === "มุสลีมะฮฺ") return;
      groupsSet.add(item.group);
    });

    const list = Array.from(groupsSet);
    list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    return list;
  }, [selectedDayNum, selectedGender, subgroupItems]);

  // Keep selectedGroup valid when day or gender changes
  useEffect(() => {
    if (selectedDayNum !== 2 && selectedDayNum !== 3) {
      setSelectedGroup("main");
    } else {
      if (selectedGroup !== "main" && !availableGroups.includes(selectedGroup)) {
        setSelectedGroup("main");
      }
    }
  }, [selectedDayNum, selectedGender, availableGroups, selectedGroup]);

  // Load schedule data on mount
  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);

      // 1. Master Schedule
      let masterLoaded = false;
      try {
        const { data, error } = await supabase
          .from("camp_schedule")
          .select("*")
          .eq("schedule_type", "master")
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: MasterScheduleItem[] = data.map((d: any) => ({
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
          setScheduleItems(mapped);
          masterLoaded = true;
        }
      } catch (err) {
        console.warn("Supabase fetch failed for master schedule:", err);
      }

      if (!masterLoaded) {
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setScheduleItems(parsed);
              masterLoaded = true;
            }
          }
        } catch (e) {}
      }

      if (!masterLoaded) {
        setScheduleItems(MASTER_CAMP_SCHEDULE);
      }

      // 2. Subgroup Schedule
      let subgroupLoaded = false;
      try {
        const { data, error } = await supabase
          .from("camp_schedule")
          .select("*")
          .eq("schedule_type", "subgroup")
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: EditableSubgroupItem[] = data.map((d: any) => ({
            id: d.id,
            dayNum: d.day_num,
            dayLabel: d.date_str,
            dateISO: d.date_iso,
            gender: d.gender || "male",
            group: d.target_group || "มุสลีมีน",
            startTime: d.start_time,
            endTime: d.end_time,
            time: d.time,
            duration: d.duration,
            title: d.title,
            desc: d.description || d.title,
            location: d.gender === "female" ? (d.loc_female || d.loc_male || "") : (d.loc_male || d.loc_female || ""),
            dept: d.dept || "",
            note: d.note || "",
            category: d.category || "activity",
          }));
          setSubgroupItems(mapped);
          subgroupLoaded = true;
        }
      } catch (err) {
        console.warn("Supabase fetch failed for subgroup schedule:", err);
      }

      if (!subgroupLoaded) {
        try {
          const cachedSub = localStorage.getItem(LOCAL_STORAGE_SUBGROUP_KEY);
          if (cachedSub) {
            const parsed = JSON.parse(cachedSub);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSubgroupItems(parsed);
              subgroupLoaded = true;
            }
          }
        } catch (e) {}
      }

      if (!subgroupLoaded) {
        setSubgroupItems(DEFAULT_SUBGROUP_ITEMS);
      }

      setLoading(false);
    };

    loadSchedule();
  }, []);

  // Persist Master Schedule
  const persistSchedule = async (newItems: MasterScheduleItem[], notifyText = "บันทึกเรียบร้อย") => {
    setScheduleItems(newItems);
    setIsSaving(true);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
      window.dispatchEvent(new Event("gfd_schedule_updated"));
    } catch (err) {
      console.warn("localStorage save error:", err);
    }

    try {
      const records = newItems.map((it, idx) => ({
        id: it.id,
        schedule_type: "master",
        day_num: it.dayNum,
        date_str: it.dateStr,
        date_iso: it.dateISO,
        time: it.time,
        start_time: it.startTime,
        end_time: it.endTime,
        duration: it.duration,
        title: it.title,
        description: it.desc,
        loc_male: it.locMale,
        loc_female: it.locFemale,
        dept: it.dept,
        note: it.note,
        category: it.category,
        sort_order: idx + 1,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("camp_schedule").upsert(records, { onConflict: "id" });
      if (error) {
        console.warn("Supabase schedule upsert warning:", error.message);
      }
    } catch (err) {
      console.warn("Supabase save error:", err);
    }

    setIsSaving(false);
    showToast(notifyText);
  };

  // Persist Subgroup Schedule
  const persistSubgroups = async (newItems: EditableSubgroupItem[], notifyText = "บันทึกเรียบร้อย") => {
    setSubgroupItems(newItems);
    setIsSaving(true);

    try {
      localStorage.setItem(LOCAL_STORAGE_SUBGROUP_KEY, JSON.stringify(newItems));
      window.dispatchEvent(new Event("gfd_schedule_updated"));
    } catch (err) {
      console.warn("localStorage save error:", err);
    }

    try {
      const records = newItems.map((it, idx) => ({
        id: it.id,
        schedule_type: "subgroup",
        day_num: it.dayNum,
        date_str: it.dayLabel,
        date_iso: it.dateISO,
        time: it.time,
        start_time: it.startTime,
        end_time: it.endTime,
        duration: it.duration,
        title: it.title,
        description: it.desc,
        loc_male: it.gender === "male" ? it.location : "",
        loc_female: it.gender === "female" ? it.location : "",
        dept: it.dept,
        note: it.note,
        category: it.category,
        gender: it.gender,
        target_group: it.group,
        sort_order: idx + 1,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("camp_schedule").upsert(records, { onConflict: "id" });
      if (error) {
        console.warn("Supabase subgroup schedule upsert warning:", error.message);
      }
    } catch (err) {
      console.warn("Supabase save error:", err);
    }

    setIsSaving(false);
    showToast(notifyText);
  };

  // ==============================================================
  // INLINE EDITING HANDLERS (EDIT DIRECTLY IN TABLE)
  // ==============================================================

  const handleUpdateMasterField = (
    id: string,
    field: keyof MasterScheduleItem,
    value: any
  ) => {
    const updated = scheduleItems.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === "time" && typeof value === "string") {
        const parts = value.split("-").map((s) => s.trim());
        if (parts.length === 2) {
          next.startTime = parts[0];
          next.endTime = parts[1];
        }
      }
      return next;
    });

    setScheduleItems(updated);

    // Auto-save debounce (600ms)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistSchedule(updated, "บันทึกข้อมูลในตารางเรียบร้อย");
    }, 600);
  };

  const handleUpdateSubgroupField = (
    id: string,
    field: keyof EditableSubgroupItem,
    value: any
  ) => {
    const updated = subgroupItems.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === "time" && typeof value === "string") {
        const parts = value.split("-").map((s) => s.trim());
        if (parts.length === 2) {
          next.startTime = parts[0];
          next.endTime = parts[1];
        }
      }
      return next;
    });

    setSubgroupItems(updated);

    // Auto-save debounce (600ms)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistSubgroups(updated, "บันทึกข้อมูลกลุ่มย่อยในตารางเรียบร้อย");
    }, 600);
  };

  // Filtered Master Items
  const filteredMasterList = useMemo(() => {
    return scheduleItems.filter((item) => {
      if (selectedDayNum !== 0 && item.dayNum !== selectedDayNum) return false;
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const combined = `${item.title} ${item.desc} ${item.locMale} ${item.locFemale} ${item.note} ${item.dept}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }
      return true;
    });
  }, [scheduleItems, selectedDayNum, selectedCategory, searchQuery]);

  // Filtered Subgroup Items
  const filteredSubgroupList = useMemo(() => {
    if (selectedGroup === "main") return [];
    return subgroupItems.filter((item) => {
      if (item.dayNum !== selectedDayNum) return false;
      if (item.group !== selectedGroup) return false;
      if (selectedGender !== "all" && item.gender !== selectedGender) return false;
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const combined = `${item.title} ${item.desc} ${item.location} ${item.note} ${item.dept} ${item.group}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }
      return true;
    });
  }, [subgroupItems, selectedDayNum, selectedGroup, selectedGender, selectedCategory, searchQuery]);

  // Is currently managing Master or Subgroup
  const isMasterMode = selectedGroup === "main";

  // Open Add Modal with auto-detected start time from last item of the day
  const handleOpenAdd = () => {
    const targetDay = selectedDayNum === 0 ? 1 : selectedDayNum;
    const itemsForDay = isMasterMode
      ? scheduleItems.filter((it) => it.dayNum === targetDay)
      : subgroupItems.filter((it) => it.dayNum === targetDay && it.group === (selectedGroup !== "main" ? selectedGroup : "มุสลีมีน กลุ่ม 1"));

    let defaultStart = "09:00";
    let defaultEnd = "10:00";
    let defaultDur = "60";

    if (itemsForDay.length > 0) {
      const lastItem = itemsForDay[itemsForDay.length - 1];
      const { end } = extractEndAndStartTime(lastItem.time || `${lastItem.startTime} - ${lastItem.endTime}`);
      if (end) {
        defaultStart = end;
        defaultEnd = addMinutesToTime(defaultStart, 60);
      }
    }

    setFormDayNum(targetDay);
    setFormTime(`${defaultStart} - ${defaultEnd}`);
    setFormStartTime(defaultStart);
    setFormEndTime(defaultEnd);
    setFormDuration(defaultDur);
    setFormTitle("");
    setFormDesc("");
    setFormLocMale("");
    setFormLocFemale("");
    setFormLocation("");
    setFormGroup(selectedGroup !== "main" ? selectedGroup : "มุสลีมีน กลุ่ม 1");
    setFormGender(selectedGroup.includes("มุสลีมะฮฺ") ? "female" : "male");
    setFormDept("");
    setFormNote("");
    setFormCategory("activity");
    setIsAddModalOpen(true);
  };

  // When changing day inside Add Modal, auto-update start time to the last item of that day
  const handleFormDayChange = (newDay: number) => {
    setFormDayNum(newDay);
    const itemsForDay = isMasterMode
      ? scheduleItems.filter((it) => it.dayNum === newDay)
      : subgroupItems.filter((it) => it.dayNum === newDay && it.group === (formGroup || selectedGroup));

    if (itemsForDay.length > 0) {
      const lastItem = itemsForDay[itemsForDay.length - 1];
      const { end } = extractEndAndStartTime(lastItem.time || `${lastItem.startTime} - ${lastItem.endTime}`);
      if (end) {
        const nextEnd = addMinutesToTime(end, 60);
        setFormStartTime(end);
        setFormEndTime(nextEnd);
        setFormTime(`${end} - ${nextEnd}`);
        setFormDuration("60");
      }
    }
  };

  // Save Add Modal Form
  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDesc = formDesc.trim() || formTitle.trim();
    const finalTitle = formTitle.trim() || formDesc.trim();
    if (!finalDesc) {
      alert("กรุณากรอกชื่อกิจกรรมหลัก");
      return;
    }

    const dayMeta = DAYS_META.find((d) => d.dayNum === formDayNum) || DAYS_META[0];

    if (isMasterMode) {
      const newItem: MasterScheduleItem = {
        id: `master-d${formDayNum}-${Date.now()}`,
        dayNum: formDayNum,
        dateStr: dayMeta.title,
        dateISO: dayMeta.dateISO,
        time: formTime.trim(),
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim(),
        duration: formDuration.trim(),
        title: finalTitle,
        desc: finalDesc,
        locMale: formLocMale.trim(),
        locFemale: formLocFemale.trim(),
        dept: formDept.trim(),
        note: formNote.trim(),
        category: formCategory,
      };

      const next = [...scheduleItems];
      let insertIdx = -1;
      for (let i = scheduleItems.length - 1; i >= 0; i--) {
        if (scheduleItems[i].dayNum === formDayNum) {
          insertIdx = i;
          break;
        }
      }
      if (insertIdx !== -1) {
        next.splice(insertIdx + 1, 0, newItem);
      } else {
        next.push(newItem);
      }
      persistSchedule(next, "เพิ่มกิจกรรมกำหนดการหลักเรียบร้อยแล้ว");
    } else {
      const targetGrp = formGroup || selectedGroup;
      const targetGndr = targetGrp.includes("มุสลีมะฮฺ") ? "female" : formGender;

      const newItem: EditableSubgroupItem = {
        id: `sub-d${formDayNum}-${targetGrp.replace(/\s+/g, "_")}-${Date.now()}`,
        dayNum: formDayNum,
        dayLabel: dayMeta.title,
        dateISO: dayMeta.dateISO,
        gender: targetGndr,
        group: targetGrp,
        time: formTime.trim(),
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim(),
        duration: formDuration.trim(),
        title: finalTitle,
        desc: finalDesc,
        location: formLocation.trim(),
        dept: formDept.trim(),
        note: formNote.trim(),
        category: formCategory,
      };

      const next = [...subgroupItems];
      let insertIdx = -1;
      for (let i = subgroupItems.length - 1; i >= 0; i--) {
        if (subgroupItems[i].dayNum === formDayNum && subgroupItems[i].group === targetGrp) {
          insertIdx = i;
          break;
        }
      }
      if (insertIdx !== -1) {
        next.splice(insertIdx + 1, 0, newItem);
      } else {
        next.push(newItem);
      }
      persistSubgroups(next, `เพิ่มกิจกรรมสำหรับ ${targetGrp} เรียบร้อยแล้ว`);
    }

    setIsAddModalOpen(false);
  };

  // Delete Item
  const handleDeleteMaster = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบกิจกรรม "${title}" ใช่หรือไม่?`)) return;
    const next = scheduleItems.filter((it) => it.id !== id);
    try {
      await supabase.from("camp_schedule").delete().eq("id", id);
    } catch {}
    persistSchedule(next, "ลบกิจกรรมเรียบร้อยแล้ว");
  };

  const handleDeleteSubgroup = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบกิจกรรม "${title}" ของกลุ่มนี้ใช่หรือไม่?`)) return;
    const next = subgroupItems.filter((it) => it.id !== id);
    try {
      await supabase.from("camp_schedule").delete().eq("id", id);
    } catch {}
    persistSubgroups(next, "ลบกิจกรรมกลุ่มย่อยเรียบร้อยแล้ว");
  };

  // Insert Next Row: Adds a new schedule line directly below, starting with this line's end time!
  const handleInsertNextMaster = (item: MasterScheduleItem) => {
    const { end } = extractEndAndStartTime(item.time || `${item.startTime} - ${item.endTime}`);
    const nextStart = end || item.endTime || "10:00";
    const durMins = parseInt(item.duration, 10) || 60;
    const nextEnd = addMinutesToTime(nextStart, durMins > 0 ? durMins : 60);

    const newItem: MasterScheduleItem = {
      id: `master-d${item.dayNum}-${Date.now()}`,
      dayNum: item.dayNum,
      dateStr: item.dateStr,
      dateISO: item.dateISO,
      startTime: nextStart,
      endTime: nextEnd,
      time: `${nextStart} - ${nextEnd}`,
      duration: String(durMins > 0 ? durMins : 60),
      title: "",
      desc: "",
      locMale: item.locMale || "",
      locFemale: item.locFemale || "",
      dept: item.dept || "",
      note: "",
      category: item.category || "activity",
    };

    const globalIdx = scheduleItems.findIndex((it) => it.id === item.id);
    const next = [...scheduleItems];
    if (globalIdx !== -1) {
      next.splice(globalIdx + 1, 0, newItem);
    } else {
      next.push(newItem);
    }
    persistSchedule(next, `เพิ่มกำหนดการบรรทัดถัดไปแล้ว (เริ่มเวลา ${nextStart} น.)`);
  };

  const handleInsertNextSubgroup = (item: EditableSubgroupItem) => {
    const { end } = extractEndAndStartTime(item.time || `${item.startTime} - ${item.endTime}`);
    const nextStart = end || item.endTime || "10:00";
    const durMins = parseInt(item.duration, 10) || 60;
    const nextEnd = addMinutesToTime(nextStart, durMins > 0 ? durMins : 60);

    const newItem: EditableSubgroupItem = {
      id: `sub-d${item.dayNum}-${item.group.replace(/\s+/g, "_")}-${Date.now()}`,
      dayNum: item.dayNum,
      dayLabel: item.dayLabel,
      dateISO: item.dateISO,
      gender: item.gender,
      group: item.group,
      startTime: nextStart,
      endTime: nextEnd,
      time: `${nextStart} - ${nextEnd}`,
      duration: String(durMins > 0 ? durMins : 60),
      title: "",
      desc: "",
      location: item.location || "",
      dept: item.dept || "",
      note: "",
      category: item.category || "activity",
    };

    const globalIdx = subgroupItems.findIndex((it) => it.id === item.id);
    const next = [...subgroupItems];
    if (globalIdx !== -1) {
      next.splice(globalIdx + 1, 0, newItem);
    } else {
      next.push(newItem);
    }
    persistSubgroups(next, `เพิ่มกำหนดการบรรทัดถัดไป (${item.group}) แล้ว (เริ่มเวลา ${nextStart} น.)`);
  };

  // Duplicate Item (Also sets start time to previous item's end time)
  const handleDuplicateMaster = (item: MasterScheduleItem) => {
    const { end } = extractEndAndStartTime(item.time || `${item.startTime} - ${item.endTime}`);
    const nextStart = end || item.endTime || "10:00";
    const durMins = parseInt(item.duration, 10) || 60;
    const nextEnd = addMinutesToTime(nextStart, durMins > 0 ? durMins : 60);

    const copy: MasterScheduleItem = {
      ...item,
      id: `master-d${item.dayNum}-${Date.now()}`,
      title: `${item.title} (สำเนา)`,
      startTime: nextStart,
      endTime: nextEnd,
      time: `${nextStart} - ${nextEnd}`,
      duration: String(durMins > 0 ? durMins : 60),
    };
    const idx = scheduleItems.findIndex((it) => it.id === item.id);
    const next = [...scheduleItems];
    next.splice(idx + 1, 0, copy);
    persistSchedule(next, `คัดลอกกิจกรรมแล้ว (เริ่มเวลา ${nextStart} น.)`);
  };

  const handleDuplicateSubgroup = (item: EditableSubgroupItem) => {
    const { end } = extractEndAndStartTime(item.time || `${item.startTime} - ${item.endTime}`);
    const nextStart = end || item.endTime || "10:00";
    const durMins = parseInt(item.duration, 10) || 60;
    const nextEnd = addMinutesToTime(nextStart, durMins > 0 ? durMins : 60);

    const copy: EditableSubgroupItem = {
      ...item,
      id: `sub-d${item.dayNum}-${Date.now()}`,
      title: `${item.title} (สำเนา)`,
      startTime: nextStart,
      endTime: nextEnd,
      time: `${nextStart} - ${nextEnd}`,
      duration: String(durMins > 0 ? durMins : 60),
    };
    const idx = subgroupItems.findIndex((it) => it.id === item.id);
    const next = [...subgroupItems];
    next.splice(idx + 1, 0, copy);
    persistSubgroups(next, `คัดลอกกิจกรรมกลุ่มย่อยแล้ว (เริ่มเวลา ${nextStart} น.)`);
  };

  // Quick Sync: Adjust current row's start time to match previous row's end time
  const handleSyncTimeToPrevMaster = (id: string, prevEndTime: string) => {
    const updated = scheduleItems.map((item) => {
      if (item.id !== id) return item;
      const durMins = parseInt(item.duration, 10) || calculateDurationMinutes(item.startTime, item.endTime, 60);
      const newStart = prevEndTime;
      const newEnd = addMinutesToTime(newStart, durMins > 0 ? durMins : 60);
      return {
        ...item,
        startTime: newStart,
        endTime: newEnd,
        time: `${newStart} - ${newEnd}`,
        duration: String(durMins > 0 ? durMins : 60),
      };
    });
    setScheduleItems(updated);
    persistSchedule(updated, `ปรับเวลาเริ่มเป็น ${prevEndTime} น. เรียบร้อยแล้ว`);
  };

  const handleSyncTimeToPrevSubgroup = (id: string, prevEndTime: string) => {
    const updated = subgroupItems.map((item) => {
      if (item.id !== id) return item;
      const durMins = parseInt(item.duration, 10) || calculateDurationMinutes(item.startTime, item.endTime, 60);
      const newStart = prevEndTime;
      const newEnd = addMinutesToTime(newStart, durMins > 0 ? durMins : 60);
      return {
        ...item,
        startTime: newStart,
        endTime: newEnd,
        time: `${newStart} - ${newEnd}`,
        duration: String(durMins > 0 ? durMins : 60),
      };
    });
    setSubgroupItems(updated);
    persistSubgroups(updated, `ปรับเวลาเริ่มเป็น ${prevEndTime} น. เรียบร้อยแล้ว`);
  };

  // Move Up & Down
  const handleMoveUpMaster = (index: number) => {
    if (index === 0) return;
    const next = [...scheduleItems];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    persistSchedule(next, "ย้ายลำดับเรียบร้อย");
  };

  const handleMoveDownMaster = (index: number) => {
    if (index === scheduleItems.length - 1) return;
    const next = [...scheduleItems];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    persistSchedule(next, "ย้ายลำดับเรียบร้อย");
  };

  const handleMoveUpSubgroup = (index: number) => {
    if (index === 0) return;
    const next = [...subgroupItems];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    persistSubgroups(next, "ย้ายลำดับเรียบร้อย");
  };

  const handleMoveDownSubgroup = (index: number) => {
    if (index === subgroupItems.length - 1) return;
    const next = [...subgroupItems];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    persistSubgroups(next, "ย้ายลำดับเรียบร้อย");
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (isMasterMode) {
      if (!confirm("คุณต้องการรีเซ็ตกำหนดการหลักกลับเป็นค่าเริ่มต้น 94 รายการใช่หรือไม่?")) return;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      persistSchedule(MASTER_CAMP_SCHEDULE, "รีเซ็ตกำหนดการหลักเป็นค่าเริ่มต้นแล้ว");
    } else {
      if (!confirm(`คุณต้องการรีเซ็ตกำหนดการกลุ่มย่อยกลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) return;
      localStorage.removeItem(LOCAL_STORAGE_SUBGROUP_KEY);
      persistSubgroups(DEFAULT_SUBGROUP_ITEMS, "รีเซ็ตกำหนดการกลุ่มย่อยเป็นค่าเริ่มต้นแล้ว");
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const exportData = isMasterMode ? scheduleItems : subgroupItems;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `guidance_for_dream_${isMasterMode ? "master_schedule" : "subgroups_schedule"}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 text-zinc-900">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold shadow-2xl border border-zinc-700 animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 text-xs font-bold border border-zinc-300">
              Schedule CMS
            </span>
            <span className="text-xs text-zinc-600">
              {isMasterMode
                ? `กำหนดการหลักทั้งหมด ${scheduleItems.length} รายการ`
                : `กำหนดการกลุ่มย่อย: ${selectedGroup} (${filteredSubgroupList.length} รายการ)`}
            </span>
            {isSaving && (
              <span className="text-[11px] text-zinc-900 font-bold animate-pulse">กำลังบันทึก...</span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-black mt-1">
            จัดการกำหนดการค่าย (แอดมิน)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            คลิกพิมพ์แก้ไขในตารางได้โดยตรง ข้อมูลจะถูกบันทึกและซิงก์สดไปหน้าเว็บทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span>
            <span>{isMasterMode ? "เพิ่มกิจกรรมหลักใหม่" : `เพิ่มกิจกรรม (${selectedGroup})`}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-300 transition-all cursor-pointer"
            title="ส่งออกข้อมูลเป็น JSON"
          >
            ส่งออก JSON
          </button>

          <button
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all cursor-pointer"
            title="คืนค่าเป็นกำหนดการทางการเริ่มต้น"
          >
            รีเซ็ตค่าเริ่มต้น
          </button>
        </div>
      </div>

      {/* Structured Filters: 3 Levels matching the website */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        
        {/* ==============================================================
            ระดับที่ 1: เลือกวันของค่าย
            ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-black">
              ระดับที่ 1: เลือกวันของค่าย
            </span>
            <span className="text-[11px] text-zinc-500">
              4 วัน 3 คืน (6 - 9 พ.ย. 2569)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => setSelectedDayNum(0)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedDayNum === 0
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                selectedDayNum === 0 ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-800"
              }`}>
                ภาพรวม
              </span>
              <div className="font-bold text-xs sm:text-sm mt-1">รวมทั้ง 4 วัน</div>
              <div className={`text-[10px] truncate ${selectedDayNum === 0 ? "text-zinc-300" : "text-zinc-500"}`}>
                ทุกกิจกรรม ({scheduleItems.length})
              </div>
            </button>

            {DAYS_META.map((d) => {
              const isSelected = selectedDayNum === d.dayNum;
              const count = scheduleItems.filter((it) => it.dayNum === d.dayNum).length;
              return (
                <button
                  key={d.dayNum}
                  onClick={() => setSelectedDayNum(d.dayNum)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                      isSelected ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-800"
                    }`}>
                      วันที่ {d.dayNum}
                    </span>
                    <span className={`text-[10px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>{count} รายการ</span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm mt-1">{d.title.split(" ")[0]} {d.title.split(" ")[1]}</div>
                  <div className={`text-[10px] truncate ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                    {d.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==============================================================
            ระดับที่ 2 & ระดับที่ 3: กำหนดการแยก ชาย - หญิง & กลุ่มย่อย
            ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start pt-3.5 border-t border-zinc-200">
          
          {/* ระดับที่ 2: กำหนดการแยก ชาย - หญิง */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-black">
                ระดับที่ 2: กำหนดการแยก ชาย - หญิง
              </span>
              <span className="text-[10px] text-zinc-500">
                {selectedGender === "all" ? "รวมทั้งสองฝ่าย" : selectedGender === "male" ? "มุสลีมีน (ชาย)" : "มุสลีมะฮฺ (หญิง)"}
              </span>
            </div>
            <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 w-full">
              <button
                type="button"
                onClick={() => setSelectedGender("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 text-center ${
                  selectedGender === "all"
                    ? "bg-black text-white shadow-sm"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                รวมทั้งสองฝ่าย
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender("male")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 text-center ${
                  selectedGender === "male"
                    ? "bg-black text-white shadow-sm"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                มุสลีมีน (ชาย)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender("female")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 text-center ${
                  selectedGender === "female"
                    ? "bg-black text-white shadow-sm"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                มุสลีมะฮฺ (หญิง)
              </button>
            </div>
          </div>

          {/* ระดับที่ 3: เลือกกลุ่มย่อย */}
          <div className="md:col-span-7 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-black">
                ระดับที่ 3: เลือกกลุ่มย่อย {availableGroups.length > 0 ? `(${availableGroups.length} กลุ่ม)` : ""}
              </span>
              {selectedGroup !== "main" && (
                <span className="text-[10px] text-black font-extrabold">
                  กำลังเลือก: {selectedGroup}
                </span>
              )}
            </div>

            {availableGroups.length === 0 ? (
              <div className="py-2.5 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-medium text-center">
                {selectedDayNum === 0
                  ? "กำหนดการหลักภาพรวมทั้งค่าย 4 วัน 3 คืน"
                  : "กำหนดการหลักภาพรวม (ทุกกลุ่มทำกิจกรรมร่วมกัน)"}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 max-h-36 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedGroup("main")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGroup === "main"
                      ? "bg-black text-white shadow-sm"
                      : "bg-white text-zinc-700 hover:text-black border border-zinc-200"
                  }`}
                >
                  กำหนดการหลัก
                </button>

                {availableGroups.map((grp) => {
                  const isSelected = selectedGroup === grp;
                  const isMale = grp.includes("มุสลีมีน");
                  const shortName = grp
                    .replace("มุสลีมีน ", "")
                    .replace("มุสลีมะฮฺ ", "")
                    .trim();
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-black text-white shadow-sm"
                          : "bg-white text-zinc-700 hover:text-black border border-zinc-200"
                      }`}
                    >
                      {selectedGender === "all" && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                            isMale
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {isMale ? "ช" : "ญ"}
                        </span>
                      )}
                      <span>{shortName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* หมวดหมู่ & ค้นหา */}
        <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-600 mr-1">หมวดหมู่:</span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                selectedCategory === "all"
                  ? "bg-black text-white border-black"
                  : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:text-black"
              }`}
            >
              ทั้งหมด
            </button>
            {(Object.keys(CATEGORY_MAP) as ScheduleCategory[]).map((catKey) => {
              const cat = CATEGORY_MAP[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                    isSelected
                      ? "bg-black text-white border-black"
                      : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:text-black"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, สถานที่, ฝ่าย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-black font-bold"
              >
                ✕
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ==============================================================
          SCHEDULE ITEMS MANAGEMENT TABLE (INLINE EDITING - WHITE/BLACK THEME)
          ============================================================== */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-extrabold text-black">
              {isMasterMode
                ? `ตารางกำหนดการหลักภาพรวม (${filteredMasterList.length} รายการ)`
                : `ตารางหมุนเวียนกลุ่ม: ${selectedGroup} (${filteredSubgroupList.length} รายการ)`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              แก้ไขในตารางได้ทันที (Auto-Save)
            </span>
            {isSaving && (
              <span className="text-[11px] text-zinc-900 font-bold animate-pulse">กำลังบันทึก...</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            กำลังโหลดข้อมูลกำหนดการ...
          </div>
        ) : isMasterMode ? (
          // ================= MASTER SCHEDULE TABLE (INLINE EDITABLE) =================
          filteredMasterList.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm space-y-2">
              <p>ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>
              <button
                onClick={() => {
                  setSelectedDayNum(0);
                  setSelectedGender("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-black text-white text-xs font-bold"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-2 text-center w-20">วัน</th>
                    <th className="py-3 px-2 text-center w-36">เวลา (เริ่ม - จบ)</th>
                    <th className="py-3 px-3 min-w-[260px]">กิจกรรมหลัก / รายละเอียด</th>
                    <th className={`py-3 px-2 w-40 ${selectedGender === "male" ? "text-purple-900 font-black" : ""}`}>
                      สถานที่ มุสลีมีน (ชาย)
                    </th>
                    <th className={`py-3 px-2 w-40 ${selectedGender === "female" ? "text-pink-900 font-black" : ""}`}>
                      สถานที่ มุสลีมะฮฺ (หญิง)
                    </th>
                    <th className="py-3 px-2 w-36">ฝ่ายรับผิดชอบ</th>
                    <th className="py-3 px-2 w-40">หมายเหตุ</th>
                    <th className="py-3 px-2 text-center w-28">หมวดหมู่</th>
                    <th className="py-3 px-2 text-center w-24">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredMasterList.map((item, idx) => {
                    const globalIdx = scheduleItems.findIndex((it) => it.id === item.id);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 transition-colors group"
                      >
                        {/* 1. Day Selector */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <select
                            value={item.dayNum}
                            onChange={(e) => handleUpdateMasterField(item.id, "dayNum", Number(e.target.value))}
                            className="px-2 py-1 rounded-md bg-zinc-100 text-black text-[11px] font-bold border border-zinc-300 cursor-pointer focus:ring-1 focus:ring-black outline-none"
                            title="เปลี่ยนวันที่ของกิจกรรม"
                          >
                            <option value={1}>วัน 1</option>
                            <option value={2}>วัน 2</option>
                            <option value={3}>วัน 3</option>
                            <option value={4}>วัน 4</option>
                          </select>
                        </td>

                        {/* 2. Time (Editable in place) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) => handleUpdateMasterField(item.id, "time", e.target.value)}
                            className="font-mono font-bold text-center text-xs text-black bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-300 rounded-lg px-2 py-1 w-28 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="10:00 - 12:00"
                          />
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <input
                              type="text"
                              value={item.duration || ""}
                              onChange={(e) => handleUpdateMasterField(item.id, "duration", e.target.value)}
                              className="text-[10px] text-center text-zinc-600 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5 w-12 focus:border-black outline-none"
                              placeholder="60"
                            />
                            <span className="text-[10px] text-zinc-400">นาที</span>
                          </div>

                          {/* Smart Sync to Previous Row's End Time if mismatch */}
                          {(() => {
                            if (idx === 0) return null;
                            const prev = filteredMasterList[idx - 1];
                            if (!prev || prev.dayNum !== item.dayNum) return null;
                            const prevEnd = extractEndAndStartTime(prev.time || `${prev.startTime} - ${prev.endTime}`).end;
                            const curStart = extractEndAndStartTime(item.time || `${item.startTime} - ${item.endTime}`).start;
                            if (prevEnd && curStart && prevEnd !== curStart) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleSyncTimeToPrevMaster(item.id, prevEnd)}
                                  className="mt-1 text-[10px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                  title={`คลิกเพื่อปรับให้เริ่มต่อจากเวลาสิ้นสุดแถวก่อนหน้า (${prevEnd} น.)`}
                                >
                                  <span>⏱️ ต่อ {prevEnd}</span>
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </td>

                        {/* 3. Title & Desc (Editable in place - Swapped to match front-end web layout) */}
                        <td className="py-2.5 px-3 min-w-[260px]">
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => handleUpdateMasterField(item.id, "desc", e.target.value)}
                            className="font-bold text-black text-xs w-full bg-zinc-50/70 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-2.5 py-1 outline-none transition-all"
                            placeholder="กิจกรรมหลัก (แสดงตัวหนาด้านบน)..."
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateMasterField(item.id, "title", e.target.value)}
                            className="text-[11px] text-zinc-600 w-full bg-zinc-50/50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-black rounded-lg px-2.5 py-0.5 mt-1 outline-none transition-all"
                            placeholder="หัวข้อย่อย / รายละเอียด (แสดงบรรทัดล่าง)..."
                          />
                        </td>

                        {/* 4. Location Male (Editable in place) */}
                        <td className="py-2.5 px-2 w-40">
                          <input
                            type="text"
                            value={item.locMale}
                            onChange={(e) => handleUpdateMasterField(item.id, "locMale", e.target.value)}
                            className={`text-xs text-black w-full bg-zinc-50/80 hover:bg-white focus:bg-white border rounded-lg px-2.5 py-1 outline-none transition-all ${
                              selectedGender === "male"
                                ? "border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold bg-purple-50/40"
                                : "border-zinc-300 focus:border-black"
                            }`}
                            placeholder="สถานที่ฝ่ายชาย..."
                          />
                        </td>

                        {/* 5. Location Female (Editable in place) */}
                        <td className="py-2.5 px-2 w-40">
                          <input
                            type="text"
                            value={item.locFemale}
                            onChange={(e) => handleUpdateMasterField(item.id, "locFemale", e.target.value)}
                            className={`text-xs text-black w-full bg-zinc-50/80 hover:bg-white focus:bg-white border rounded-lg px-2.5 py-1 outline-none transition-all ${
                              selectedGender === "female"
                                ? "border-pink-600 focus:ring-1 focus:ring-pink-600 font-bold bg-pink-50/40"
                                : "border-zinc-300 focus:border-black"
                            }`}
                            placeholder="สถานที่ฝ่ายหญิง..."
                          />
                        </td>

                        {/* 6. Dept (Editable in place) */}
                        <td className="py-2.5 px-2 w-36">
                          <input
                            type="text"
                            value={item.dept}
                            onChange={(e) => handleUpdateMasterField(item.id, "dept", e.target.value)}
                            className="text-xs text-zinc-800 w-full bg-zinc-50/80 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-2 py-1 outline-none transition-all"
                            placeholder="ฝ่ายรับผิดชอบ..."
                          />
                        </td>

                        {/* 7. Note (Editable in place) */}
                        <td className="py-2.5 px-2 w-40">
                          <input
                            type="text"
                            value={item.note}
                            onChange={(e) => handleUpdateMasterField(item.id, "note", e.target.value)}
                            className="text-xs text-zinc-800 w-full bg-zinc-50/80 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-2 py-1 outline-none transition-all"
                            placeholder="หมายเหตุ..."
                          />
                        </td>

                        {/* 8. Category Dropdown (Direct in Cell) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap w-28">
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateMasterField(item.id, "category", e.target.value as ScheduleCategory)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer outline-none transition-all ${
                              item.category === "prayer"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : item.category === "meal_break"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : item.category === "travel"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : "bg-purple-50 text-purple-800 border-purple-300"
                            }`}
                          >
                            <option value="activity">กิจกรรม</option>
                            <option value="prayer">ละหมาด</option>
                            <option value="meal_break">อาหาร</option>
                            <option value="travel">เดินทาง</option>
                          </select>
                        </td>

                        {/* 9. Actions (Insert Next, Move Up, Move Down, Duplicate, Delete - NO "แก้ไข" button) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap w-28">
                          <div className="flex items-center justify-center gap-1">
                            {/* Insert Next Row */}
                            <button
                              onClick={() => handleInsertNextMaster(item)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer border border-emerald-300 transition-all font-bold text-xs"
                              title={`เพิ่มกำหนดการบรรทัดถัดไป (เริ่มต่อเวลา ${item.endTime || 'สิ้นสุด'} น.)`}
                            >
                              ➕
                            </button>

                            {/* Move Up */}
                            <button
                              onClick={() => handleMoveUpMaster(globalIdx)}
                              disabled={globalIdx === 0}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-20 cursor-pointer border border-zinc-200 transition-all"
                              title="เลื่อนขึ้น"
                            >
                              ▲
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={() => handleMoveDownMaster(globalIdx)}
                              disabled={globalIdx === scheduleItems.length - 1}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-20 cursor-pointer border border-zinc-200 transition-all"
                              title="เลื่อนลง"
                            >
                              ▼
                            </button>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicateMaster(item)}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer border border-zinc-200 transition-all"
                              title="ทำสำเนาแถวนี้ (เริ่มต่อเวลาสิ้นสุด)"
                            >
                              📋
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteMaster(item.id, item.title)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer border border-rose-200 transition-all"
                              title="ลบแถวนี้"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // ================= SUBGROUP SCHEDULE TABLE (INLINE EDITABLE) =================
          filteredSubgroupList.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm space-y-2">
              <p>ไม่พบรายการกิจกรรมของกลุ่ม "{selectedGroup}" ในวันนี้</p>
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-1.5 rounded-xl bg-black text-white text-xs font-bold"
              >
                + เพิ่มกิจกรรมของกลุ่มนี้
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-2 text-center w-20">วัน</th>
                    <th className="py-3 px-2 text-center w-36">เวลา (เริ่ม - จบ)</th>
                    <th className="py-3 px-3 min-w-[260px]">กิจกรรม / รายละเอียด</th>
                    <th className="py-3 px-2 w-44">สถานที่ประจำกลุ่ม</th>
                    <th className="py-3 px-2 text-center w-28">กลุ่มย่อย</th>
                    <th className="py-3 px-2 w-36">ฝ่ายรับผิดชอบ</th>
                    <th className="py-3 px-2 w-40">หมายเหตุ</th>
                    <th className="py-3 px-2 text-center w-28">หมวดหมู่</th>
                    <th className="py-3 px-2 text-center w-24">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredSubgroupList.map((item, idx) => {
                    const globalIdx = subgroupItems.findIndex((it) => it.id === item.id);
                    const isMale = item.gender === "male";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 transition-colors group"
                      >
                        {/* 1. Day Selector */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <select
                            value={item.dayNum}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "dayNum", Number(e.target.value))}
                            className="px-2 py-1 rounded-md bg-zinc-100 text-black text-[11px] font-bold border border-zinc-300 cursor-pointer focus:ring-1 focus:ring-black outline-none"
                            title="เปลี่ยนวันที่ของกิจกรรม"
                          >
                            <option value={1}>วัน 1</option>
                            <option value={2}>วัน 2</option>
                            <option value={3}>วัน 3</option>
                            <option value={4}>วัน 4</option>
                          </select>
                        </td>

                        {/* 2. Time (Editable in place) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "time", e.target.value)}
                            className="font-mono font-bold text-center text-xs text-black bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-300 rounded-lg px-2 py-1 w-28 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="10:00 - 12:00"
                          />
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <input
                              type="text"
                              value={item.duration || ""}
                              onChange={(e) => handleUpdateSubgroupField(item.id, "duration", e.target.value)}
                              className="text-[10px] text-center text-zinc-600 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5 w-12 focus:border-black outline-none"
                              placeholder="60"
                            />
                            <span className="text-[10px] text-zinc-400">นาที</span>
                          </div>

                          {/* Smart Sync to Previous Row's End Time if mismatch */}
                          {(() => {
                            if (idx === 0) return null;
                            const prev = filteredSubgroupList[idx - 1];
                            if (!prev || prev.dayNum !== item.dayNum) return null;
                            const prevEnd = extractEndAndStartTime(prev.time || `${prev.startTime} - ${prev.endTime}`).end;
                            const curStart = extractEndAndStartTime(item.time || `${item.startTime} - ${item.endTime}`).start;
                            if (prevEnd && curStart && prevEnd !== curStart) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleSyncTimeToPrevSubgroup(item.id, prevEnd)}
                                  className="mt-1 text-[10px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                  title={`คลิกเพื่อปรับให้เริ่มต่อจากเวลาสิ้นสุดแถวก่อนหน้า (${prevEnd} น.)`}
                                >
                                  <span>⏱️ ต่อ {prevEnd}</span>
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </td>

                        {/* 3. Title & Desc (Editable in place - Swapped to match front-end web layout) */}
                        <td className="py-2.5 px-3 min-w-[260px]">
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "desc", e.target.value)}
                            className="font-bold text-black text-xs w-full bg-zinc-50/70 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black focus:ring-1 focus:ring-black rounded-lg px-2.5 py-1 outline-none transition-all"
                            placeholder="กิจกรรมหลัก (แสดงตัวหนาด้านบน)..."
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "title", e.target.value)}
                            className="text-[11px] text-zinc-600 w-full bg-zinc-50/50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-black rounded-lg px-2.5 py-0.5 mt-1 outline-none transition-all"
                            placeholder="หัวข้อย่อย / รายละเอียด (แสดงบรรทัดล่าง)..."
                          />
                        </td>

                        {/* 4. Location for Subgroup (Editable in place) */}
                        <td className="py-2.5 px-2 w-44">
                          <input
                            type="text"
                            value={item.location}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "location", e.target.value)}
                            className="text-xs text-black w-full bg-zinc-50/80 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-2.5 py-1 outline-none transition-all"
                            placeholder="สถานที่ของกลุ่มนี้..."
                          />
                        </td>

                        {/* 5. Group Badge */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isMale
                              ? "bg-blue-50 text-blue-900 border-blue-200"
                              : "bg-pink-50 text-pink-900 border-pink-200"
                          }`}>
                            {item.group}
                          </span>
                        </td>

                        {/* 6. Dept (Editable in place) */}
                        <td className="py-2.5 px-2 w-36">
                          <input
                            type="text"
                            value={item.dept}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "dept", e.target.value)}
                            className="text-xs text-zinc-800 w-full bg-zinc-50/80 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-2 py-1 outline-none transition-all"
                            placeholder="ฝ่ายรับผิดชอบ..."
                          />
                        </td>

                        {/* 7. Note (Editable in place) */}
                        <td className="py-2.5 px-2 w-40">
                          <input
                            type="text"
                            value={item.note}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "note", e.target.value)}
                            className="text-xs text-zinc-800 w-full bg-zinc-50/80 hover:bg-white focus:bg-white border border-zinc-300 focus:border-black rounded-lg px-2 py-1 outline-none transition-all"
                            placeholder="หมายเหตุ..."
                          />
                        </td>

                        {/* 8. Category Dropdown (Direct in Cell) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap w-28">
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateSubgroupField(item.id, "category", e.target.value as ScheduleCategory)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer outline-none transition-all ${
                              item.category === "prayer"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : item.category === "meal_break"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : item.category === "travel"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : "bg-purple-50 text-purple-800 border-purple-300"
                            }`}
                          >
                            <option value="activity">กิจกรรม</option>
                            <option value="prayer">ละหมาด</option>
                            <option value="meal_break">อาหาร</option>
                            <option value="travel">เดินทาง</option>
                          </select>
                        </td>

                        {/* 9. Actions (Insert Next, Move Up, Move Down, Duplicate, Delete - NO "แก้ไข" button) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap w-28">
                          <div className="flex items-center justify-center gap-1">
                            {/* Insert Next Row */}
                            <button
                              onClick={() => handleInsertNextSubgroup(item)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer border border-emerald-300 transition-all font-bold text-xs"
                              title={`เพิ่มกำหนดการบรรทัดถัดไป (เริ่มต่อเวลา ${item.endTime || 'สิ้นสุด'} น.)`}
                            >
                              ➕
                            </button>

                            {/* Move Up */}
                            <button
                              onClick={() => handleMoveUpSubgroup(globalIdx)}
                              disabled={globalIdx === 0}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-20 cursor-pointer border border-zinc-200 transition-all"
                              title="เลื่อนขึ้น"
                            >
                              ▲
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={() => handleMoveDownSubgroup(globalIdx)}
                              disabled={globalIdx === subgroupItems.length - 1}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-20 cursor-pointer border border-zinc-200 transition-all"
                              title="เลื่อนลง"
                            >
                              ▼
                            </button>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicateSubgroup(item)}
                              className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer border border-zinc-200 transition-all"
                              title="ทำสำเนาแถวนี้ (เริ่มต่อเวลาสิ้นสุด)"
                            >
                              📋
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteSubgroup(item.id, item.title)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer border border-rose-200 transition-all"
                              title="ลบแถวนี้"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ==============================================================
          ADD NEW ITEM MODAL (WHITE & BLACK THEME)
          ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-zinc-300 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 text-zinc-900">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="text-lg font-extrabold text-black">
                  {isMasterMode ? "เพิ่มกิจกรรมกำหนดการหลักใหม่" : `เพิ่มกิจกรรมใหม่สำหรับ ${selectedGroup}`}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  กรอกข้อมูลกิจกรรมเพื่อเพิ่มแถวใหม่ลงในตาราง
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddModal} className="space-y-4 text-xs">
              
              {/* Row 1: Day & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    วันที่จัดกิจกรรม *
                  </label>
                  <select
                    value={formDayNum}
                    onChange={(e) => handleFormDayChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {DAYS_META.map((d) => (
                      <option key={d.dayNum} value={d.dayNum}>
                        วันที่ {d.dayNum} ({d.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    หมวดหมู่กิจกรรม *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ScheduleCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {(Object.keys(CATEGORY_MAP) as ScheduleCategory[]).map((catKey) => (
                      <option key={catKey} value={catKey}>
                        {CATEGORY_MAP[catKey].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subgroup specifics: If in subgroup mode */}
              {!isMasterMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      กลุ่มเป้าหมาย (Subgroup)
                    </label>
                    <input
                      type="text"
                      value={formGroup}
                      onChange={(e) => setFormGroup(e.target.value)}
                      placeholder="เช่น มุสลีมีน กลุ่ม 1"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      ฝ่าย (เพศ)
                    </label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as "male" | "female")}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="male">มุสลีมีน (ชาย)</option>
                      <option value="female">มุสลีมะฮฺ (หญิง)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Row 2: Time fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    เวลาเริ่ม (Start)
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormStartTime(val);
                      if (formEndTime) setFormTime(`${val} - ${formEndTime}`);
                    }}
                    placeholder="เช่น 10:00"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    เวลาสิ้นสุด (End)
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormEndTime(val);
                      if (formStartTime) setFormTime(`${formStartTime} - ${val}`);
                    }}
                    placeholder="เช่น 12:00"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    ระยะเวลา (นาที)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="เช่น 120"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Row 3: Title & Description (Arranged to match web front-end) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    ชื่อกิจกรรมหลัก (แสดงตัวหนาด้านบน) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="เช่น ตื่นนอน ล้างหน้า อาบน้ำละหมาด หรือ ลงทะเบียนเข้าร่วมกิจกรรม"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    หัวข้อย่อย / รายละเอียด (แสดงบรรทัดล่าง)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="เช่น ตื่นนอนและละหมาด ซุบฮฺ หรือ เปิดลงทะเบียนสำหรับน้องค่าย"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Row 4: Locations */}
              {isMasterMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      สถานที่ มุสลีมีน (ชาย)
                    </label>
                    <input
                      type="text"
                      value={formLocMale}
                      onChange={(e) => setFormLocMale(e.target.value)}
                      placeholder="เช่น ตึกกิจกรรม หรือ ใต้ Sport com"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      สถานที่ มุสลีมะฮฺ (หญิง)
                    </label>
                    <input
                      type="text"
                      value={formLocFemale}
                      onChange={(e) => setFormLocFemale(e.target.value)}
                      placeholder="เช่น ร่มศรีตรัง หรือ REG202"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    สถานที่ของกลุ่มนี้
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="เช่น คณะแพทยศาสตร์ ห้อง 201"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              )}

              {/* Row 5: Dept & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    ฝ่ายที่รับผิดชอบ
                  </label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    placeholder="เช่น ฝ่ายวิชาการ, ฝ่ายพี่เลี้ยง"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    หมายเหตุเพิ่มเติม
                  </label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="เช่น ละหมาด 15.30 น. (มีนาศีหัตพี่)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold shadow-sm cursor-pointer"
                >
                  บันทึกกิจกรรมใหม่
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
