import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { sendFutureLetterEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    let forceAll = false;
    let manualList: any[] | null = null;

    try {
      const body = await req.json();
      if (body) {
        forceAll = Boolean(body.forceAll);
        if (Array.isArray(body.letters)) {
          manualList = body.letters;
        }
      }
    } catch {}

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    let pendingLetters: any[] = [];

    if (manualList && manualList.length > 0) {
      pendingLetters = manualList.filter((l) => !l.is_delivered);
    } else {
      const { data, error } = await supabase
        .from("future_letters")
        .select("*")
        .eq("is_delivered", false);

      if (error) {
        throw new Error(error.message);
      }
      pendingLetters = data || [];
    }

    // กรองเฉพาะฉบับที่ถึงกำหนดส่ง (วันที่ระบุถึงกำหนดวันนี้หรือในอดีต)
    const dueLetters = pendingLetters.filter((ltr) => {
      if (forceAll) return true;
      if (!ltr.target_date) return true;
      return ltr.target_date <= todayStr;
    });

    if (dueLetters.length === 0) {
      return NextResponse.json({
        success: true,
        message: "ไม่มีจดหมายที่ถึงกำหนดส่งในวันนี้",
        processed: 0,
        sent: 0,
        failed: 0,
      });
    }

    const results: { id: string; name: string; email: string; success: boolean; error?: string }[] = [];

    for (const letter of dueLetters) {
      try {
        await sendFutureLetterEmail({
          id: letter.id,
          name: letter.name,
          email: letter.email,
          school: letter.school,
          dream_faculty: letter.dream_faculty,
          letter_content: letter.letter_content,
          delivery_timing: letter.delivery_timing,
          target_date: letter.target_date,
          created_at: letter.created_at,
        });

        // อัปเดตฐานข้อมูล
        if (letter.id && !String(letter.id).startsWith("local-")) {
          await supabase
            .from("future_letters")
            .update({
              is_delivered: true,
              delivered_at: new Date().toISOString(),
            })
            .eq("id", letter.id);
        }

        results.push({ id: letter.id, name: letter.name, email: letter.email, success: true });
      } catch (err: any) {
        console.error(`Failed to send letter to ${letter.email}:`, err);
        results.push({
          id: letter.id,
          name: letter.name,
          email: letter.email,
          success: false,
          error: err.message,
        });
      }
    }

    const sentCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `ดำเนินการส่งจดหมายเสร็จสิ้น: สำเร็จ ${sentCount} ฉบับ, ไม่สำเร็จ ${failedCount} ฉบับ`,
      processed: dueLetters.length,
      sent: sentCount,
      failed: failedCount,
      results,
    });
  } catch (error: any) {
    console.error("send-due letters error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการประมวลผลการส่งจดหมาย" },
      { status: 500 }
    );
  }
}

// รองรับ GET request สำหรับ Vercel Cron หรือ External Cron Service
export async function GET(req: NextRequest) {
  return POST(req);
}

