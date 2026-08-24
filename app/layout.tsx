import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Guidance for Dream 7th — ค่ายสานฝันเพื่อน้อง ครั้งที่ 7",
  description:
    "ค่ายสานฝันเพื่อน้อง ครั้งที่ 7 โดย Muslim Student Society PSU Hatyai ร่วมกับ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่ | 6-9 พฤศจิกายน 2569",
  keywords: [
    "Guidance for Dream",
    "ค่ายสานฝันเพื่อน้อง",
    "ค่ายอาสา",
    "PSU",
    "มหาวิทยาลัยสงขลานครินทร์",
    "Muslim Student Society",
  ],
  openGraph: {
    title: "Guidance for Dream 7th — ค่ายสานฝันเพื่อน้อง ครั้งที่ 7",
    description:
      "ร่วมเป็นส่วนหนึ่งของค่ายสานฝันเพื่อน้อง ครั้งที่ 7 | 6-9 พฤศจิกายน 2569 ณ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่",
    images: ["/images/poster.jpg"],
    type: "website",
    locale: "th_TH",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${notoSansThai.variable} antialiased`}
    >
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
