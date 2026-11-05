"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "../components/SubpageHero";
import { facultiesData, FacultyStation } from "../activities/page";
import { ALL_CAMP_SCHEDULE, CampScheduleItem } from "../schedule/campScheduleData";
import { DAYS_META, DayMeta } from "../schedule/page";
import { supabase } from "../lib/supabase";

/* ================================================================
   CAMP MEALS SCHEDULE DATA (4 DAYS, 5 COLUMNS)
   วันที่ 6: 2 มื้อ (เที่ยง, เย็น)
   วันที่ 7: 3 มื้อ (เช้า, เที่ยง, เย็น)
   วันที่ 8: 3 มื้อ (เช้า, เที่ยง, เย็น)
   วันที่ 9: 2 มื้อ (เช้า, เที่ยง)
   ================================================================ */

interface CampMealRow {
  dayNum: number;
  dateStr: string;
  dayTitle: string;
  breakfast: {
    menu: string;
    time: string;
    isProvided: boolean;
  };
  lunch: {
    menu: string;
    time: string;
    isProvided: boolean;
  };
  dinner: {
    menu: string;
    time: string;
    isProvided: boolean;
  };
  snacks: {
    menu: string;
    time: string;
  };
}

const CAMP_MEALS: CampMealRow[] = [
  {
    dayNum: 1,
    dateStr: "ศุกร์ 6 พ.ย. 2569",
    dayTitle: "วันรายงานตัว & พิธีเปิดค่าย",
    breakfast: {
      menu: "— เดินทางมารายงานตัว (ตามอัธยาศัย) —",
      time: "-",
      isProvided: false,
    },
    lunch: {
      menu: "ข้าวไก่ทอดซอสเกาหลี / ข้าวกระเพราไก่+ไข่ดาว / ข้าวไข่ข้นกุ้งน้ำจิ้มซีฟู้ด",
      time: "12:00 - 13:00 น.",
      isProvided: true,
    },
    dinner: {
      menu: "ข้าวไข่ข้นห่อหมกกุ้ง / ข้าวหน้าไก่เทอริยากิไข่ข้น / ข้าวไข่ข้นไก่ย่างน้ำจิ้มแจ่ว",
      time: "18:00 - 19:00 น.",
      isProvided: true,
    },
    snacks: {
      menu: "บ่าย: เบบี้โดนัทไส้หวาน (นูเทลล่า วนิลา ไส้แยม) • ดึก: เฉาก๊วย",
      time: "ช่วงบ่าย & ดึก",
    },
  },
  {
    dayNum: 2,
    dateStr: "เสาร์ 7 พ.ย. 2569",
    dayTitle: "กิจกรรมฐานวิทยาศาสตร์สุขภาพ",
    breakfast: {
      menu: "ข้าวมันไก่ / ข้าวหมกไก่",
      time: "06:30 - 07:30 น.",
      isProvided: true,
    },
    lunch: {
      menu: "ข้าวแกงจืดเห็ดหอม / ข้าวต้มยำไก่ / ข้าวต้มข่าไก่",
      time: "11:30 - 13:00 น.",
      isProvided: true,
    },
    dinner: {
      menu: "ข้าวไก่กรอบซอสเขียวหวาน / ข้าวไก่กรอบซอสกระเทียม / ข้าวไก่กรอบซอสสามรส",
      time: "17:00 - 18:00 น.",
      isProvided: true,
    },
    snacks: {
      menu: "สาย: เบบี้โดนัท (ไก่หยอง พิซซ่า) • บ่าย: เค้กไข่เบบี้โดนัท • ดึก: ไอศกรีมโคน",
      time: "ช่วงสาย, บ่าย & ดึก",
    },
  },
  {
    dayNum: 3,
    dateStr: "อาทิตย์ 8 พ.ย. 2569",
    dayTitle: "ฐานวิทย์-เทคโน & มนุษย์-สังคม",
    breakfast: {
      menu: "ข้าวไก่ย่างน้ำจิ้มแจ่ว / ข้าวไก่ย่างซอสเทอริยากิ / ข้าวไก่ย่างซอสพริกไทยดำ",
      time: "06:30 - 07:30 น.",
      isProvided: true,
    },
    lunch: {
      menu: "ข้าวไก่ทอดซาวครีมหัวหอมชีส / ข้าวฉู่ฉี่ปลา / ข้าวไก่ผัดเห็ด",
      time: "11:30 - 12:30 น.",
      isProvided: true,
    },
    dinner: {
      menu: "ข้าวไก่กรอบครีมมะนาว / ข้าวยำไก่แซ่บ / ข้าวไก่กรอบซอสกระเพรา",
      time: "17:00 - 18:00 น.",
      isProvided: true,
    },
    snacks: {
      menu: "สาย: ขนมปัง (ไส้หวาน) • บ่าย: ขนมปัง (ไส้คาว) • ดึก: ลาวานูเทลล่า",
      time: "ช่วงสาย, บ่าย & ดึก",
    },
  },
  {
    dayNum: 4,
    dateStr: "จันทร์ 9 พ.ย. 2569",
    dayTitle: "เสวนาวิชาการ & พิธีปิดค่าย",
    breakfast: {
      menu: "ข้าวไข่ข้นหน้าซาบะเทอริยากิ / ข้าวกระเพราไก่ไข่ข้น",
      time: "06:30 - 07:30 น.",
      isProvided: true,
    },
    lunch: {
      menu: "ข้าวผัดไก่ / ข้าวไข่พะโล้ / ข้าวไก่ทอดขมิ้น",
      time: "12:00 - 13:00 น.",
      isProvided: true,
    },
    dinner: {
      menu: "— สิ้นสุดค่าย เดินทางกลับโดยสวัสดิภาพ —",
      time: "-",
      isProvided: false,
    },
    snacks: {
      menu: "สาย: we food แจกน้องค่าย",
      time: "ช่วงสาย",
    },
  },
];

