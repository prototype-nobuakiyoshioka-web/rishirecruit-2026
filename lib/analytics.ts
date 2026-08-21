import { sendGAEvent } from "@next/third-parties/google";

// GA4 測定ID。未設定時は計測を完全に無効化する(ローカル/プレビューで誤計測しない)。
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/**
 * GA4 へカスタムイベントを送信する。GA未設定なら何もしない安全ラッパー。
 * クライアントコンポーネントからのみ呼ぶこと(内部で window.dataLayer を使う)。
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!GA_ID) return;
  sendGAEvent("event", name, params ?? {});
}
