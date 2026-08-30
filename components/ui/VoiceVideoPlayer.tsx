"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type YTPlayer = {
  playVideo(): void;
  destroy(): void;
};

type YTStateChangeEvent = {
  data: number;
  target: YTPlayer;
};

type YTPlayerConstructor = new (
  elementId: string,
  config: {
    videoId: string;
    host?: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onStateChange?: (event: YTStateChangeEvent) => void;
    };
  },
) => YTPlayer;

declare global {
  interface Window {
    YT?: {
      Player: YTPlayerConstructor;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_API_SRC = "https://www.youtube.com/iframe_api";

/**
 * YouTube IFrame API のスクリプトを 1 度だけ読み込む Promise を返す。
 * 複数プレイヤーが同時に居ても API 読み込みは 1 回で共有される。
 */
function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${YT_API_SRC}"]`,
    );

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    if (!existing) {
      const script = document.createElement("script");
      script.src = YT_API_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

type Props = {
  videoId: string;
  title: string;
};

/**
 * YouTube 動画埋め込みプレイヤー。
 * - youtube-nocookie.com を使い、rel=0 / modestbranding で装飾を最小化。
 * - 再生終了(state=0) を IFrame API で検知し、オーバーレイで
 *   関連動画/おすすめが露出しないようカバーする。
 */
export function VoiceVideoPlayer({ videoId, title }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ended, setEnded] = useState(false);
  // 同一ページに複数プレイヤーがあっても衝突しないSSR互換の一意ID。
  // useId() が返すコロン等の記号は DOM id で有効だが CSS セレクタとの衝突リスクを避けるため無害化。
  const rawId = useId();
  const elementId = `voice-video-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const handleReplay = useCallback(() => {
    setEnded(false);
    playerRef.current?.playVideo();
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT?.Player || !containerRef.current) return;

      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.ENDED) {
              setEnded(true);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, elementId]);

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-2xl)] bg-black">
      <div className="relative aspect-video w-full">
        <div
          ref={containerRef}
          id={elementId}
          title={title}
          className="absolute inset-0 h-full w-full"
        />
        {ended ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center text-[color:var(--c-text-inverse)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--c-warning)]">
              End of video
            </p>
            <p className="max-w-[36ch] text-base font-bold leading-7 md:text-lg md:leading-8">
              最後までご覧いただきありがとうございました。
            </p>
            <button
              type="button"
              onClick={handleReplay}
              className="mt-2 inline-flex min-h-11 items-center rounded-full border border-[color:var(--c-ice)] px-6 py-2 text-sm font-black text-[color:var(--c-text-inverse)] transition hover:bg-white/10"
            >
              もう一度見る →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
