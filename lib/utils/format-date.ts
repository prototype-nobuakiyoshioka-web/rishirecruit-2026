export function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${month}月${day}日`;
}

const PERIOD_RANGE_LABELS: Record<string, string> = {
  early: "上旬",
  mid: "中旬",
  late: "下旬",
};

const NTH_LABELS: Record<string, string> = {
  "1": "第1",
  "2": "第2",
  "3": "第3",
  "4": "第4",
  "5": "第5",
};

const WEEKDAY_LABELS: Record<string, string> = {
  mon: "月曜日",
  tue: "火曜日",
  wed: "水曜日",
  thu: "木曜日",
  fri: "金曜日",
  sat: "土曜日",
  sun: "日曜日",
};

export function formatEventPeriod(
  displayType: string | null,
  startDate: string | null,
  endDate: string | null,
  month: string | null,
  range: string | null,
  nth: string | null = null,
  weekday: string | null = null,
): string {
  if (displayType === "period" && month && range) {
    return `${month}月${PERIOD_RANGE_LABELS[range] ?? ""}`;
  }

  if (displayType === "nth_weekday" && month && nth && weekday) {
    return `${month}月${NTH_LABELS[nth] ?? ""}${WEEKDAY_LABELS[weekday] ?? ""}`;
  }

  if (startDate) {
    const start = formatEventDate(startDate);
    const end = endDate ? formatEventDate(endDate) : null;

    return end && end !== start ? `${start}〜${end}` : start;
  }

  return "日程未定";
}

// 会場と日程エントリを "〇会場 ◯月◯日" or "〇会場 ◯月第N曜日" 形式の配列にする。
// 入力があるエントリ(venue+日付情報両方非空)のみ返す。
export function formatScheduleEntries(
  entries:
    | Array<{
        venue: string | null;
        dateType?: string[] | null;
        date?: string | null;
        month?: string[] | null;
        nth?: string[] | null;
        weekday?: string[] | null;
      }>
    | null
    | undefined,
): string[] {
  if (!entries) return [];
  return entries
    .map((e) => {
      if (!e.venue) return null;
      const dateType = e.dateType?.[0] ?? "exact";
      if (dateType === "nth_weekday") {
        const m = e.month?.[0];
        const n = e.nth?.[0];
        const w = e.weekday?.[0];
        if (!m || !n || !w) return null;
        return `${e.venue} ${m}月${NTH_LABELS[n] ?? ""}${WEEKDAY_LABELS[w] ?? ""}`;
      }
      if (!e.date) return null;
      return `${e.venue} ${formatEventDate(e.date)}`;
    })
    .filter((s): s is string => s !== null);
}
