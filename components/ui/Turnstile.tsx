"use client";

import { useEffect, useRef } from "react";

// Turnstile サイトキー(公開値)。未設定時はローカル用の公式テストキー(常に成功)を使う。
const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// スクリプトは複数ウィジェットで共有するため一度だけ読み込む。
let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Cloudflare Turnstile ウィジェット。認証成功でトークンを、失効/エラーで空文字を親へ渡す。
 * onToken は ref 経由で参照するため、親側でメモ化していなくても再レンダーで作り直されない。
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  // 最新の onToken を ref に保持（描画中ではなく effect で更新する）。
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => {
        // 読み込み失敗時はトークン無し=送信不可のままにする。
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // 既に除去済みでも無視。
        }
        widgetId.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
