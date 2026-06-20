# Phase 4 - Task 07: フッターのスクロール連動フェード制御(Zustand)

**目的:** トップページ(`/`)限定で、島の回転が最大値(±45°)に到達したタイミングを検知し、Footer を `opacity: 0 → 1` でフェードインさせる。Canvas内部(`IslandModel.tsx`)とCanvas外部(`Footer.tsx`)という離れた場所を Zustand ストアで橋渡しする。

---

## コンテキスト

### 前提環境
- **Phase 4 Task 02 完了済み**: `components/scene/IslandModel.tsx` にスクロール連動回転(`clamp → damp`)実装済み
- **Phase 4 Task 06 完了済み**: `components/layout/Footer.tsx`(静的レイアウト、常時 `opacity: 1`)
- `app/layout.tsx` に `Header` と `Footer` が配置済み(全ページ共通)

### 必ず参照すべきドキュメント
- **`docs/05-sitemap.md` §3.1(`/` Home のスクロール挙動)** ← 本タスクの仕様の出典、再掲する
- `AGENTS.md` の「重要な実装パターン」(`clamp → damp` パターン)
- `AGENTS.md` の技術スタック(Zustand: 状態管理、季節管理 `useSeasonStore` と同じ設計思想)
- `docs/04-design-tokens.md` §10.3(`useSeasonStore` の実装例、本タスクのストア設計の参考になる)

### 確定済み仕様(`docs/05-sitemap.md` §3.1 より転記)

```
スクロール開始
  ↓
島が回転(±45°まで、clamp → damp。Phase 4 Task 02実装)
  ↓
回転が±45°(最大値)に到達
  ↓
フッターが opacity: 0 → 1 でフェードイン
  ↓
それ以降スクロールしても見た目上は変化なし(スクロール自体は物理的にロックしない)
```

| 項目 | 仕様 |
|---|---|
| フッター表示後の追加コンテンツ | なし(1ページ完結) |
| フッター出現タイミング | 回転完了の直後 |
| フッター表示方法 | 最初からDOMに存在し、`opacity` をスクロール位置に連動させてフェード |
| スクロールロック | しない |
| 適用範囲 | **トップページ(`/`)限定**。他ページでは Footer は常時 `opacity: 1` のまま |

---

## やってほしいこと

### 1. `store/scroll-progress-store.ts` の新規作成

**責務:** 島の回転進捗(0〜1)とフッター表示フラグを保持する Zustand ストア。

実装内容:
- `AGENTS.md` の `useSeasonStore` パターンを踏襲(同じ `/store/` ディレクトリ、同じ命名規則)
- 状態として最低限以下を持つ:
  - 回転が完了したかどうかのフラグ(boolean)、または回転の進捗値(0〜1の数値)のどちらかを設計判断で選ぶ
- セッター関数を用意し、`IslandModel.tsx` 側から更新できるようにする

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```ts
// /store/scroll-progress-store.ts
import { create } from 'zustand';

interface ScrollProgressState {
  isRotationComplete: boolean;
  setRotationComplete: (complete: boolean) => void;
}

export const useScrollProgressStore = create<ScrollProgressState>((set) => ({
  isRotationComplete: false,
  setRotationComplete: (complete) => set({ isRotationComplete: complete }),
}));
```

設計上の論点(Codexの判断に委ねる):
- 単純な boolean(「完了したかどうか」)で十分か、それとも 0〜1 の連続値(進捗度)を持たせて Footer 側で `opacity` を直接計算させる方が良いか
- 後者の方が「フェードインの滑らかさ」をコントロールしやすい可能性がある。一方、前者はシンプルで Task 02 のロジックへの変更が少なくて済む
- どちらを選んでも、**Task 02 の `clamp → damp` 回転ロジック自体は変更しない**(状態の読み取り・通知を追加するだけ)

### 2. `IslandModel.tsx` の更新(回転完了の検知・通知)

**変更内容:**
- 既存の `useFrame` 内の `clamp → damp` ロジックは**変更しない**
- 回転角度が `MAX_ROTATION`(±45°)に十分近づいた(または到達した)タイミングを検知し、Zustandストアの状態を更新する処理を追加
- 「到達した」の判定は、目標角度と現在角度の差が十分小さい(例: `Math.abs(target - current) < 0.01` 程度の閾値)ことで判定するか、`scroll.offset` 自体が一定値(例: 0.5、`ScrollControls` の回転マッピング上限)を超えたかで判定するか、Codexの判断で実装してよい
- ストア更新は `useFrame` 内で毎フレーム呼ばないよう注意する(状態が変化した時だけ更新する、無駄な再レンダリングを避けるため)

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
// IslandModel.tsx 内、既存の useFrame に追記するイメージ
import { useScrollProgressStore } from "@/store/scroll-progress-store";