/* ================================================================
   TODAY HIGHLIGHTS DATA
   ================================================================ */

const DAILY_HIGHLIGHTS = [
  {
    dayNum: 1,
    badge: "ไฮไลท์วันแรก (6 พ.ย.)",
    title: "ก้าวแรกสู่ค่ายสานฝัน: รายงานตัว ต้อนรับ และเปิดม่าน Season 7",
    desc: "เปิดประตูรั้วสีบลู ม.อ. ต้อนรับน้องๆ นักปีนเขาทุกคน รายงานตัว รับอุปกรณ์ประจำค่าย และเข้าสู่นักปีนเขาอย่างเต็มตัว",
    location: "อาคารเรียนรวม REG , อาคารร่มศรีตรัง , บริเวณหอพัก",
    time: "13:00 - 21:00 น.",
    keyPoints: ["พิธีเปิดและเปิดตัวคอนเซ็ปต์ Season 7", "Ice Breaking ละลายพฤติกรรม", "ฮัลเกาะฮ์ เริ่มต้นด้วยเจตนาที่บริสุทธิ์", "พบปะพี่เลี้ยง"],
  },
  {
    dayNum: 2,
    badge: "ไฮไลท์วันที่สอง (7 พ.ย.)",
    title: "เจาะลึก 5 ฐานกลุ่มวิทยาศาสตร์สุขภาพ: ปูทางสู่บุคลากรทางการแพทย์",
    desc: "สัมผัสห้องแล็บและเครื่องมือแพทย์ของจริง Workshop การกู้ชีพเบื้องต้น CPR หูฟังแพทย์ Stethoscope และการตรวจแล็บเทคนิค",
    location: "ตึกแดงคณะแพทยศาสตร์",
    time: "08:00 - 22:00 น.",
    keyPoints: ["7 ฐานวิทย์สุขภาพพร้อมภาคปฏิบัติ", "แนะแนวระบบ TCAS รอบ 1-4", "จำลองเคสผู้ป่วยและตรวจวินิจฉัย", "Q&A เส้นทางสอบแพทย์/ทันตะ/เภสัช"],
  },
  {
    dayNum: 3,
    badge: "ไฮไลท์วันที่สาม (8 พ.ย.)",
    title: "ตะลุย 11 ฐานวิทย์-เทคโน & มนุษย์-สังคม พร้อมค่ำคืนบายเนียร์แสนอบอุ่น",
    desc: "เปิดโลกนวัตกรรมวิศวกรรม หุ่นยนต์ AI ทรัพยากรธรรมชาติ สถาปัตย์ ศิลปศาสตร์ รัฐศาสตร์ นิติศาสตร์ และวิทยาการจัดการ พร้อมค่ำคืนบายเนียร์รอบกองไฟในบรรยากาศซึ้งกินใจ",
    location: "อาคารเรียนรวม คณะวิศวกรรมศาสตร์ คณะวิทยาศาสตร์ ศาลจำลอง คณะอุตสหกรรมการเกษตร และลานกิจกรรม บริเวณหอพัก",
    time: "07:30 - 22:00 น.",
    keyPoints: ["7 ฐานการเรียนรู้ครบทุกมิติ", "ถอดบทเรียนนักปีนเขาและสานสายใยพี่น้อง"],
  },
  {
    dayNum: 4,
    badge: "ไฮไลท์วันสุดท้าย (9 พ.ย.)",
    title: "เวทีเสวนาวิชาการ 'Bloom into Your Summit' และพิธีปิดค่าย",
    desc: "รับฟังประสบการณ์ตรงจากวิทยากรผู้มากประสบการณ์และมีบทบาทในสังคมมุสลิมไทย",
    location: "อาคารเรียนรวม REG",
    time: "08:00 - 13:00 น.",
    keyPoints: ["เสวนาโดยวิทยากรชื่อดัง", "นาศีหัตปิดท้ายโดยประธานค่าย"],
  },
];

/* ================================================================
   CAMP ROADMAP POSTERS DATA (2 DAYS: 7 Nov & 8 Nov)
   Each day has 2 posters: Left = Male (มุสลีมีน), Right = Female (มุสลิมะฮ์)
   ================================================================ */

interface RoadmapPosterItem {
  src: string;
  title: string;
  gender: "male" | "female";
  genderLabel: string;
  badge: string;
  theme: string;
  desc: string;
}

interface RoadmapDayData {
  dayNum: number;
  dateStr: string;
  dayTitle: string;
  description: string;
  male: RoadmapPosterItem;
  female: RoadmapPosterItem;
}

