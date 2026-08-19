# Phase 6 Task 01: フォーム実送信（Contact Form 7 / ヘッドレス）

## 目的

現在モック（1秒待って成功画面）の2フォームを、**CF7 の REST API** 経由の実送信に置き換える。

- `app/contact/page.tsx`（お問い合わせ）
- `components/job/ApplyForm.tsx`（求人応募）

送信基盤: **WordPress の Contact Form 7**（管理画面で応募/問い合わせが管理でき、CF7 のメール設定で通知）。
フロントは CF7 の feedback エンドポイントに `multipart/form-data` を POST する。

```
POST {WP}/wp-json/contact-form-7/v1/contact-forms/{FORM_ID}/feedback
→ JSON: { status: "mail_sent" | "validation_failed" | "spam" | "mail_failed" | "acceptance_missing", message: string }
成功判定: status === "mail_sent"
```

CORS は `inc/cors-config.php` が `localhost:3000` / `https://rishirecruit.com` を許可済み（`init` フックで `/wp-json/` にも適用）→ **フロントから直接呼べる。Next.js プロキシは不要**。

---

## 前提（WordPress 側・手作業）※これが完了しないとフロントは疎通確認できない

### WP-1. CF7 プラグイン導入
- 「Contact Form 7」をインストール・有効化
- （推奨）応募内容を管理画面に残すため「Flamingo」も併せて有効化

### WP-2. フォームを2つ作成（フィールド名は下記の契約と厳密に一致させる）

**契約が命**: フロントが送る `name` と CF7 のフォームタグ名が一致しないと値が届かない。

#### フォームA: お問い合わせ（contact）

| CF7 フォームタグ | 送信される name | 必須 |
|---|---|---|
| `[radio inquiry_type ...]` | `inquiry_type` | ✓ |
| `[text* your_name]` → **name は `name`** | `name` | ✓ |
| `[text furigana]` | `furigana` | ✓ |
| `[email* email]` | `email` | ✓ |
| `[tel phone]` | `phone` |  |
| `[textarea* message]` | `message` | ✓ |
| `[acceptance privacy]` | `privacy` | ✓ |

> CF7 の `[email*]` などタグ名は自由だが **name 部分（角括弧内の2語目）を上表の name に合わせる**こと。
> inquiry_type の選択肢は `app/contact/page.tsx` の `INQUIRY_OPTIONS` と一致させる。

#### フォームB: 求人応募（apply）

| CF7 フォームタグ | 送信される name | 必須 |
|---|---|---|
| `[text* full_name]` | `full_name` | ✓ |
| `[text* full_name_kana]` | `full_name_kana` | ✓ |
| `[select gender ...]` | `gender` |  |
| `[date birth_date]` | `birth_date` |  |
| `[tel* phone]` | `phone` | ✓ |
| `[email* email]` | `email` | ✓ |
| `[text* zip_code]` | `zip_code` | ✓ |
| `[text* prefecture]` | `prefecture` | ✓ |
| `[text* address_line]` | `address_line` | ✓ |
| `[acceptance privacy]` | `privacy` | ✓ |
| 応募求人スラッグ | `job_slug` |  |

> **要確認（サブ決定）**: `job_slug` は「どの求人への応募か」を通知メールに含めるための値。CF7 標準に hidden タグが無いため、以下いずれかで対応:
> - (a) 「Contact Form 7 Hidden Field」系アドオンを入れ `[hidden job_slug]` を置く（推奨・最小変更）
> - (b) アドポン無しなら `[text job_slug]` を置き CSS/readonly で隠す
> どちらでも、CF7 メール本文のテンプレに `[job_slug]` を差し込めば通知に載る。

### WP-3. 各フォームの「メール」タブを設定
- 送信先・件名・本文に上記 mail-tag（`[name]` `[email]` `[job_slug]` 等）を差し込む
- テスト送信して**wp-admin/メールが実際に届く**ことを確認

### WP-4. 2つのフォーム ID を控える
- CF7 の各フォーム編集画面のショートコード `[contact-form-7 id="XXXX" ...]` の **id** を控えてフロント担当（Claude Code）へ渡す

---

## フロント側（Claude Code が実装）

### FE-1. 環境変数（`.env.local` に追加）
```
NEXT_PUBLIC_WP_BASE_URL=http://rishirecruit-2026.local
NEXT_PUBLIC_CF7_CONTACT_ID=<フォームAのID>
NEXT_PUBLIC_CF7_APPLY_ID=<フォームBのID>
```

### FE-2. 送信ユーティリティを1つ追加（例: `lib/wp/submit-cf7.ts`）
- 引数: `formId`, `FormData`
- `fetch(POST, feedbackURL, { body: formData })` → JSON を返す
- `status === "mail_sent"` を成功として呼び出し側へ返す

### FE-3. `app/contact/page.tsx` の `handleSubmit`（現状 line 109 の setTimeout モック）を差し替え
- 既存の `validateForm`（クライアント検証）は**残す**
- FormData を組み立て（契約の name で）→ submit-cf7 呼び出し
- 成功 → `setIsSubmitted(true)` / 失敗 → 送信エラー表示（新規の error state を最小限で追加）

### FE-4. `components/job/ApplyForm.tsx` の `handleSubmit`（現状 line 243 の setTimeout モック）を同様に差し替え
- `job_slug` を FormData に含める

### 制約
- 既存のクライアント側バリデーション・UI・成功画面のマークアップは変更しない（送信処理のみ差し替え）
- モックの `setTimeout` と TODO コメントは削除する
- 送信失敗時にユーザーへフィードバックを出す（無言で失敗しない）
- `NEXT_PUBLIC_` 前提（クライアントから叩くため）。秘匿情報は含めない
- TypeScript 型エラーを出さない

---

## 検証（報告前に自動ゲート → 目視）
1. `npm run lint` / `npx tsc --noEmit` / `npm run build` が緑
2. `npm run dev` で /contact 送信 → CF7 の通知メールが届く／Flamingo に記録される
3. 求人詳細の応募フォーム送信 → 同上、`job_slug` が通知に載る
4. わざと必須を空にして送信 → クライアント検証で止まる（従来通り）
5. 失敗レスポンス時にエラー表示が出る
6. 完了報告に lint/tsc/build 結果と、送信成功のスクショ（or Flamingoの受信記録）を添付

## 成果物
- `lib/wp/submit-cf7.ts`（新規）
- `app/contact/page.tsx` / `components/job/ApplyForm.tsx`（送信処理差し替え）
- `.env.local`（フォームID・BASE_URL 追記。※コミットしない）

## 完了後
- `AGENTS.md`「現在のフェーズ」Phase 6 の「応募フォーム・お問い合わせフォームの実送信」を `[x]` に更新
