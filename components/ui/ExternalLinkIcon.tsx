// 外部サイトへのリンクに添える記号。文字の「↗」ではなく線で描く(TextArrow と同じ線の太さ・揃え方)
export function ExternalLinkIcon() {
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
      style={{ display: "inline-block", width: "0.85em", height: "0.85em", flex: "none", verticalAlign: "-0.08em", marginInlineStart: "0.3em" }}
    >
      <path d="M6 3h7v7M13 3 4 12" />
    </svg>
  );
}
