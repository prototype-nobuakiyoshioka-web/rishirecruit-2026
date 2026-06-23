# Phase 4 - Task 11a: 求人詳細ページ内 応募フォーム追加

**目的:** Task 10 で実装した `/jobs/[slug]` 詳細ページに、応募フォームをページ内統合する。`/apply` 独立ページは廃止済み。スティッキーボタン「応募する」押下で同ページ内のフォームエリアへ誘導し、**ページ遷移なしで応募完了まで完結させる。**

---

## コンテキスト

### 前提環境
- **Phase 4 Task 10 完了済み**: `/jobs/[slug]` 詳細ページ・`StickyApplyCta.tsx` 実装済み
- 現状の `StickyApplyCta` は `/apply?job=[slug]` へのページ遷移リンクとして実装されている
- **`/apply` ページは廃止する**(`app/apply/` ディレクトリごと削除)

### 必ず参照すべきドキュメント
- **`docs/05-sitemap.md` §3.3(求人詳細内応募フォーム仕様)** ← フォーム項目の確定仕様
- **`docs/05-sitemap.md` §7.1(固定スティッキーボタン仕様)** ← ボタンの挙動変更
- **`docs/04-design-tokens.md`** ← カラー・スペーシング
- **`docs/06-messaging.md` §10** ← マイクロコピー(エラーメッセージ・完了メッセージ等)

### 設計方針(`docs/05-sitemap.md` §3.3 より)

「**最小限のクリックで、どの求人への応募か分かった状態で完了できる**」

- スティッキーボタン押下 → 同ページ内フォームへ誘導(ページ遷移なし)
- フォーム入力中も求人名・職種が常に視界内に入る状態を維持
- 送信完了後も同ページ内で完了メッセージを表示(別ページへの遷移なし)

---

## やってほしいこと

### 1. `app/apply/` ディレクトリの削除

`/apply` ページは廃止。`app/apply/page.tsx` および `app/apply/thanks/page.tsx` を削除する。

コミットメッセージで削除理由を明記:
`remove app/apply/ (応募フォームを /jobs/[slug] ページ内に統合のため廃止)`

### 2. `StickyApplyCta.tsx` の挙動変更

**変更前:** クリックで `/apply?job=[slug]` へページ遷移
**変更後:** クリックで**同ページ内のフォームエリア**へスムーズスクロール or アコーディオン展開

実装方式はCodexの判断で選んでよいが、以下の基準で決定すること:

| 方式 | メリット | デメリット |
|---|---|---|
| スムーズスクロール | 実装シンプル、フォームの存在が視覚的に自然 | フォームへ到達するまでスクロールが必要 |
| アコーディオン展開 | その場でフォームが出現、求人情報が常に上部に見える | 実装やや複雑 |

**選んだ方式をコミットメッセージに明記すること。**

スムーズスクロールの場合は `id="apply-form"` 等の anchor を使い、`scrollIntoView` で実装することを推奨:

```tsx
// StickyApplyCta.tsx の変更イメージ
"use client";
export function StickyApplyCta() {
  const handleClick = () => {
    document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <button onClick={handleClick} aria-label="応募フォームへ移動" className="...">
      応募する
    </button>
  );
}
```

アコーディオンの場合は Zustand or useState でフォームの開閉状態を管理し、ボタン押下でフォームを展開する実装を推奨。

### 3. 応募フォームコンポーネントの新規作成

新規ファイル: `components/job/ApplyForm.tsx`

**確定フォーム項目(`docs/05-sitemap.md` §3.3 より、一字一句正確に):**

| # | 項目 | 入力タイプ | 必須 |
|---|---|---|---|
| 1 | 姓(漢字) | text | 必須 |
| 2 | 名(漢字) | text | 必須 |
| 3 | 姓(カナ) | text | 必須 |
| 4 | 名(カナ) | text | 必須 |
| 5 | 性別 | select(男性/女性) | 必須 |
| 6 | 生年月日 | date | 任意 |
| 7 | 電話番号 | tel | 必須 |
| 8 | メールアドレス | email | 必須 |
| 9 | 住所 | 郵便番号(自動補完) + 都道府県select + 市区町村以降 | 必須 |
| 10 | プライバシーポリシー同意 | checkbox | 必須 |

**住所入力の実装(郵便番号自動補完):**

