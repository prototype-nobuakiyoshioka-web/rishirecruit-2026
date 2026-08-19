import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rishiri Recruit 2026",
  description:
    "利尻島の求人・イベント・観光・コラムを3Dマップから探せるインタラクティブサイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <PageTransition />
        {children}
        <Footer />
      </body>
    </html>
  );
}
