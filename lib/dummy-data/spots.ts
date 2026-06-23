import type { DummyImage } from "@/lib/dummy-data/shared";

export interface DummyTouristspot {
  id: string;
  slug: string;
  title: string;
  category:
    | "nature"
    | "onsen"
    | "gourmet"
    | "lodging"
    | "experience"
    | "culture"
    | "view";
  categoryLabel: string;
  catchCopy: string;
  thumbnailImage: DummyImage;
  thumbnailVideoUrl: string | null;
  description: string;
  galleryImages: DummyImage[];
  bestSeason: string;
  address: string;
  accessInfo: string;
  openHours: string;
  closedDays: string;
  price: string;
  phone: string;
  websiteUrl: string;
}

export const DUMMY_SPOTS: DummyTouristspot[] = [
  {
    id: "spot-1",
    slug: "himenuma",
    title: "姫沼",
    category: "nature",
    categoryLabel: "自然・景観",
    catchCopy: "利尻富士を静かに映す、森の中の水辺。",
    thumbnailImage: {
      sourceUrl: "/placeholders/spot.svg",
      altText: "姫沼を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    description: "散策路を歩きながら、季節ごとの山と水面の表情を楽しめます。",
    galleryImages: [
      {
        sourceUrl: "/placeholders/spot.svg",
        altText: "姫沼の散策路を表すプレースホルダー",
        mediaDetails: { width: 1200, height: 800 },
      },
      {
        sourceUrl: "/placeholders/spot.svg",
        altText: "姫沼から見える利尻富士を表すプレースホルダー",
        mediaDetails: { width: 1200, height: 800 },
      },
    ],
    bestSeason: "初夏〜秋",
    address: "北海道利尻郡利尻富士町鴛泊",
    accessInfo: "鴛泊港から車で約15分",
    openHours: "常時開放",
    closedDays: "冬季は状況により通行不可",
    price: "無料",
    phone: "",
    websiteUrl: "",
  },
  {
    id: "spot-2",
    slug: "peshi-misaki",
    title: "ペシ岬",
    category: "view",
    categoryLabel: "公園・展望",
    catchCopy: "港と海を見下ろす、島の入口の展望地。",
    thumbnailImage: {
      sourceUrl: "/placeholders/spot.svg",
      altText: "ペシ岬を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    description: "短い登りの先に、鴛泊港と日本海を望む景色が広がります。",
    galleryImages: [
      {
        sourceUrl: "/placeholders/spot.svg",
        altText: "ペシ岬の展望を表すプレースホルダー",
        mediaDetails: { width: 1200, height: 800 },
      },
      {
        sourceUrl: "/placeholders/spot.svg",
        altText: "鴛泊港周辺を表すプレースホルダー",
        mediaDetails: { width: 1200, height: 800 },
      },
    ],
    bestSeason: "春〜秋",
    address: "北海道利尻郡利尻富士町鴛泊",
    accessInfo: "鴛泊港から徒歩圏内",
    openHours: "常時開放",
    closedDays: "なし",
    price: "無料",
    phone: "",
    websiteUrl: "",
  },
  {
    id: "spot-3",
    slug: "otatomari-numa",
    title: "オタトマリ沼",
    category: "nature",
    categoryLabel: "自然・景観",
    catchCopy: "山と湿原を一緒に眺める、島南部の立ち寄り先。",
    thumbnailImage: {
      sourceUrl: "/placeholders/spot.svg",
      altText: "オタトマリ沼を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    description: "利尻富士を背景に、沼のまわりをゆっくり巡れます。",
    galleryImages: [
      {
        sourceUrl: "/placeholders/spot.svg",
        altText: "オタトマリ沼の水辺を表すプレースホルダー",
        mediaDetails: { width: 1200, height: 800 },
      },
      {
        sourceUrl: "/placeholders/spot.svg",
        altText: "島南部の湿原を表すプレースホルダー",
        mediaDetails: { width: 1200, height: 800 },
      },
    ],
    bestSeason: "夏",
    address: "北海道利尻郡利尻富士町鬼脇",
    accessInfo: "鬼脇市街地から車で約10分",
    openHours: "常時開放",
    closedDays: "冬季は状況により通行不可",
    price: "無料",
    phone: "",
    websiteUrl: "",
  },
];
