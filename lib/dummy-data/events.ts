import type { DummyImage } from "@/lib/dummy-data/shared";

export interface DummyEvent {
  id: string;
  slug: string;
  title: string;
  category:
    | "festival"
    | "workshop"
    | "seminar"
    | "recruitment"
    | "sports"
    | "culture";
  categoryLabel: string;
  catchCopy: string;
  thumbnailImage: DummyImage;
  thumbnailVideoUrl: string | null;
  startDatetime: string;
  endDatetime: string;
  isRecurring: boolean;
  recurrenceNote: string;
  organizer: string;
  description: string;
  galleryImages: DummyImage[];
  venueName: string;
  address: string;
  accessInfo: string;
  pinReference: string;
  price: string;
  registrationUrl: string;
  contact: string;
  status: "開催中" | "予定";
}

export const DUMMY_EVENTS: DummyEvent[] = [
  {
    id: "event-1",
    slug: "rishirisan-opening-2026",
    title: "利尻山開き",
    category: "festival",
    categoryLabel: "まつり・伝統行事",
    catchCopy: "夏山の始まりを、町で迎える一日。",
    thumbnailImage: {
      sourceUrl: "/placeholders/event.svg",
      altText: "利尻山開きのプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    startDatetime: "2026-07-01T09:00:00+09:00",
    endDatetime: "2026-07-01T15:00:00+09:00",
    isRecurring: true,
    recurrenceNote: "毎年7月上旬",
    organizer: "利尻富士町",
    description: "安全祈願や地域企画を通して、夏の山の季節を迎えます。",
    galleryImages: [],
    venueName: "鴛泊地区",
    address: "北海道利尻郡利尻富士町鴛泊",
    accessInfo: "鴛泊港から徒歩圏内",
    pinReference: "town_hall",
    price: "無料",
    registrationUrl: "",
    contact: "利尻富士町役場",
    status: "予定",
  },
  {
    id: "event-2",
    slug: "oniwaki-summer-festival-2026",
    title: "鬼脇まつり",
    category: "festival",
    categoryLabel: "まつり・伝統行事",
    catchCopy: "地区のにぎわいが、海沿いに集まる日。",
    thumbnailImage: {
      sourceUrl: "/placeholders/event.svg",
      altText: "鬼脇まつりのプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    startDatetime: "2026-08-08T10:00:00+09:00",
    endDatetime: "2026-08-08T20:00:00+09:00",
    isRecurring: true,
    recurrenceNote: "毎年8月頃",
    organizer: "鬼脇まつり実行委員会",
    description: "地域の出店やステージ企画を楽しめる、夏の地区イベントです。",
    galleryImages: [],
    venueName: "鬼脇地区会場",
    address: "北海道利尻郡利尻富士町鬼脇",
    accessInfo: "鬼脇市街地周辺",
    pinReference: "oniwaki",
    price: "無料",
    registrationUrl: "",
    contact: "鬼脇まつり実行委員会",
    status: "予定",
  },
  {
    id: "event-3",
    slug: "island-life-seminar-2026",
    title: "島ぐらし相談会",
    category: "seminar",
    categoryLabel: "セミナー・講演会",
    catchCopy: "仕事と暮らしのことを、町の人に聞く時間。",
    thumbnailImage: {
      sourceUrl: "/placeholders/event.svg",
      altText: "島ぐらし相談会のプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    startDatetime: "2026-06-21T13:00:00+09:00",
    endDatetime: "2026-06-21T16:00:00+09:00",
    isRecurring: false,
    recurrenceNote: "",
    organizer: "利尻富士町",
    description: "求人、住まい、冬の暮らしなどを相談できる小さな説明会です。",
    galleryImages: [],
    venueName: "利尻富士町役場",
    address: "北海道利尻郡利尻富士町鴛泊富士野6",
    accessInfo: "鴛泊港から車で約5分",
    pinReference: "town_hall",
    price: "無料",
    registrationUrl: "",
    contact: "利尻富士町役場",
    status: "開催中",
  },
];