const ROADMAP_DAYS: Record<7 | 8, RoadmapDayData> = {
  7: {
    dayNum: 2,
    dateStr: "เสาร์ 7 พ.ย. 2569",
    dayTitle: "กิจกรรมฐานกลุ่มวิทยาศาสตร์สุขภาพ (Health Sciences)",
    description: "ผังการหมุนเวียนเข้าศึกษาฐานกลุ่มวิทยาศาสตร์สุขภาพ (แพทยศาสตร์, ทันตแพทย์, เภสัชศาสตร์, พยาบาลศาสตร์, เทคนิคการแพทย์, การแพทย์แผนไทย, สัตวแพทยศาสตร์ และคลินิกหัวใจ)",
    male: {
      src: "/images/roadmap/roadmap-day7-male.png",
      title: "ผังฐานกิจกรรมมุสลีมีน (7 พ.ย.)",
      gender: "male",
      genderLabel: "มุสลีมีน (ฝ่ายชาย)",
      badge: "Muslimeen • 7 Nov. 2026",
      theme: "ฐานกลุ่มวิทยาศาสตร์สุขภาพ (Muslimeen G.1 - G.6)",
      desc: "ผังเส้นทางและตารางรอบเวลาเข้าฐานช่วงเช้าและช่วงบ่ายสำหรับกลุ่ม มุสลีมีน",
    },
    female: {
      src: "/images/roadmap/roadmap-day7-female.png",
      title: "ผังฐานกิจกรรมมุสลิมะฮ์ (7 พ.ย.)",
      gender: "female",
      genderLabel: "มุสลิมะฮ์ (ฝ่ายหญิง)",
      badge: "Muslimah • 7 Nov. 2026",
      theme: "ฐานกลุ่มวิทยาศาสตร์สุขภาพ (Muslimah G.1 - G.8)",
      desc: "ผังเส้นทางและตารางรอบเวลาเข้าฐานช่วงเช้าและช่วงบ่ายสำหรับกลุ่ม มุสลิมะฮ์",
    },
  },
  8: {
    dayNum: 3,
    dateStr: "อาทิตย์ 8 พ.ย. 2569",
    dayTitle: "กิจกรรมฐานวิทย์-เทคโน และ มนุษย์-สังคม (Sci-Tech & Humanities)",
    description: "ผังและตารางเวลาการหมุนเวียนฐานกลุ่มวิทยาศาสตร์-เทคโนโลยี และกลุ่มมนุษยศาสตร์-สังคมศาสตร์ พร้อมจุดนัดพบและการเดินรถบัสรับ-ส่ง",
    male: {
      src: "/images/roadmap/roadmap-day8-male.png",
      title: "ผังฐานกิจกรรมมุสลีมีน (8 พ.ย.)",
      gender: "male",
      genderLabel: "มุสลีมีน (ฝ่ายชาย)",
      badge: "Muslimeen • 8 Nov. 2026",
      theme: "ฐานวิทย์-เทคโน & มนุษย์-สังคม (กลุ่ม B1 - B4)",
      desc: "ผังตารางเวลาหมุนเวียนฐานเช้าและบ่าย จุดเดินเท้า และจุดขึ้นรถบัสกลุ่มมุสลีมีน",
    },
    female: {
      src: "/images/roadmap/roadmap-day8-female.png",
      title: "ผังฐานกิจกรรมมุสลิมะฮ์ (8 พ.ย.)",
      gender: "female",
      genderLabel: "มุสลิมะฮ์ (ฝ่ายหญิง)",
      badge: "Muslimah • 8 Nov. 2026",
      theme: "ฐานวิทย์-เทคโน & มนุษย์-สังคม (กลุ่ม G1 - G3)",
      desc: "ผังตารางเวลาหมุนเวียนฐานเช้าและบ่าย จุดเดินเท้า และจุดขึ้นรถบัสกลุ่มมุสลิมะฮ์",
    },
  },
};

/* ================================================================
   MAIN CAMP PAGE
   ================================================================ */

