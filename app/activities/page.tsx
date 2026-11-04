"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "../components/SubpageHero";

export interface ActivitySubItem {
  title: string;
  desc: string;
}

export interface FacultyStation {
  id: string;
  order: number;
    sticker: string;
  nameTh: string;
  nameEn: string;
  theme: string;
  category: "health" | "sci_tech" | "social";
  categoryLabel: string;
  gradient: string;
  studyAbout: string;
  curriculum: string;
  learningStyle: string;
  careers: string;
  selfCheck: string;
  workshop: string;
  activityItems: ActivitySubItem[];
  docId: string;
}

export const facultiesData: FacultyStation[] = [
  {
    id: "med",
    order: 1,
        sticker: "/images/stickers/med.png",
    nameTh: "คณะแพทยศาสตร์",
    nameEn: "Faculty of Medicine",
    theme: "Lifeline Ridge — สันเขาแห่งชีวิต",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-emerald-600 to-teal-800",
    studyAbout: "การดูแลสุขภาพ ตั้งแต่ตรวจวินิจฉัยและรักษาโรค ฟื้นฟูการเคลื่อนไหว ใช้เทคโนโลยีรังสีไปจนถึงช่วยเหลือผู้ป่วยฉุกเฉิน",
    curriculum: "แพทยศาสตรบัณฑิต 6 ปี / กายภาพบำบัด รังสีเทคนิค และปฏิบัติการฉุกเฉินการแพทย์ 4 ปี",
    learningStyle: "เรียนพื้นฐานวิทยาศาสตร์สุขภาพ ฝึกทักษะในห้องปฏิบัติการและฝึกดูแลผู้ป่วยตามวิชาชีพของตน",
    careers: "แพทย์, นักกายภาพบำบัด, นักรังสีเทคนิค และนักฉุกเฉินการแพทย์",
    selfCheck: "สนใจร่างกายมนุษย์ ชอบช่วยเหลือผู้อื่น และพร้อมรับผิดชอบงานที่เกี่ยวข้อง",
    workshop: "แนะแนวคณะ เจาะลึก TCAS และเปิดโอกาสถามตอบ พร้อม Workshop ให้ทดลองการห้ามเลือด และการใช้หูฟัง (Stethoscope)",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "จุดเด่นของคณะ เรียนอะไรบ้าง อาชีพหลังจบ วิธีการเข้าคณะนี้รูปแบบไหนบ้าง (TCAS) และการเตรียมตัว",
      },
      {
        title: "ถามตอบคลายข้อสงสัย",
        desc: "เปิดโอกาสให้น้อง ๆ ได้ซักถามและพูดคุยกับพี่ ๆ นักศึกษาแพทย์อย่างใกล้ชิด",
      },
      {
        title: "Workshop ฝึกปฏิบัติการ",
        desc: "ให้น้อง ๆ ทดลองการห้ามเลือด และการใช้หูฟังตรวจชีพจรและเสียงหัวใจ (Stethoscope)",
      },
    ],
    docId: "3ad1ecea-804f-49f2-8ca6-cd3376a16791",
  },
  {
    id: "dent",
    order: 2,
        sticker: "/images/stickers/dent.png",
    nameTh: "คณะทันตแพทยศาสตร์",
    nameEn: "Faculty of Dentistry",
    theme: "Smile Creek — ลำธารแห่งรอยยิ้ม",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-sky-600 to-blue-800",
    studyAbout: "การป้องกัน วินิจฉัย และรักษาโรคของฟัน ช่องปาก และอวัยวะที่เกี่ยวข้อง",
    curriculum: "ทันตแพทยศาสตรบัณฑิต 6 ปี",
    learningStyle: "เรียนวิทยาศาสตร์สุขภาพ ฝึกทักษะงานทันตกรรมกับแบบจำลอง ก่อนฝึกรักษาผู้ป่วยจริงภายใต้การดูแล",
    careers: "ทันตแพทย์ในโรงพยาบาลหรือคลินิก งานส่งเสริมสุขภาพช่องปาก และศึกษาต่อเฉพาะทาง",
    selfCheck: "ชอบงานละเอียด ใช้ทักษะมือ มีสมาธิ และสื่อสารกับผู้ป่วยได้ดี",
    workshop: "เจาะลึกการเรียนพรีคลินิก/คลินิก ค่าใช้จ่ายและอุปกรณ์ พร้อมเวิร์กช็อปฝึกวาดภาพแบบ Indirect Drawing ผ่านกระจก",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "นำเสนอรูปแบบการเรียนในชั้นพรีคลินิก/คลินิก และลักษณะการทำงานของอาชีพทันตแพทย์ รวมไปถึงค่าใช้จ่าย (อุปกรณ์) และค่าเทอม พร้อมแนะนำการเตรียมตัวเข้าศึกษาต่อ",
      },
      {
        title: "กิจกรรมเวิร์คช็อป (Indirect Drawing)",
        desc: "อธิบายลักษณะการทำงาน และให้น้อง ๆ ฝึกการวาดภาพแบบ indirect โดยวาดตามภาพที่เห็นในกระจก จำลองทักษะมือหมอฟัน",
      },
    ],
    docId: "0d48af6f-4957-4d32-a545-f0ab436b8472",
  },
  {
    id: "pharm",
    order: 3,
        sticker: "/images/stickers/pharm.png",
    nameTh: "คณะเภสัชศาสตร์",
    nameEn: "Faculty of Pharmaceutical Sciences",
    theme: "Nature's Remedy — สวนยากลางไพร",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-teal-600 to-emerald-800",
    studyAbout: "ยา ตั้งแต่การค้นคว้า ผลิตและตรวจสอบคุณภาพ ไปจนถึงการเลือกใช้ยาให้เหมาะสมกับผู้ป่วย",
    curriculum: "เภสัชศาสตรบัณฑิต 6 ปี มีสาขาการบริบาลทางเภสัชกรรม และเภสัชกรรมอุตสาหการ",
    learningStyle: "เรียนเคมี ชีววิทยาและการออกฤทธิ์ของยา ทำแล็บ ฝึกงานด้านยาและการดูแลผู้ป่วยตามสาขา",
    careers: "เภสัชกรโรงพยาบาล, เภสัชกรร้านยา, งานผลิตยา, ประกันคุณภาพ, วิจัยและพัฒนา หรือขึ้นทะเบียนผลิตภัณฑ์",
    selfCheck: "สนใจเคมีและสุขภาพ รอบคอบ และชอบค้นหาคำตอบจากข้อมูลที่น่าเชื่อถือ",
    workshop: "เจาะลึก 2 สาขาวิชา พร้อมเวิร์กช็อปตรวจสอบใบสั่งยาเทียบกับเวชระเบียน และตรวจสอบซองยา/ฉลากยา",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "จุดเด่นของคณะ เรียนอะไรบ้าง อาชีพหลังจบ แนวทางศึกษาต่อ/ทุน และการนำความรู้ไปพัฒนาสังคมมุสลิม",
      },
      {
        title: "Workshop ตรวจสอบใบสั่งยา",
        desc: "ให้น้อง ๆ ลองตรวจใบสั่งยาเทียบกับเวชระเบียนผู้ป่วย โดยเทียบชื่อผู้ป่วย ประวัติแพ้ยา ชื่อยา ความแรง วิธีใช้ แล้ววงจุดที่ไม่ตรงกันที่ต้องตรวจสอบเพิ่ม",
      },
      {
        title: "Workshop ตรวจสอบซองยาและฉลากยา",
        desc: "ให้น้อง ๆ ตรวจชื่อยา จำนวนเม็ดยา และฉลากยาเทียบกับใบสั่งยาจำลอง",
      },
    ],
    docId: "36bc323f-8ed2-463e-b1ca-37f52c55a3f7",
  },
  {
    id: "nurse",
    order: 4,
        sticker: "/images/stickers/nurse.png",
    nameTh: "คณะพยาบาลศาสตร์",
    nameEn: "Faculty of Nursing",
    theme: "A Place to Heal — พื้นที่แห่งการเยียวยา",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-rose-500 to-pink-700",
    studyAbout: "การดูแลผู้รับบริการทุกช่วงวัย ทั้งการส่งเสริมสุขภาพ ป้องกันโรค ดูแลขณะเจ็บป่วย และฟื้นฟูสุขภาพ",
    curriculum: "พยาบาลศาสตรบัณฑิต 4 ปี",
    learningStyle: "เรียนทฤษฎี ฝึกทักษะในห้องปฏิบัติการ และฝึกปฏิบัติในโรงพยาบาลและชุมชน",
    careers: "พยาบาลวิชาชีพในโรงพยาบาล สถานบริการสุขภาพ และงานดูแลสุขภาพในชุมชนหรือสถานประกอบการ",
    selfCheck: "ใส่ใจผู้อื่น ทำงานเป็นทีมได้ และพร้อมปรับตัวกับงานที่อาจต้องเข้าเวร",
    workshop: "แนะนำหลักสูตรและทุนการศึกษา พร้อมกิจกรรม CPR Hero ฝึกปฏิบัติการฟื้นคืนชีพกับหุ่นจริงทุกคน",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะนำคณะ อธิบายหลักสูตรการเรียน วิธีการรับสมัคร สายงานการประกอบอาชีพ และทุนการศึกษา",
      },
      {
        title: "กิจกรรม CPR Hero",
        desc: "สาธิตและให้ความรู้การฟื้นคืนชีพ จำลองสถานการณ์โดยขออาสาสมัคร 2 คน และให้ผู้เข้าร่วมทุกคนผลัดกันฝึก CPR กับหุ่นที่เตรียมไว้",
      },
    ],
    docId: "85a3c1cc-a0c5-4573-8668-021c74c1a63e",
  },
  {
    id: "medtech",
    order: 5,
        sticker: "/images/stickers/medtech.png",
    nameTh: "คณะเทคนิคการแพทย์",
    nameEn: "Faculty of Medical Technology",
    theme: "Hidden Clues — นักสืบหลังเลนส์",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-cyan-600 to-blue-800",
    studyAbout: "การตรวจเลือด ปัสสาวะ และสิ่งส่งตรวจอื่น เพื่อช่วยวินิจฉัย ติดตามการรักษา และประเมินสุขภาพ",
    curriculum: "วิทยาศาสตรบัณฑิต สาขาวิชาเทคนิคการแพทย์ 4 ปี",
    learningStyle: "เรียนเรื่องเลือด เชื้อโรค ภูมิคุ้มกันและสารเคมีในร่างกาย ฝึกใช้เครื่องมือ และฝึกงานในห้องปฏิบัติการทางการแพทย์",
    careers: "นักเทคนิคการแพทย์ในโรงพยาบาลหรือห้องแล็บ งานวิจัย และงานผลิตภัณฑ์ตรวจวิเคราะห์ทางการแพทย์",
    selfCheck: "ชอบชีววิทยา งานทดลอง และการวิเคราะห์ที่ต้องอาศัยความแม่นยำ",
    workshop: "สาธิต Streak Plate แยกเชื้อแบคทีเรีย, ส่องกล้องจุลทรรศน์ดูเม็ดเลือด RBC และแข่งตอบคำถาม Kahoot ชิงรางวัล",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะนำการเรียน การสมัครเข้าศึกษาและการประกอบอาชีพของนักเทคนิคการแพทย์",
      },
      {
        title: "Streak Plate",
        desc: "อธิบายและสาธิตการแยกเชื้อให้ได้ Isolated colony พร้อมให้น้อง ๆ ทดลองปฏิบัติจริง",
      },
      {
        title: "ส่องกล้องจุลทรรศน์",
        desc: "ให้น้อง ๆ ทดลองส่องและเรียนรู้ตัวอย่าง Normal/Abnormal RBC และเชื้อแบคทีเรีย เช่น S. aureus, E. coli.",
      },
      {
        title: "Kahoot ชิงรางวัล",
        desc: "เล่นเกมตอบคำถามทบทวนความรู้จากกิจกรรม พร้อมแจกของรางวัล",
      },
    ],
    docId: "cc4c3983-54b4-4cd3-b036-45734821e3da",
  },
  {
    id: "thaimed",
    order: 6,
        sticker: "/images/stickers/thaimed.png",
    nameTh: "คณะการแพทย์แผนไทย",
    nameEn: "Faculty of Traditional Thai Medicine",
    theme: "สวนสมุนไพรกลางเขา",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-lime-600 to-emerald-800",
    studyAbout: "การดูแลสุขภาพด้วยศาสตร์การแพทย์แผนไทย เชื่อมโยงกับความรู้วิทยาศาสตร์สุขภาพ",
    curriculum: "การแพทย์แผนไทยบัณฑิต 4 ปี",
    learningStyle: "เรียนเวชกรรมไทย เภสัชกรรมไทย การนวดไทย และการผดุงครรภ์ไทย มีการฝึกปฏิบัติและฝึกประสบการณ์วิชาชีพ (ชั้นปีที่ 4 เน้นการฝึกวิชาชีพ)",
    careers: "แพทย์แผนไทยในสถานบริการสุขภาพ คลินิกแพทย์แผนไทย และผู้ประกอบการด้านสมุนไพรหรือบริการส่งเสริมสุขภาพ",
    selfCheck: "สนใจสุขภาพ สมุนไพร ภูมิปัญญาไทย และชอบลงมือปฏิบัติ",
    workshop: "เจาะลึก TCAS จุดเด่นคณะ ถามตอบคลายข้อสงสัย พร้อมสาธิตและฝึกทำลูกประคบสมุนไพรจิ๋วด้วยตนเอง",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "จุดเด่นของคณะ เรียนอะไรบ้าง อาชีพหลังจบ วิธีการเข้าคณะนี้รูปแบบไหนบ้าง (TCAS)",
      },
      {
        title: "กิจกรรมถามตอบ",
        desc: "เปิดโอกาสให้น้อง ๆ ได้ถามและตอบคำถามข้อสงสัยต่าง ๆ กับพี่ ๆ ในคณะ",
      },
      {
        title: "สาธิตการทำลูกประคบ",
        desc: "สาธิตการทำลูกประคบจิ๋ว พร้อมให้น้อง ๆ ค่ายฝึกการทำลูกประคบสมุนไพรจริง",
      },
    ],
    docId: "e8c14bf3-6b13-4e0e-ad52-422d2ecfeaa5",
  },
  {
    id: "vet",
    order: 7,
        sticker: "/images/stickers/vet.png",
    nameTh: "คณะสัตวแพทยศาสตร์",
    nameEn: "Faculty of Veterinary Science",
    theme: "Wildlife Trail — เส้นทางสู่โลกของสัตว์",
    category: "health",
    categoryLabel: "วิทยาศาสตร์สุขภาพ",
    gradient: "from-amber-600 to-stone-800",
    studyAbout: "สุขภาพและโรคของสัตว์ รวมถึงการป้องกันโรคที่เกี่ยวข้องกับคนและความปลอดภัยของอาหารจากสัตว์",
    curriculum: "สัตวแพทยศาสตรบัณฑิต 6 ปี",
    learningStyle: "เรียนโครงสร้างร่างกายสัตว์ โรค ยาและการรักษา ฝึกในห้องแล็บ โรงพยาบาลสัตว์ และพื้นที่เลี้ยงสัตว์",
    careers: "สัตวแพทย์สัตว์เลี้ยง, สัตวแพทย์ประจำฟาร์ม, งานควบคุมโรคสัตว์, งานปศุสัตว์ และธุรกิจที่เกี่ยวข้องกับสุขภาพสัตว์",
    selfCheck: "สนใจวิทยาศาสตร์และสัตว์ พร้อมรับมือกับสัตว์เจ็บป่วยและการทำงานภาคสนาม",
    workshop: "แนะแนวสายงานสัตวแพทย์ การ์ดเกมอาหารซ่อนพิษ และเรียนรู้วิธีสังเกตอาหารหลัก/เสริมในสัตว์เลี้ยง",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะนำคณะ อธิบายหลักสูตรการเรียน วิธีการรับสมัคร และสายงานการประกอบอาชีพ",
      },
      {
        title: "กิจกรรมอาหารซ่อนพิษ",
        desc: "การ์ดเกมให้น้อง ๆ ได้เรียนรู้ชนิดของอาหารว่าสิ่งไหนสัตว์เลี้ยงกินได้หรือไม่ได้",
      },
      {
        title: "เรียนรู้อาหารหลัก/เสริมในอาหารสัตว์",
        desc: "น้อง ๆ จะได้เรียนรู้วิธีสังเกตประเภทของอาหารสัตว์เลี้ยง และสารอาหารที่สัตว์ต้องการ",
      },
    ],
    docId: "dc341bae-b2ad-460e-b787-e3944d711ec2",
  },
  {
    id: "eng",
    order: 8,
        sticker: "/images/stickers/eng.png",
    nameTh: "คณะวิศวกรรมศาสตร์",
    nameEn: "Faculty of Engineering",
    theme: "Build the Way — นักประดิษฐ์กลางป่า",
    category: "sci_tech",
    categoryLabel: "วิศวะ & วิทย์",
    gradient: "from-orange-600 to-amber-800",
    studyAbout: "ใช้คณิตศาสตร์ วิทยาศาสตร์ และเทคโนโลยีออกแบบระบบหรือสร้างสิ่งที่ช่วยแก้ปัญหา",
    curriculum: "ไฟฟ้า ชีวการแพทย์ เครื่องกล เมคาทรอนิกส์ โยธา สิ่งแวดล้อม อุตสาหการ การผลิต เหมืองแร่และวัสดุ เคมี คอมพิวเตอร์ ปัญญาประดิษฐ์ และเซมิคอนดักเตอร์ รวมถึงวิศวกรรมและการจัดการนวัตกรรม และวิศวกรรมยาง (นานาชาติ) โดยทั่วไป 4 ปี",
    learningStyle: "เรียนพื้นฐานคำนวณและวิศวกรรม ทำแล็บ ออกแบบชิ้นงาน ทำโครงงาน และฝึกงานตามหลักสูตร",
    careers: "วิศวกรตามสาขา, นักพัฒนาซอฟต์แวร์, งานระบบอัตโนมัติ, งานออกแบบและควบคุมการผลิต หรืองานวิจัยและพัฒนา",
    selfCheck: "ชอบคิดเป็นระบบ แก้ปัญหา ทดลอง และสร้างผลงานที่ใช้งานได้จริง",
    workshop: "นำเสนอภาพรวมทุกสาขาวิศวะ ทุนการศึกษา การเตรียมตัว TCAS 70 ถามตอบกับพี่ๆ และ Workshop เชิงวิศวกรรมศาสตร์",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "นำเสนอภาพรวมของคณะวิศวกรรมศาสตร์ ม.อ. หาดใหญ่ แต่ละสาขาเรียนเกี่ยวกับอะไร จบไปทำอะไรได้บ้าง ทุนการศึกษาที่คณะมีให้ TCAS 70 การเตรียมตัวของพี่ ๆ และคิวอาร์โค้ดช่องทางติดตามข่าวสาร",
      },
      {
        title: "ถาม-ตอบ",
        desc: "ถาม-ตอบกับพี่ ๆ นักศึกษาคณะวิศวกรรมศาสตร์ทุกสาขาวิชา",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "Workshop เชิงวิศวกรรมศาสตร์ สัมผัสโจทย์และการคิดแก้ปัญหาจริง",
      },
    ],
    docId: "f4d4a228-ac9d-4073-953f-5e3a3a8e8914",
  },
  {
    id: "sci",
    order: 9,
        sticker: "/images/stickers/sci.png",
    nameTh: "คณะวิทยาศาสตร์",
    nameEn: "Faculty of Science",
    theme: "Wonder Woods — นักวิทย์สำรวจเขา",
    category: "sci_tech",
    categoryLabel: "วิศวะ & วิทย์",
    gradient: "from-indigo-600 to-purple-800",
    studyAbout: "ค้นหาคำอธิบายของธรรมชาติ และนำความรู้ไปพัฒนาเทคโนโลยี ผลิตภัณฑ์ หรือวิธีแก้ปัญหา",
    curriculum: "เคมี วัสดุศาสตร์ ฟิสิกส์ ชีววิทยา เทคโนโลยีชีวภาพ จุลชีววิทยา คณิตศาสตร์ สถิติประยุกต์และวิทยาการข้อมูล วิทยาการคอมพิวเตอร์ และเทคโนโลยีสารสนเทศและการสื่อสาร (โดยทั่วไป 4 ปี)",
    learningStyle: "เน้นทฤษฎีควบคู่การทดลอง การเขียนโปรแกรม การวิเคราะห์ข้อมูล หรือโครงงานวิจัยตามสาขา",
    careers: "นักวิทยาศาสตร์, นักวิเคราะห์ห้องปฏิบัติการ, งานควบคุมคุณภาพ, นักพัฒนาซอฟต์แวร์ และนักวิเคราะห์ข้อมูล ตามความเชี่ยวชาญ",
    selfCheck: "ชอบตั้งคำถาม ทดลอง คำนวณ หรือค้นหาคำตอบจากหลักฐาน",
    workshop: "เกณฑ์สอบ TCAS และทุน พร้อมกิจกรรม Forensic Science (นักสืบคณะวิทย์) ตรวจสอบสารปริศนาด้วยตัวบ่งชี้กรด-เบส",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "เกณฑ์การสอบ / รายละเอียดทุน / ระบบ TCAS คณะวิทยาศาสตร์ ม.อ.",
      },
      {
        title: "กิจกรรม Forensic Science (นักสืบคณะวิทย์)",
        desc: "สถานการณ์จำลอง ภารกิจให้น้อง ๆ ตรวจสอบสารปริศนาด้วยสารบ่งชี้กรด–เบส เปรียบเทียบกับตัวอย่างอ้างอิง และระบุว่าสารปริศนาน่าจะตรงกับตัวอย่างของนักศึกษาคนใด",
      },
    ],
    docId: "50305e1c-25f4-4b1b-9d60-05b41f7d879b",
  },
  {
    id: "natres",
    order: 10,
        sticker: "/images/stickers/natres.png",
    nameTh: "คณะทรัพยากรธรรมชาติ",
    nameEn: "Faculty of Natural Resources",
    theme: "Forest Guardians — หน่วยพิทักษ์ธรรมชาติ",
    category: "sci_tech",
    categoryLabel: "วิศวะ & วิทย์",
    gradient: "from-green-600 to-emerald-800",
    studyAbout: "การผลิตและจัดการด้านการเกษตร พืช สัตว์ และทรัพยากรทางน้ำ โดยใช้วิทยาศาสตร์และเทคโนโลยี",
    curriculum: "เกษตรศาสตร์ สัตวศาสตร์ วาริชศาสตร์ และนวัตกรรมการเกษตรและการจัดการ (โดยทั่วไป 4 ปี)",
    learningStyle: "เรียนพื้นฐานวิทยาศาสตร์ ทำแล็บ ฝึกในแปลงหรือฟาร์ม ลงพื้นที่ และเรียนรู้การจัดการเกษตรจริง (มีวิชาเอกพืชศาสตร์ ปฐพีศาสตร์ การจัดการศัตรูพืช และพัฒนาการเกษตร)",
    careers: "นักวิชาการเกษตร, งานส่งเสริมการเกษตร, งานฟาร์มและเพาะเลี้ยงสัตว์น้ำ, ธุรกิจอาหารสัตว์ และผู้ประกอบการเกษตร",
    selfCheck: "สนใจธรรมชาติ อาหารและการเกษตร ชอบทดลอง และพร้อมทำงานกลางแจ้ง",
    workshop: "แนะแนวคณะโดยพี่ ๆ พร้อมกิจกรรม Workshop ชวนขบคิดทิศทางการเกษตรไทยยุคใหม่และการเติบโตในอนาคต",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะแนวคณะทรัพยากรธรรมชาติโดยพี่ ๆ ในคณะแบบเจาะลึก",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "คิดยังไงกับการเกษตรของไทยในยุคนี้ ? ในอนาคตจะมองการเกษตรของไทย เติบโตไปทางไหน ?",
      },
    ],
    docId: "c0b37cad-5f89-44d7-a249-71c4eb0cc864",
  },
  {
    id: "agro",
    order: 11,
        sticker: "/images/stickers/agro.png",
    nameTh: "คณะอุตสาหกรรมเกษตร",
    nameEn: "Faculty of Agro-Industry",
    theme: "Harvest Valley — หุบเขาแห่งผลผลิต",
    category: "sci_tech",
    categoryLabel: "วิศวะ & วิทย์",
    gradient: "from-amber-500 to-yellow-700",
    studyAbout: "นำวัตถุดิบเกษตรมาพัฒนาเป็นอาหาร ผลิตภัณฑ์ และบรรจุภัณฑ์ที่มีคุณภาพและมูลค่าเพิ่ม",
    curriculum: "วิทยาศาสตร์และเทคโนโลยีอาหาร, เทคโนโลยีบรรจุภัณฑ์และวัสดุ, เทคโนโลยีและการจัดการอุตสาหกรรมอาหาร และการกำหนดอาหารและโภชนาการเพื่อสุขภาพ (นานาชาติ) โดยทั่วไป 4 ปี",
    learningStyle: "เรียนวิทยาศาสตร์อาหารและกระบวนการผลิต ทำแล็บ ทดลองพัฒนาผลิตภัณฑ์ และฝึกประสบการณ์ตามสาขา",
    careers: "งานวิจัยและพัฒนาผลิตภัณฑ์อาหาร, งานควบคุมหรือประกันคุณภาพ, งานบรรจุภัณฑ์, งานโภชนาการ และผู้ประกอบการอาหาร",
    selfCheck: "สนใจวิทยาศาสตร์เบื้องหลังอาหาร ชอบทดลองสูตรหรือพัฒนาผลิตภัณฑ์ และใส่ใจคุณภาพ",
    workshop: "แนะแนวโดยพี่วิทยา พร้อมกิจกรรมคำนวณ BMI/TDEE/IBW, ตรวจความเข้มข้นด้วย Refractometer และส่องกล้องจุลทรรศน์",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะนำคณะโดยพี่วิทยาจากคณะอุตสาหกรรมเกษตร",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "การคำนวณและประเมินสัดส่วนร่างกาย หาค่า BMI, TDEE, IBW",
      },
      {
        title: "Refractometer",
        desc: "กิจกรรมหาความเข้มข้นของวัตถุดิบด้วยอุปกรณ์ Refractometer",
      },
      {
        title: "ส่องกล้องจุลทรรศน์",
        desc: "กิจกรรมส่องกล้องจุลทรรศน์ตรวจดูโครงสร้างเซลล์อาหาร",
      },
    ],
    docId: "15e412a0-8152-4ecd-80ac-18e458c54a0c",
  },
  {
    id: "fms",
    order: 12,
        sticker: "/images/stickers/fms.png",
    nameTh: "คณะวิทยาการจัดการ",
    nameEn: "Faculty of Management Sciences",
    theme: "Make It Count — นักวางแผนพิชิตเขา",
    category: "social",
    categoryLabel: "สังคม & บริหาร",
    gradient: "from-blue-600 to-indigo-800",
    studyAbout: "การบริหารธุรกิจ องค์กร ทรัพยากร และงานภาครัฐ",
    curriculum: "บริหารธุรกิจ (การตลาด, การเงิน, HR, MIS, โลจิสติกส์, MICE), บัญชี, รัฐประศาสนศาสตร์ และการจัดการความเป็นผู้ประกอบการ (นานาชาติ) 4 ปี",
    learningStyle: "เรียนแนวคิดการจัดการ วิเคราะห์กรณีศึกษา ทำงานกลุ่ม วางแผนธุรกิจหรือโครงการ และฝึกประสบการณ์ตามหลักสูตร",
    careers: "นักการตลาด, นักบัญชี, งานการเงิน, งานบุคคล, งานโลจิสติกส์, งานจัดประชุมและนิทรรศการ, งานบริหารภาครัฐ และผู้ประกอบการ",
    selfCheck: "สนใจธุรกิจหรือองค์กร ชอบวางแผน สื่อสาร และทำงานร่วมกับคนอื่น",
    workshop: "แนะแนวร่วมกับเศรษฐศาสตร์ พร้อมกิจกรรม Workshop สุดเข้มข้น “วิกฤตชานมไข่มุก (The Boba Crisis Simulation)”",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะแนวเจาะลึกคณะวิทยาการจัดการ และคณะเศรษฐศาสตร์ ม.อ.",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "“วิกฤตชานมไข่มุก (The Boba Crisis Simulation)” กิจกรรมจำลองการบริหารจัดการธุรกิจและการตัดสินใจท่ามกลางวิกฤต",
      },
    ],
    docId: "ab7c1a1f-c577-40bd-b78b-d37d638cbd8b",
  },
  {
    id: "econ",
    order: 13,
        sticker: "/images/stickers/econ.png",
    nameTh: "คณะเศรษฐศาสตร์",
    nameEn: "Faculty of Economics",
    theme: "Make It Count — นักวางแผนพิชิตเขา",
    category: "social",
    categoryLabel: "สังคม & บริหาร",
    gradient: "from-violet-600 to-purple-800",
    studyAbout: "การตัดสินใจใช้ทรัพยากรของคน ธุรกิจและประเทศ รวมถึงการวิเคราะห์ราคา ตลาด และนโยบายเศรษฐกิจ",
    curriculum: "เศรษฐศาสตรบัณฑิต และหลักสูตรด้านเศรษฐศาสตร์ธุรกิจเกษตร (โดยทั่วไป 4 ปี)",
    learningStyle: "เรียนเศรษฐศาสตร์ คณิตศาสตร์และสถิติ ใช้ข้อมูลและโปรแกรมวิเคราะห์ปัญหา เชื่อมกับสถานการณ์จริงทางเศรษฐกิจและธุรกิจ",
    careers: "นักเศรษฐศาสตร์, นักวิเคราะห์ข้อมูลหรือธุรกิจ, งานธนาคาร, งานวิเคราะห์นโยบาย และงานธุรกิจเกษตร",
    selfCheck: "ชอบตั้งคำถามว่า “ทำไมราคาเปลี่ยน” หรือ “นโยบายนี้กระทบใคร” และสนใจใช้ข้อมูลอธิบายเหตุการณ์",
    workshop: "แนะแนวร่วมกับวิทยาการจัดการ พร้อมเวิร์กช็อปจำลองเศรษฐกิจ “วิกฤตชานมไข่มุก (The Boba Crisis Simulation)”",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะแนวคณะวิทยาการจัดการ และคณะเศรษฐศาสตร์",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "“วิกฤตชานมไข่มุก (The Boba Crisis Simulation)” วิเคราะห์กลไกราคา อุปสงค์อุปทาน และการตัดสินใจในตลาดจำลอง",
      },
    ],
    docId: "fc59792d-e6e6-46c2-b98d-4acbaa02fa03",
  },
  {
    id: "law",
    order: 14,
        sticker: "/images/stickers/law.png",
    nameTh: "คณะนิติศาสตร์",
    nameEn: "Faculty of Law",
    theme: "The Right Path — เส้นทางแห่งความเป็นธรรม",
    category: "social",
    categoryLabel: "สังคม & บริหาร",
    gradient: "from-stone-600 to-neutral-800",
    studyAbout: "กฎหมาย สิทธิ หน้าที่ และกระบวนการยุติธรรม เพื่อนำไปวิเคราะห์และแก้ปัญหาในสังคม",
    curriculum: "นิติศาสตรบัณฑิต (โดยทั่วไป 4 ปี)",
    learningStyle: "อ่านและตีความกฎหมาย วิเคราะห์ข้อเท็จจริง ฝึกให้เหตุผลจากกรณีศึกษา และเรียนรู้ผ่านกิจกรรมกฎหมายเชิงปฏิบัติ",
    careers: "นิติกร, งานกฎหมายบริษัท, งานกำกับการปฏิบัติตามกฎระเบียบ และเส้นทางทนายความ อัยการหรือผู้พิพากษา (มีการสอบเพิ่มเติม)",
    selfCheck: "ชอบอ่าน จับประเด็น ใช้เหตุผล และพิจารณาปัญหาจากหลายมุมมอง",
    workshop: "แนะแนว TCAS ทุน และหน่วยกิตล่วงหน้า พร้อมกิจกรรมสวมบทบาทในศาลจำลอง (Mock Trial) แบ่ง 2 รอบ สวมบทบาททนาย/จำเลย/ผู้พิพากษา",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "TCAS ทุนการศึกษา โครงการเก็บหน่วยกิตล่วงหน้า และอาชีพในอนาคต",
      },
      {
        title: "กิจกรรมสวมบทบาทในศาลจำลอง (Mock Trial)",
        desc: "แบ่งเป็น 2 รอบ รอบละ 15 นาที จำลองบทบาทการโต้เถียงในชั้นศาล โดยสวมบทบาทเป็นทนายความ จำเลย และผู้พิพากษา",
      },
    ],
    docId: "0b5df334-21fb-4ed9-ad29-1aef43ccb1f0",
  },
  {
    id: "libarts",
    order: 15,
        sticker: "/images/stickers/libarts.png",
    nameTh: "คณะศิลปศาสตร์",
    nameEn: "Faculty of Liberal Arts",
    theme: "Many Voices, One World — ต่างภาษา ต่างมุมมอง โลกใบเดียวกัน",
    category: "social",
    categoryLabel: "สังคม & บริหาร",
    gradient: "from-fuchsia-600 to-pink-800",
    studyAbout: "ภาษา การสื่อสาร มนุษย์และชุมชน รวมถึงการประยุกต์ความรู้กับงานบริการ",
    curriculum: "ภาษาไทยประยุกต์ ภาษาอังกฤษ ภาษาจีน ชุมชนศึกษาเพื่อการพัฒนาที่ยั่งยืน และการจัดการอุตสาหกรรมการบินและการบริการ (โดยทั่วไป 4 ปี)",
    learningStyle: "ฝึกฟัง พูด อ่าน เขียน วิเคราะห์ภาษาและวัฒนธรรม ทำโครงการ ลงพื้นที่ หรือฝึกงานตามสาขา",
    careers: "งานแปลและประสานงานต่างประเทศ, งานสื่อสารและเนื้อหา, งานพัฒนาชุมชน, งานบริการผู้โดยสาร และงานในอุตสาหกรรมบริการ",
    selfCheck: "สนใจภาษา ผู้คนและวัฒนธรรม ชอบสื่อสาร หรืออยากทำงานเชื่อมโยงคนต่างกลุ่ม",
    workshop: "แนะแนวร่วมกับวิทยาลัยนานาชาติ พร้อมกิจกรรม Workshop: Role Play และ Take Pic Easy.",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะแนวคณะศิลปศาสตร์ และวิทยาลัยนานาชาติ",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "Role Play, Take Pic Easy. สนุกกับการใช้ภาษาและการสื่อสารข้ามวัฒนธรรม",
      },
    ],
    docId: "359f9dfa-8752-4a4f-a533-996a5b185b0f",
  },
  {
    id: "psuic",
    order: 16,
        sticker: "/images/stickers/psuic.png",
    nameTh: "วิทยาลัยนานาชาติ (PSUIC)",
    nameEn: "PSU International College",
    theme: "Many Voices, One World — ต่างภาษา ต่างมุมมอง โลกใบเดียวกัน",
    category: "social",
    categoryLabel: "สังคม & บริหาร",
    gradient: "from-purple-600 to-indigo-800",
    studyAbout: "การสร้างสื่อดิจิทัล โดยผสมผสานศิลปะ ความคิดสร้างสรรค์ และเทคโนโลยี เช่น กราฟิก แอนิเมชัน เกม เว็บไซต์ และแอปพลิเคชัน",
    curriculum: "วิทยาศาสตรบัณฑิต สาขาวิชา สื่อสร้างสรรค์และเทคโนโลยีดิจิทัล (Creative Media and Digital Technologies: CMDT) หลักสูตรนานาชาติ 4 ปี PSUIC",
    learningStyle: "เรียนเป็นภาษาอังกฤษ เน้นลงมือสร้างผลงานและทำโครงงาน ฝึกออกแบบกราฟิก วาดภาพดิจิทัล สร้างแอนิเมชัน 2D/3D ออกแบบเกม เว็บไซต์ และ UX/UI พร้อมฝึกงานหรือสหกิจศึกษา",
    careers: "นักออกแบบกราฟิก, นักสร้างแอนิเมชัน, ศิลปินดิจิทัล, นักออกแบบและพัฒนาเกม, นักออกแบบเว็บไซต์, นักพัฒนาแอปพลิเคชัน และ UX/UI Designer",
    selfCheck: "ชอบศิลปะและเทคโนโลยี สนใจสร้างสื่อหรือออกแบบผลงาน และพร้อมพัฒนาทักษะภาษาอังกฤษควบคู่กัน",
    workshop: "แนะแนวร่วมกับศิลปศาสตร์ พร้อมกิจกรรม Workshop: Role Play, Take Pic Easy และ Creative Media Demo",
    activityItems: [
      {
        title: "แนะแนวคณะ",
        desc: "แนะแนวคณะศิลปศาสตร์ และวิทยาลัยนานาชาติ PSUIC",
      },
      {
        title: "กิจกรรม Workshop",
        desc: "Role Play, Take Pic Easy. สัมผัสการผสมผสานความคิดสร้างสรรค์ ศิลปะ และเทคโนโลยีดิจิทัลระดับสากล",
      },
    ],
    docId: "f3a43feb-51c4-4351-8d1e-b23b643fbbed",
  },
];

