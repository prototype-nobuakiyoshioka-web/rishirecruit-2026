import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

// contact/page.tsx は "use client"(フォーム)のため metadata を持てない。
// route segment の layout でメタデータを付与する。
export const metadata: Metadata = buildMetadata({
  title: "お問い合わせ",
  description:
    "利尻富士町の求人・移住・サイトに関するお問い合わせはこちらから。",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
