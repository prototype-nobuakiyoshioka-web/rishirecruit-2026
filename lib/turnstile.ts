/**
 * Cloudflare Turnstile のサーバー側トークン検証。
 *
 * secret はサーバー専用(TURNSTILE_SECRET_KEY)。ブラウザには絶対に出さない。
 * 未設定時はローカル検証用の公式テストキー(常に成功)にフォールバックする。
 * 本番では TURNSTILE_SECRET_KEY を実キーに設定すること。
 */

const TURNSTILE_SECRET =
  process.env.TURNSTILE_SECRET_KEY ?? "1x0000000000000000000000000000000AA";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Turnstile トークンを Cloudflare の siteverify で検証する。
 * ネットワーク失敗・トークン欠落はすべて false(=不許可)にフェイルセーフする。
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams();
  body.set("secret", TURNSTILE_SECRET);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