export default function CampPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "faculties" | "schedule">("overview");

  // State for Overview Tab
  const [selectedDayHighlight, setSelectedDayHighlight] = useState<number>(1);
  const [selectedRoadmapDay, setSelectedRoadmapDay] = useState<7 | 8>(7);
  const [previewPoster, setPreviewPoster] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  // State for Faculties Tab
  const [selectedCategory, setSelectedCategory] = useState<"all" | "health" | "sci_tech" | "social">("all");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyStation | null>(null);

  // State for Schedule Tab
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [scheduleGender, setScheduleGender] = useState<"all" | "male" | "female">("all");
  const [scheduleSearch, setScheduleSearch] = useState<string>("");
  const [liveItems, setLiveItems] = useState<CampScheduleItem[]>(ALL_CAMP_SCHEDULE);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [meals, setMeals] = useState<CampMealRow[]>(CAMP_MEALS);

  // Fetch Supabase schedule & meals updates on mount
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase
          .from("camp_schedule")
          .select("*")
          .order("day_num", { ascending: true })
          .order("start_time", { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: CampScheduleItem[] = data.map((d: any) => ({
            dayNum: d.day_num,
            dayLabel: `วันที่ ${d.day_num}`,
            dateISO: d.date_iso || "",
            gender: d.gender || "male",
            group: d.target_group || d.group_target || "รวมทุกกลุ่ม",
            startTime: d.start_time?.slice(0, 5) || "08:00",
            endTime: d.end_time?.slice(0, 5) || "09:00",
            time: d.time_display || d.time || `${d.start_time?.slice(0, 5)} - ${d.end_time?.slice(0, 5)} น.`,
            duration: d.duration ? String(d.duration) : "60",
            title: d.title || "",
            desc: d.description || "",
            location: d.location || (d.gender === "female" ? (d.loc_female || d.loc_male || "") : (d.loc_male || d.loc_female || "")) || "",
            dept: d.dept || "",
            note: d.note || "",
            category: (d.category as any) || "activity",
          }));
          setLiveItems(mapped);
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.warn("Using offline schedule data:", err);
      }
    };

    const fetchMeals = async () => {
      try {
        const { data, error } = await supabase
          .from("camp_meals")
          .select("*")
          .order("day_num", { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: CampMealRow[] = data.map((d: any) => ({
            dayNum: d.day_num,
            dateStr: d.date_str,
            dayTitle: d.day_title,
            breakfast: {
              menu: d.breakfast_menu || "",
              time: d.breakfast_time || "-",
              isProvided: !!d.breakfast_provided,
            },
            lunch: {
              menu: d.lunch_menu || "",
              time: d.lunch_time || "-",
              isProvided: !!d.lunch_provided,
            },
            dinner: {
              menu: d.dinner_menu || "",
              time: d.dinner_time || "-",
              isProvided: !!d.dinner_provided,
            },
            snacks: {
              menu: d.snacks_menu || "",
              time: d.snacks_time || "-",
            },
          }));
          setMeals(mapped);
        }
      } catch (err) {
        console.warn("Using offline meals fallback:", err);
      }
    };

    fetchSchedule();
    fetchMeals();

    // Subscribe to realtime meals
    const mealsChannel = supabase
      .channel("camp_meals_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "camp_meals" },
        () => {
          fetchMeals();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(mealsChannel);
    };
  }, []);

  const currentHighlight =
    DAILY_HIGHLIGHTS.find((h) => h.dayNum === selectedDayHighlight) || DAILY_HIGHLIGHTS[0];

  const filteredFaculties = facultiesData.filter((f) => {
    if (selectedCategory === "all") return true;
    return f.category === selectedCategory;
  });

  const getCampItemStatus = (item: CampScheduleItem): "past" | "current" | "upcoming" => {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
    const bkkNow = new Date(utcMs + 7 * 3600_000);

    const todayISO = `${bkkNow.getFullYear()}-${String(bkkNow.getMonth() + 1).padStart(2, "0")}-${String(bkkNow.getDate()).padStart(2, "0")}`;

    if (item.dateISO && todayISO !== item.dateISO) {
      if (todayISO > item.dateISO) return "past";
      return "upcoming";
    }

    if (!item.startTime || !item.endTime) return "upcoming";

    const startParts = item.startTime.split(":").map(Number);
    const endParts = item.endTime.split(":").map(Number);
    const startMinutes = (startParts[0] || 0) * 60 + (startParts[1] || 0);
    const endMinutes = (endParts[0] || 0) * 60 + (endParts[1] || 0);
    const currentMinutes = bkkNow.getHours() * 60 + bkkNow.getMinutes();

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return "current";
    }
    if (currentMinutes >= endMinutes) {
      return "past";
    }
    return "upcoming";
  };

  const filteredSchedule = useMemo(() => {
    return liveItems.filter((item) => {
      if (item.dayNum !== selectedDay) return false;

      // Group 1 filter for Day 2 and Day 3 (show only Group 1 content as requested)
      if (selectedDay === 2) {
        if (scheduleGender === "female") {
          if (!item.group?.includes("กลุ่ม 1") || item.gender !== "female") return false;
        } else {
          // male or all -> show male Group 1
          if (!item.group?.includes("กลุ่ม 1") || item.gender !== "male") return false;
        }
      } else if (selectedDay === 3) {
        if (scheduleGender === "female") {
          if (!item.group?.includes("กลุ่ม G1") || item.gender !== "female") return false;
        } else {
          // male or all -> show male Group B1
          if (!item.group?.includes("กลุ่ม B1") || item.gender !== "male") return false;
        }
      } else {
        // Day 1 & Day 4: filter by gender if selected, or default to male if "all" to prevent duplicate rows
        if (scheduleGender === "male" && item.gender !== "male") return false;
        if (scheduleGender === "female" && item.gender !== "female") return false;
        if (scheduleGender === "all" && item.gender !== "male") return false;
      }

      if (scheduleSearch.trim()) {
        const q = scheduleSearch.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.desc?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchDept = item.dept?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchDept) return false;
      }
      return true;
    });
  }, [liveItems, selectedDay, scheduleGender, scheduleSearch]);

  return (
    <div className="min-h-screen bg-cream-bg text-foreground flex flex-col justify-between">
      {/* Subpage Hero */}
      <SubpageHero
        badge="ข้อมูลและกิจกรรมค่าย"
        titleMain="CAMP"
        titleHighlight="GUIDANCE FOR DREAM 7TH"
        subtitle1="รวมข้อมูลกิจกรรม แผนที่ค่าย มื้ออาหาร ตาราง 16 ฐานคณะ และกำหนดการ"
        subtitle2="6 - 9 พฤศจิกายน 2569 ณ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่"
        scrollTargetId="#camp-content"
      />

      {/* Main Tab Navigation */}
      <main id="camp-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Navigation Tab Pills */}
        <div className="flex items-center justify-center mb-10 sm:mb-14">
          <div className="inline-flex p-1.5 rounded-2xl bg-purple-deeper/10 border border-purple-primary/20 backdrop-blur-md shadow-inner gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "overview"
                ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              ไฮไลท์ • แผนที่ • มื้ออาหาร
            </button>
            <button
              onClick={() => setActiveTab("faculties")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "faculties"
                ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              กิจกรรมฐาน 16 คณะ
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "schedule"
                ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              กำหนดการค่าย
            </button>
          </div>
        </div>

        {/* ========================================================
            PART 1: ไฮไลท์ • แผนที่ (CAMP MAP) • มื้ออาหาร
            ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-12 sm:space-y-16 animate-fade-in">
            {/* 1.1 วันนี้มีกิจกรรมอะไร? (FEATURED HIGHLIGHT BOX) */}
            <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-deeper via-purple-900 to-indigo-950 text-white shadow-2xl border border-purple-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-pink-accent/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-pink-accent/30 text-pink-light border border-pink-accent/40 inline-flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      ไฮไลท์กิจกรรมค่าย
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                      วันนี้มีกิจกรรมอะไร?
                    </h2>
                  </div>

                  {/* Day Picker Pills */}
                  <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15">
                    {[1, 2, 3, 4].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDayHighlight(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDayHighlight === d
                          ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                          }`}
                      >
                        วันที่ {d} (6-9 พ.ย.)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highlight Card Content */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15">
                  <span className="text-xs font-mono text-pink-light font-bold">
                    {currentHighlight.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1 mb-3">
                    {currentHighlight.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6">
                    {currentHighlight.desc}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/15">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <span className="text-pink-light font-bold font-mono">สถานที่:</span>
                        <span>{currentHighlight.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <span className="text-pink-light font-bold font-mono">ช่วงเวลา:</span>
                        <span>{currentHighlight.time}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-pink-light block">กิจกรรมสำคัญ:</span>
                      {currentHighlight.keyPoints.map((pt, i) => (
                        <div key={i} className="text-xs text-white/90 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-light shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 1.2 CAMP MAP & ACTIVITY ROADMAP (ผังกิจกรรม 4 โปสเตอร์: ขึ้น 1 วัน 2 โปสเตอร์ ซ้าย ชาย ขวา หญิง) */}
            <section className="p-6 sm:p-10 rounded-3xl bg-white shadow-xl border border-zinc-200 relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold text-purple-primary uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  ผังสถานที่ & แผนที่เส้นทางค่าย
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-2">
                  Camp Map & Activity Roadmap
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  ผังเส้นทางการหมุนเวียนฐานกิจกรรม 16 คณะ (ขึ้นแสดงวันละ 2 โปสเตอร์: ซ้าย ชาย • ขวา หญิง)
                </p>

                {/* Day Switcher Buttons (วันที่ 7 พ.ย. / วันที่ 8 พ.ย.) */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedRoadmapDay(7)}
                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${selectedRoadmapDay === 7
                      ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20 scale-105"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                      }`}
                  >
                    <span>เสาร์ 7 พ.ย.</span>
                    <span className="opacity-80 font-normal text-xs">(ฐานวิทยาศาสตร์สุขภาพ)</span>
                  </button>

                  <button
                    onClick={() => setSelectedRoadmapDay(8)}
                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${selectedRoadmapDay === 8
                      ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20 scale-105"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                      }`}
                  >
                    <span>อาทิตย์ 8 พ.ย.</span>
                    <span className="opacity-80 font-normal text-xs">(ฐานวิทย์-เทคโน & มนุษย์-สังคม)</span>
                  </button>
                </div>
              </div>

              {/* Day Header Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <span className="text-xs font-bold text-pink-accent block font-mono">
                    {ROADMAP_DAYS[selectedRoadmapDay].dateStr}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-purple-deeper">
                    {ROADMAP_DAYS[selectedRoadmapDay].dayTitle}
                  </h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {ROADMAP_DAYS[selectedRoadmapDay].description}
                  </p>
                </div>
                <div className="text-xs text-purple-800 font-semibold bg-white px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">
                  คลิกที่ภาพเพื่อขยายเต็มจอ
                </div>
              </div>

              {/* 2-Column Side-by-Side: Left = Male (ชาย) | Right = Female (หญิง) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* LEFT: MALE (มุสลีมีน / ฝ่ายชาย) */}
                <div className="rounded-3xl bg-indigo-50/30 border-2 border-indigo-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs">
                        {ROADMAP_DAYS[selectedRoadmapDay].male.genderLabel}
                      </span>
                      <span className="text-xs font-mono text-zinc-500 font-bold">
                        {ROADMAP_DAYS[selectedRoadmapDay].male.badge}
                      </span>
                    </div>

                    <h5 className="font-black text-base sm:text-lg text-indigo-950 mb-1">
                      {ROADMAP_DAYS[selectedRoadmapDay].male.title}
                    </h5>
                    <p className="text-xs text-zinc-600 mb-4">
                      {ROADMAP_DAYS[selectedRoadmapDay].male.desc}
                    </p>

                    {/* Poster Image Frame */}
                    <div
                      onClick={() =>
                        setPreviewPoster({
                          src: ROADMAP_DAYS[selectedRoadmapDay].male.src,
                          title: ROADMAP_DAYS[selectedRoadmapDay].male.title,
                          subtitle: `${ROADMAP_DAYS[selectedRoadmapDay].dateStr} • ${ROADMAP_DAYS[selectedRoadmapDay].male.theme}`,
                        })
                      }
                      className="group relative rounded-2xl overflow-hidden border border-indigo-200 bg-white shadow-inner cursor-pointer"
                    >
                      <img
                        src={ROADMAP_DAYS[selectedRoadmapDay].male.src}
                        alt={ROADMAP_DAYS[selectedRoadmapDay].male.title}
                        className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 rounded-xl bg-white/95 text-indigo-950 text-xs font-bold shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                          <span>คลิกดูภาพขยายเต็มจอ</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setPreviewPoster({
                          src: ROADMAP_DAYS[selectedRoadmapDay].male.src,
                          title: ROADMAP_DAYS[selectedRoadmapDay].male.title,
                          subtitle: `${ROADMAP_DAYS[selectedRoadmapDay].dateStr} • ${ROADMAP_DAYS[selectedRoadmapDay].male.theme}`,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      เปิดดูภาพขยาย
                    </button>
                    <a
                      href={ROADMAP_DAYS[selectedRoadmapDay].male.src}
                      download={`Roadmap-Day${selectedRoadmapDay}-Muslimeen.png`}
                      className="text-xs text-indigo-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>ดาวน์โหลดไฟล์</span>
                      <span>↓</span>
                    </a>
                  </div>
                </div>

                {/* RIGHT: FEMALE (มุสลิมะฮ์ / ฝ่ายหญิง) */}
                <div className="rounded-3xl bg-pink-50/30 border-2 border-pink-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-bold shadow-xs">
                        {ROADMAP_DAYS[selectedRoadmapDay].female.genderLabel}
                      </span>
                      <span className="text-xs font-mono text-zinc-500 font-bold">
                        {ROADMAP_DAYS[selectedRoadmapDay].female.badge}
                      </span>
                    </div>

                    <h5 className="font-black text-base sm:text-lg text-pink-950 mb-1">
                      {ROADMAP_DAYS[selectedRoadmapDay].female.title}
                    </h5>
                    <p className="text-xs text-zinc-600 mb-4">
                      {ROADMAP_DAYS[selectedRoadmapDay].female.desc}
                    </p>

                    {/* Poster Image Frame */}
                    <div
                      onClick={() =>
                        setPreviewPoster({
                          src: ROADMAP_DAYS[selectedRoadmapDay].female.src,
                          title: ROADMAP_DAYS[selectedRoadmapDay].female.title,
                          subtitle: `${ROADMAP_DAYS[selectedRoadmapDay].dateStr} • ${ROADMAP_DAYS[selectedRoadmapDay].female.theme}`,
                        })
                      }
                      className="group relative rounded-2xl overflow-hidden border border-pink-200 bg-white shadow-inner cursor-pointer"
                    >
                      <img
                        src={ROADMAP_DAYS[selectedRoadmapDay].female.src}
                        alt={ROADMAP_DAYS[selectedRoadmapDay].female.title}
                        className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 rounded-xl bg-white/95 text-pink-950 text-xs font-bold shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                          <span>คลิกดูภาพขยายเต็มจอ</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setPreviewPoster({
                          src: ROADMAP_DAYS[selectedRoadmapDay].female.src,
                          title: ROADMAP_DAYS[selectedRoadmapDay].female.title,
                          subtitle: `${ROADMAP_DAYS[selectedRoadmapDay].dateStr} • ${ROADMAP_DAYS[selectedRoadmapDay].female.theme}`,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      เปิดดูภาพขยาย
                    </button>
                    <a
                      href={ROADMAP_DAYS[selectedRoadmapDay].female.src}
                      download={`Roadmap-Day${selectedRoadmapDay}-Muslimah.png`}
                      className="text-xs text-pink-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>ดาวน์โหลดไฟล์</span>
                      <span>↓</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 1.3 มื้ออาหาร (CAMP MEALS TABLE: 4 DAYS, 5 COLUMNS) */}
            <section className="p-6 sm:p-10 rounded-3xl bg-white shadow-xl border border-zinc-200">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold text-pink-accent uppercase tracking-wider bg-pink-pale px-3 py-1 rounded-full border border-pink-light">
                  ตารางโภชนาการฮาลาล 100%
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-2">
                  ตารางมื้ออาหารตลอดค่าย (4 วัน 5 คอลัมน์)
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  วันที่ 6 (2 มื้อ: เที่ยง, เย็น) • วันที่ 7-8 (3 มื้อ: เช้า, เที่ยง, เย็น) • วันที่ 9 (2 มื้อ: เช้า, เที่ยง)
                </p>
              </div>

              {/* 5-Column Responsive Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 shadow-md">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-deeper via-purple-900 to-indigo-950 text-white font-bold">
                      <th className="p-4 w-1/5 border-r border-white/10">วัน / วันที่</th>
                      <th className="p-4 w-1/5 border-r border-white/10">มื้อเช้า (Breakfast)</th>
                      <th className="p-4 w-1/5 border-r border-white/10">มื้อเที่ยง (Lunch)</th>
                      <th className="p-4 w-1/5 border-r border-white/10">มื้อเย็น (Dinner)</th>
                      <th className="p-4 w-1/5">ของว่าง & เครื่องดื่ม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {meals.map((row) => (
                      <tr key={row.dayNum} className="hover:bg-purple-50/40 transition-colors">
                        {/* Column 1: Day & Date */}
                        <td className="p-4 font-semibold text-purple-deeper border-r border-zinc-200 bg-purple-50/20">
                          <span className="block text-xs text-pink-accent font-bold">วันที่ {row.dayNum}</span>
                          <span className="block text-sm font-bold text-zinc-900">{row.dateStr}</span>
                          <span className="block text-[11px] text-zinc-500 mt-0.5">{row.dayTitle}</span>
                        </td>

                        {/* Column 2: Breakfast */}
                        <td className="p-4 border-r border-zinc-200">
                          {row.breakfast.isProvided ? (
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-purple-600 font-bold block">
                                {row.breakfast.time}
                              </span>
                              <div className="space-y-0.5">
                                {row.breakfast.menu.split("/").map((dish, i) => (
                                  <div key={i} className="text-zinc-800 font-medium flex items-start gap-1">
                                    {row.breakfast.menu.includes("/") && (
                                      <span className="text-purple-400 font-bold shrink-0">•</span>
                                    )}
                                    <span>{dish.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">
                              {row.breakfast.menu}
                            </span>
                          )}
                        </td>

                        {/* Column 3: Lunch */}
                        <td className="p-4 border-r border-zinc-200">
                          {row.lunch.isProvided ? (
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-emerald-600 font-bold block">
                                {row.lunch.time}
                              </span>
                              <div className="space-y-0.5">
                                {row.lunch.menu.split("/").map((dish, i) => (
                                  <div key={i} className="text-zinc-800 font-medium flex items-start gap-1">
                                    {row.lunch.menu.includes("/") && (
                                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                                    )}
                                    <span>{dish.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">{row.lunch.menu}</span>
                          )}
                        </td>

                        {/* Column 4: Dinner */}
                        <td className="p-4 border-r border-zinc-200">
                          {row.dinner.isProvided ? (
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-pink-600 font-bold block">
                                {row.dinner.time}
                              </span>
                              <div className="space-y-0.5">
                                {row.dinner.menu.split("/").map((dish, i) => (
                                  <div key={i} className="text-zinc-800 font-medium flex items-start gap-1">
                                    {row.dinner.menu.includes("/") && (
                                      <span className="text-pink-400 font-bold shrink-0">•</span>
                                    )}
                                    <span>{dish.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">{row.dinner.menu}</span>
                          )}
                        </td>

                        {/* Column 5: Snacks */}
                        <td className="p-4">
                          <span className="text-[10px] font-mono text-amber-600 font-bold block mb-1">
                            {row.snacks.time}
                          </span>
                          <div className="space-y-1">
                            {row.snacks.menu.split("•").map((snack, i) => (
                              <div key={i} className="text-xs font-medium text-zinc-800 flex items-start gap-1">
                                {row.snacks.menu.includes("•") && (
                                  <span className="text-amber-500 font-bold shrink-0">•</span>
                                )}
                                <span>{snack.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-purple-50 text-xs text-purple-900 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>*หมายเหตุ: เมนูอาหารและของว่างทุกมื้อจัดเตรียมตามหลักฮาลาล 100% ดูแลโดยทีมงานฝ่ายสวัสดิการ</span>
                <span className="font-mono text-[11px] text-purple-700 font-bold">ฝ่ายสวัสดิการ (Welfare & Catering)</span>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================
            PART 2: กิจกรรมฐาน 16 คณะ
            ======================================================== */}
        {activeTab === "faculties" && (
          <div className="space-y-8 animate-fade-in">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { key: "all", label: "ทั้งหมด 16 คณะ" },
                { key: "health", label: "วิทยาศาสตร์สุขภาพ (5 คณะ)" },
                { key: "sci_tech", label: "วิทยาศาสตร์และเทคโนโลยี (5 คณะ)" },
                { key: "social", label: "มนุษยศาสตร์และสังคมศาสตร์ (6 คณะ)" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${selectedCategory === c.key
                    ? "bg-purple-primary text-white shadow-md shadow-purple-primary/30"
                    : "bg-white text-zinc-600 hover:text-purple-dark hover:bg-zinc-100 border border-zinc-200"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Faculty Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaculties.map((fac) => (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFaculty(fac)}
                  className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:border-purple-primary/40 relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        ฐานที่ {fac.order}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {fac.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {fac.sticker ? (
                          <img
                            src={fac.sticker}
                            alt={fac.nameTh}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="font-mono font-black text-purple-primary text-sm">
                            {String(fac.order).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 group-hover:text-purple-primary transition-colors">
                          {fac.nameTh}
                        </h4>
                        <p className="text-xs text-zinc-400 font-mono truncate">{fac.nameEn}</p>
                      </div>
                    </div>

                    <p className="text-xs text-purple-700 font-semibold mb-2">
                      {fac.theme}
                    </p>
                    <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                      {fac.studyAbout}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-purple-primary font-bold">
                    <span>ดูรายละเอียดฐาน</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Faculty Details */}
            {selectedFaculty && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setSelectedFaculty(null)}
              >
                <div
                  className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl border border-purple-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                        {selectedFaculty.sticker ? (
                          <img
                            src={selectedFaculty.sticker}
                            alt={selectedFaculty.nameTh}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="font-mono font-black text-purple-primary text-sm">
                            {String(selectedFaculty.order).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-purple-deeper">
                          {selectedFaculty.nameTh}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">{selectedFaculty.nameEn}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFaculty(null)}
                      className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="py-4 space-y-3.5 text-xs sm:text-sm text-zinc-700">
                    <div>
                      <h4 className="font-bold text-purple-primary mb-1">เรียนเกี่ยวกับอะไร:</h4>
                      <p className="leading-relaxed">{selectedFaculty.studyAbout}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-primary mb-1">หลักสูตร:</h4>
                      <p className="leading-relaxed">{selectedFaculty.curriculum}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-primary mb-1">แนวทางอาชีพ:</h4>
                      <p className="leading-relaxed">{selectedFaculty.careers}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-primary mb-1">กิจกรรม Workshop ประจำฐาน:</h4>
                      <p className="leading-relaxed">{selectedFaculty.workshop}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <Link
                      href={`/documents?search=${encodeURIComponent(selectedFaculty.nameTh)}`}
                      className="px-4 py-2 rounded-xl bg-purple-primary text-white text-xs font-bold shadow-md hover:bg-purple-dark transition-colors"
                    >
                      เปิดอ่านสไลด์คณะนี้ใน KNOWLEDGE
                    </Link>
                    <button
                      onClick={() => setSelectedFaculty(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PART 3: กำหนดการ (SCHEDULE) — TABLE DESIGN MATCHING IMAGE 2
            ======================================================== */}
        {activeTab === "schedule" && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Day Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {DAYS_META.map((d) => (
                <button
                  key={d.dayNum}
                  onClick={() => setSelectedDay(d.dayNum)}
                  className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${selectedDay === d.dayNum
                    ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                    }`}
                >
                  <span className="block font-bold">{d.title}</span>
                  <span className="block text-[10px] opacity-80">{d.subtitle}</span>
                </button>
              ))}
            </div>

            {/* Sub-Filters: Search & Gender */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white shadow-sm border border-purple-primary/10">
              {/* Gender Filter Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-500 mr-1 hidden sm:inline">กลุ่มผู้เข้าร่วม:</span>
                <button
                  onClick={() => setScheduleGender("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${scheduleGender === "all"
                    ? "bg-purple-deeper text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setScheduleGender("male")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${scheduleGender === "male"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                >
                  มุสลีมีน (ชาย)
                </button>
                <button
                  onClick={() => setScheduleGender("female")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${scheduleGender === "female"
                    ? "bg-pink-600 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                >
                  มุสลิมะฮ์ (หญิง)
                </button>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="ค้นหากิจกรรม หรือสถานที่..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-primary/30 focus:border-purple-primary transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Schedule Table Container */}
            <div className="p-4 sm:p-7 rounded-3xl bg-white shadow-xl border border-zinc-200">
              {/* Header Info */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base sm:text-lg text-purple-deeper">
                    กำหนดการ {DAYS_META.find((d) => d.dayNum === selectedDay)?.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-bold font-mono">
                    {selectedDay === 2 || selectedDay === 3
                      ? `ตัวอย่างกลุ่ม 1 (${filteredSchedule.length} รายการ)`
                      : `${filteredSchedule.length} รายการ`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Realtime Schedule</span>
                </div>
              </div>

              {/* Column Headers Bar: เวลา | กิจกรรม | สถานที่ (แบบรูปที่ 2) */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-2 rounded-xl bg-purple-50/70 text-purple-900/70 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 border border-purple-100/60">
                <div className="w-[84px] sm:w-[130px] flex-shrink-0 text-center">
                  เวลา
                </div>
                <div className="flex-1 min-w-0 pl-2 sm:pl-4">
                  กิจกรรม
                </div>
                <div className="w-[90px] sm:w-[180px] flex-shrink-0 text-right pr-2">
                  สถานที่
                </div>
              </div>

              {/* Rows List */}
              {filteredSchedule.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  ไม่พบกิจกรรมที่ตรงกับเงื่อนไขการค้นหา
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-2.5">
                  {filteredSchedule.map((item, idx) => {
                    const status = getCampItemStatus(item);
                    const isCurrent = status === "current";
                    const isPast = status === "past";

                    return (
                      <div
                        key={`${item.dayNum}-${item.startTime}-${item.title}-${idx}`}
                        className={`rounded-2xl border transition-all duration-300 p-2.5 sm:p-3.5 ${isCurrent
                          ? "bg-emerald-50/90 border-2 border-emerald-400 shadow-md ring-2 ring-emerald-400/20"
                          : isPast
                            ? "bg-white/60 border-zinc-200/60 opacity-60 hover:opacity-100 transition-opacity"
                            : "bg-white hover:bg-zinc-50/80 border-zinc-200/80 shadow-xs hover:border-purple-200 hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
                          {/* Column 1: เวลา (Time & Duration) */}
                          <div className="w-[84px] sm:w-[130px] flex-shrink-0 flex flex-col items-center justify-center">
                            <div
                              className={`w-full py-1 sm:py-1.5 px-1 sm:px-2 rounded-xl font-mono text-[11px] sm:text-xs font-bold text-center tracking-tight border transition-colors ${isCurrent
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-purple-50 text-purple-950 border-purple-100/80"
                                }`}
                            >
                              {item.time}
                            </div>
                            {item.duration && (
                              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium block text-center mt-0.5">
                                {item.duration} นาที
                              </span>
                            )}
                          </div>

                          {/* Column 2: กิจกรรม (Activity Details) */}
                          <div className="flex-1 min-w-0 pl-1 sm:pl-2 space-y-0.5">
                            {isCurrent && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold shadow-xs mb-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                <span>กำลังดำเนินอยู่ ณ เวลานี้</span>
                              </div>
                            )}

                            <h4
                              className={`text-xs sm:text-sm md:text-base font-bold leading-snug line-clamp-2 sm:line-clamp-none ${isCurrent
                                ? "text-emerald-950 font-extrabold"
                                : "text-zinc-900"
                                }`}
                            >
                              {item.desc || item.title}
                            </h4>

                            {item.desc && item.title && item.desc.trim() !== item.title.trim() && (
                              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate sm:whitespace-normal">
                                {item.title}
                              </p>
                            )}

                            {(item.dept || item.note || (item.group && item.group !== "รวม")) && (
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                {item.dept && (
                                  <span className="inline-block px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-zinc-100 text-zinc-600 text-[9px] sm:text-[10px] font-medium border border-zinc-200/60 truncate">
                                    ฝ่าย: {item.dept}
                                  </span>
                                )}
                                {item.note && (
                                  <span className="inline-block px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] sm:text-[10px] font-medium border border-amber-200/70 truncate">
                                    {item.note}
                                  </span>
                                )}
                                {item.group && item.group !== "รวม" && (
                                  <span className="inline-block px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] sm:text-[10px] font-medium border border-purple-100 truncate">
                                    {item.group}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Column 3: สถานที่ (Location - Right Aligned) */}
                          <div className="w-[90px] sm:w-[180px] flex-shrink-0 flex items-center justify-end">
                            {item.location && item.location !== "-" ? (
                              <span
                                title={item.location}
                                className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-semibold border text-right transition-colors ${isCurrent
                                  ? "bg-emerald-100/90 text-emerald-900 border-emerald-300 font-bold"
                                  : "bg-purple-50/60 text-purple-900 border-purple-100/80"
                                  }`}
                              >
                                <span className="max-w-[85px] sm:max-w-[170px] truncate">{item.location}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-300">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Link to Full Master Schedule */}
              <div className="mt-7 pt-4 border-t border-zinc-100 text-center">
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 text-xs text-purple-primary font-bold hover:underline"
                >
                  <span>เปิดดูตารางกำหนดการแบบเต็มจอ (Master Schedule View)</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal for Full Poster Preview */}
      {previewPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setPreviewPoster(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[95vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between text-white shrink-0">
              <div className="pr-4 min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{previewPoster.title}</h3>
                <p className="text-xs text-purple-200/80 mt-0.5 truncate">{previewPoster.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPoster.src}
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>ดาวน์โหลด</span>
                  <span>↓</span>
                </a>
                <button
                  onClick={() => setPreviewPoster(null)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                  aria-label="ปิดหน้าต่าง"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="p-3 sm:p-6 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={previewPoster.src}
                alt={previewPoster.title}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
