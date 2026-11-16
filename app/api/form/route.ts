import { NextResponse } from "next/server";
import { sanitizeInflowFields } from "@/lib/forms/inflow";
import { verifyTurnstile } from "@/lib/turnstile";
import { submitCf7, type Cf7Response } from "@/lib/wp/submit-cf7";

// 中継を許可するCF7フォームID(お問い合わせ=176 / 求人応募=177)。
// 任意フォームIDへの踏み台化を防ぐため許可リストで制限する。
const ALLOWED_FORM_IDS = new Set([
  process.env.NEXT_PUBLIC_CF7_CONTACT_ID ?? "176",
  process.env.NEXT_PUBLIC_CF7_APPLY_ID ?? "177",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormRequest = {
  formId?: string;
  fields?: Record<string, string>;
  turnstileToken?: string;
  honeypot?: string;
  inflow?: Record<string, string>;
};

// フォーム送信をサーバー側で受け、Turnstile検証+最小バリデーションを通してからCF7へ中継する。
// これによりCF7エンドポイントをブラウザへ直接晒さず、ボット送信をサーバー側で遮断する。
export async function POST(request: Request) {
  let payload: FormRequest;
  try {
    payload = (await request.json()) as FormRequest;
  } catch {
    return NextResponse.json(
      { status: "validation_failed", message: "リクエストが不正です。" } satisfies Cf7Response,
      { status: 400 },
    );
  }

  const { formId, fields, turnstileToken, honeypot, inflow } = payload;

  // ハニーポット: 人間は空のまま。値が入っていればボットとみなし、成功を装って静かに破棄する。
  if (honeypot) {
    return NextResponse.json({ status: "mail_sent", message: "" } satisfies Cf7Response);
  }

  if (!formId || !ALLOWED_FORM_IDS.has(formId) || !fields || typeof fields !== "object") {
    return NextResponse.json(
      { status: "validation_failed", message: "リクエストが不正です。" } satisfies Cf7Response,
      { status: 400 },
    );
  }

  // Turnstile をサーバー側で検証。失敗時は送信せず遮断する。
  const remoteIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined;
  const passed = await verifyTurnstile(turnstileToken, remoteIp);
  if (!passed) {
    return NextResponse.json({
      status: "spam",
      message: "認証に失敗しました。ページを再読み込みして、もう一度お試しください。",
    } satisfies Cf7Response);
  }

  // 最低限のサーバー側バリデーション(メール形式)。詳細な必須チェックはCF7側でも実施される。
  const email = fields.email?.trim();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({
      status: "validation_failed",
      message: "メールアドレスを確認してください。",
      invalid_fields: [{ field: "email", message: "メールアドレスを確認してください。" }],
    } satisfies Cf7Response);
  }

  // CF7制御フィールド(_wpcf7*)はサーバー側で必ず付与するため、クライアント指定分は除去する。
  const safeFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key.startsWith("_wpcf7")) continue;
    // 流入元は下でサーバー側の値だけを入れる(画面の項目からは受け取らない)
    if (key.startsWith("inflow_")) continue;
    safeFields[key] = typeof value === "string" ? value : String(value);
  }

  // 流入元を添える。CF7 はフォームに定義のない項目を無視するため、WP 側の設定前でも送信は失敗しない。
  Object.assign(safeFields, sanitizeInflowFields(inflow));

  try {
    const result = await submitCf7(formId, safeFields);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      status: "mail_failed",
      message: "送信に失敗しました。時間をおいて、もう一度お試しください。",
    } satisfies Cf7Response);
  }
}
