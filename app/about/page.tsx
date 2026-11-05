"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "../components/SubpageHero";
import { supabase } from "../lib/supabase";
import { TeamMember, MALE_MEMBERS, FEMALE_MEMBERS } from "./campStaffData";

/* ================================================================
   DATA: GUIDANCE FOR DREAM LOGOS & EDITIONS (1ST - 7TH)
   ================================================================ */

interface CampEdition {
  generation: number;
  roman: string;
  seasonBadge: string;
  yearTh: string;
  yearEn: string;
  dates: string;
  location: string;
  locationType: "tour" | "campus";
  themeName: string;
  themeTh: string;
  themeEn: string;
  posterSrc: string;
  colorGradient: string;
  borderColor: string;
  hasSpecialNote?: boolean;
  specialNoteTitle?: string;
  specialNoteBody?: string;
  description: string;
  highlights: string[];
}

const CAMP_EDITIONS: CampEdition[] = [
  {
    generation: 1,
    roman: "1st",
    seasonBadge: "Season 1",
    yearTh: "2562",
    yearEn: "2019",
    dates: "6 - 8 ธันวาคม 2562",
    location: "โรงเรียนมุสลิมศึกษา จ.สตูล",
    locationType: "tour",
    themeName: "ค่ายสานฝันสัญจร สตูล",
    themeTh: "จุดเริ่มต้นแห่งการสานฝัน สู่เส้นทางแห่งศรัทธา",
    themeEn: "The Genesis of Guiding Dreams",
    posterSrc: "/images/editions/ss1.jpg",
    colorGradient: "from-sky-900 via-indigo-900 to-purple-900",
    borderColor: "border-sky-500/40",
    hasSpecialNote: true,
    specialNoteTitle: "ค่ายสัญจรรุ่นแรก (The Genesis)",
    specialNoteBody:
      "ค่ายสานฝันเพื่อน้อง รุ่นที่ 1 จัดขึ้นในรูปแบบ 'ค่ายสัญจร' ณ โรงเรียนมุสลิมศึกษา จ.สตูล โดยพี่น้องนักศึกษาชมรมมุสลิม ม.อ. หาดใหญ่ ออกเดินทางไปจัดกิจกรรมแนะแนวการศึกษาและสร้างแรงบันดาลใจให้แก่น้องๆ ในพื้นที่",
    description:
      "รุ่นริเริ่มสร้างประวัติศาสตร์ในรูปแบบค่ายสัญจร มุ่งสร้างพื้นที่เรียนรู้ แนะนำ TCAS และแนวทางการเตรียมตัวสอบเข้ามหาวิทยาลัย",
    highlights: ["เปิดตัวโครงการครั้งแรกในรูปแบบค่ายสัญจร", "แนะแนวคณะและระบบ TCAS", "สร้างแรงบันดาลใจสู่รั้วมหาวิทยาลัย"],
  },
  {
    generation: 2,
    roman: "2nd",
    seasonBadge: "Season 2",
    yearTh: "2563",
    yearEn: "2020",
    dates: "27 - 29 พฤศจิกายน 2563",
    location: "โรงเรียนหาดใหญ่วิทยาคาร จ.สงขลา",
    locationType: "tour",
    themeName: "ค่ายสานฝันสัญจร หาดใหญ่วิทยาคาร",
    themeTh: "ก้าวแห่งการเติบโต สานต่อสายใยแห่งความหวัง",
    themeEn: "Stepping Stones of Growth & Hope",
    posterSrc: "/images/editions/ss2.jpg",
    colorGradient: "from-amber-900 via-rose-900 to-purple-900",
    borderColor: "border-amber-500/40",
    hasSpecialNote: true,
    specialNoteTitle: "ค่ายสัญจรรุ่นที่ 2 ต่อยอดสู่ชุมชน",
    specialNoteBody:
      "ค่ายสานฝันเพื่อน้อง รุ่นที่ 2 สัญจร ณ โรงเรียนหาดใหญ่วิทยาคาร จ.สงขลา ขยายฐานวิชาการและริเริ่มระบบพี่เลี้ยงประจำกลุ่ม (Mentor) อย่างใกล้ชิด ก่อนจะปรับเปลี่ยนมาจัดในมหาวิทยาลัยตั้งแต่รุ่นที่ 3 เป็นต้นมา",
    description:
      "รุ่นสัญจรครั้งที่ 2 ที่ขยายขอบเขตความรู้ พัฒนาระบบแบบทดสอบค้นหาตนเอง และจัดทำคู่มือแนะแนวการศึกษาฉบับแรก",
    highlights: ["ค่ายสัญจร ณ โรงเรียนหาดใหญ่วิทยาคาร", "ริเริ่มระบบพี่เลี้ยงประจำกลุ่ม (Mentor)", "เจาะลึกเทคนิคการเตรียมสอบ"],
  },
  {
    generation: 3,
    roman: "3rd",
    seasonBadge: "Season 3",
    yearTh: "2565",
    yearEn: "2022",
    dates: "11 - 13 พฤศจิกายน 2565",
    location: "มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่",
    locationType: "campus",
    themeName: "นักสืบคดี (Detective)",
    themeTh: "สืบค้นตัวตนที่ซ่อนในตัวเรา ไขกุญแจ 16 คณะใน ม.อ.",
    themeEn: "Uncover Your Hidden Identity",
    posterSrc: "/images/editions/ss3.jpg",
    colorGradient: "from-amber-950 via-zinc-900 to-purple-950",
    borderColor: "border-amber-500/40",
    description:
      "จุดเปลี่ยนสำคัญในการย้ายมาจัด ณ ม.อ. หาดใหญ่ อย่างเต็มรูปแบบ ในธีมนักสืบคดี ชวนน้องๆ มาร่วมสืบค้นหาตัวตนและไขรหัสกุญแจสู่ 16 คณะ",
    highlights: ["ปรับเปลี่ยนมาจัด ณ ม.อ. หาดใหญ่ เต็มรูปแบบ", "ธีม 'นักสืบคดี' สืบค้นตัวตนและ 16 คณะ", "เวทีแลกเปลี่ยนประสบการณ์จริงจากรุ่นพี่"],
  },
  {
    generation: 4,
    roman: "4th",
    seasonBadge: "Season 4",
    yearTh: "2566",
    yearEn: "2023",
    dates: "10 - 12 พฤศจิกายน 2566",
    location: "มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่",
    locationType: "campus",
    themeName: "อวกาศ (Space & Astronaut)",
    themeTh: "พุ่งทะยานสู่ 16 คณะ ลงมือทำภารกิจแห่งห้วงอวกาศ",
    themeEn: "Voyage into the Infinite Cosmos",
    posterSrc: "/images/editions/ss4.jpg",
    colorGradient: "from-indigo-950 via-purple-900 to-slate-900",
    borderColor: "border-indigo-400/40",
    description:
      "พาน้องๆ ท่องจักรวาลแห่งการเรียนรู้ในธีมอวกาศ สำรวจศักยภาพที่ไร้ขีดจำกัด จำลองสนามสอบสัมภาษณ์ (Mock Interview) และเวิร์กช็อปเข้มข้น",
    highlights: ["ธีม 'อวกาศ' พุ่งทะยานสู่ 16 คณะในรั้วมหาลัย", "ภารกิจจำลองการเรียนรู้เชิงปฏิบัติการ", "Mock Interview จำลองสัมภาษณ์เสมือนจริง"],
  },
  {
    generation: 5,
    roman: "5th",
    seasonBadge: "Season 5",
    yearTh: "2567",
    yearEn: "2024",
    dates: "8 - 10 พฤศจิกายน 2567",
    location: "มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่",
    locationType: "campus",
    themeName: "นักเดินทาง (Explorer)",
    themeTh: "เดินทางตามล่าหาขุมทรัพย์ 16 คณะ ถอดรหัสปริศนา",
    themeEn: "Desert Expedition & Treasure Quest",
    posterSrc: "/images/editions/ss5.jpg",
    colorGradient: "from-amber-900 via-orange-950 to-purple-950",
    borderColor: "border-amber-400/40",
    description:
      "ผจญภัยในธีมนักเดินทางทะเลทราย ตามล่าขุมทรัพย์ทางปัญญา 16 คณะ ถอดรหัสปริศนาเพื่อค้นพบศักยภาพที่ซ่อนอยู่ภายในตัวเอง",
    highlights: ["ธีม 'นักเดินทาง' ตามล่าหาขุมทรัพย์ความรู้", "ถอดรหัสปริศนาศักยภาพและเป้าหมายชีวิต", "เปิดบ้าน 16 คณะแล็บจริงสถานที่จริง"],
  },
  {
    generation: 6,
    roman: "6th",
    seasonBadge: "Season 6",
    yearTh: "2568",
    yearEn: "2025",
    dates: "7 - 10 พฤศจิกายน 2568",
    location: "มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่",
    locationType: "campus",
    themeName: "โจรสลัด / แล่นเรือใบ (Pirates)",
    themeTh: "ร่วมแล่นเรือสู่เป้าหมายที่ชัดเจนยิ่งขึ้น ผ่าน 16 คณะ",
    themeEn: "Sailing Voyage to Clear Horizons",
    posterSrc: "/images/editions/ss6.jpg",
    colorGradient: "from-teal-950 via-cyan-900 to-purple-900",
    borderColor: "border-teal-400/40",
    description:
      "ล่องเรือสำรวจมหาสมุทรแห่งความฝันในธีมโจรสลัดและนักเดินเรือ ฝ่าคลื่นลมมุ่งตรงสู่เป้าหมายที่ชัดเจนผ่านกิจกรรม 16 คณะ 4 วัน 3 คืน",
    highlights: ["ธีม 'โจรสลัด/นักแล่นเรือ' กางใบเรือสู่เป้าหมาย", "ขยายระยะเวลาค่าย 4 วัน 3 คืน", "ระบบทะเบียนดิจิทัลและการเรียนรู้บูรณาการ"],
  },
  {
    generation: 7,
    roman: "7th",
    seasonBadge: "Season 7",
    yearTh: "2569",
    yearEn: "2026",
    dates: "6 - 9 พฤศจิกายน 2569",
    location: "มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่",
    locationType: "campus",
    themeName: "นักปีนเขา (Mountain Climber)",
    themeTh: "Bloom into your summit, guided by Deen",
    themeEn: "Climb to Your Summit, Guided by Deen",
    posterSrc: "/images/editions/ss7.jpg",
    colorGradient: "from-purple-900 via-pink-900 to-indigo-950",
    borderColor: "border-pink-400/60",
    description:
      "รุ่นปัจจุบันในธีมนักปีนเขา — ดอกไม้แต่ละดอกต่างมีฤดูกาลเบ่งบานของตนเอง ร่วมออกเดินทางตามหาความฝันบนภูเขาแห่งการเติบโตโดยมีศาสนาเป็นแสงนำทาง",
    highlights: ["ธีม 'นักปีนเขา' Bloom into your summit, guided by Deen", "ระบบ E-Book ดิจิทัล และผัง Roadmap กิจกรรม", "16 ฐานคณะ Interactive ครบทั้งวิทย์และศิลป์"],
  },
];

