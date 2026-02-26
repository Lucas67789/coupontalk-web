import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "쿠폰톡(coupontalk) - 최신 할인코드 & 쿠폰 총정리",
  description: "가장 최신의 검증된 할인코드 모음. 쿠팡, 알리익스프레스, 아고다 등 인기 쇼핑몰 할인 쿠폰 및 프로모션 코드를 매일 업데이트합니다.",
  openGraph: {
    title: "쿠폰톡(coupontalk) - 최신 할인코드 & 쿠폰 총정리",
    description: "가장 최신의 검증된 할인코드만 모았습니다. 쿠팡, 알리 등 인기 스토어의 할인 혜택을 확인하세요.",
    images: [
      {
        url: "https://coupontalk.kr/og-image.png",
        width: 1200,
        height: 630,
        alt: "쿠폰톡(coupontalk) 메인 썸네일",
      },
    ],
    type: "website",
    locale: "ko_KR",
  },
  verification: {
    other: {
      "naver-site-verification": ["7738e368040a4ed04066be27f8ce35cf568336f0"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-12">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
