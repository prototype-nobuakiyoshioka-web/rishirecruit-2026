// 流入元をブラウザ(localStorage)に保存・読み出しする。クライアントからのみ呼ぶ。
// 保存できない環境(プライベートモードの制限など)では何もせず、送信時はサーバー側で「記録なし」になる。
import { SITE_URL } from "@/lib/seo";
import {
  detectTouch,
  stateToFields,
  touchSession,
  updateOnPageLoad,
  type InflowState,
} from "@/lib/forms/inflow";

const STORAGE_KEY = "rr_inflow_v1";

function load(): InflowState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as InflowState) : {};
  } catch {
    return {};
  }
}

function save(state: InflowState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 保存できなくても画面の動きには影響させない
  }
}

function siteHosts(): string[] {
  const hosts = new Set([window.location.hostname.toLowerCase()]);
  try {
    const host = new URL(SITE_URL).hostname.toLowerCase();
    hosts.add(host);
    hosts.add(host.startsWith("www.") ? host.slice(4) : `www.${host}`);
  } catch {
    // SITE_URL が不正でも現在のホストだけで判定する
  }
  return [...hosts];
}

/** ページの読み込み時に1回呼ぶ。 */
export function recordPageLoad() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const { search, pathname } = window.location;
  const detected = detectTouch({
    search,
    pathname,
    referrer: document.referrer,
    siteHosts: siteHosts(),
    now,
  });
  save(updateOnPageLoad(load(), detected, pathname, now));
}

/** サイト内のページ移動ごとに呼ぶ(訪問の続きとして時刻だけ進める)。 */
export function recordInternalNavigation() {
  if (typeof window === "undefined") return;
  const state = load();
  if (state.current) save(touchSession(state, Date.now()));
}

/** 送信データに添える流入元。保存がなければ空(サーバー側で「記録なし」)。 */
export function readInflowFields(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return stateToFields(load());
  } catch {
    return {};
  }
}