/* ================================================================
   DATA: HALL OF PRESIDENTS (ทำเนียบประธานค่าย รุ่นที่ 3 - 7)
   ================================================================ */

interface CampPresident {
  generation: number;
  roman: string;
  seasonBadge: string;
  yearTh: string;
  name: string;
  nickname: string;
  faculty: string;
  major: string;
  theme: string;
  quote: string;
  color: string;
  avatarBg: string;
}

const CAMP_PRESIDENTS: CampPresident[] = [
  {
    generation: 3,
    roman: "3rd",
    seasonBadge: "Season 3",
    yearTh: "2565",
    name: "นายวันอัฟฎอล รักมิตร",
    nickname: "B' อัฟดอล",
    faculty: "คณะเทคนิคการแพทย์",
    major: "สาขาเทคนิคการแพทย์บัณฑิต",
    theme: "นักสืบคดี (Detective)",
    quote: "สืบค้นตัวตนที่ซ่อนอยู่ ไขรหัสกุญแจสู่ประตู 16 คณะใน ม.อ.",
    color: "border-amber-200 hover:border-amber-400",
    avatarBg: "from-amber-600 to-purple-800",
  },
  {
    generation: 4,
    roman: "4th",
    seasonBadge: "Season 4",
    yearTh: "2566",
    name: "นายวารีฟ ดารอเง๊าะ",
    nickname: "B' วารีฟ",
    faculty: "คณะวิศวกรรมศาสตร์",
    major: "สาขาวิศวกรรมปัญญาประดิษฐ์",
    theme: "อวกาศ (Space & Astronaut)",
    quote: "พุ่งทะยานสู่ห้วงอวกาศแห่งความฝัน ไร้ขีดจำกัดแห่งความเป็นไปได้",
    color: "border-indigo-200 hover:border-indigo-400",
    avatarBg: "from-indigo-600 to-purple-800",
  },
  {
    generation: 5,
    roman: "5th",
    seasonBadge: "Season 5",
    yearTh: "2567",
    name: "นายฮานีฟ ดอเหล๊าะ",
    nickname: "B'ฮานีฟ",
    faculty: "คณะวิทยาศาสตร์",
    major: "สาขาวิทยาการคอมพิวเตอร์",
    theme: "นักเดินทาง (Explorer)",
    quote: "เดินทางตามล่าหาขุมทรัพย์ความรู้ ถอดรหัสศักยภาพที่ซ่อนอยู่",
    color: "border-orange-200 hover:border-orange-400",
    avatarBg: "from-orange-600 to-purple-800",
  },
  {
    generation: 6,
    roman: "6th",
    seasonBadge: "Season 6",
    yearTh: "2568",
    name: "นายมูอาซ ยามา",
    nickname: "B'มูอาซ",
    faculty: "คณะเศรษฐศาสตร์",
    major: "สาขาเศรษฐศาสตร์",
    theme: "โจรสลัด / แล่นเรือใบ (Pirates)",
    quote: "แล่นเรือสู่เป้าหมายที่ชัดเจนยิ่งขึ้น ฝ่าคลื่นลมมุ่งตรงสู่อนาคต",
    color: "border-teal-200 hover:border-teal-400",
    avatarBg: "from-teal-600 to-purple-800",
  },
  {
    generation: 7,
    roman: "7th",
    seasonBadge: "Season 7",
    yearTh: "2569",
    name: "นายฮนีฟ ต่วนมีเด่น",
    nickname: "บังฮนีฟ",
    faculty: "คณะวิศวกรรมศาสตร์",
    major: "สาขาวิศวกรรมคอมพิวเตอร์",
    theme: "นักปีนเขา (Mountain Climber)",
    quote: "Bloom into your summit, guided by Deen. เติบโตและไปให้ถึงยอดเขาในหนทางที่ถูกต้อง",
    color: "border-purple-300 hover:border-purple-500 ring-2 ring-purple-500/20",
    avatarBg: "from-purple-700 to-pink-600",
  },
];

/* ================================================================
   DATA: 9 DEPARTMENTS & AMANAH (ฝ่ายและอะมานะห์)
   Arrangement:
   Row 1: 1 Department (ฝ่ายอำนวยการ / หัวหน้าค่าย)
   Row 2: 4 Departments
   Row 3: 4 Departments
   ================================================================ */

