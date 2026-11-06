// ページ移動の幕(components/layout/PageTransition.tsx)のセクション区分と一文。
// セクションが変わる移動だけ幕を出し、同じセクションの中の移動は短いフェードにする。

export const TRANSITION_COPY = [
  { prefix: "/message", eyebrow: "Message", title: "島で働く、その前に。" },
  { prefix: "/voices", eyebrow: "Voices", title: "ここに来た人たちの、声。" },
  { prefix: "/jobs", eyebrow: "Jobs", title: "あなたの行き先を、ここから。" },
  { prefix: "/spots", eyebrow: "Spots", title: "島を知ることは、暮らしを知ること。" },
  { prefix: "/events", eyebrow: "Events", title: "今、この島で起きていること。" },
  { prefix: "/columns", eyebrow: "Column", title: "島から、声をのせて。" },
  { prefix: "/contact", eyebrow: "Contact", title: "気になることを、話すところから。" },
  { prefix: "/privacy", eyebrow: "Privacy", title: "大切な情報について。" },
  { prefix: "/terms", eyebrow: "Terms", title: "このサイトを使う前に。" },
] as const;

export const DEFAULT_COPY = {
  eyebrow: "Rishirecruit",
  title: "利尻富士町の仕事と暮らしへ。",
};

/** 末尾の / を落とす。ISR のトップ(/index)は / として扱う */
function trimPath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" || trimmed === "/index" ? "/" : trimmed;
}

function copyEntryForPath(pathname: string) {
  const path = trimPath(pathname);
  return TRANSITION_COPY.find(
    ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function copyForPath(pathname: string): { eyebrow: string; title: string } {
  return copyEntryForPath(pathname) ?? DEFAULT_COPY;
}

/** トップは "/"、区分にあるものはその prefix。どれにも当たらない URL は、そのパス自体を1つのセクションとみなす */
export function sectionForPath(pathname: string) {
  const path = trimPath(pathname);
  if (path === "/") return "/";
  return copyEntryForPath(path)?.prefix ?? path;
}

export function crossesSection(fromPathname: string, toPathname: string) {
  return sectionForPath(fromPathname) !== sectionForPath(toPathname);
}
