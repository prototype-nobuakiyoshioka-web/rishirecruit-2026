import type { AreaTerm, JobPosting, Touristspot, WPEvent } from "@/lib/wp/types";
import { PIN_LABELS } from "@/lib/wp/labels";

/**
 * 下層の詳細ページに置く「島の地図」の中身を、WP のデータから作る。
 * 文字(エリア名)は areas、ピンの位置は pinLocation / 観光地の表 / areas から決める。
 * 両者が食い違っても、ここでは補わない(WP のデータを直せば表示も直る)。
 */

/** 地図の絵(public/images/map/rishiri-island-*.png、700×790)の中で、島の外形が占める範囲(px) */
const BOX = { w: 700, h: 790, x0: 9, x1: 691, y0: 7, y1: 779 };
/** 島の外形の緯度経度の範囲(reference/island-source/osm.json の海岸線) */
const GEO = { lon0: 141.126831, lon1: 141.330418, lat0: 45.096974, lat1: 45.259729 };

export type LatLon = { lat: number; lon: number };
/** 地図の絵に対する位置(%)。左上が 0,0 */
export type MapPoint = { x: number; y: number };

export function toMapPoint({ lat, lon }: LatLon): MapPoint {
  const x = (BOX.x0 + ((lon - GEO.lon0) / (GEO.lon1 - GEO.lon0)) * (BOX.x1 - BOX.x0)) / BOX.w;
  const y = (BOX.y0 + ((GEO.lat1 - lat) / (GEO.lat1 - GEO.lat0)) * (BOX.y1 - BOX.y0)) / BOX.h;
  return { x: Math.round(x * 1000) / 10, y: Math.round(y * 1000) / 10 };
}

/** エリアの位置(トップの3Dのエリアのピンと同じ)と方角。表示の並びもこの順 */
const AREA_PLACES: Record<string, LatLon & { direction: string }> = {
  oshidomari: { lat: 45.2417, lon: 141.2245, direction: "島の北側" },
  oniwaki: { lat: 45.1394, lon: 141.3095, direction: "島の南東側" },
};
const AREA_ORDER = Object.keys(AREA_PLACES);

/**
 * 求人の pinLocation の位置。health_center(保健センター)は位置が未確定のため表に入れず、
 * エリアの位置にピンを立てる(住所は鴛泊字栄町117。確定したらここに足す)
 */
const JOB_PIN_PLACES: Record<string, LatLon> = {
  town_hall: { lat: 45.24756, lon: 141.21458 },
  airport: { lat: 45.24392, lon: 141.18361 },
  oniwaki: { lat: 45.1394, lon: 141.3095 },
};
/** 位置の表がない pinLocation のときに、代わりに使うエリア */
const JOB_PIN_FALLBACK_AREA: Record<string, string> = { health_center: "oshidomari" };
/** 3行目に施設名を足さない pinLocation(「鬼脇地区」はエリア名と重なる) */
const JOB_PIN_WITHOUT_FACILITY = new Set(["oniwaki"]);

/**
 * 観光地の位置(slug → 緯度経度)。OSM で確かめられたものだけ。
 * 表にない観光地はエリアの位置にピンを立てる。ACF に緯度経度の欄ができたら、そちらに移す
 */
const SPOT_PLACES: Record<string, LatLon> = {
  himenuma: { lat: 45.22662, lon: 141.24566 },
  "otatomari-numa": { lat: 45.1205, lon: 141.28508 },
  "numaura-observatory": { lat: 45.11681, lon: 141.28964 },
  "peshi-misaki-observatory": { lat: 45.24638, lon: 141.23051 },
};

export type IslandLocation = {
  /** 1行目(求人「働く場所」/ 観光地「場所」/ イベント「会場」) */
  label: string;
  /** 2行目。エリア名(複数は「・」でつなぐ)。後ろに「エリア」を小さく添える */
  areaName: string;
  /** 3行目。方角(と施設名) */
  sub: string;
  pins: MapPoint[];
  /** 地図(role="img")の読み上げ */
  ariaLabel: string;
};

/** 地図に出せるエリアだけを、決まった順に並べる */
function knownAreas(areas: { nodes: AreaTerm[] } | null | undefined): AreaTerm[] {
  return (areas?.nodes ?? [])
    .filter((area) => area.slug in AREA_PLACES)
    .sort((a, b) => AREA_ORDER.indexOf(a.slug) - AREA_ORDER.indexOf(b.slug));
}

function buildLocation(args: {
  label: string;
  areas: AreaTerm[];
  pins: MapPoint[];
  facility?: string | null;
  placeName?: string | null;
}): IslandLocation | null {
  const { label, areas, pins, facility, placeName } = args;
  if (areas.length === 0 || pins.length === 0) return null;
  const directions = areas.map((area) => AREA_PLACES[area.slug].direction);
  const sub = [...directions, facility].filter(Boolean).join("・");
  // 例:「鬼脇エリア（島の南東側）」「鴛泊エリア（島の北側・役場本庁舎）」「姫沼（鴛泊エリア、島の北側）」
  const where = placeName
    ? `${placeName}（${areas.map((area, i) => `${area.name}エリア、${directions[i]}`).join("／")}）`
    : areas
        .map((area, i) => `${area.name}エリア（${[directions[i], areas.length === 1 ? facility : null].filter(Boolean).join("・")}）`)
        .join("と");
  return {
    label,
    areaName: areas.map((area) => area.name).join("・"),
    sub,
    pins,
    ariaLabel: `利尻島の地図。${where}の位置にピン`,
  };
}

function areaPins(areas: AreaTerm[]): MapPoint[] {
  return areas.map((area) => toMapPoint(AREA_PLACES[area.slug]));
}

export function jobLocation(job: Pick<JobPosting, "areas" | "jobPostingFields">): IslandLocation | null {
  const areas = knownAreas(job.areas);
  const pinKey = job.jobPostingFields?.pinLocation?.[0] ?? null;
  let pins: MapPoint[];
  if (pinKey && JOB_PIN_PLACES[pinKey]) pins = [toMapPoint(JOB_PIN_PLACES[pinKey])];
  else if (pinKey && JOB_PIN_FALLBACK_AREA[pinKey]) pins = [toMapPoint(AREA_PLACES[JOB_PIN_FALLBACK_AREA[pinKey]])];
  else pins = areaPins(areas);
  const facility = pinKey && !JOB_PIN_WITHOUT_FACILITY.has(pinKey) ? PIN_LABELS[pinKey] ?? null : null;
  return buildLocation({ label: "働く場所", areas, pins, facility });
}

export function spotLocation(spot: Pick<Touristspot, "slug" | "title" | "areas">): IslandLocation | null {
  const areas = knownAreas(spot.areas);
  const place = SPOT_PLACES[spot.slug];
  const pins = place ? [toMapPoint(place)] : areaPins(areas);
  return buildLocation({ label: "場所", areas, pins, placeName: place ? spot.title : null });
}

/** イベントは pinReference の表記がばらばらなので使わず、areas で決める(エリアが2つならピンも2本) */
export function eventLocation(event: Pick<WPEvent, "areas">): IslandLocation | null {
  const areas = knownAreas(event.areas);
  return buildLocation({ label: "会場", areas, pins: areaPins(areas) });
}