// コンポーネント内
const setRotationComplete = useScrollProgressStore((s) => s.setRotationComplete);
const wasCompleteRef = useRef(false);

useFrame((_, dt) => {
  // ...既存の clamp → damp ロジック(変更しない)...

  const isNowComplete = Math.abs(target) >= MAX_ROTATION * 0.95; // 例: 95%到達で完了とみなす
  if (isNowComplete !== wasCompleteRef.current) {
    wasCompleteRef.current = isNowComplete;
    setRotationComplete(isNowComplete);
  }
});
```

`wasCompleteRef` のような ref を使って「状態が変化した時だけストアを更新する」パターンは、`useFrame` 内で Zustand の set を毎フレーム呼ぶことによる無駄な再レンダリングを避けるための工夫。同様の目的を達成できるなら、別の実装方法でも構わない。

### 3. `Footer.tsx` の更新(フェード制御の追加)

**変更内容:**
- `"use client"` を追加(Task 06では不要だったが、Zustandストアを購読するクライアントコンポーネントになるため必須)
- `useScrollProgressStore` からフラグを読み取り、`opacity` を制御する
- **ただしこの制御はトップページ(`/`)限定**。他ページでは常時 `opacity: 1` のまま
- トップページかどうかの判定は `usePathname`(Task 04 の Header で使用済みのパターン)を使う

**参照モード**(このとおりでなくてOK、より良いパターンがあれば提案してください):

```tsx
"use client";
import { usePathname } from "next/navigation";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

export function Footer() {
  const pathname = usePathname();
  const isRotationComplete = useScrollProgressStore((s) => s.isRotationComplete);

  // トップページ以外では常に表示、トップページではフラグに連動
  const isVisible = pathname !== "/" || isRotationComplete;

  return (
    <footer
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 600ms ease",
      }}
      className="..."
    >
      {/* Task 06 で実装済みの中身、変更しない */}
    </footer>
  );
}
```

`transition` の duration(600ms 等)は Codex の判断で調整してよいが、「ふわっと」感が出る程度(極端に速い/遅いものは避ける)にすること。

### 4. アクセシビリティへの配慮

- `opacity: 0` の間、Footer内のリンクがキーボードフォーカス・スクリーンリーダーから見えてしまう問題がある(視覚的に消えていてもDOM上には存在するため)
- `opacity: 0` の状態の時は `aria-hidden="true"` と `pointer-events: none`(または `visibility: hidden` の併用)も設定し、非表示中は操作・読み上げされないようにすること
- フェードイン後(`opacity: 1`)は `aria-hidden` を外し、通常通り操作可能にする

---

## 成果物

```
store/
└── scroll-progress-store.ts   (新規)
components/
├── scene/
│   └── IslandModel.tsx         (更新: 回転完了の検知・通知ロジック追加)
└── layout/
    └── Footer.tsx               (更新: フェード制御追加、"use client" 化)
