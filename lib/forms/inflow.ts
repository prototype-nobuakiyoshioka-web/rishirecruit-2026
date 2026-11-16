// 応募・お問い合わせのメールに「その人がどこから来たか(流入元)」を添えるための純粋ロジック。
// ブラウザ保存は inflow-storage.ts、サーバー側の受け取りは app/api/form/route.ts。
//
// 扱い:
// - 最初: はじめて来たときの流入元。90日保存し、過ぎたら次に来たときを「最初」に置き直す
//   (応募まで数週間かかる人も追えて、GA4 の既定の振り返り期間とも揃う長さ)。
// - 今回: 送信した訪問の流入元。最後のページ表示から30分あくと別の訪問とみなす(GA4 のセッションと同じ)。
//   訪問の途中で外部サイトや UTM 付き URL から入り直したら、その経路に置き換える。直接開いただけでは置き換えない。
// - サイト内の移動は流入元として扱わない。

export const FIRST_TOUCH_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const DIRECT_LABEL = "直接（不明）";
export const NONE_LABEL = "なし";
export const NOT_RECORDED_LABEL = "記録なし";

export type InflowTouch = {
  channel: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string; // 参照元のホスト名だけ(パスや検索語は持たない)
  landing: string; // 最初に開いたページのパス
  at: number; // 記録した時刻(ms)
};

export type InflowState = {
  first?: InflowTouch;
  current?: InflowTouch;
  lastSeen?: number;
};

const LIMITS = {
  channel: 60,
  utm: 100,
  referrer: 100,
  landing: 200,
  date: 20,
} as const;

/**
 * メールに載せても安全な1行の文字列にする。
 * 改行・制御文字・山かっこを取り除き、空白をまとめ、文字数(コードポイント)で切る。
 */
export function sanitizeInflowValue(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const cleaned = value
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(cleaned).slice(0, max).join("").trim();
}

const UTM_SOURCE_LABELS: Record<string, string> = {
  youtube: "YouTube",
  note: "note",
  town_site: "利尻富士町公式サイト",
};

// 参照元のホスト名(末尾一致)から経路名を決める。上から順に判定する。
const REFERRER_RULES: { label: string; test: (host: string) => boolean }[] = [
  { label: "YouTube", test: (h) => endsWithDomain(h, "youtube.com") || endsWithDomain(h, "youtu.be") },
  { label: "note", test: (h) => endsWithDomain(h, "note.com") || endsWithDomain(h, "note.mu") },
  { label: "利尻富士町公式サイト", test: (h) => endsWithDomain(h, "town.rishirifuji.hokkaido.jp") },
  // AI の回答から来た人(gemini.google.com は Google検索より先に判定する)
  {
    label: "AI検索",
    test: (h) =>
      ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "claude.ai"].some(
        (d) => endsWithDomain(h, d),
      ),
  },
  // google.com / google.co.jp など。www. や検索以外のサブドメインも含める
  { label: "Google検索", test: (h) => /(^|\.)google\.[a-z.]+$/.test(h) },
  { label: "Yahoo!検索", test: (h) => endsWithDomain(h, "yahoo.co.jp") || endsWithDomain(h, "yahoo.com") },
  { label: "Bing検索", test: (h) => endsWithDomain(h, "bing.com") },
  { label: "DuckDuckGo", test: (h) => endsWithDomain(h, "duckduckgo.com") },
  { label: "Instagram", test: (h) => endsWithDomain(h, "instagram.com") },
  { label: "Facebook", test: (h) => endsWithDomain(h, "facebook.com") },
  {
    label: "X（旧Twitter）",
    test: (h) => endsWithDomain(h, "x.com") || endsWithDomain(h, "twitter.com") || h === "t.co",
  },
  { label: "LINE", test: (h) => endsWithDomain(h, "line.me") },
];

function endsWithDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/** 経路名を決める。UTM の utm_source を優先し、なければ参照元のホスト名で見分ける。 */
export function classifyChannel(utmSource: string, referrerHost: string): string {
  const source = utmSource.toLowerCase();
  if (source) return UTM_SOURCE_LABELS[source] ?? `その他（${utmSource}）`;
  if (!referrerHost) return DIRECT_LABEL;
  const rule = REFERRER_RULES.find((r) => r.test(referrerHost));
  return rule ? rule.label : "その他のサイト";
}

