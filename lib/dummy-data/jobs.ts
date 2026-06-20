import type { DummyImage } from "@/lib/dummy-data/shared";

export interface DummyJobPosting {
  id: string;
  slug: string;
  title: string;
  employmentType: string;
  catchCopy: string;
  thumbnailImage: DummyImage | null;
  thumbnailVideoUrl: string | null;
  description: string;
  desiredPerson: string;
  requiredQualifications: string;
  salary: string;
  salaryDetail: string;
  workHours: string;
  workHoursDetail: string;
  holiday: string;
  socialInsurance: string;
  benefits: string;
  housingSupportAvailable: boolean;
  housingSupportDetail: string;
  smokingPolicy: string;
  trialPeriod: string;
  workAddress: string;
  workAddressDetail: string;
  pinLocation: "town_hall" | "health_center" | "airport" | "oniwaki";
  applicationFlow: string;
}

export const DUMMY_JOBS: DummyJobPosting[] = [
  {
    id: "job-1",
    slug: "honchou-jimu-2026",
    title: "主事補(一般事務)",
    employmentType: "正規職員",
    catchCopy: "島の暮らしを、窓口から支える仕事。",
    thumbnailImage: {
      sourceUrl: "/placeholders/job.svg",
      altText: "利尻富士町役場の仕事を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    description: "窓口対応、各種書類作成、地域事業の運営補助などを担当します。",
    desiredPerson: "町民と落ち着いて向き合い、日々の事務を丁寧に進められる方。",
    requiredQualifications: "普通自動車免許",
    salary: "月額18.5万円〜",
    salaryDetail: "経験年数に応じて町規定により決定します。",
    workHours: "8:30〜17:15",
    workHoursDetail: "休憩60分。繁忙期は時間外勤務が発生する場合があります。",
    holiday: "土日祝、年末年始、年次有給休暇",
    socialInsurance: "各種完備",
    benefits: "通勤手当、期末・勤勉手当、寒冷地手当",
    housingSupportAvailable: true,
    housingSupportDetail: "町内住宅の相談窓口を案内します。",
    smokingPolicy: "庁舎内禁煙",
    trialPeriod: "6か月",
    workAddress: "北海道利尻郡利尻富士町鴛泊富士野6",
    workAddressDetail: "利尻富士町役場 本庁舎",
    pinLocation: "town_hall",
    applicationFlow: "応募書類の確認後、面接日程をご連絡します。",
  },
  {
    id: "job-2",
    slug: "health-center-support-2026",
    title: "保健センター支援員",
    employmentType: "会計年度任用(フル)",
    catchCopy: "健やかな毎日を、身近な場所で支える。",
    thumbnailImage: {
      sourceUrl: "/placeholders/job.svg",
      altText: "保健センターの仕事を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    description: "健診受付、予防事業の準備、住民向け案内の補助を担当します。",
    desiredPerson: "人と接することが好きで、細かな確認を大切にできる方。",
    requiredQualifications: "普通自動車免許",
    salary: "月額17.2万円〜",
    salaryDetail: "勤務条件により変動します。",
    workHours: "8:30〜17:00",
    workHoursDetail: "事業日程により早出をお願いする場合があります。",
    holiday: "土日祝、年末年始",
    socialInsurance: "各種完備",
    benefits: "通勤手当、研修参加補助",
    housingSupportAvailable: false,
    housingSupportDetail: "",
    smokingPolicy: "施設内禁煙",
    trialPeriod: "1か月",
    workAddress: "北海道利尻郡利尻富士町鴛泊",
    workAddressDetail: "利尻富士町保健センター",
    pinLocation: "health_center",
    applicationFlow: "担当課で書類確認後、面接をご案内します。",
  },
  {
    id: "job-3",
    slug: "oniwaki-community-2026",
    title: "地域活動サポートスタッフ",
    employmentType: "会計年度任用(パート)",
    catchCopy: "鬼脇地区の日々を、少しずつ整える。",
    thumbnailImage: {
      sourceUrl: "/placeholders/job.svg",
      altText: "鬼脇地区の仕事を表すプレースホルダー",
      mediaDetails: { width: 1200, height: 800 },
    },
    thumbnailVideoUrl: null,
    description: "地区行事の準備、施設管理補助、来訪者対応などを担当します。",
    desiredPerson: "地域の人と協力しながら、柔軟に動ける方。",
    requiredQualifications: "普通自動車免許",
    salary: "時給1,150円〜",
    salaryDetail: "勤務日数・経験に応じて決定します。",
    workHours: "9:00〜15:00",
    workHoursDetail: "週3〜4日程度。行事日は勤務時間が変わる場合があります。",
    holiday: "シフトによる",
    socialInsurance: "勤務条件により加入",
    benefits: "通勤手当",
    housingSupportAvailable: false,
    housingSupportDetail: "",
    smokingPolicy: "勤務施設内禁煙",
    trialPeriod: "1か月",
    workAddress: "北海道利尻郡利尻富士町鬼脇",
    workAddressDetail: "鬼脇地区内の公共施設",
    pinLocation: "oniwaki",
    applicationFlow: "応募後、担当者から勤務条件の確認をご連絡します。",
  },
];

