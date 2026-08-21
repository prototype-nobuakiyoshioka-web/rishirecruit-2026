/**
 * Contact Form 7 の REST feedback エンドポイントへフォームを送信するユーティリティ。
 *
 * CF7 は `_wpcf7_unit_tag` 等の制御フィールドが無いと 400 (wpcf7_unit_tag_not_found)
 * を返すため、ここで一括付与する。フロントからは name→値 のマップだけ渡せばよい。
 */

// WordPress のベース URL（GraphQL とは別。CF7 REST は /wp-json 配下）
const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_BASE_URL ?? "http://rishirecruit-2026.local";

export type Cf7Response = {
  contact_form_id?: number;
  status: string; // "mail_sent" | "validation_failed" | "spam" | "mail_failed" | ...
  message: string;
  invalid_fields?: { field: string; message: string }[];
};

/**
 * CF7 フォームへ送信する。ネットワーク成功時は CF7 のレスポンス JSON をそのまま返す。
 * 送信成否の判定は呼び出し側で `isCf7Success` を使う。
 */
export async function submitCf7(
  formId: string,
  fields: Record<string, string>,
): Promise<Cf7Response> {
  const body = new FormData();
  // CF7 が要求する制御フィールド
  body.set("_wpcf7", formId);
  body.set("_wpcf7_version", "6.0");
  body.set("_wpcf7_locale", "ja");
  body.set("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);
  body.set("_wpcf7_container_post", "0");
  // 実データ
  for (const [name, value] of Object.entries(fields)) {
    body.set(name, value);
  }

  const res = await fetch(
    `${WP_BASE_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
    { method: "POST", body },
  );
  return (await res.json()) as Cf7Response;
}

/** CF7 の送信成功判定（mail_sent のみ成功）。 */
export function isCf7Success(result: Cf7Response): boolean {
  return result.status === "mail_sent";
}

/**
 * フォームを Next.js の API ルート（/api/form）経由で送信する。
 * サーバー側で Turnstile 検証とバリデーションを通してから CF7 へ中継されるため、
 * クライアントからは CF7 を直接叩かない（ボット対策・secret秘匿）。
 */
export async function submitForm(
  formId: string,
  fields: Record<string, string>,
  turnstileToken: string,
  honeypot = "",
): Promise<Cf7Response> {
  const res = await fetch("/api/form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId, fields, turnstileToken, honeypot }),
  });
  return (await res.json()) as Cf7Response;
}
