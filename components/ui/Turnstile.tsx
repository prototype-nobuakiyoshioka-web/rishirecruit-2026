"use client";

import { useEffect, useRef, useState } from "react";

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
    script.onerror = () => {
      // 再試行で読み込み直せるように、失敗した読み込みを残さない
      scriptPromise = null;
      script.remove();
      reject(new Error("Failed to load Turnstile."));
    };
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
  const [hasFailed, setHasFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

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
          "error-callback": () => {
            onTokenRef.current("");
            setHasFailed(true);
          },
        });
      })
      .catch(() => {
        // 読み込み失敗時はトークン無し=送信不可のままにして、案内を出す。
        if (!cancelled) setHasFailed(true);
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
  }, [attempt]);

  return (
    <div>
      <div ref={containerRef} />
      {hasFailed ? (
        <div role="alert" className="text-sm font-bold leading-6 text-[color:var(--c-danger)]">
          <p>認証を読み込めませんでした。通信環境をご確認のうえ、もう一度お試しください。</p>
          <button
            type="button"
            onClick={() => {
              setHasFailed(false);
              setAttempt((current) => current + 1);
            }}
            className="mt-[var(--space-2)] min-h-11 underline"
          >
            もう一度試す
          </button>
        </div>
      ) : null}
    </div>
  );
}