interface Department {
  id: string;
  order: number;
  nameTh: string;
  nameEn: string;
  roleBadge: string;
  iconSvg: string;
  color: string;
  description: string;
  responsibilities: string[];
}

const TOP_DEPARTMENT: Department = {
  id: "executive_finance",
  order: 1,
  nameTh: "ฝ่ายบริหารและเหรัญญิก",
  nameEn: "Executive & Financial Directorate",
  roleBadge: "ผู้นำ กำกับภาพรวม และบริหารงบประมาณโครงการ",
  color: "from-purple-700 via-purple-800 to-pink-700",
  iconSvg:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  description:
    "ดูแลและกำกับทิศทางภาพรวมของค่ายให้บรรลุตามเป้าหมาย (Outcome) และตัวชี้วัดความสำเร็จของโครงการ บริหารจัดการสรรหาบุคลากรและทีมงานครบทุกฝ่าย วางแผนระบบการประชุมรอบด้าน (ประชุมบริหาร, เฮดฝ่าย, ทีมงานรวม, ทีมงานรายฝ่าย) สั่งทำของที่ระลึกชาวค่าย (ขวดน้ำ, กระเป๋าผ้า) วางโครงสร้างสารบัญคู่มือค่าย พร้อมทั้งบริหารจัดการระบบบัญชีการเงิน สรุปรายรับจากผู้สนับสนุน ระดมทุนพิเศษ และจัดทำรายงานผลการใช้งบประมาณส่งสภานักศึกษาอย่างโปร่งใสและถูกต้อง",
  responsibilities: [
    "กำกับดูแลภาพรวมค่ายให้บรรลุตาม Outcome และตัวชี้วัดความสำเร็จ (KPI) ของโครงการ",
    "วางแผนและขับเคลื่อนระบบการประชุม (ประชุมบริหาร, เฮดฝ่าย, ทีมงานรวม, ทีมงานรายฝ่าย)",
    "สรรหาทีมงานครบทุกฝ่าย ดูแลทีมระดมทุนพิเศษ และสั่งทำของที่ระลึก (ขวดน้ำ, กระเป๋าผ้า)",
    "บริหารบัญชีรายรับ-รายจ่าย สรุปงบประมาณผู้สนับสนุน และรายงานงบประมาณส่งสภานักศึกษา",
  ],
};

const ROW2_DEPARTMENTS: Department[] = [
  {
    id: "activities",
    order: 2,
    nameTh: "ฝ่ายกิจกรรม",
    nameEn: "Activities & Campus Exploration",
    roleBadge: "ออกแบบประสบการณ์และการแนะแนว 16 คณะ",
    color: "from-pink-600 to-purple-800",
    iconSvg:
      "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    description:
      "ออกแบบและขับเคลื่อนทุกช่วงเวลากิจกรรมให้เกิดมิตรภาพและแรงบันดาลใจ จัดกิจกรรม 'มิตรภาพไม่มีระยะห่าง' เซสชันเสวนา 'เส้นทางนักศึกษาสู่ชีวิตจริงในสังคม', 'TCAS Roadmap', และ 'รู้จักตัวเอง ก่อนเลือกอนาคต' พร้อมทั้งบริหารฐานแนะแนวการศึกษา 16 คณะ ประสานงานวิทยากร รวบรวมสไลด์ และจัดทำกำหนดการ Final Super-script",
    responsibilities: [
      "ออกแบบกิจกรรมสานสัมพันธ์ 'มิตรภาพไม่มีระยะห่าง' และบทเรียนสู่มหาวิทยาลัย",
      "จัดเซสชันเสวนาเส้นทางนักศึกษา, TCAS Roadmap และรู้จักตัวเองก่อนเลือกอนาคต",
      "บริหารจัดการฐานแนะแนว 16 คณะ ติดต่อวิทยากร รวบรวมสไลด์ และจัดเตรียมสถานที่แต่ละฐาน",
      "จัดทำกำหนดการฉบับคู่มือค่าย, กำหนดการ Final Super-script และเตรียมอุปกรณ์กิจกรรม",
    ],
  },
  {
    id: "registration",
    order: 3,
    nameTh: "ฝ่ายทะเบียน",
    nameEn: "Registration & Camp Documentation",
    roleBadge: "ระบบข้อมูลสารสนเทศ เอกสาร และทำเนียบรุ่น",
    color: "from-blue-600 to-indigo-800",
    iconSvg:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    description:
      "ดูแลระบบรับสมัครน้องค่าย คัดกรองข้อมูล และจัดการป้ายชื่อติดเสื้อ ออกเอกสารทางราชการทุกฉบับ (หนังสือขอความอนุเคราะห์, ลาเรียนน้องค่าย, เชิญวิทยากร, ขอใช้สถานที่, ขออนุญาตผู้ปกครอง) จัดทำทำเนียบชาวค่ายทั้งพี่และน้องอย่างละเอียด พร้อมระบบแบบฟอร์มประเมินผลโครงการ และแบบประเมินรับทรานสคริปต์สำหรับพี่ค่าย",
    responsibilities: [
      "พัฒนาแบบฟอร์มรับสมัคร คัดกรองข้อมูลผู้เข้าร่วม และจัดเตรียมป้ายชื่อติดเสื้อ",
      "ออกเอกสารราชการทุกฉบับ (ขอความอนุเคราะห์, ลาเรียน, เชิญวิทยากร, ขอใช้สถานที่, ผู้ปกครอง)",
      "จัดทำทำเนียบชาวค่าย บันทึกข้อมูลละเอียดของพี่ค่ายและน้องค่ายอย่างเป็นระบบ",
      "ออกแบบแบบฟอร์มประเมินค่ายสำหรับน้อง และแบบฟอร์มรับทรานสคริปต์สำหรับพี่ค่าย",
    ],
  },
  {
    id: "media",
    order: 4,
    nameTh: "ฝ่ายสื่อ",
    nameEn: "Media & Creative Production",
    roleBadge: "สื่อสร้างสรรค์ อัตลักษณ์ค่าย และความทรงจำ",
    color: "from-purple-600 to-pink-700",
    iconSvg:
      "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    description:
      "สร้างสรรค์สื่อประชาสัมพันธ์และอัตลักษณ์ของค่ายในทุกช่องทาง ผลิตชุดโปสเตอร์ทุกระยะ (Coming Soon, รับสมัคร, บริจาคอาหาร, แนะนำวิทยากร, สรุปผล) ผลิตวิดีโอเชิญชวนและสรุปกิจกรรม ออกแบบและสั่งทำเสื้อค่าย ป้ายชื่อ สมุดค่าย พาสปอร์ต และเกียรติบัตร รายงานสตอรี่เรียลไทม์ และบันทึกภาพนิ่ง-วิดีโอจัดเก็บไดรฟ์อย่างเป็นระบบ",
    responsibilities: [
      "ผลิตชุดโปสเตอร์ประชาสัมพันธ์ครบทุกระยะ และรายงานสตอรี่เรียลไทม์ (IG & FB)",
      "ผลิตวิดีโอประชาสัมพันธ์ วิดีโอรายละเอียดกิจกรรม และบันทึกภาพตลอดโครงการ",
      "ออกแบบและสั่งทำเสื้อค่าย, ป้ายชื่อ, สมุดค่าย, พาสปอร์ตกิจกรรม และเกียรติบัตร",
      "บริหารจัดการไดรฟ์ภาพ/วิดีโอแยกตามวันและกิจกรรม และออกแบบทำเนียบเฟรนด์ชิป",
    ],
  },
  {
    id: "academic",
    order: 5,
    nameTh: "ฝ่ายวิชาการ",
    nameEn: "Academic & Spiritual Development",
    roleBadge: "จิตวิญญาณอิสลาม ศาสนกิจ และคุณธรรม",
    color: "from-indigo-600 to-purple-800",
    iconSvg:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    description:
      "ขับเคลื่อนมิติด้านจิตวิญญาณและคุณธรรมอิสลามตลอดโครงการ จัดทำเนื้อหาหัลเกาะฮฺ '16 สิ่งจำเป็นสำหรับนักศึกษาในการเรียนรู้' และ 'เริ่มต้นด้วยเจตนาที่บริสุทธิ์' ลงสมุดค่าย วางหัวข้อและจัดสรรตารางพี่ค่ายสำหรับนาศีหัตประจำวัน ดูแลระบบการละหมาดญะมาอะฮฺ ตารางอิหม่าม ตารางคนอาซาน ส่งเสริมละหมาดสุนัตเราะวาติบ และจัดพิมพ์บทขอพรอัซกัรฉบับย่อลงในคู่มือค่าย",
    responsibilities: [
      "จัดทำเนื้อหาหัลเกาะฮฺ '16 สิ่งจำเป็นในการเรียนรู้' และ 'เจตนาที่บริสุทธิ์' ลงสมุดค่าย",
      "วางหัวข้อนาศีหัตและจัดสรรตารางพี่ค่ายสำหรับให้ข้อคิดเตือนใจประจำวัน",
      "ดูแลระบบการละหมาดญะมาอะฮฺ ตารางอิหม่าม ตารางคนอาซาน และส่งเสริมละหมาดสุนัต",
      "รวบรวมและจัดพิมพ์บทขอพรอัซกัรฉบับย่อลงในคู่มือค่ายเพื่อการปฏิบัติศาสนกิจ",
    ],
  },
];

