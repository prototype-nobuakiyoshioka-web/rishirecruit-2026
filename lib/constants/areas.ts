export interface AreaInfo {
  slug: string;
  name: string;
  nameEn: string;
  catchCopy: string[];
  description: string[];
}

export const AREA_INFO: Record<string, AreaInfo> = {
  oshidomari: {
    slug: "oshidomari",
    name: "鴛泊",
    nameEn: "OSHIDOMARI",
    catchCopy: [
      "空港やフェリーターミナルがある",
      "利尻富士のメインエリア",
    ],
    description: [
      "飲食店や有数の観光スポットが立ち並ぶ",
      "鴛泊エリア、利尻富士を楽しむならまずこちらへ！",
    ],
  },
  oniwaki: {
    slug: "oniwaki",
    name: "鬼脇",
    nameEn: "ONIWAKI",
    catchCopy: ["利尻山の南麓に広がる", "自然豊かなエリア"],
    description: [
      "オタトマリ沼をはじめとした",
      "雄大な自然が魅力の鬼脇エリア。",
    ],
  },
};
