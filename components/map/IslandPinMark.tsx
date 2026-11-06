/**
 * トップの3Dのピン(Pin.tsx)と同じ形を、半径12の SVG にしたもの。
 * 比率は Pin.tsx と同じ(中心1.3・帯2.4・透き間2.85・輪3.35)。動かさない
 */
export function IslandPinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true" focusable="false" className={className}>
      <circle r="11.1" fill="none" strokeWidth="1.8" style={{ stroke: "var(--c-pin-spot)" }} />
      <circle r="6.63" fill="none" strokeWidth="3.94" style={{ stroke: "var(--c-pin-spot)" }} />
      <circle r="4.66" style={{ fill: "var(--c-snow)" }} />
    </svg>
  );
}
