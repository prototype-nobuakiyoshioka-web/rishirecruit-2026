import type { DummyImage } from "@/lib/dummy-data/shared";

export interface DummyTestimonial {
  id: string;
  slug: string;
  title: string;
  catchCopy: string;
  photo: DummyImage;
  profileBefore: string;
  profileAfter: string;
  migrationYear: string;
  relatedJob: {
    slug: string;
    title: string;
  } | null;
  leadText: string;
  interviewBody: string;
  galleryImages: DummyImage[];
}

export const DUMMY_VOICES: DummyTestimonial[] = [
  {
    id: "voice-1",
    slug: "sato-2023",
    title: "佐藤さん(2023年移住)",
    catchCopy: "海の近くで働く毎日が、少しずつ自分のペースになった。",
    photo: {
      sourceUrl: "/placeholders/voice.svg",
      altText: "移住者の声を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    profileBefore: "札幌市・会社員",
    profileAfter: "利尻富士町・役場勤務",
    migrationYear: "2023年",
    relatedJob: { slug: "honchou-jimu-2026", title: "主事補(一般事務)" },
    leadText: "仕事の内容と暮らしの距離感を、移住後の視点で聞きました。",
    interviewBody: "朝の海や町の人とのやりとりが、日々の仕事の支えになっています。",
    galleryImages: [],
  },
  {
    id: "voice-2",
    slug: "tanaka-2022",
    title: "田中さん(2022年移住)",
    catchCopy: "子育てと仕事の間に、島の景色がある。",
    photo: {
      sourceUrl: "/placeholders/voice.svg",
      altText: "移住者の暮らしを表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    profileBefore: "東京都・事務職",
    profileAfter: "利尻富士町・地域活動スタッフ",
    migrationYear: "2022年",
    relatedJob: { slug: "oniwaki-community-2026", title: "地域活動サポートスタッフ" },
    leadText: "家族で移ってきた後の生活リズムについて聞きました。",
    interviewBody: "不便なこともありますが、相談できる顔が近くにある安心感があります。",
    galleryImages: [],
  },
  {
    id: "voice-3",
    slug: "yamada-2024",
    title: "山田さん(2024年移住)",
    catchCopy: "冬の静けさも、仕事の手ざわりも、ここで知った。",
    photo: {
      sourceUrl: "/placeholders/voice.svg",
      altText: "冬の島ぐらしを表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    profileBefore: "旭川市・医療事務",
    profileAfter: "利尻富士町・保健センター勤務",
    migrationYear: "2024年",
    relatedJob: { slug: "health-center-support-2026", title: "保健センター支援員" },
    leadText: "冬を越えて見えてきた、島で働く実感を聞きました。",
    interviewBody: "季節の変化が大きい分、町の人との会話が自然に増えました。",
    galleryImages: [],
  },
];

