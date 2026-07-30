export function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${month}月${day}日`;
}
