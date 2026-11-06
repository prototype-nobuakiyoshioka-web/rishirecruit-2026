// 文字リンクの末尾(先頭)に添える矢印。記号の文字ではなく線で描き、文字の高さの中央にそろえる
export function TextArrow({ direction = "right" }: { direction?: "left" | "right" }) {
  const isLeft = direction === "left";

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{
        display: "inline-block",
        width: "0.9em",
        height: "0.9em",
        flex: "none",
        verticalAlign: "-0.1em",
        [isLeft ? "marginInlineEnd" : "marginInlineStart"]: "0.35em",
      }}
    >
      <path d={isLeft ? "M13 8H3m4-4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} />
    </svg>
  );
}
