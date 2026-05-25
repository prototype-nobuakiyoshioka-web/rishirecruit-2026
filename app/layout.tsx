import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