function hostOf(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function safeDecode(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export type PageEntry = {
  search: string; // location.search
  referrer: string; // document.referrer
  pathname: string; // location.pathname
  siteHosts: string[]; // 自サイトとみなすホスト名(サイト内移動の判定)
  now: number;
};

/**
 * ページを読み込んだときの入り方を読み取る。
 * サイト内から来た(参照元が自サイト)なら null。UTM も参照元もなければ「直接（不明）」。
 */
export function detectTouch(entry: PageEntry): InflowTouch | null {
  const params = new URLSearchParams(entry.search);
  const utmSource = sanitizeInflowValue(params.get("utm_source") ?? "", LIMITS.utm);
  const utmMedium = sanitizeInflowValue(params.get("utm_medium") ?? "", LIMITS.utm);
  const utmCampaign = sanitizeInflowValue(params.get("utm_campaign") ?? "", LIMITS.utm);

  const rawHost = hostOf(entry.referrer);
  const internal = rawHost !== "" && entry.siteHosts.includes(rawHost);
  // サイト内の移動は流入元にしない(UTM 付きのリンクがサイト内にあっても同じ)
  if (internal) return null;
  const referrer = sanitizeInflowValue(rawHost, LIMITS.referrer);

  return {
    channel: sanitizeInflowValue(classifyChannel(utmSource, referrer), LIMITS.channel),
    utmSource,
    utmMedium,
    utmCampaign,
    referrer,
    landing: sanitizeInflowValue(safeDecode(entry.pathname || "/"), LIMITS.landing),
    at: entry.now,
  };
}

function isDirect(touch: InflowTouch): boolean {
  return !touch.utmSource && !touch.utmMedium && !touch.utmCampaign && !touch.referrer;
}

function sameSource(a: InflowTouch, b: InflowTouch): boolean {
  return (
    a.utmSource === b.utmSource &&
    a.utmMedium === b.utmMedium &&
    a.utmCampaign === b.utmCampaign &&
    a.referrer === b.referrer
  );
}

function directTouch(pathname: string, now: number): InflowTouch {
  return {
    channel: DIRECT_LABEL,
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    referrer: "",
    landing: sanitizeInflowValue(safeDecode(pathname || "/"), LIMITS.landing),
    at: now,
  };
}

/** ページの読み込み(リロード含む)ごとに保存内容を更新する。 */
export function updateOnPageLoad(
  state: InflowState,
  detected: InflowTouch | null,
  pathname: string,
  now: number,
): InflowState {
  const fallback = detected ?? directTouch(pathname, now);

  const firstValid = state.first && now - state.first.at <= FIRST_TOUCH_TTL_MS;
  const first = firstValid ? state.first : fallback;

  const sessionAlive =
    state.current && state.lastSeen !== undefined && now - state.lastSeen <= SESSION_TIMEOUT_MS;
  let current: InflowTouch;
  if (!sessionAlive || !state.current) {
    current = fallback;
  } else if (detected && !isDirect(detected) && !sameSource(detected, state.current)) {
    // 訪問の途中で別の外部経路から入り直した
    current = detected;
  } else {
    current = state.current;
  }

  return { first, current, lastSeen: now };
}

/** サイト内のページ移動(読み込みなし)では、訪問の続きとして時刻だけ進める。 */
export function touchSession(state: InflowState, now: number): InflowState {
  return state.current ? { ...state, lastSeen: now } : state;
}

// CF7 に渡す項目名。WP の CF7 フォーム 176 / 177 に同じ名前の hidden 項目を足す。
export const INFLOW_FIELD_NAMES = [
  "inflow_first_channel",
  "inflow_first_utm_source",
  "inflow_first_utm_medium",
  "inflow_first_utm_campaign",
  "inflow_first_referrer",
  "inflow_first_landing",
  "inflow_first_date",
  "inflow_this_channel",
  "inflow_this_utm_source",
  "inflow_this_utm_medium",
  "inflow_this_utm_campaign",
  "inflow_this_referrer",
  "inflow_this_landing",
  "inflow_this_date",
] as const;

export type InflowFieldName = (typeof INFLOW_FIELD_NAMES)[number];
export type InflowFields = Record<InflowFieldName, string>;

const FIELD_LIMITS: Record<string, number> = {
  channel: LIMITS.channel,
  utm_source: LIMITS.utm,
  utm_medium: LIMITS.utm,
  utm_campaign: LIMITS.utm,
  referrer: LIMITS.referrer,
  landing: LIMITS.landing,
  date: LIMITS.date,
};

function limitFor(name: InflowFieldName): number {
  const key = name.replace(/^inflow_(first|this)_/, "");
  return FIELD_LIMITS[key] ?? LIMITS.utm;
}

/** 日本時間の "YYYY-MM-DD HH:mm" */
export function formatJst(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function touchFields(prefix: "first" | "this", touch: InflowTouch | undefined) {
  if (!touch) return {};
  return {
    [`inflow_${prefix}_channel`]: touch.channel,
    [`inflow_${prefix}_utm_source`]: touch.utmSource,
    [`inflow_${prefix}_utm_medium`]: touch.utmMedium,
    [`inflow_${prefix}_utm_campaign`]: touch.utmCampaign,
    [`inflow_${prefix}_referrer`]: touch.referrer,
    [`inflow_${prefix}_landing`]: touch.landing,
    [`inflow_${prefix}_date`]: formatJst(touch.at),
  };
}

/** 保存内容を CF7 の項目へ。空の値はサーバー側で「なし」等に置き換える。 */
export function stateToFields(state: InflowState): Partial<InflowFields> {
  return { ...touchFields("first", state.first), ...touchFields("this", state.current) };
}

/**
 * サーバー側で、ブラウザから届いた流入元を受け取り直す。
 * 決まった項目名だけを通し、長さを制限して改行などを取り除く。
 * 値がない場合: 記録自体がなければ経路名は「記録なし」、記録はあって空の項目は「なし」。
 */
export function sanitizeInflowFields(raw: unknown): InflowFields {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const result = {} as InflowFields;
  for (const prefix of ["first", "this"] as const) {
    const recorded = sanitizeInflowValue(input[`inflow_${prefix}_channel`], LIMITS.channel) !== "";
    for (const name of INFLOW_FIELD_NAMES) {
      if (!name.startsWith(`inflow_${prefix}_`)) continue;
      const value = sanitizeInflowValue(input[name], limitFor(name));
      if (value) {
        result[name] = value;
      } else if (name.endsWith("_channel")) {
        result[name] = NOT_RECORDED_LABEL;
      } else {
        result[name] = recorded ? NONE_LABEL : NOT_RECORDED_LABEL;
      }
    }
  }
  return result;
}
