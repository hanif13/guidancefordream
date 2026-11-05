import nodemailer from "nodemailer";

export interface FutureLetterData {
  id?: string;
  name: string;
  email: string;
  school?: string;
  dream_faculty?: string;
  letter_content: string;
  delivery_timing: string;
  target_date?: string;
  created_at?: string;
}

/**
 * สร้าง Nodemailer Transporter สำหรับ Gmail SMTP
 */
export function getEmailTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || "";
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || "";
  const pass = rawPass.replace(/\s+/g, ""); // ลบช่องว่างในรหัสผ่าน 16 หลัก

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * สร้าง HTML สำหรับจดหมาย Time Capsule ธีมค่าย Guidance for Dream
 */
export function renderLetterHtml(letter: FutureLetterData): string {
  const formattedCreated = letter.created_at
    ? new Date(letter.created_at).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "ช่วงจัดกิจกรรมค่าย";

  const paragraphs = letter.letter_content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(
      (p) =>
        `<p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.8; color: #1e1b4b;">${p}</p>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>จดหมายถึงตัวฉันในอนาคต - Guidance for Dream</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e1b4b;">
  <div style="max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(76, 29, 149, 0.08); border: 1px solid #ede8e3;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #2e0854 0%, #4c1d95 50%, #9d174d 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
      <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; padding: 4px 14px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
        TIME CAPSULE • กล่องเก็บฝัน
      </span>
      <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
        จดหมายถึงตัวฉันในอนาคต
      </h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9; font-weight: 300;">
        ค่ายสานฝันเพื่อน้อง (Guidance for Dream) • ชมรมมุสลิม ม.อ. หาดใหญ่
      </p>
    </div>

    <!-- Main Content Body -->
    <div style="padding: 32px 30px;">
      
      <!-- Greeting -->
      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #2e0854; font-weight: 700;">
          สวัสดี ${letter.name || "น้องค่ายคนเก่ง"} ✉️
        </h2>
        <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
          จำวันนั้นที่น้องเขียนจดหมายฉบับนี้ลงในกล่อง <strong>Time Capsule</strong> ได้ไหม? วันนี้เวลาได้เดินทางมาถึงแล้ว และนี่คือข้อความ ความฝัน และความหวังที่น้องส่งต่อมาให้ตัวเองในวันนี้...
        </p>
      </div>

      <!-- Metadata Badge Card -->
      <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 16px; padding: 16px 20px; margin-bottom: 28px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280; width: 140px;">วันที่เขียนจดหมาย:</td>
            <td style="padding: 4px 0; color: #2e0854; font-weight: 600;">${formattedCreated}</td>
          </tr>
          ${
            letter.school
              ? `<tr>
            <td style="padding: 4px 0; color: #6b7280;">โรงเรียน / ชั้นปี:</td>
            <td style="padding: 4px 0; color: #2e0854; font-weight: 600;">${letter.school}</td>
          </tr>`
              : ""
          }
          ${
            letter.dream_faculty
              ? `<tr>
            <td style="padding: 4px 0; color: #6b7280;">คณะ / ความฝันในวันนั้น:</td>
            <td style="padding: 4px 0; color: #9d174d; font-weight: 700;">${letter.dream_faculty}</td>
          </tr>`
              : ""
          }
          ${
            letter.delivery_timing
              ? `<tr>
            <td style="padding: 4px 0; color: #6b7280;">กำหนดเวลาส่งกลับ:</td>
            <td style="padding: 4px 0; color: #4c1d95; font-weight: 600;">${letter.delivery_timing}</td>
          </tr>`
              : ""
          }
        </table>
      </div>

      <!-- Letter Content Envelope / Note Card -->
      <div style="background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 18px; padding: 24px; margin-bottom: 28px; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <div style="border-left: 3px solid #d97706; padding-left: 16px; margin-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
            ข้อความจากตัวเธอในวันนั้น:
          </span>
          ${paragraphs}
        </div>
      </div>

      <!-- Inspirational Message -->
      <div style="background-color: #faf5ff; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px; border: 1px dashed #c084fc;">
        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #581c87;">
          &ldquo;Bloom into your summit, guided by Deen.&rdquo;
        </p>
        <p style="margin: 0; font-size: 13px; color: #7e22ce;">
          เติบโต…และไปให้ถึง ในหนทางที่ถูกต้อง
        </p>
      </div>

      <!-- Camp Wish & Closing -->
      <div style="font-size: 13px; color: #4b5563; line-height: 1.7; border-top: 1px solid #f3f4f6; pt: 20px; margin-top: 20px; padding-top: 20px;">
        <p style="margin: 0 0 8px 0;">
          ไม่ว่าตอนนี้เธอจะกำลังเผชิญหน้ากับอะไร หรืออยู่ ณ จุดไหนของเส้นทาง ขอให้เธอจำไว้เสมอว่า <em>ความพยายามที่ผ่านมาไม่มีวันสูญเปล่า</em> และอัลลอฮฺ (ซ.บ.) ทรงมีแผนการที่ดีที่สุดสำหรับเราเสมอ
        </p>
        <p style="margin: 0 0 16px 0;">
          พวกเราพี่น้องค่ายสานฝันเพื่อน้อง คอยเป็นกำลังใจและขอดุอาอ์ให้เธอประสบความสำเร็จในทุกเส้นทางที่เลือกเดินนะครับ/ค่ะ
        </p>
        <p style="margin: 0; font-weight: bold; color: #2e0854;">
          ด้วยความรักและความปรารถนาดี<br>
          <span style="font-size: 12px; font-weight: normal; color: #6b7280;">
            คณะทำงานค่ายสานฝันเพื่อน้อง (Guidance for Dream)<br>
            ชมรมมุสลิม มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่
          </span>
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 18px 30px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
      <p style="margin: 0 0 4px 0;">
        อีเมลฉบับนี้ถูกส่งอัตโนมัติจากระบบ Time Capsule เว็บไซต์ Guidance for Dream
      </p>
      <p style="margin: 0;">
        หากมีข้อสงสัยหรือต้องการพูดคุยกับพี่ๆ สามารถตอบกลับอีเมลฉบับนี้ได้โดยตรงครับ
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * ส่งจดหมาย 1 ฉบับไปยังอีเมลผู้รับ
 */
export async function sendFutureLetterEmail(letter: FutureLetterData) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า EMAIL_USER หรือ EMAIL_PASS ใน .env.local"
    );
  }

  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER;
  const fromName = "ค่ายสานฝันเพื่อน้อง Guidance for Dream";
  const fromHeader = `"${fromName}" <${senderEmail}>`;

  const htmlContent = renderLetterHtml(letter);

  const timeSuffix = new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const info = await transporter.sendMail({
    from: fromHeader,
    to: letter.email,
    replyTo: senderEmail,
    subject: `✉️ จดหมาย Time Capsule จากตัวเธอในอดีต (${letter.name || "Guidance for Dream"}) • ${timeSuffix} น.`,
    html: htmlContent,
  });

  return info;
}

/**
 * ส่งอีเมลทดสอบเพื่อตรวจสอบความถูกต้องของระบบเชื่อมต่อ SMTP
 */
export async function sendTestEmail(targetEmail: string) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า EMAIL_USER หรือ EMAIL_PASS ใน .env.local"
    );
  }

  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER;
  const fromHeader = `"ระบบทดสอบ Guidance for Dream" <${senderEmail}>`;

  const info = await transporter.sendMail({
    from: fromHeader,
    to: targetEmail,
    subject: "✅ ทดสอบระบบส่งอีเมลค่าย Guidance for Dream (Gmail SMTP)",
    html: `
      <div style="padding: 24px; font-family: sans-serif; color: #1e1b4b; background: #faf5ff; border-radius: 16px; border: 1px solid #c084fc;">
        <h2 style="color: #4c1d95; margin-top: 0;">ทดสอบการเชื่อมต่อ Gmail SMTP สำเร็จ! 🎉</h2>
        <p>อีเมลฉบับนี้ยืนยันว่าระบบ Auto Mail ของค่าย <strong>Guidance for Dream</strong> สามารถส่งออกข้อความผ่านบัญชี <strong>${senderEmail}</strong> ได้อย่างสมบูรณ์แบบแล้วครับ</p>
        <p style="font-size: 13px; color: #6b7280;">เวลาที่ทดสอบ: ${new Date().toLocaleString("th-TH")}</p>
      </div>
    `,
  });

  return info;
}