```

---

## 制約・前提

- Task 02 の `clamp → damp` 回転計算ロジック自体は変更しない(状態の読み取り・通知の追加のみ)
- `useFrame` 内で Zustand の `set` を毎フレーム呼ばない(状態変化時のみ更新、パフォーマンス配慮)
- フェード制御は**トップページ限定**、他ページでは Footer は常時表示
- `opacity: 0` 中はアクセシビリティ対応(`aria-hidden`, `pointer-events: none`)を行う
- TypeScript の型エラーを出さない(`any` 禁止)
- AGENTS.md の Zustand 設計思想(「3Dシーン状態 / UI状態 / データ状態を別ストアで管理」)に従い、本ストアは「3Dシーンの進捗状態」を扱うものとして適切な命名・配置にする

---

## やってはいけないこと

- ❌ **Task 02 の `clamp → damp` 回転計算ロジックを変更する**(状態の追加読み取り・通知のみ許可)
- ❌ **`useFrame` 内で Zustand の `set` を毎フレーム呼ぶ**(状態が変化していなくても呼ぶのはパフォーマンス上NG)
- ❌ **他ページ(`/`以外)で Footer のフェード制御を有効にする**(他ページは常時表示のまま)
- ❌ **スクロールを物理的にロックする処理を追加する**(`docs/05-sitemap.md` で明確に否定されている、見た目上の変化がないだけでスクロール自体は可能)
- ❌ **Task 06 で実装した Footer の中身(4セクション・著作権表記)を変更する**(フェード制御のロジックのみ追加)
- ❌ **Header・ColumnBoard の実装を変更する**
- ❌ **データ取得(WPGraphQL等)を実装する**
- ❌ **WordPress側ファイルへの変更**

---

## Git 運用ルール

コミットメッセージ例:
- `Phase 4 Task 07: scroll-progress-store.ts 新規作成`
- `Phase 4 Task 07: IslandModel.tsx に回転完了検知ロジックを追加`
- `Phase 4 Task 07: Footer.tsx にスクロール連動フェード制御を追加`

設計判断(boolean vs 進捗値、閾値の決め方)を採用した場合は、コミットメッセージか実装報告で理由を明記すること。

---

## レビュー基準(Claude Code レビュー用チェックリスト)

### ファイル構造
- [ ] `store/scroll-progress-store.ts` が存在するか
- [ ] `IslandModel.tsx` が更新されているか
- [ ] `Footer.tsx` が更新され、`"use client"` が追加されているか
- [ ] Task 06 で実装した Footer の中身(4セクション等)が変更されていないか
- [ ] Header・ColumnBoard が変更されていないか
- [ ] WordPress側ファイルが変更されていないか

### 回転ロジックの健全性(最重要)
- [ ] Task 02 の `clamp → damp` 計算式自体が変更されていないか(数式が一致するか確認)
- [ ] `useFrame` 内で Zustand の `set` が状態変化時のみ呼ばれているか(毎フレーム呼んでいないか)
- [ ] スクロール連動回転(Task 02 の動作)が壊れていないか

### フェード制御の正確性
- [ ] トップページ(`/`)でのみフェード制御が有効になっているか
- [ ] 他ページでは Footer が常時 `opacity: 1` のままか
- [ ] 回転完了のタイミングでフッターが `opacity: 0 → 1` に変化するか
- [ ] `transition` が設定され、瞬間的な切り替えでなく「ふわっと」感があるか
- [ ] スクロールが物理的にロックされていないか(回転完了後もスクロール自体は可能か)

### アクセシビリティ
- [ ] `opacity: 0` 中、`aria-hidden="true"` が設定されているか
- [ ] `opacity: 0` 中、`pointer-events: none` 等でクリック・フォーカスを防いでいるか
- [ ] `opacity: 1` になった後、`aria-hidden` が外れ、通常操作できるか

### コード品質
- [ ] Zustandストアの設計が `useSeasonStore` と一貫したパターンになっているか
- [ ] TypeScript の型エラーがないか(`any` 未使用)
- [ ] `usePathname` の使用が Task 04 の Header と一貫しているか

---

## 完了後の確認手順

1. `npm run dev` を起動
2. `http://localhost:3000` をブラウザで開く
3. ページ読み込み直後、Footer が**見えない**(`opacity: 0`)ことを確認
4. スクロールを開始し、島が回転することを確認(Task 02 の動作が壊れていないか)
5. スクロールを進め、回転が最大値(±45°)に達した瞬間、Footer が**ふわっとフェードイン**することを確認
6. フェードイン後、さらにスクロールしても見た目上の変化がない(が、スクロール自体は可能)ことを確認
7. ブラウザの開発者ツールで、`opacity: 0` の間 Footer 内のリンクに Tab キーでフォーカスが当たらないことを確認(アクセシビリティ対応の確認)
8. 別ページ(存在しないため `/jobs` 等にアクセスして404でも良い、もし簡易ページがあれば)で Footer が常時表示されることを確認、またはコード上 `pathname !== "/"` の分岐が正しく機能していることをレビューで確認
9. ページをリロードし、毎回正しく「フッター非表示 → スクロールでフェードイン」が再現されることを確認
10. `npm run build` でビルドエラーがないことを確認

---

## 次タスク予告

未定。Phase 4 の基本的なHUD・スクロール体験が一通り揃ったため、ここで一度状況を確認し、次の優先順位(ピン実装、リンク先ページの雛形作成、Phase 3 の testimonial CPT 対応 等)を相談する。
