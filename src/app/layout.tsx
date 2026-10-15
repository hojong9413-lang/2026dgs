import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2026dgs 과업 자료실 및 문서 공유 플랫폼",
  description: "대한민국 구석구석 이용자 심층조사(FGI) 과업 자료 및 옵시디언 연계 문서 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
