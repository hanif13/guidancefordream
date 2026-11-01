import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
    <html lang="th" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen font-sans">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