const ROW3_DEPARTMENTS: Department[] = [
  {
    id: "mentors",
    order: 6,
    nameTh: "ฝ่ายพี่เลี้ยง",
    nameEn: "Mentorship & Camper Care",
    roleBadge: "ดูแลใกล้ชิด คัดเลือกน้องค่าย และส่งต่อสู่อนาคต",
    color: "from-emerald-600 to-teal-800",
    iconSvg:
      "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    description:
      "หัวใจสำคัญในการดูแลและสร้างสายใยผูกพันกับน้องค่าย วางเกณฑ์และคัดเลือกน้องค่ายอย่างเป็นธรรมโดยใช้รหัส ID แทนชื่อ กำหนดคุณสมบัติผู้เข้าร่วม ดูแลแชทกลุ่มรวมน้องค่ายแยกสัดส่วนมุสลีมีน-มุสลิมะฮ์ ติดตามข้อมูลการเดินทาง เข้าร่วมประกบกิจกรรมกับน้องค่ายทุกช่วงเวลาอย่างน้อยกลุ่มละ 1 คน และขับเคลื่อนระบบติดตามน้องหลังค่ายเพื่อส่งต่อจนถึงรั้วมหาวิทยาลัย",
    responsibilities: [
      "กำหนดคุณสมบัติ เกณฑ์คะแนน และดำเนินการคัดเลือกน้องค่ายอย่างโปร่งใสโดยใช้ ID",
      "บริหารจัดการกลุ่มสื่อสารน้องค่ายแยกชาย-หญิง และติดตามข้อมูลการเดินทางของน้องทุกคน",
      "ประกบดูแลน้องค่ายอย่างใกล้ชิดและอบอุ่นในทุกกิจกรรมตลอดทั้ง 4 วัน อย่างน้อยกลุ่มละ 1 คน",
      "วางแผนการพักของพี่เลี้ยง และดำเนินระบบติดตามน้องหลังค่าย (Mentorship) เพื่อส่งน้องถึงมหาวิทยาลัย",
    ],
  },
  {
    id: "venues",
    order: 7,
    nameTh: "ฝ่ายสถานที่",
    nameEn: "Logistics & Campus Venues",
    roleBadge: "อาคารจัดกิจกรรม ที่พัก และระบบการเดินทาง",
    color: "from-teal-600 to-cyan-800",
    iconSvg:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    description:
      "ประสานงานและจัดเตรียมความพร้อมด้านอาคารสถานที่ทั้งหมด ทั้งสถานที่พักของชาวค่าย อาคารเรียนและห้องกิจกรรม เช่น ตึก REG และอาคารอื่นๆ ทั่วมหาวิทยาลัย จัดเตรียมความพร้อมและความสะอาดของสถานที่ละหมาด จัดหารถรับ-ส่งสำหรับการเดินทางหมุนเวียนตามฐานคณะต่างๆ และวางระบบโครงข่ายคมนาคมอำนวยความสะดวกในการเดินทางทั่วเขตหาดใหญ่",
    responsibilities: [
      "ติดต่อประสานงานและจัดเตรียมสถานที่พัก และอาคารจัดกิจกรรม (เช่น ตึก REG และตึกอื่นๆ)",
      "จัดเตรียมและดูแลความสะอาดเรียบร้อยของสถานที่ละหมาดทั้งมุสลีมีนและมุสลิมะฮ์",
      "จัดเตรียมยานพาหนะและรถเดินทางหมุนเวียนสำหรับการเข้าศึกษาฐานคณะต่างๆ ทั่วมหาวิทยาลัย",
      "วางระบบแผนผังและโครงข่ายคมนาคมการเดินทางที่ปลอดภัยและสะดวกทั่วเมืองหาดใหญ่",
    ],
  },
  {
    id: "welfare",
    order: 8,
    nameTh: "ฝ่ายสวัสดิการ",
    nameEn: "Welfare & Halal Catering",
    roleBadge: "โภชนาการฮาลาล น้ำดื่ม และอุปกรณ์สนับสนุน",
    color: "from-amber-600 to-orange-800",
    iconSvg:
      "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
    description:
      "ดูแลสวัสดิการปากท้องและความเป็นอยู่ของชาวค่ายทุกคน วางแผนเมนูอาหารหลักและติดต่อร้านสั่งทำอาหารฮาลาลที่ได้มาตรฐานในทุกมื้อ ดูแลจุดบริการน้ำดื่มสำหรับชาวค่าย วางแผนเมนูอาหารว่างและติดต่อร้านสั่งทำของว่างประจำวัน พร้อมทั้งจัดเตรียมและดูแลอุปกรณ์ฝ่ายสวัสดิการ เช่น อุปกรณ์ทำความสะอาด อุปกรณ์จุดจ่ายน้ำดื่ม และอุปกรณ์สนับสนุนตลอดโครงการ",
    responsibilities: [
      "วางแผนเมนูอาหารหลักแต่ละมื้อ ติดต่อร้านสั่งทำอาหารฮาลาลคุณภาพ และควบคุมการแจกจ่ายให้ตรงเวลา",
      "จัดเตรียมเมนูอาหารว่างแต่ละมื้อ และประสานงานสั่งทำของว่างและเครื่องดื่มประจำวัน",
      "ดูแลระบบน้ำดื่มสะอาดให้เพียงพอและทั่วถึงทุกจุดจัดกิจกรรมของชาวค่าย",
      "จัดเตรียมและบำรุงรักษาอุปกรณ์สวัสดิการ อุปกรณ์ทำความสะอาด และอุปกรณ์บริการน้ำดื่ม",
    ],
  },
  {
    id: "medical",
    order: 9,
    nameTh: "ฝ่ายพยาบาล",
    nameEn: "Healthcare & Medical Support",
    roleBadge: "เวชภัณฑ์ การปฐมพยาบาล และสุขภาวะชาวค่าย",
    color: "from-rose-600 to-pink-800",
    iconSvg:
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    description:
      "ดูแลสุขอนามัย ความปลอดภัย และการปฐมพยาบาลเบื้องต้นแก่ผู้เข้าร่วมโครงการทุกคนอย่างถูกต้องตามหลักการแพทย์ จัดทำรายการอุปกรณ์และยาพยาบาลที่จำเป็น ติดต่อประสานงานขอรับการสนับสนุนเวชภัณฑ์ จัดชุดอุปกรณ์ปฐมพยาบาลแยกสัดส่วนมุสลีมีนและมุสลิมะฮ์ เฝ้าระวังผู้มีอาการเจ็บป่วยตลอดกิจกรรม และพร้อมประสานงานส่งต่อสถานพยาบาลในกรณีฉุกเฉิน",
    responsibilities: [
      "สำรวจและจัดทำรายการอุปกรณ์พยาบาล เวชภัณฑ์ และยาสามัญที่จำเป็นต้องใช้ตลอดค่าย",
      "ติดต่อขอรับการสนับสนุนอุปกรณ์พยาบาล และจัดชุดเวชภัณฑ์ปฐมพยาบาลแยกสัดส่วนชาย-หญิง",
      "ตรวจคัดกรองปัญหาสุขภาพ เฝ้าระวัง และให้การปฐมพยาบาลเบื้องต้นแก่ผู้มีอาการเจ็บป่วยตลอด 24 ชั่วโมง",
      "ประสานงานร่วมกับฝ่ายสถานที่และโรงพยาบาล ม.อ. เพื่อส่งต่อรักษาอย่างรวดเร็วในกรณีฉุกเฉิน",
    ],
  },
];

