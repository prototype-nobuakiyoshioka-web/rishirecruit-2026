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

export function formatEventPeriod(
  displayType: string | null,
  startDate: string | null,
  endDate: string | null,
  month: string | null,
  range: string | null,
): string {
  if (displayType === "period" && month && range) {
    return `${month}月${PERIOD_RANGE_LABELS[range] ?? ""}`;
  }

  if (startDate) {
    const start = formatEventDate(startDate);
    const end = endDate ? formatEventDate(endDate) : null;

    return end && end !== start ? `${start}〜${end}` : start;
  }

  return "日程未定";
}
