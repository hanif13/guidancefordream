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
  yearTh: string;
  yearEn: string;
  themeTh: string;
  themeEn: string;
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
    yearTh: "2563",
    yearEn: "2020",
    themeTh: "จุดเริ่มต้นแห่งการสานฝัน สู่เส้นทางแห่งศรัทธา",
    themeEn: "The Genesis of Guiding Dreams",
    colorGradient: "from-purple-900 via-indigo-900 to-purple-800",
    borderColor: "border-purple-500/40",
    hasSpecialNote: true,
    specialNoteTitle: "คำอธิบายพิเศษ: ปฐมบทแห่งการริเริ่ม (The Genesis)",
    specialNoteBody:
      "ค่ายสานฝันเพื่อน้อง ครั้งที่ 1 เกิดขึ้นจากเจตนารมณ์อันแน่วแน่ของชมรมมุสลิม ม.อ. หาดใหญ่ ที่เล็งเห็นว่าเยาวชนมุสลิมในพื้นที่ภาคใต้เผชิญกับข้อจำกัดในการเข้าถึงข้อมูลการศึกษาต่อระดับอุดมศึกษา และขาดพื้นที่แนะนำแนวทางที่บูรณาการมิติด้านคุณธรรมและหลักการศาสนาอิสลามอย่างแท้จริง รุ่นที่ 1 จึงเป็นปฐมบทสำคัญในการวางรากฐาน สร้างคอนเซ็ปต์การแนะแนวที่ไม่เพียงชี้แนะคณะในฝัน แต่ร่วมปลูกฝังอุดมการณ์การเป็น 'ปัญญาชนมุสลิม' ที่ใช้วิชาชีพรับใช้สังคมและพระผู้เป็นเจ้า",
    description:
      "รุ่นริเริ่มสร้างประวัติศาสตร์ รวบรวมพี่น้องนักศึกษาจากหลากหลายคณะมาร่วมสร้างพื้นที่เรียนรู้ แนะนำ TCAS และการเตรียมตัวสอบเข้ามหาวิทยาลัยเป็นครั้งแรก",
    highlights: ["เปิดตัวโครงการครั้งแรก", "บูรณาการคุณธรรมสู่การศึกษา", "ริเริ่มฐานแนะแนวคณะหลัก"],
  },
  {
    generation: 2,
    roman: "2nd",
    yearTh: "2564",
    yearEn: "2021",
    themeTh: "ก้าวแห่งการเติบโต สานต่อสายใยแห่งความหวัง",
    themeEn: "Stepping Stones of Growth & Hope",
    colorGradient: "from-indigo-900 via-purple-900 to-pink-900",
    borderColor: "border-pink-500/40",
    hasSpecialNote: true,
    specialNoteTitle: "คำอธิบายพิเศษ: ก้าวแห่งการต่อยอดและการขยายฐานวิชาการ (The Expansion)",
    specialNoteBody:
      "ค่ายสานฝันเพื่อน้อง ครั้งที่ 2 คือก้าวสำคัญแห่งการเรียนรู้และยกระดับอย่างก้าวกระโดด ท่ามกลางบริบทความท้าทายของการศึกษาที่เปลี่ยนแปลง ค่ายรุ่นที่ 2 ได้ขยายขอบเขตการแนะแนวให้ครอบคลุมสาขาวิชาชีพที่หลากหลายยิ่งขึ้น พร้อมทั้งริเริ่มระบบพี่เลี้ยงประจำกลุ่ม (Murabbi / Mentor) เพื่อดูแลและรับฟังเสียงสะท้อนของน้องๆ อย่างใกล้ชิดแบบตัวต่อตัว การต่อยอดในรุ่นที่ 2 นี้เองที่กลายเป็นต้นแบบโครงสร้างอะมานะห์การจัดค่ายที่สืบทอดมาจนถึงปัจจุบัน",
    description:
      "รุ่นแห่งการขยายขอบเขตความรู้ พัฒนาระบบแบบทดสอบค้นหาตนเอง และจัดทำสมุดคู่มือแนะแนวการศึกษาฉบับแรกของค่าย",
    highlights: ["ขยายฐานวิชาการครบทุกสายวิชา", "ริเริ่มระบบพี่เลี้ยงที่ปรึกษา", "จัดทำคู่มือแนะแนวฉบับแรก"],
  },
  {
    generation: 3,
    roman: "3rd",
    yearTh: "2565",
    yearEn: "2022",
    themeTh: "จุดประกายไฟฝัน จุดประกายพลังแห่งอนาคต",
    themeEn: "Ignite Your Inner Spark",
    colorGradient: "from-purple-800 via-pink-900 to-purple-950",
    borderColor: "border-purple-400/30",
    description:
      "เน้นย้ำการสร้างแรงบันดาลใจและเสริมสร้าง Mindset เชิงบวก ให้น้องๆ ก้าวข้ามความลังเลใจ กล้าที่จะวาดฝันในเส้นทางที่สอดคล้องกับศักยภาพของตนเอง",
    highlights: ["เวทีเสวนาแรงบันดาลใจจากศิษย์เก่า", "กิจกรรม Workshop เชิงปฏิบัติการ", "เปิดบ้านแนะนำวิทยาเขต"],
  },
  {
    generation: 4,
    roman: "4th",
    yearTh: "2566",
    yearEn: "2023",
    themeTh: "มุ่งสู่เส้นชัย ด้วยศรัทธาและความรู้",
    themeEn: "Navigating Pathways with Faith & Wisdom",
    colorGradient: "from-slate-900 via-purple-900 to-indigo-900",
    borderColor: "border-indigo-400/30",
    description:
      "ยกระดับการเจาะลึกระบบ TCAS รอบ Portfolio, Quota และ Admission พร้อมจำลองสนามสอบสัมภาษณ์จริง (Mock Interview) ให้กับน้องๆ มัธยมปลาย",
    highlights: ["Mock Interview จำลองสัมภาษณ์เสมือนจริง", "เทคนิคทำพอร์ตฟอลิโอให้โดนใจ", "ขยายเครือข่ายโรงเรียนเครือข่าย"],
  },
  {
    generation: 5,
    roman: "5th",
    yearTh: "2567",
    yearEn: "2024",
    themeTh: "ร้อยเรียงความฝัน สู่ดวงดาวแห่งความสำเร็จ",
    themeEn: "Weaving Dreams into Reality",
    colorGradient: "from-purple-950 via-pink-950 to-purple-900",
    borderColor: "border-pink-400/30",
    description:
      "เชื่อมโยงความรู้เชิงวิชาการควบคู่กับการใช้ชีวิตในรั้วมหาวิทยาลัยจริง พร้อมทั้งเปิดเวทีแลกเปลี่ยนประสบการณ์ชีวิตนักศึกษาแพทย์ เภสัช วิศวะ และอื่นๆ",
    highlights: ["เจาะลึก 16 คณะยอดนิยม", "ค่ำคืนสานสัมพันธ์บายเนียร์", "เพิ่มสื่อดิจิทัลและวิดีโอแนะนำคณะ"],
  },
  {
    generation: 6,
    roman: "6th",
    yearTh: "2568",
    yearEn: "2025",
    themeTh: "แสงนำทางสู่ยอดเขาแห่งเป้าหมาย",
    themeEn: "The Guiding Beacon to the Summit",
    colorGradient: "from-indigo-950 via-purple-900 to-pink-900",
    borderColor: "border-purple-400/30",
    description:
      "พัฒนามาตรฐานค่ายสู่ระดับมืออาชีพอย่างเต็มรูปแบบ มีระบบสารสนเทศทะเบียนดิจิทัล และเพิ่มเนื้อหาการวางแผนชีวิตและการเงินเบื้องต้นสำหรับนักศึกษา",
    highlights: ["เปิดตัวระบบทะเบียนและ E-Book ค่าย", "ขยายกลุ่มเป้าหมายทั่วภาคใต้", "เครือข่ายวิทยากรระดับประเทศ"],
  },
  {
    generation: 7,
    roman: "7th",
    yearTh: "2569",
    yearEn: "2026",
    themeTh: "เบ่งบานสู่ยอดเขา นำทางด้วยศรัทธา",
    themeEn: "Bloom into your summit, guided by Deen",
    colorGradient: "from-purple-800 via-purple-900 to-pink-800",
    borderColor: "border-pink-400/60",
    description:
      "ค่ายสานฝันเพื่อน้อง ครั้งที่ 7 — รุ่นปัจจุบันที่นำแนวคิด 'ดอกไม้บานบนยอดเขา' ดอกไม้แต่ละดอกต่างมีฤดูกาลเบ่งบานของตนเอง ขอเพียงยึดมั่นในศรัทธาและทุ่มเทอย่างเต็มกำลัง",
    highlights: ["ธีม 'Bloom into your summit, guided by Deen'", "E-Book 3D Flipbook คมชัดระดับ Retina", "16 ฐานคณะแบบ Interactive"],
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
              position: d.role,
              department: d.dept || "ฝ่ายบริหาร",
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
              position: d.role,
              department: d.dept || "ฝ่ายบริหาร",
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
    return (
      <div
        key={m.id}
        className={`p-5 rounded-2xl bg-white border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${isMale ? "border-indigo-100 hover:border-indigo-300" : "border-pink-100 hover:border-pink-300"
          }`}
      >
        <div>
          {/* Avatar & Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div
              className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0 ${isMale
                ? "bg-gradient-to-tr from-indigo-700 to-purple-600"
                : "bg-gradient-to-tr from-pink-600 to-purple-600"
                }`}
            >
              {m.nickname.charAt(0)}
            </div>
            <div className="min-w-0">
              <h5 className="font-bold text-sm sm:text-base text-zinc-900 truncate">
                {m.fullName}
              </h5>
              <p
                className={`text-xs font-semibold truncate ${isMale ? "text-indigo-600" : "text-pink-600"
                  }`}
              >
                ชื่อเล่น: {isMale ? "พี่" : "กะ"}{m.nickname} • {m.year}
              </p>
              <span
                className={`inline-block text-[11px] px-2 py-0.5 rounded-md font-bold border mt-1 truncate max-w-full ${isMale
                  ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                  : "bg-pink-50 text-pink-800 border-pink-200"
                  }`}
              >
                {m.position}
              </span>
            </div>
          </div>

          {/* Detailed info */}
          <div className="space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">คณะ:</span>
              <span className="font-medium text-zinc-800 text-right">{m.faculty}</span>
            </div>
            {m.studentId && (
              <div className="flex justify-between">
                <span className="text-zinc-400">รหัสนักศึกษา:</span>
                <span className="font-mono text-zinc-700">{m.studentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400">ฝ่าย:</span>
              <span className="font-medium text-purple-700 text-right">{m.department}</span>
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1 text-xs">
          {m.phone && (
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="text-zinc-400 font-mono text-[11px]">Tel:</span>
              <a
                href={`tel:${m.phone}`}
                className={`font-mono font-medium ${isMale ? "hover:text-indigo-600" : "hover:text-pink-600"
                  }`}
              >
                {m.phone}
              </a>
            </div>
          )}
          {m.facebook && (
            <div className="flex items-center gap-2 text-zinc-700 truncate">
              <span className="text-zinc-400 font-mono text-[11px]">FB:</span>
              <span className="truncate text-zinc-800 font-medium">{m.facebook}</span>
            </div>
          )}
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
                <h2 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-3 mb-4">
                  นำทางความฝัน บ่มเพาะศรัทธา สู่รั้วมหาวิทยาลัย
                </h2>
                <div className="prose prose-purple max-w-none text-zinc-700 leading-relaxed space-y-4 text-sm sm:text-base">
                  <p>
                    <strong>Guidance for Dream (ค่ายสานฝันเพื่อน้อง)</strong> คือโครงการค่ายแนะแนวการศึกษาและพัฒนาศักยภาพเยาวชนระดับมัธยมศึกษาตอนปลาย จัดขึ้นโดย <strong>ชมรมมุสลิม มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่ (ม.อ.)</strong> ด้วยความมุ่งมั่นที่จะเป็นสะพานเชื่อมโอกาส มอบองค์ความรู้ และจุดประกายไฟแห่งความหวังให้กับน้องๆ นักเรียนในพื้นที่ภาคใต้และทั่วประเทศ
                  </p>
                  <p>
                    เราเชื่อมั่นว่า การศึกษาที่สมบูรณ์แบบไม่เพียงแต่มุ่งเน้นการสอบติดในคณะที่ใฝ่ฝันเท่านั้น หากแต่ต้องควบคู่กับการพัฒนาคุณธรรม จริยธรรม และการมีจิตสำนึกรับใช้สังคม ค่ายของเราจึงบูรณาการองค์ความรู้ TCAS กิจกรรมฐาน 16 คณะ การทดลองปฏิบัติการจริง และการแลกเปลี่ยนประสบการณ์ชีวิตนักศึกษาจากรุ่นพี่ในรั้ว ม.อ. อย่างอบอุ่นเสมือนครอบครัว
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-primary/15 flex items-center justify-center text-purple-dark font-bold">
                      7
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-deeper">จัดต่อเนื่องเป็นปีที่ 7</p>
                      <p className="text-[11px] text-zinc-500">สร้างแรงบันดาลใจแก่น้องๆ กว่า 2,000 คน</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">#GuidanceForDream #MSSPSU</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7 Editions & Logos Section */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                <span className="text-xs font-bold text-purple-primary uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  เส้นทางการเติบโต
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-deeper mt-2">
                  โลโก้และประวัติค่ายทั้ง 7 รุ่น (1st – 7th)
                </h3>
                <p className="text-zinc-600 text-sm mt-1">
                  ตราสัญลักษณ์และเอกลักษณ์ของค่ายสานฝันเพื่อน้องในแต่ละเจเนอเรชัน
                </p>
              </div>

              {/* Grid of 7 Editions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {CAMP_EDITIONS.map((ed) => (
                  <div
                    key={ed.generation}
                    className={`rounded-3xl bg-white border p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${ed.hasSpecialNote
                      ? "md:col-span-2 lg:col-span-1 border-purple-primary/40 ring-2 ring-purple-primary/20 bg-gradient-to-b from-white to-purple-50/40"
                      : "border-zinc-200 hover:border-purple-300"
                      }`}
                  >
                    {/* Top: Edition Badge & Year */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-deeper text-white shadow-sm">
                          รุ่นที่ {ed.generation} ({ed.roman})
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          ปี {ed.yearTh} / {ed.yearEn}
                        </span>
                      </div>

                      {/* Symbolic Logo Badge (Vector Graphic representation) */}
                      <div className="my-4 flex items-center justify-center">
                        <div
                          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br ${ed.colorGradient} flex flex-col items-center justify-center text-white shadow-lg p-2 text-center group-hover:scale-105 transition-transform duration-300 border-2 ${ed.borderColor}`}
                        >
                          <span className="text-[10px] font-mono tracking-widest text-pink-light/80 uppercase">
                            GUIDANCE
                          </span>
                          <span className="text-2xl sm:text-3xl font-black font-lucian text-glow-white tracking-wider">
                            {ed.roman}
                          </span>
                          <span className="text-[9px] text-white/70 line-clamp-1 font-mono">
                            {ed.yearEn}
                          </span>
                        </div>
                      </div>

                      {/* Theme Title */}
                      <h4 className="text-base sm:text-lg font-bold text-purple-deeper text-center mb-1">
                        {ed.themeTh}
                      </h4>
                      <p className="text-xs text-zinc-500 text-center font-mono italic mb-4">
                        &ldquo;{ed.themeEn}&rdquo;
                      </p>

                      {/* SPECIAL NOTE CALLOUT FOR 1ST AND 2ND EDITIONS */}
                      {ed.hasSpecialNote && (
                        <div className="mb-4 p-4 rounded-2xl bg-purple-900 text-white border border-purple-700/60 shadow-inner">
                          <div className="flex items-center gap-2 mb-2 text-pink-light font-bold text-xs uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                            <span>{ed.specialNoteTitle}</span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed">
                            {ed.specialNoteBody}
                          </p>
                        </div>
                      )}

                      {/* Regular Description */}
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                        {ed.description}
                      </p>
                    </div>

                    {/* Bottom Highlights */}
                    <div className="pt-4 border-t border-zinc-100 mt-2">
                      <p className="text-[11px] font-bold text-purple-primary uppercase tracking-wider mb-2">
                        จุดเด่นประจำรุ่น:
                      </p>
                      <ul className="space-y-1">
                        {ed.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-zinc-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-accent" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
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
                          รวม {totalInDept} ท่าน
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
                          <span>มุสลีมีน / พี่น้องฝ่ายชาย ({deptMales.length} ท่าน)</span>
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
                          <span>มุสลิมะฮ์ / พี่น้องฝ่ายหญิง ({deptFemales.length} ท่าน)</span>
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
    </div>
  );
}

