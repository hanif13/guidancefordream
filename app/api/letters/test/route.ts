import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "กรุณาระบุอีเมลที่ถูกต้องสำหรับการทดสอบ" },
        { status: 400 }
      );
    }

    const info = await sendTestEmail(email.trim());

    return NextResponse.json({
      success: true,
      message: `ส่งอีเมลทดสอบไปยัง ${email} สำเร็จแล้ว`,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        error: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ Gmail SMTP",
      },
      { status: 500 }
    );
  }
}