/* ================================================================
   DEPARTMENTS ORDER METADATA (สำหรับจัดหมวดหมู่ทีมงานตามฝ่าย)
   ================================================================ */

export const CAMP_DEPARTMENTS_META = [
  { id: "exec", name: "ฝ่ายบริหารและเหรัญญิก", nameEn: "Executive & Financial Directorate", order: 1, iconSvg: TOP_DEPARTMENT.iconSvg },
  { id: "act", name: "ฝ่ายกิจกรรม", nameEn: "Activities & Campus Exploration", order: 2, iconSvg: ROW2_DEPARTMENTS[0].iconSvg },
  { id: "reg", name: "ฝ่ายทะเบียน", nameEn: "Registration & Camp Documentation", order: 3, iconSvg: ROW2_DEPARTMENTS[1].iconSvg },
  { id: "media", name: "ฝ่ายสื่อ", nameEn: "Media & Creative Production", order: 4, iconSvg: ROW2_DEPARTMENTS[2].iconSvg },
  { id: "acad", name: "ฝ่ายวิชาการ", nameEn: "Academic & Spiritual Development", order: 5, iconSvg: ROW2_DEPARTMENTS[3].iconSvg },
  { id: "mentor", name: "ฝ่ายพี่เลี้ยง", nameEn: "Mentorship & Camper Care", order: 6, iconSvg: ROW3_DEPARTMENTS[0].iconSvg },
  { id: "venue", name: "ฝ่ายสถานที่", nameEn: "Logistics & Campus Venues", order: 7, iconSvg: ROW3_DEPARTMENTS[1].iconSvg },
  { id: "welfare", name: "ฝ่ายสวัสดิการ", nameEn: "Welfare & Halal Catering", order: 8, iconSvg: ROW3_DEPARTMENTS[2].iconSvg },
  { id: "med", name: "ฝ่ายพยาบาล", nameEn: "Healthcare & Medical Support", order: 9, iconSvg: ROW3_DEPARTMENTS[3].iconSvg },
];