export default function ActivitiesPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyStation | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "health" | "sci_tech" | "social">("all");

  const filteredFaculties = facultiesData.filter(
    (fac) => activeFilter === "all" || fac.category === activeFilter
  );

  return (
    <main className="relative min-h-screen bg-cream-bg">
      <SubpageHero
        badge="16 Faculty Stations"
        titleMain="กิจกรรมฐาน"
        titleHighlight="16 คณะ"
        subtitle1="ค่ายสานฝันเพื่อน้อง ปีที่ 7"
        subtitle2="ค้นหาคณะที่ใช่ เปิดประตูสู่อนาคตที่ชอบ"
        subtitle3="ณ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่"
        scrollTargetId="#stations-grid"
      />

      {/* Main Content Section */}
      <section id="stations-grid" className="relative py-16 sm:py-24 bg-gradient-to-b from-cream-bg via-pink-pale/30 to-cream-bg overflow-hidden">
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-purple-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-primary/10 text-purple-primary text-xs sm:text-sm font-semibold rounded-full mb-3 border border-purple-primary/15">
              ฐานกิจกรรมแนะแนววิชาการ & Workshop
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-primary to-pink-accent bg-clip-text text-transparent">
                ครบครัน 16 คณะ
              </span>{" "}
              ใน ม.อ. หาดใหญ่
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-primary to-pink-accent mx-auto rounded-full mb-4" />
            <p className="text-foreground/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              ข้อมูลหลักสูตร เส้นทางอาชีพ และกิจกรรม Workshop ของทั้ง 16 คณะจากคู่มือค่าย Guidance 7th ฉบับทางการ
            </p>

            {/* Category Filter Pills (No emojis/icons) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "all" as const, label: "ทั้งหมด 16 คณะ", count: 16 },
                { id: "health" as const, label: "วิทยาศาสตร์สุขภาพ (7)", count: 7 },
                { id: "sci_tech" as const, label: "วิศวะ & วิทยาศาสตร์ (4)", count: 4 },
                { id: "social" as const, label: "สังคมศาสตร์ & บริหาร (5)", count: 5 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm ${
                    activeFilter === tab.id
                      ? "bg-purple-primary text-white shadow-md shadow-purple-primary/25 scale-105"
                      : "bg-white/80 text-foreground/70 hover:bg-white hover:text-purple-primary border border-purple-primary/10"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid: 4 Columns on Large Screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredFaculties.map((fac) => (
              <div
                key={fac.id}
                className="group relative bg-white/90 backdrop-blur-sm rounded-3xl border border-purple-primary/15 p-5 sm:p-6
                           hover:bg-white hover:shadow-2xl hover:shadow-purple-primary/20 hover:-translate-y-2
                           transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Order badge & Category */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-primary/10 text-purple-primary border border-purple-primary/15">
                      ฐานที่ {fac.order} จาก 16
                    </span>
                    <span className="text-[10px] text-foreground/50 font-medium truncate">
                      {fac.categoryLabel}
                    </span>
                  </div>

                  {/* Faculty Stamp Sticker Avatar */}
                  <div className="relative w-24 h-28 mx-auto mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2 drop-shadow-md group-hover:drop-shadow-xl">
                    <Image
                      src={fac.sticker}
                      alt={fac.nameTh}
                      width={96}
                      height={112}
                      className="w-full h-full object-contain filter"
                      priority={fac.order <= 4}
                    />
                  </div>

                  {/* Faculty Name & Theme */}
                  <div className="text-center mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-purple-dark leading-snug group-hover:text-purple-primary transition-colors">
                      {fac.nameTh}
                    </h3>
                    <p className="text-[11px] text-foreground/50 font-medium mt-0.5">
                      {fac.nameEn}
                    </p>
                    <div className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-pink-accent/10 text-pink-700 text-[11px] font-bold border border-pink-accent/20">
                      {fac.theme}
                    </div>
                  </div>

                  {/* Overview description snippet */}
                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2 text-center mb-3">
                    {fac.studyAbout}
                  </p>

                  {/* Workshop Highlight Box */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-primary/5 via-pink-accent/5 to-transparent border border-purple-primary/10 text-xs mb-4">
                    <p className="font-bold text-purple-primary text-[11px] mb-1">
                      ไฮไลต์ Workshop:
                    </p>
                    <p className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed">
                      {fac.workshop}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-purple-primary/10">
                  <button
                    onClick={() => setSelectedFaculty(fac)}
                    className="w-full py-2 px-3 rounded-xl bg-purple-primary hover:bg-purple-dark text-white text-xs font-semibold shadow-md shadow-purple-primary/20 hover:shadow-lg transition-all cursor-pointer text-center"
                  >
                    ดูข้อมูลเจาะลึก 6 หัวข้อ
                  </button>

                  <Link
                    href={`/documents?book=${fac.docId}`}
                    className="w-full py-1.5 px-3 rounded-xl bg-purple-primary/10 hover:bg-purple-primary/20 text-purple-dark text-[11px] font-medium transition-colors text-center border border-purple-primary/15 block"
                  >
                    เปิดสไลด์นำเสนอของคณะนี้
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          FACULTY DETAIL MODAL (COMPLETE 6 TOPICS FROM CAMP BOOKLET)
          ======================================================== */}
      {selectedFaculty && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={() => setSelectedFaculty(null)}
        >
          <div
            className="bg-white rounded-3xl border border-purple-primary/20 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 bg-gradient-to-r ${selectedFaculty.gradient} text-white relative flex-shrink-0`}>
              <button
                onClick={() => setSelectedFaculty(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-3.5 pr-8">
                <div className="w-16 h-20 relative flex-shrink-0 drop-shadow-md">
                  <Image
                    src={selectedFaculty.sticker}
                    alt={selectedFaculty.nameTh}
                    width={64}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 border border-white/20">
                      ฐานที่ {selectedFaculty.order} จาก 16
                    </span>
                    <span className="text-[11px] text-white/80 font-medium">
                      {selectedFaculty.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold leading-snug drop-shadow-sm">
                    {selectedFaculty.nameTh}
                  </h3>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {selectedFaculty.nameEn}
                  </p>
                </div>
              </div>

              {/* Theme Ribbon */}
              <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center gap-2 text-xs font-semibold text-white/95">
                <span>ธีมประจำฐาน:</span>
                <span className="underline decoration-pink-300 decoration-2 underline-offset-2">
                  {selectedFaculty.theme}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-foreground/80 leading-relaxed">
              {/* Topic 1: เรียนเกี่ยวกับ */}
              <div className="p-4 rounded-2xl bg-purple-primary/5 border border-purple-primary/10 space-y-1">
                <h4 className="font-bold text-purple-dark text-sm">
                  1. เรียนเกี่ยวกับอะไร:
                </h4>
                <p className="text-foreground/80 leading-relaxed pl-1">
                  {selectedFaculty.studyAbout}
                </p>
              </div>

              {/* Topic 2: หลักสูตร */}
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                <h4 className="font-bold text-blue-900 text-sm">
                  2. หลักสูตร / สาขาวิชา:
                </h4>
                <p className="text-foreground/80 leading-relaxed font-medium pl-1">
                  {selectedFaculty.curriculum}
                </p>
              </div>

              {/* Topic 3: รูปแบบการเรียน */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                <h4 className="font-bold text-emerald-900 text-sm">
                  3. รูปแบบการเรียน:
                </h4>
                <p className="text-foreground/80 leading-relaxed pl-1">
                  {selectedFaculty.learningStyle}
                </p>
              </div>

              {/* Topic 4: เส้นทางอาชีพ */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                <h4 className="font-bold text-amber-900 text-sm">
                  4. เส้นทางอาชีพหลังจบ:
                </h4>
                <p className="text-foreground/80 leading-relaxed pl-1">
                  {selectedFaculty.careers}
                </p>
              </div>

              {/* Topic 5: ลองสำรวจตัวเอง */}
              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-1">
                <h4 className="font-bold text-pink-900 text-sm">
                  5. ลองสำรวจตัวเอง (คุณสมบัติที่ใช่):
                </h4>
                <p className="text-foreground/80 leading-relaxed pl-1">
                  {selectedFaculty.selfCheck}
                </p>
              </div>

              {/* Topic 6: รูปแบบกิจกรรม & Workshop */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-primary/10 via-pink-accent/10 to-purple-primary/5 border border-purple-primary/20 space-y-3">
                <h4 className="font-bold text-purple-primary text-sm">
                  6. รูปแบบกิจกรรม & Workshop ในค่าย:
                </h4>
                
                {selectedFaculty.activityItems && selectedFaculty.activityItems.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFaculty.activityItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/80 border border-purple-primary/15 shadow-xs"
                      >
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-primary/10 text-purple-primary font-bold text-xs mb-1">
                          {item.title}
                        </span>
                        <p className="text-foreground/80 text-xs sm:text-[13px] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/90 leading-relaxed font-medium pl-1">
                    {selectedFaculty.workshop}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-purple-primary/10 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <span className="text-[11px] text-foreground/50 font-mono">
                Guidance for Dream 7th • PSU Hat Yai
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/documents?book=${selectedFaculty.docId}`}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-purple-primary hover:bg-purple-dark text-white text-xs font-bold shadow-md shadow-purple-primary/25 transition-all text-center cursor-pointer"
                >
                  เปิดสไลด์ของคณะนี้
                </Link>
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
