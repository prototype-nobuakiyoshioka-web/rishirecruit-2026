# Phase 4 - Task 03: Lenis 導入によるスムーススクロール

**目的:** `lenis` パッケージを導入し、ネイティブスクロールをスムーススクロール化する。Task 02 で実装した `<ScrollControls>` ベースの回転制御と**競合しないよう同期**させる。

---

## コンテキスト

### 前提環境
- **Task 01 完了済み**: GLB表示、`components/scene/IslandCanvas.tsx`, `components/scene/IslandModel.tsx`
- **Task 02 完了済み**: `<ScrollControls>` によるスクロール連動回転(`clamp → damp` パターン)、レビューOK
- `npm run dev` → `http://localhost:3000` で、スクロールに応じて島が ±45° 回転することを確認済み

### 必ず参照すべきドキュメント
- **`AGENTS.md` の「よくあるエラーと初手対応」** ← 「スクロール量がズレる」の行に注意点が既に書かれている:
  > Lenis と native scroll の干渉、Lenis に一元化

この一文の意味: Lenis を導入すると、ブラウザのネイティブスクロールイベントと Lenis 独自のスクロール処理が**両方発火**してしまうことがある。スクロール量の基準は **Lenis に一元化**し、二重計測を防ぐ必要がある。

### このタスクの技術的な難所

`<ScrollControls>`(drei)は内部で `scroll.offset` を **DOM のネイティブスクロールイベント** から算出している。Lenis を単純に追加すると、Lenis が独自にスムージングしたスクロール位置と、`ScrollControls` が見ているネイティブスクロール位置が**ズレる**可能性がある。

このタスクでは、**Lenis のスクロール値を `ScrollControls` 側に伝える**形で同期させる(逆に `ScrollControls` の値を使い続けて Lenis を見た目だけのスムージングとして使う設計も許容、後述の選択肢を参照)。

---

## やってほしいこと

### 1. パッケージ追加

```json
"dependencies": {
  "lenis": "1.1.18"
}
```

バージョンは AGENTS.md の「バージョン指定の読み替えルール」に従い、**事前にレジストリ存在確認**を行うこと。存在しない場合は同系統最新安定版に読み替え、読み替えた場合はコミットメッセージに理由を明記する。

### 2. Lenis 統合方針の選択(実装前に判断すること)

以下2つのアプローチがある。**Codexの判断で、より少ない変更・より低リスクな方を選んで進めてよい**。選んだ方針はコミットメッセージか実装報告で明示すること。

#### 方針A: Lenis を見た目のスムージングのみに使う(低リスク・推奨)

- Lenis はスクロールバーの動き(慣性スクロール)を滑らかに見せるためだけに使う
- `<ScrollControls>` の `scroll.offset` 計算はそのまま(Lenis 導入前と同じ)
- Lenis の `raf` ループを R3F の `useFrame` または `requestAnimationFrame` と同期させ、Lenis 自体のアニメーションが正しく進行するようにする

#### 方針B: Lenis のスクロール値を `ScrollControls` に直接連携する(高度・統合度高い)

- `<ScrollControls>` の代わりに、Lenis の `scroll` イベントから直接スクロール進捗(0〜1)を計算し、`IslandModel` の回転制御に渡す
- `useScroll`(drei)を使わず、独自の scroll progress state(Zustand 等)を作る
- より制御しやすいが、変更範囲が大きい

**推奨は方針A**。Task 02 の実装(`clamp → damp` パターン、`<ScrollControls>`)を壊さずに、Lenis のなめらかさだけを追加できるため。方針Bが明らかに必要な技術的理由がある場合のみ、その理由を明記した上で方針Bを選んでよい。

### 3. Lenis のセットアップ(方針Aの場合)

新規ファイル: `components/scene/SmoothScroll.tsx`(ファイル名は提案、より適切な名前があれば変更可)

実装内容:
- `"use client"` 必須
- Lenis インスタンスを `useEffect` 内で生成
- `requestAnimationFrame` ループで `lenis.raf(time)` を呼び続ける
- クリーンアップ(`useEffect` の return)で `lenis.destroy()` を呼ぶ
- このコンポーネントは画面に何も描画しない(副作用のみ)か、`children` をそのまま返すラッパーにする

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

### 4. `app/page.tsx` への統合

`SmoothScroll` で `IslandCanvas` を(または Canvas を含む適切な範囲を)囲む。

**参照モード**:

```tsx
import { IslandCanvas } from "@/components/scene/IslandCanvas";
import { SmoothScroll } from "@/components/scene/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="h-screen bg-[--c-deep-ocean]">
        <IslandCanvas />
      </main>
    </SmoothScroll>
  );
}
```

Task 02 時点の `page.tsx` 構造(Canvas の親要素のクラス・スタイル)はできる限り維持し、`SmoothScroll` でラップする部分のみ追加する。

### 5. 動作検証のポイント(実装中に確認すること)

- Lenis 導入後も、Task 02 で確認した「スクロールで島が ±45° 回転する」動作が**壊れていない**こと
- スクロールの「カクつき」「二重スクロール感」がないこと(あれば Lenis と ScrollControls の競合を疑う)
- もし方針Aで競合が解消できない場合は、その旨を実装報告に明記し、方針Bへの切り替えを提案すること

---

## 成果物