export function normalizeStaffDept(rawDept?: string): string {
  if (!rawDept) return "ฝ่ายบริหารและเหรัญญิก";
  const trimmed = rawDept.trim();
  if (trimmed.includes("บริหาร") || trimmed.includes("เหรัญญิก")) {
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

/* ================================================================
   MAIN ABOUT PAGE COMPONENT
   ================================================================ */

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"intro" | "team" | "departments">("intro");
  const [searchMember, setSearchMember] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [males, setMales] = useState<TeamMember[]>(MALE_MEMBERS);
  const [females, setFemales] = useState<TeamMember[]>(FEMALE_MEMBERS);
  const [previewPoster, setPreviewPoster] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  // Fetch camp_staff from Supabase Database
  useEffect(() => {
    let isMounted = true;

    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from("camp_staff")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          const mappedMales: TeamMember[] = data
            .filter((d: any) => d.gender === "male")
            .map((d: any) => ({
              id: d.id,
              gender: "male",
              fullName: d.name,
              nickname: d.nickname,
              year: d.year_level,
              faculty: d.faculty,
              studentId: d.student_id || "",
              phone: d.phone || "",
              facebook: d.facebook || "",
              position: (d.role || "").replace(/และคมนาคม/g, ""),
              department: normalizeStaffDept(d.dept || "ฝ่ายบริหาร"),
            }));

          const mappedFemales: TeamMember[] = data
            .filter((d: any) => d.gender === "female")
            .map((d: any) => ({
              id: d.id,
              gender: "female",
              fullName: d.name,
              nickname: d.nickname,
              year: d.year_level,
              faculty: d.faculty,
              studentId: d.student_id || "",
              phone: d.phone || "",
              facebook: d.facebook || "",
              position: (d.role || "").replace(/และคมนาคม/g, ""),
              department: normalizeStaffDept(d.dept || "ฝ่ายบริหาร"),
            }));

          if (mappedMales.length > 0) setMales(mappedMales);
          if (mappedFemales.length > 0) setFemales(mappedFemales);
        }
      } catch (err) {
        console.warn("Using offline staff fallback:", err);
      }
    };

    fetchStaff();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("camp_staff_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "camp_staff" },
        () => {
          fetchStaff();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filterMembers = (list: TeamMember[]) => {
    if (!searchMember.trim()) return list;
    const q = searchMember.toLowerCase();
    return list.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.nickname.toLowerCase().includes(q) ||
        m.faculty.toLowerCase().includes(q) ||
        m.position.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
    );
  };

  const filteredMales = filterMembers(males);
  const filteredFemales = filterMembers(females);

  const renderMemberCard = (m: TeamMember, gender: "male" | "female") => {
    const isMale = gender === "male";
    const cleanNick = m.nickname.replace(/^(พี่|บัง|กะ)/, "").trim();
    return (
      <div
        key={m.id}
        className={`p-5 rounded-2xl bg-white border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${isMale ? "border-indigo-100 hover:border-indigo-300" : "border-pink-100 hover:border-pink-300"
          }`}
      >
        <div>
          {/* Avatar & Header */}
          <div className="flex items-center gap-3.5 mb-4">
            {/* Minimal Vector Profile Avatar */}
            <div
              className={`w-14 h-14 rounded-2xl bg-white border-2 p-1.5 shadow-xs transition-all duration-300 flex items-center justify-center shrink-0 group-hover:scale-105 ${isMale
                ? "border-indigo-200 text-indigo-950 group-hover:border-indigo-400 group-hover:shadow-md"
                : "border-pink-200 text-pink-950 group-hover:border-pink-400 group-hover:shadow-md"
                }`}
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Outer Circle Ring */}
                <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="8" />
                {/* Head Circle */}
                <circle cx="50" cy="37" r="14" stroke="currentColor" strokeWidth="8" />
                {/* Shoulder / Body Arc */}
                <path
                  d="M 20 78 C 24 64 35 58 50 58 C 65 58 76 64 80 78"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h5 className="font-bold text-sm sm:text-base text-zinc-900 truncate">
                {m.fullName}
              </h5>
              <p
                className={`text-xs font-semibold truncate ${isMale ? "text-indigo-600" : "text-pink-600"
                  }`}
              >
                ชื่อเล่น: {isMale ? "บัง" : "กะ"}{cleanNick} • {m.year}
              </p>
              <span
                className={`inline-block text-[11px] px-2 py-0.5 rounded-md font-bold border mt-1 truncate max-w-full ${isMale
                  ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                  : "bg-pink-50 text-pink-800 border-pink-200"
                  }`}
              >
                {(m.position || "").replace(/และคมนาคม/g, "")}
              </span>
            </div>
          </div>

          {/* Detailed info */}
          <div className="space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">คณะ:</span>
              <span className="font-medium text-zinc-800 text-right">{m.faculty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">ฝ่าย:</span>
              <span className="font-medium text-purple-700 text-right">{normalizeStaffDept(m.department)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-bg text-foreground flex flex-col justify-between">
      {/* Hero Banner */}
      <SubpageHero
        badge="เกี่ยวกับโครงการ"
        titleMain="ABOUT"
        titleHighlight="GUIDANCE FOR DREAM"
        subtitle1="ทำความรู้จักค่ายสานฝันเพื่อน้อง คณะทำงาน และฝ่ายอะมานะห์"
        subtitle2="ชมรมมุสลิม มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่"
        scrollTargetId="#about-content"
      />

      {/* Main Content Area */}
      <main id="about-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Navigation Tab Bar */}
        <div className="flex items-center justify-center mb-10 sm:mb-14">
          <div className="inline-flex p-1.5 rounded-2xl bg-purple-deeper/10 border border-purple-primary/20 backdrop-blur-md shadow-inner gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("intro")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "intro"
                ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              รู้จัก Guidance for Dream
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "team"
                ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              ทีมงาน
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === "departments"
                ? "bg-gradient-to-r from-purple-primary to-pink-accent text-white shadow-md shadow-purple-900/20"
                : "text-purple-dark/80 hover:text-purple-deeper hover:bg-white/40"
                }`}
            >
              ฝ่ายและอะมานะห์ (9 ฝ่าย)
            </button>
          </div>
        </div>

        {/* ========================================================
            TAB 1: รู้จัก GUIDANCE FOR DREAM & 7 LOGOS / EDITIONS
            ======================================================== */}
        {activeTab === "intro" && (
          <div className="space-y-12 sm:space-y-16 animate-fade-in">
            {/* Mission & Vision Overview Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-white shadow-xl border border-purple-primary/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-accent/10 to-purple-primary/10 rounded-full blur-3xl -z-0 pointer-events-none" />
              <div className="relative z-10">
                <span className="text-xs font-bold text-pink-accent uppercase tracking-widest bg-pink-pale px-3 py-1 rounded-full border border-pink-light">
                  ค่ายสานฝันเพื่อน้อง
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-purple-primary mt-3 mb-6">
                  แรงบันดาลใจและเป้าหมายของค่าย
                </h2>
                <div className="prose prose-purple max-w-none text-zinc-700 leading-relaxed space-y-4 text-sm sm:text-base">
                  <p>
                    ตลอดระยะเวลา 7 ปี ค่ายสานฝันเพื่อน้อง (Guidance for Dream) ได้เดินทางมาอย่างต่อเนื่อง ด้วยความมุ่งมั่น ความตั้งใจ และความร่วมมือของนักศึกษา รุ่นพี่ และผู้เกี่ยวข้อง จากทุกภาคส่วน จากประสบการณ์ในแต่ละปี ค่ายได้เติบโตและพัฒนาอย่างต่อเนื่อง โดยมีเจตนารมณ์เดียวกัน คือการสร้างพื้นที่แห่งการเรียนรู้ แรงบันดาลใจ และการค้นหาตัวตนให้แก่น้อง ๆ นักเรียนระดับมัธยมศึกษาตอนปลาย
                  </p>
                  <p>
                    การเดินทางมาถึงปีที่ 7 นี้ จะเกิดขึ้นไม่ได้หากปราศจากความช่วยเหลือ และ<span className="text-purple-primary font-bold">ความเมตตาจากอัลลอฮฺ (ซุบฮานะฮูวะตะอาลา)</span> ผู้ทรงเปิดทางและเอื้ออำนวยให้พวกเราสามารถก้าวผ่านอุปสรรคต่าง ๆ และเดินทางมาถึงวันนี้ได้ ด้วยเหตุนี้ พวกเราจึงตั้งใจที่จะสานต่อเจตนารมณ์ของค่ายให้เติบโตยิ่งขึ้น และสร้างประโยชน์แก่เยาวชน สังคม และผู้คนรอบข้างต่อไป &ldquo;<span className="text-purple-primary font-bold italic">Khairunnas Anfa&apos;uhum linnas</span>&rdquo;
                  </p>
                  <p>
                    Guidance for Dream Season 7 จึงไม่ได้มุ่งหมายเพียงให้น้อง ๆ ได้รู้จักคณะ หรือเตรียมตัวสอบเข้ามหาวิทยาลัยเท่านั้น แต่ยัง<span className="text-purple-primary font-bold">เป็นพื้นที่ให้น้อง ๆ ได้ เรียนรู้ ค้นหาตัวเอง ค้นพบความถนัด และมองเห็นเป้าหมายของตนเอง</span> พร้อมทั้งได้เรียนรู้เส้นทางการศึกษา และอาชีพที่หลากหลาย เพื่อให้สามารถวางแผนอนาคตและก้าวเดินต่อไปได้อย่างมั่นใจ ในขณะเดียวกัน ค่ายยังมุ่งส่งเสริมทักษะชีวิต ทั้งการสื่อสาร การทำงานร่วมกับผู้อื่น การแก้ปัญหา และการปรับตัว ตลอดจนปลูกฝังคุณธรรม จริยธรรม เพื่อให้เยาวชนเติบโตอย่างมีจุดยืน ในวิถีอิสลามและอยู่ร่วมกับผู้อื่นในสังคมพหุวัฒนธรรมได้อย่างเข้าใจและให้เกียรติซึ่งกันและกัน
                  </p>
                  <p>
                    ค่ายมุ่งหวังให้น้อง ๆ ได้ค้นพบว่า ความสำเร็จไม่ได้มีเพียงรูปแบบเดียว และการเดินทางของแต่ละคนย่อมแตกต่างกัน ขอเพียงเชื่อมั่นในศักยภาพของตนเองพยายามอย่างเต็มที่และ<span className="text-purple-primary font-bold">วางใจในอัลลอฮฺ โดยเชื่อว่าอัลลอฮฺ จะทรงช่วยเหลือผู้ที่พยายาม และมอบหมายทุกสิ่งไว้กับพระองค์ (Tawakkul)</span>
                  </p>
                </div>

                {/* Slogan & Core Quote Box */}
                <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-pink-50/50 border border-purple-200/80 shadow-xs space-y-4">
                  <div className="text-base sm:text-lg font-bold text-center sm:text-left">
                    <span className="text-purple-primary font-extrabold tracking-wide">
                      Bloom into your summit, guided by Deen.
                    </span>{" "}
                    <span className="text-zinc-800">
                      เติบโต…และไปให้ถึง ในหนทางที่ถูกต้อง
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-white/90 border border-purple-100 shadow-xs space-y-1.5 font-medium text-sm sm:text-base leading-relaxed text-zinc-700">
                    <p>
                      <span className="text-purple-primary font-bold">
                        ꒰ ดอกไม้แต่ละดอกต่างมีฤดูกาลของการเบ่งบาน
                      </span>
                    </p>
                    <p>
                      <span>เพื่อออกเดินทางตามหา </span>
                      <span className="text-purple-primary font-bold">
                        &ldquo;เส้นทางแห่งความฝัน&rdquo;
                      </span>
                    </p>
                    <p>
                      <span>บนภูเขาแห่งการเติบโต โดยมีศาสนาเป็นแสงนำทาง </span>
                      <span className="text-purple-primary font-bold">꒱</span>
                    </p>
                  </div>

                  <div className="text-right text-xs sm:text-sm text-zinc-600 font-medium pt-2">
                    ชมรมมุสลิม ม.อ.หาดใหญ่ ประจำปี 2569
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-primary/15 flex items-center justify-center text-purple-dark font-bold">
                      7
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-deeper">จัดต่อเนื่องเป็นปีที่ 7</p>
                      <p className="text-[11px] text-zinc-500">สร้างแรงบันดาลใจแก่น้องๆ กว่า 300 คน</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">#GuidanceForDream #MSSPSU</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7 Editions & Posters Section */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                <span className="text-xs font-bold text-purple-primary uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  เส้นทางการเติบโต 7 ปี
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-2">
                  ประวัติและโปสเตอร์ค่ายทั้ง 7 รุ่น (Season 1 - 7)
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  สรุปวันจัดกิจกรรม สถานที่ และธีมค่ายของแต่ละรุ่น จากค่ายสัญจรรุ่นบุกเบิกสู่ค่ายแนะแนวในรั้ว ม.อ. หาดใหญ่
                </p>
              </div>

              {/* Grid of 7 Editions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {CAMP_EDITIONS.map((ed) => (
                  <div
                    key={ed.generation}
                    className="rounded-3xl bg-white border border-zinc-200 hover:border-purple-300 p-5 sm:p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-deeper text-white shadow-xs">
                          รุ่นที่ {ed.generation} ({ed.roman})
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${ed.locationType === "tour"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-purple-50 text-purple-800 border-purple-200"
                              }`}
                          >
                            {ed.locationType === "tour" ? "ค่ายสัญจร" : "จัดที่ ม.อ.หาดใหญ่"}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 font-semibold">
                            ปี {ed.yearTh}
                          </span>
                        </div>
                      </div>

                      {/* Poster Image Frame with Click to Zoom */}
                      <div
                        onClick={() =>
                          setPreviewPoster({
                            src: ed.posterSrc,
                            title: `โปสเตอร์ค่ายสานฝันเพื่อน้อง ครั้งที่ ${ed.generation} (${ed.seasonBadge})`,
                            subtitle: `${ed.dates} • ${ed.themeName} • ${ed.location}`,
                          })
                        }
                        className="my-3 relative rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-50 shadow-inner cursor-pointer group/poster aspect-[3/4] max-h-72 mx-auto flex items-center justify-center"
                      >
                        <img
                          src={ed.posterSrc}
                          alt={`โปสเตอร์รุ่นที่ ${ed.generation}`}
                          className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-xl bg-white/95 text-purple-deeper text-xs font-bold shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                            <span>คลิกดูภาพขยาย</span>
                          </span>
                        </div>
                      </div>

                      {/* Theme Title */}
                      <div className="text-center my-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200/70 mb-1">
                          ธีมค่าย: {ed.themeName}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-purple-deeper leading-snug">
                          {ed.themeTh}
                        </h4>
                      </div>

                      {/* Key Summary Box (จัดวันไหน • จัดที่ไหน • ธีมค่าย) */}
                      <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs text-zinc-700 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-primary font-bold shrink-0 min-w-[70px]">
                            จัดวันไหน:
                          </span>
                          <span className="font-semibold text-zinc-900">{ed.dates}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-primary font-bold shrink-0 min-w-[70px]">
                            จัดที่ไหน:
                          </span>
                          <span className="font-medium text-zinc-800">{ed.location}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-primary font-bold shrink-0 min-w-[70px]">
                            ธีมค่าย:
                          </span>
                          <span className="font-bold text-purple-800">{ed.themeName}</span>
                        </div>
                      </div>

                      {/* Special Note Callout for ss1 & ss2 */}
                      {ed.hasSpecialNote && (
                        <div className="mb-4 p-3.5 rounded-xl bg-purple-900 text-white border border-purple-700/60 shadow-inner">
                          <div className="flex items-center gap-1.5 mb-1.5 text-pink-light font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                            <span>{ed.specialNoteTitle}</span>
                          </div>
                          <p className="text-[11px] text-white/90 leading-relaxed">
                            {ed.specialNoteBody}
                          </p>
                        </div>
                      )}

                      {/* Regular Description */}
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                        {ed.description}
                      </p>
                    </div>

                    {/* Bottom Action: View Poster Button & Highlights */}
                    <div className="pt-3 border-t border-zinc-100 mt-2 space-y-3">
                      <div>
                        <p className="text-[11px] font-bold text-purple-primary uppercase tracking-wider mb-1.5">
                          จุดเด่นประจำรุ่น:
                        </p>
                        <ul className="space-y-1">
                          {ed.highlights.map((h, i) => (
                            <li key={i} className="text-xs text-zinc-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-accent shrink-0" />
                              <span className="truncate">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() =>
                          setPreviewPoster({
                            src: ed.posterSrc,
                            title: `โปสเตอร์ค่ายสานฝันเพื่อน้อง ครั้งที่ ${ed.generation} (${ed.seasonBadge})`,
                            subtitle: `${ed.dates} • ${ed.themeName} • ${ed.location}`,
                          })
                        }
                        className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-primary hover:text-purple-deeper text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-purple-200/60"
                      >
                        <span>เปิดดูโปสเตอร์เต็ม</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hall of Presidents Section (ทำเนียบประธานค่าย รุ่นที่ 3 - 7) */}
            <div className="pt-8 sm:pt-12 border-t border-purple-100">
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                <span className="text-xs font-bold text-pink-accent uppercase tracking-wider bg-pink-pale px-3 py-1 rounded-full border border-pink-light">
                  Guidance for Dream
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-2">
                  ทำเนียบประธานค่าย (รุ่นที่ 3 – 7)
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  อมีรค่ายสานฝันเพื่อน้อง Guidance for Dream
                </p>
              </div>

              {/* Grid of Presidents (Season 3 - 7) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {CAMP_PRESIDENTS.map((pres) => (
                  <div
                    key={pres.generation}
                    className={`rounded-3xl bg-white border p-5 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${pres.color}`}
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-deeper text-white shadow-xs">
                          รุ่นที่ {pres.generation} ({pres.roman})
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                          ปี {pres.yearTh}
                        </span>
                      </div>

                      {/* Avatar Profile Icon (สร้างขึ้นตามแบบไอคอนโปรไฟล์มินิมอล) */}
                      <div className="flex justify-center mb-3.5">
                        <div
                          className="w-16 h-16 rounded-2xl bg-white border-2 border-zinc-200 p-2 shadow-xs group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-md transition-all duration-300 flex items-center justify-center"
                        >
                          <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full text-zinc-900"
                          >
                            <defs>
                              <clipPath id={`avatar-clip-${pres.generation}`}>
                                <circle cx="50" cy="50" r="41" />
                              </clipPath>
                            </defs>
                            {/* Outer Circle Ring */}
                            <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="8" />
                            {/* Clipped Inner Figure */}
                            <g clipPath={`url(#avatar-clip-${pres.generation})`}>
                              {/* Head Circle */}
                              <circle cx="50" cy="40" r="15" stroke="currentColor" strokeWidth="8" />
                              {/* Shoulder Arc */}
                              <ellipse cx="50" cy="82" rx="28" ry="22" stroke="currentColor" strokeWidth="8" />
                            </g>
                          </svg>
                        </div>
                      </div>

                      {/* Name & Nickname */}
                      <div className="text-center mb-2.5">
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 leading-snug">
                          {pres.name}
                        </h4>
                        <p className="text-xs font-semibold text-purple-primary mt-0.5">
                          {pres.nickname}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 mt-1">
                          ประธานโครงการ (อมีรค่าย)
                        </span>
                      </div>

                      {/* Faculty, Major & Theme */}
                      <div className="space-y-1.5 text-[11px] text-zinc-600 border-t border-zinc-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">คณะ:</span>
                          <span className="font-medium text-zinc-800 text-right">{pres.faculty}</span>
                        </div>
                        {pres.major && (
                          <div className="flex justify-between">
                            <span className="text-zinc-400">สาขา:</span>
                            <span className="font-medium text-purple-900 text-right font-medium">{pres.major}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-zinc-400">ธีมค่าย:</span>
                          <span className="font-bold text-purple-700 text-right">{pres.theme}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <div className="mt-3.5 pt-3 border-t border-zinc-100">
                      <p className="text-[11px] text-zinc-500 italic leading-relaxed text-center">
                        &ldquo;{pres.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ทีมงาน (จัดหมวดหมู่แยกตาม 9 ฝ่าย - ชายอยู่บน หญิงอยู่ล่าง)
            ======================================================== */}
        {activeTab === "team" && (
          <div className="space-y-10 sm:space-y-14 animate-fade-in">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white shadow-md border border-purple-primary/15">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-purple-deeper">
                  คณะทำงานและทีมงานค่าย (Staff & Organizers)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                  พี่น้องนักศึกษาชมรมมุสลิม ม.อ. หาดใหญ่ แยกตาม 9 ฝ่ายงาน (รวมทั้งสิ้น {males.length + females.length} คน)
                </p>
              </div>
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, ชื่อเล่น, คณะ, หรือตำแหน่ง..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/40 focus:border-purple-primary transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedDeptFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedDeptFilter === "all"
                  ? "bg-purple-deeper text-white shadow-md scale-105"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                  }`}
              >
                ทั้งหมด ({males.length + females.length})
              </button>
              {CAMP_DEPARTMENTS_META.map((dept) => {
                const count = [...males, ...females].filter(
                  (m) => normalizeStaffDept(m.department) === dept.name
                ).length;
                const isSelected = selectedDeptFilter === dept.name;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptFilter(dept.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                      ? "bg-purple-deeper text-white shadow-md scale-105"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                      }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center opacity-85 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={dept.iconSvg} />
                      </svg>
                    </span>
                    <span>{dept.order}. {dept.name.replace("ฝ่าย", "")}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Departments List */}
            <div className="space-y-12">
              {CAMP_DEPARTMENTS_META.filter((dept) =>
                selectedDeptFilter === "all" ? true : dept.name === selectedDeptFilter
              ).map((dept) => {
                const deptMales = filteredMales.filter(
                  (m) => normalizeStaffDept(m.department) === dept.name
                );
                const deptFemales = filteredFemales.filter(
                  (m) => normalizeStaffDept(m.department) === dept.name
                );
                const totalInDept = deptMales.length + deptFemales.length;

                // Hide department if no members match current search filter
                if (totalInDept === 0) return null;

                return (
                  <div
                    key={dept.id}
                    id={`dept-section-${dept.id}`}
                    className="space-y-7 p-6 sm:p-8 rounded-3xl bg-purple-50/25 border border-purple-200/70 shadow-sm"
                  >
                    {/* Department Header Banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-purple-200/60">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-primary to-pink-accent text-white flex items-center justify-center shadow-md shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={dept.iconSvg} />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                              ฝ่ายที่ {dept.order}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                              {dept.nameEn}
                            </span>
                          </div>
                          <h4 className="text-xl sm:text-2xl font-black text-purple-deeper">
                            {dept.name}
                          </h4>
                        </div>
                      </div>

                      {/* Member count badges */}
                      <div className="flex items-center gap-2 text-xs font-mono font-bold">
                        <span className="px-3 py-1.5 rounded-xl bg-purple-deeper text-white shadow-xs">
                          รวม {totalInDept} คน
                        </span>
                        {deptMales.length > 0 && (
                          <span className="px-2.5 py-1.5 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-200">
                            ชาย {deptMales.length}
                          </span>
                        )}
                        {deptFemales.length > 0 && (
                          <span className="px-2.5 py-1.5 rounded-xl bg-pink-100 text-pink-900 border border-pink-200">
                            หญิง {deptFemales.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SECTION 1: ฝ่ายชาย (มุสลีมีน อยู่บน) */}
                    {deptMales.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-indigo-200 text-xs font-bold text-indigo-950">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm" />
                          <span>มุสลีมีน / พี่น้องฝ่ายชาย ({deptMales.length} คน)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {deptMales.map((m) => renderMemberCard(m, "male"))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: ฝ่ายหญิง (มุสลิมะฮ์ อยู่ล่าง) */}
                    {deptFemales.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-pink-200 text-xs font-bold text-pink-950">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" />
                          <span>มุสลิมะฮ์ / พี่น้องฝ่ายหญิง ({deptFemales.length} คน)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {deptFemales.map((m) => renderMemberCard(m, "female"))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ฝ่ายและอะมานะห์ (ทั้งหมด 9 ฝ่าย: 1 บน + 4 กลาง + 4 ล่าง)
            ======================================================== */}
        {activeTab === "departments" && (
          <div className="space-y-10 sm:space-y-14 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-pink-accent uppercase tracking-wider bg-pink-pale px-3 py-1 rounded-full border border-pink-light">
                โครงสร้างการทำงาน
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-2">
                ฝ่ายและอะมานะห์ (9 ฝ่าย)
              </h3>
              <p className="text-zinc-600 text-sm mt-1">
                ภารกิจและความรับผิดชอบของทั้ง 9 ฝ่ายงานเพื่อการดำเนินงานค่ายที่สมบูรณ์แบบ
              </p>
            </div>

            {/* ROW 1: 1 DEPARTMENT (TOP CENTER) */}
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl bg-gradient-to-r from-purple-deeper via-purple-900 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-purple-500/30 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-pink-light shrink-0 border border-white/20 shadow-md">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={TOP_DEPARTMENT.iconSvg} />
                    </svg>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-pink-accent/30 text-pink-light border border-pink-accent/40 inline-block mb-2">
                      {TOP_DEPARTMENT.roleBadge}
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white">
                      {TOP_DEPARTMENT.nameTh}
                    </h4>
                    <p className="text-xs sm:text-sm text-purple-light font-mono mb-3">
                      {TOP_DEPARTMENT.nameEn}
                    </p>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
                      {TOP_DEPARTMENT.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs text-white/90">
                      {TOP_DEPARTMENT.responsibilities.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-light shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: 4 DEPARTMENTS */}
            <div>
              <div className="text-center mb-5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  — สายงานกิจกรรม ทะเบียน สื่อ และวิชาการ (4 ฝ่าย) —
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {ROW2_DEPARTMENTS.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={dept.iconSvg} />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 font-mono">
                          ฝ่ายที่ {dept.order}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 inline-block mb-1.5">
                        {dept.roleBadge}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-purple-deeper mb-0.5">
                        {dept.nameTh}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mb-3">
                        {dept.nameEn}
                      </p>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 space-y-1">
                      {dept.responsibilities.map((r, i) => (
                        <div key={i} className="text-[11px] text-zinc-600 flex items-start gap-1.5">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3: 4 DEPARTMENTS */}
            <div>
              <div className="text-center mb-5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  — สายงานพี่เลี้ยง สถานที่ สวัสดิการ และพยาบาล (4 ฝ่าย) —
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {ROW3_DEPARTMENTS.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={dept.iconSvg} />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 font-mono">
                          ฝ่ายที่ {dept.order}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200 inline-block mb-1.5">
                        {dept.roleBadge}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-purple-deeper mb-0.5">
                        {dept.nameTh}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mb-3">
                        {dept.nameEn}
                      </p>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 space-y-1">
                      {dept.responsibilities.map((r, i) => (
                        <div key={i} className="text-[11px] text-zinc-600 flex items-start gap-1.5">
                          <span className="text-pink-500 font-bold">•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal for Poster Preview */}
      {previewPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setPreviewPoster(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[95vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
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

