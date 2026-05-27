import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "AIUG · AI 创作者社区", template: "%s · AIUG" },
  description: "AI 创作者的聚集地:发布应用、分享教程、加入圈子、即时聊天。",
  keywords: ["AI 应用", "AI 工具", "AI 社区", "创作者", "夸克网盘"],
  openGraph: {
    title: "AIUG · AI 创作者社区",
    description: "AI 创作者的聚集地",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-6">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}