- 郵便番号フィールドに7桁入力(ハイフンなし or あり)すると、`zipcloud.ibsnet.co.jp` API を叩いて都道府県・市区町村を自動補完する
- API: `GET https://zipcloud.ibsnet.co.jp/api/search?zipcode={郵便番号}`
- レスポンス例:
  ```json
  {
    "results": [{
      "address1": "北海道",
      "address2": "利尻郡利尻富士町",
      "address3": "鴛泊"
    }]
  }
  ```
- `address1`(都道府県)→ 都道府県selectに自動セット
- `address2` + `address3`(市区町村以降)→ テキストフィールドに自動入力
- 自動補完後も手動での修正が可能
- 郵便番号が存在しない場合のエラーハンドリング(「該当する住所が見つかりませんでした」等)

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import { useState } from "react";

interface ApplyFormProps {
  jobTitle: string;
  jobSlug: string;
}

export function ApplyForm({ jobTitle, jobSlug }: ApplyFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 郵便番号自動補完
  async function handleZipCode(zip: string) {
    if (zip.replace(/-/g, "").length !== 7) return;
    const res = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip.replace(/-/g, "")}`
    );
    const data = await res.json();
    if (data.results) {
      const { address1, address2, address3 } = data.results[0];
      // 都道府県・市区町村を対応フィールドにセット
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: 実際の送信処理を後で実装
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  if (isSubmitted) {
    return (
      <div>
        <p>届きました。3営業日以内にお返事します。</p>
        {/* TODO: GA計測イベント発火ポイント */}
      </div>
    );
  }

  return (
    <form id="apply-form" onSubmit={handleSubmit}>
      {/* フォーム先頭に応募対象の求人名を表示 */}
      <div>応募先: {jobTitle}</div>
      {/* 各フィールド */}
    </form>
  );
}
```

**バリデーション:**
- 必須項目が空: 「あ、ここをもう一度お願いします。」(`docs/06-messaging.md` §10.2)
- メール形式不正: 「メールアドレスを確認してください。」(同§10.2)
- カナフィールドにひらがな・漢字が入力された場合: 「カタカナで入力してください。」(messaging.mdに明記がないためこの文言を使用)
- 送信中: 「送信中...」(同§10.3)
- 送信ボタン disabled 時のラベル: 「必須項目を入力してください」(同§10.3)

**送信完了後の表示:**
- フォームを非表示にし、「届きました。3営業日以内にお返事します。」(`docs/06-messaging.md` §10.3)を表示
- 「他の求人を見る → /jobs」リンクを完了メッセージ下に表示
- コメントで「TODO: GA計測イベント発火ポイント」を残す

### 4. `/jobs/[slug]/page.tsx` の更新

Task 10 で実装済みの求人詳細ページに `ApplyForm` を追加する。

- フォームの配置位置: 求人詳細コンテンツ(業務内容・条件等)の下、関連求人カードの上
- フォームエリアに `id="apply-form"` を付与(スムーズスクロール方式の場合)
- `ApplyForm` に `jobTitle` と `jobSlug` を props として渡す

---

## 成果物

```
app/
└── apply/              ← 削除
    ├── page.tsx         ← 削除
    └── thanks/
        └── page.tsx     ← 削除
components/
├── job/
│   └── ApplyForm.tsx    (新規)
└── layout/
    └── StickyApplyCta.tsx (更新: ページ遷移→ページ内誘導に変更)
app/
└── jobs/
    └── [slug]/
        └── page.tsx      (更新: ApplyForm を追加)
```

---

## 制約・前提

- `/apply` ページの削除はコミットメッセージで理由を明記すること
- フォーム項目の内容・順序は `docs/05-sitemap.md` §3.3 から変更しない
- マイクロコピーは `docs/06-messaging.md` §10 から正確に引用する(カナバリデーション文言のみ例外)
- 郵便番号自動補完は `zipcloud.ibsnet.co.jp` を使用(外部APIの追加ライブラリは不要、`fetch` で実装)
- 送信処理(メール送信・WP連携等)は実装しない(TODO コメントを残す)
- TypeScript の型エラーを出さない(`any` 禁止)
- Task 10 の詳細ページのその他の部分(フィールド展開・関連求人カード等)は変更しない

---

## やってはいけないこと

- ❌ **`/apply` ページを残す**(廃止確定、削除する)
- ❌ **ページ遷移で別ページに飛ばす**(ページ内完結が設計方針)
- ❌ **フォーム項目の順序・ラベルを変更する**
- ❌ **郵便番号自動補完のために有料APIや重いライブラリを追加する**(zipcloudのfetchで十分)
- ❌ **送信処理(メール送信等)を実装する**
- ❌ **Task 10 の既存詳細ページのレイアウトを大幅に変更する**(ApplyFormの追加のみ)
- ❌ **Header.tsx, Footer.tsx, ColumnBoard.tsx の変更**
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 11a: app/apply/ を削除(応募フォームをページ内統合のため廃止)`
- `Phase 4 Task 11a: ApplyForm.tsx 新規作成(郵便番号自動補完含む)`
- `Phase 4 Task 11a: StickyApplyCta.tsx をページ内スクロール/展開に変更`
- `Phase 4 Task 11a: /jobs/[slug] に ApplyForm を統合`

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `app/apply/` ディレクトリが削除されているか
- [ ] `components/job/ApplyForm.tsx` が存在するか
- [ ] `StickyApplyCta.tsx` が更新されているか
- [ ] `/jobs/[slug]/page.tsx` が更新されているか
- [ ] Header・Footer・ColumnBoard・3D関連が変更されていないか

### フォーム項目の正確性(最重要)
- [ ] 10項目が `docs/05-sitemap.md` §3.3 と一致しているか(姓/名漢字/カナ/性別/生年月日/電話/メール/住所/プライバシー同意)
- [ ] 性別が「男性/女性」の2択selectになっているか
- [ ] 住所が「郵便番号 + 都道府県select + 市区町村以降」に分割されているか
- [ ] プライバシーポリシーのチェックボックスラベルに `/privacy` へのリンクが含まれているか

### 郵便番号自動補完
- [ ] `zipcloud.ibsnet.co.jp` APIを使用しているか
- [ ] 7桁入力で自動補完が発火するか
- [ ] 都道府県selectと市区町村フィールドに自動セットされるか
- [ ] 存在しない郵便番号のエラーハンドリングがあるか

### スティッキーボタンの挙動
- [ ] クリックでページ遷移しないか(`/apply?job=...` へのリンクが残っていないか)
- [ ] クリックでフォームエリアへ誘導(スクロール or アコーディオン展開)されるか
- [ ] 採用した方式(スクロール/アコーディオン)がコミットメッセージに明記されているか

### 送信・完了フロー
- [ ] 送信後にフォームが非表示になり完了メッセージが表示されるか
- [ ] 完了メッセージ: 「届きました。3営業日以内にお返事します。」
- [ ] 「他の求人を見る → /jobs」リンクが完了メッセージ下にあるか
- [ ] TODOコメント(送信処理・GA計測)が残されているか

### マイクロコピー
- [ ] バリデーションエラー: 「あ、ここをもう一度お願いします。」
- [ ] メールエラー: 「メールアドレスを確認してください。」
- [ ] 送信中: 「送信中...」
- [ ] 送信ボタンdisabled時: 「必須項目を入力してください」

### コード品質
- [ ] `ApplyForm` に `jobTitle`/`jobSlug` が props として渡されているか
- [ ] TypeScript の型エラーがないか(`any` 未使用)
- [ ] `<form>` タグが使われているか(通常のNext.jsコンポーネントでは使用可)

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `/jobs` から任意の求人をクリックし `/jobs/[slug]` へ遷移
3. スティッキーボタン「応募する」をクリックし、ページ遷移せずにフォームエリアへ移動することを確認
4. フォームに10項目が表示されることを確認
5. 郵便番号「0970101」を入力し、都道府県「北海道」・市区町村「利尻郡利尻富士町」が自動補完されることを確認
6. 必須項目を空で送信し「あ、ここをもう一度お願いします。」が表示されることを確認
7. 全必須項目を入力して送信し、「届きました。3営業日以内にお返事します。」と「他の求人を見る」リンクが表示されることを確認
8. `/apply` にアクセスして404になることを確認(ページが削除されている)
9. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 11b: `/contact` お問い合わせページ実装**

- フォーム項目7つ(問い合わせ項目選択・名前・フリガナ・メール・電話・内容・プライバシー同意)
- 送信後は同ページ内で完了メッセージ表示
- 住所欄なし(問い合わせフォームは不要)
