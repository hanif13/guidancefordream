import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { sendFutureLetterEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { letterId, letterData } = body;

    let targetLetter = letterData;

    if (!targetLetter && letterId) {
      const { data, error } = await supabase
        .from("future_letters")
        .select("*")
        .eq("id", letterId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "ไม่พบจดหมายที่ระบุในฐานข้อมูล" },
          { status: 404 }
        );
      }
      targetLetter = data;
    }

    if (!targetLetter || !targetLetter.email) {
      return NextResponse.json(
        { error: "ข้อมูลจดหมายไม่สมบูรณ์ หรือไม่มีอีเมลผู้รับ" },
        { status: 400 }
      );
    }

    // ส่งอีเมล
    const info = await sendFutureLetterEmail({
      id: targetLetter.id,
      name: targetLetter.name,
      email: targetLetter.email,
      school: targetLetter.school,
      dream_faculty: targetLetter.dream_faculty,
      letter_content: targetLetter.letter_content,
      delivery_timing: targetLetter.delivery_timing,
      created_at: targetLetter.created_at,
    });

    // อัปเดตสถานะใน Supabase ถ้ามี ID
    if (targetLetter.id && !targetLetter.id.startsWith("local-")) {
      await supabase
        .from("future_letters")
        .update({
          is_delivered: true,
          delivered_at: new Date().toISOString(),
        })
        .eq("id", targetLetter.id);
    }

    return NextResponse.json({
      success: true,
      message: `ส่งจดหมายถึง ${targetLetter.name} (${targetLetter.email}) เรียบร้อยแล้ว`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("send-single letter error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการส่งจดหมาย" },
      { status: 500 }
    );
  }
}