```
components/
└── scene/
    ├── IslandCanvas.tsx    (Task 02 から変更なし、想定)
    ├── IslandModel.tsx     (Task 02 から変更なし、想定)
    └── SmoothScroll.tsx    (新規)
app/
└── page.tsx                (更新: SmoothScroll でラップ)
package.json                (更新: lenis 追加)
package-lock.json           (自動更新)
```

---

## 制約・前提

- `AGENTS.md` の「Lenis と native scroll の干渉、Lenis に一元化」という既存の注意点を踏まえる
- Task 02 の `clamp → damp` 回転ロジックは**変更しない**(方針Aを選んだ場合)
- `useEffect` のクリーンアップで Lenis インスタンスを必ず破棄する(メモリリーク防止)
- TypeScript の型エラーを出さない(`any` 禁止、`lenis` パッケージの型定義を使う)
- パッケージのバージョンは AGENTS.md のルールに従い、事前にレジストリ存在確認をすること

---

## やってはいけないこと

- ❌ **Task 02 の `clamp → damp` 回転ロジックを書き換える**(方針Aの場合。方針Bを選ぶ場合は理由を明記した上で変更可)
- ❌ **Lenis の `raf` ループを `useEffect` のクリーンアップなしで放置する**(メモリリーク、複数回マウントで多重ループの原因)
- ❌ **`requestAnimationFrame` の ID を保存せず `cancelAnimationFrame` を呼べない実装にする**
- ❌ **GLB ノード名・メッシュ構成の変更**
- ❌ **WordPress 側ファイルへの変更**
- ❌ **方針A・方針Bを中途半端に混在させる**(どちらかに決めて一貫させる)

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 03: lenis パッケージ追加`
- `Phase 4 Task 03: SmoothScroll.tsx 新規作成(方針A: 見た目のスムージングのみ)`
- `Phase 4 Task 03: app/page.tsx に SmoothScroll を統合`

方針A/Bのどちらを選んだかは、最初のコミットメッセージ本文に明記すること。
バージョン読み替えが発生した場合もコミットメッセージに理由を明記。

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `components/scene/SmoothScroll.tsx`(または同等の名前)が存在するか
- [ ] `app/page.tsx` が `SmoothScroll` を使うよう更新されているか
- [ ] `IslandCanvas.tsx`, `IslandModel.tsx` が(方針Aの場合)変更されていないか
- [ ] WordPress 側ファイルが変更されていないか

### Lenis 実装
- [ ] `"use client"` が `SmoothScroll.tsx` の先頭にあるか
- [ ] Lenis インスタンスが `useEffect` 内で生成されているか
- [ ] `requestAnimationFrame` ループで `lenis.raf(time)` が呼ばれ続けているか
- [ ] クリーンアップで `lenis.destroy()` と `cancelAnimationFrame()` が両方呼ばれているか
- [ ] `useEffect` の依存配列が空(`[]`)で、マウント時に1回だけ実行されるか

### 動作の健全性(最重要、実機確認必須)
- [ ] Task 02 の回転機能(スクロール連動・±45°制限)が壊れていないか
- [ ] スクロールに「カクつき」「二重スクロール感」がないか
- [ ] ページ最上部・最下部でスクロールが止まる(無限スクロールしない)か

### 採用方針の明確さ
- [ ] 方針A・方針Bのどちらを選んだか、コミットメッセージか実装報告で明示されているか
- [ ] 選んだ方針が一貫して実装されているか(中途半端な混在がないか)

### コード品質
- [ ] TypeScript の型エラーがないか(`any` 未使用)
- [ ] バージョン読み替えが発生した場合、理由が明記されているか

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000` をブラウザで開く
3. マウスホイール・トラックパッドでスクロールし、**慣性のある滑らかなスクロール**になっていることを確認(Lenis 導入前との違いを体感)
4. スクロールに応じて島が回転する(Task 02 の機能)ことを確認 — **壊れていないか最優先で確認**
5. 回転が ±45° の範囲を超えないことを確認
6. ページを連続で何度かリロードし、スクロール動作が安定していることを確認(Lenis の多重初期化がないか)
7. ブラウザの開発者ツールのコンソールにエラー・警告がないことを確認
8. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

**Phase 4 Task 04(仮): UIレイヤーの基盤**

- ヘッダー・ナビゲーション(`docs/05-sitemap.md` のナビ構成を参照)
- 3D Canvas の上に重ねる DOM UI レイヤーの設計
- `components/ui/` ディレクトリの構築開始

(Phase 5「3Dシーン実装」へ進む前に、UI基盤を先に整えるか、ピン実装に進むかは次回相談)

---

## 補足: なぜ方針Aを推奨するか

`<ScrollControls>`(drei)は内部実装として、R3F の Canvas 外側に透明な DOM 要素を生成し、そのスクロール量を `scroll.offset` として提供する仕組みになっている。Lenis でこの DOM 要素のスクロールを完全に乗っ取ろうとすると、drei 側の内部実装に依存した不安定な統合になりやすい。

方針A(Lenis は見た目のスムージングのみ)であれば、`<ScrollControls>` は今まで通り動作し続け、Lenis はその上に「慣性スクロールの気持ちよさ」を追加するだけの安全な構成になる。両者が同じスクロール量を見ている限り、大きな競合は起きにくい。
