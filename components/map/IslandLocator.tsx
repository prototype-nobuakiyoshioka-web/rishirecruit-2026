import type { CSSProperties } from "react";
import { IslandPinMark } from "@/components/map/IslandPinMark";
import type { IslandLocation } from "@/lib/map/island-locator";
import styles from "./IslandLocator.module.css";

const ISLAND_MASK = { "--mask": "url(/images/map/rishiri-island-whole.png)" } as CSSProperties;
const TOWN_MASK = { "--mask": "url(/images/map/rishiri-island-rishirifuji.png)" } as CSSProperties;

/**
 * 島の地図とピン、場所の文字3行。水色の背景の上だけで使う(紙色の背景では中心の白が見えにくい)。
 * 利尻富士町を紺、利尻町を薄い紺で塗り、島の全体の形が分かるようにする
 */
export function IslandLocator({ location }: { location: IslandLocation }) {
  return (
    <div className={styles.where}>
      <div className={styles.map} role="img" aria-label={location.ariaLabel}>
        <div className={styles.island} style={ISLAND_MASK} />
        <div className={styles.town} style={TOWN_MASK} />
        {location.pins.map((pin) => (
          <span key={`${pin.x}-${pin.y}`} className={styles.pin} style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <IslandPinMark className="block h-full w-full" />
          </span>
        ))}
      </div>
      <div>
        <p className={styles.label}>{location.label}</p>
        <p className={styles.area}>
          {location.areaName}
          <small>エリア</small>
        </p>
        {location.sub ? <p className={styles.sub}>{location.sub}</p> : null}
      </div>
    </div>
  );
}
