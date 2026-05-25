# デザイントークン定義書

**Document version:** 2.0
**作成日:** 2026-05-20
**プロジェクト:** リシリクルート（rishirecruit.com）

---

## 1. 概要

本ドキュメントはリシリクルートのデザインシステムにおける全トークン（カラー・スペーシング・角丸・シャドウ）を定義する。最大の特徴は**季節で変化する山のカラーパレット**で、利尻富士のシンボリックな3層構造（山頂・中腹・麓）を春夏秋冬で表情を変える設計とする。

ロゴ・タイポグラフィ・アニメーションは本ドキュメントの後続バージョンで追加する。

---

## 2. ブランド基本情報

| 項目 | 値 |
|---|---|
| サイト名（日本語） | リシリクルート |
| 英字・ロゴ表記 | rishirecruit（全小文字、一語） |
| ドメイン | rishirecruit.com |
| 主な特徴 | 利尻島の3Dビジュアル × ポップな色彩 × 季節で変化する山の表情 |
| トーン | ポップ・カラフル全開 × 落ち着いた青基調の上品さ |

---

## 3. カラーシステム全体構造

リシリクルートのカラーは **「定数」「季節変動」「アクセント」** の3レイヤーで構成する。

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Core (定数)                            │
│ ・深海ブルー / 海 / 空                          │
│ ・純白 / 暖白                                   │
│ ・セマンティックカラー（成功・警告等）          │
├─────────────────────────────────────────────────┤
│ Layer 2: Seasonal (季節変動)                    │
│ ・山頂 / 中腹 / 麓                              │
│ ・春 / 夏 / 秋 / 冬 の4パターン                 │
├─────────────────────────────────────────────────┤
│ Layer 3: Accents (固定アクセント)               │
│ ・夕陽コーラル / 昆布の金 / 桜貝ピンク          │
│ ・ピン3種に1対1で割り当て                       │
└─────────────────────────────────────────────────┘
```

---

## 4. Layer 1 · コア / 定数カラー

サイト全体を通じて変わらない色。UI骨格・背景・テキスト・海と空などに使用。

### 4.1 ブランドコア

| Token | 用途 | Hex |
|---|---|---|
| `core.deep-ocean` | サイトの最深色、ヘッダー・フッター・主要UI骨格 | `#0A2E4E` |
| `core.sea` | 海の表現、3Dマップの海面、補助UI | `#1B5F8C` |
| `core.sky` | 空の表現、3Dマップの背景、軽いハイライト | `#5BB4E0` |
| `core.ice` | 氷の青、UI内の控えめなアクセント | `#C9E2F0` |

### 4.2 ベース（ペーパー系）

| Token | 用途 | Hex |
|---|---|---|
| `core.snow` | 純白、雪のハイライト、カード背景 | `#FFFFFF` |
| `core.paper` | 暖白、本文・モーダル背景、UI基調 | `#FAF6EE` |

### 4.3 テキスト・線

| Token | 用途 | Hex |
|---|---|---|
| `text.primary` | 本文・見出しの主要色 | `#1F1B16` |
| `text.secondary` | 補助テキスト・キャプション | `#5C544A` |
| `text.tertiary` | プレースホルダ等 | `#A39A8C` |
| `text.inverse` | 暗背景上の文字 | `#FAF6EE` |
| `border.default` | 区切り線・カードボーダー | `#E2D7C2` |
| `border.subtle` | 薄い区切り線 | `#F0EBE0` |

### 4.4 セマンティックカラー（UI状態）

ブランドパレットの中から、状態表示用として固定。

| Token | 用途 | Hex |
|---|---|---|
| `semantic.success` | 成功・OK・公開中 | `#5FA88B`（海岸の苔） |
| `semantic.warning` | 警告・期限間近 | `#F4B942`（昆布の金） |
| `semantic.danger` | エラー・削除確認 | `#D14E2B`（深いコーラル） |
| `semantic.info` | 情報通知 | `#1B5F8C`（海の青） |

---

## 5. Layer 2 · 季節変動カラー（山の3層）

利尻富士の3層を季節で塗り替える。**3Dマテリアルへ動的に適用**するのが本パレットの主目的。

### 5.1 春 spring（3-5月）

「残雪が残り、新緑が芽吹くキラキラした明るい季節」

| Token | 部位 | Hex |
|---|---|---|
| `season.spring.peak` | 山頂 · 残雪 | `#E8E4DA` |
| `season.spring.mid` | 中腹 · 萌え緑 | `#6FA66F` |
| `season.spring.base` | 麓 · 若緑 | `#9FCB85` |

### 5.2 夏 summer（6-8月）

「雪が消え、深い緑に包まれる凛とした季節」

| Token | 部位 | Hex |
|---|---|---|
| `season.summer.peak` | 山頂 · 露岩 | `#B8BCB8` |
| `season.summer.mid` | 中腹 · 深緑 | `#2D5F3C` |
| `season.summer.base` | 麓 · 草緑 | `#5AA862` |

### 5.3 秋 autumn（9-11月）

「紅葉と初雪が交差する、最も色鮮やかな季節」

| Token | 部位 | Hex |
|---|---|---|
| `season.autumn.peak` | 山頂 · 初雪 | `#DFE5EB` |
| `season.autumn.mid` | 中腹 · 紅葉 | `#B5572E` |
| `season.autumn.base` | 麓 · 黄葉 | `#D4A04B` |

### 5.4 冬 winter（12-2月）

「島全体が雪化粧する、静謐で美しい季節」

| Token | 部位 | Hex |
|---|---|---|
| `season.winter.peak` | 山頂 · 厚雪 | `#FFFFFF` |
| `season.winter.mid` | 中腹 · 雪化粧 | `#DCE6EE` |
| `season.winter.base` | 麓 · 雪原 | `#C8D4DC` |

---

## 6. Layer 3 · アクセント / ピンカラー

固定の暖色アクセント。ピン3種に1対1で割り当てる。

| Token | 用途 | Hex |
|---|---|---|
| `accent.sunset-coral` | **求人ピン（KPI重要）** + 主要CTA | `#FF7B5B` |
| `accent.konbu-gold` | **観光地ピン** + 補助アクセント | `#F4B942` |
| `accent.sakura-pink` | **イベントピン** + お祝い・特別感 | `#FF8FB1` |
| `accent.lavender` | （予備）紫陽花、特別な強調 | `#A98BC2` |

---

## 7. ピン色の割り当て

| CPT | カテゴリ | ピン色 | Hex |
|---|---|---|---|
| `job_posting` | 求人 | 夕陽コーラル | `#FF7B5B` |
| `touristspot` | 観光地 | 昆布の金 | `#F4B942` |
| `event` | イベント | 桜貝ピンク | `#FF8FB1` |

### ピンの視覚仕様

- 形状: 上部が円形、下が尖った逆ティアドロップ型
- サイズ: 28px × 28px（PC）、24px × 24px（モバイル）
- 白フチ: 2px solid `#FFFFFF`（**秋季の視認性確保のため必須**）
- カメラに常に正面を向く（Billboard処理）

---

## 8. スペーシングシステム

すべての余白・ギャップ・パディングは **4pxベース** のスケールから選ぶ。Tailwindとの互換性を意識した数値スケール命名。

### 8.1 スケール表

| Token | rem | px | 用途例 |
|---|---|---|---|
| `--space-0` | 0 | 0 | リセット |
| `--space-1` | 0.25 | 4 | ハイラインの隙間（アイコン×文字） |
| `--space-2` | 0.5 | 8 | タイトな間隔（ボタン内padding） |
| `--space-3` | 0.75 | 12 | 小さい間隔 |
| `--space-4` | 1 | 16 | **デフォルト・標準間隔** |
| `--space-5` | 1.25 | 20 | 中間 |
| `--space-6` | 1.5 | 24 | 快適な余白 |
| `--space-8` | 2 | 32 | 大きい間隔 |
| `--space-10` | 2.5 | 40 | カードpadding |
| `--space-12` | 3 | 48 | セクション間 |
| `--space-16` | 4 | 64 | 主要セクション間 |
| `--space-20` | 5 | 80 | ヒーロー周辺 |
| `--space-24` | 6 | 96 | バナー級 |

### 8.2 セマンティックエイリアス（推奨）

数値スケールに加えて、用途別の意味的な命名も用意:

| Token | 値 | 用途 |
|---|---|---|
| `--space-inline-xs` | `--space-1` (4px) | アイコン × 文字 |
| `--space-inline-sm` | `--space-2` (8px) | ボタン内padding |
| `--space-inline-md` | `--space-4` (16px) | デフォルトインライン |
| `--space-stack-sm` | `--space-3` (12px) | 段落間 |
| `--space-stack-md` | `--space-6` (24px) | カード内見出し下 |
| `--space-stack-lg` | `--space-12` (48px) | セクション間 |
| `--space-stack-xl` | `--space-20` (80px) | メジャーセクション間 |

### 8.3 レイアウト用

| Token | 値 | 用途 |
|---|---|---|
| `--container-max` | 1200px | メインコンテンツ最大幅 |
| `--container-narrow` | 720px | テキスト中心のコンテンツ |
| `--container-padding-inline` | `--space-6` (24px) | コンテナの左右余白 |

---

## 9. 角丸スケール

リシリクルートは「ポップ × 信頼」のトーンなので、**少し大きめの角丸**を主要級に持たせて柔らかさを強調する。

### 9.1 スケール表

| Token | 値 | 用途 |
|---|---|---|
| `--radius-0` | 0 | リセット（鋭角） |
| `--radius-sm` | 4px | バッジ・タグ・小さいボタン |
| `--radius-md` | 8px | **カード・入力フィールド（デフォルト）** |
| `--radius-lg` | 12px | プロミナントカード |
| `--radius-xl` | 20px | モーダル・ヒーローカード |
| `--radius-2xl` | 32px | 特別な大きい要素 |
| `--radius-full` | 9999px | ピル・アバター・円形 |

### 9.2 使い分けの原則

- **小さい要素ほど鋭く、大きい要素ほど丸く** が基本
- 同じ階層・コンテキストの要素は同じ角丸を使う
- ボタン: 小（sm/md）か、ピル状（full）の二択
- カード: md(8px)が基本、特別なカードはlg(12px)
- 単方向のborder（border-leftのみ等）には角丸を**つけない**（崩れる）

---

## 10. シャドウシステム

フラットデザイン基調のため**最小限・控えめ**。すべて深海ブルー（`#0A2E4E`）の冷色tintを基調とする。

### 10.1 標準スケール（5段階）

| Token | 用途 |
|---|---|
| `--shadow-none` | リセット |
| `--shadow-xs` | ハイライト的微影、入力hover |
| `--shadow-sm` | カード基本影 |
| `--shadow-md` | プロミナントカード、Sticky CTA |
| `--shadow-lg` | フローティング要素、ドロップダウン |
| `--shadow-xl` | モーダル、ピン詳細パネル |

### 10.2 ポップシャドウ（ブロック影・特別用途）

Blenderロードマップで使用した**3D的なブロック影**スタイル。「押せる感」「立体感」を強調したい特別な要素のみで使う。

| Token | 用途 |
|---|---|
| `--shadow-pop-sm` | 控えめなブロック影 |
| `--shadow-pop-md` | バッジ・数字・特別な要素 |
| `--shadow-pop-lg` | 強調表現 |
| `--shadow-pop-coral` | コーラルCTA（求人詳細ページの固定CTAなど） |
| `--shadow-pop-gold` | ゴールド系の特別な強調 |

**注意:** ポップシャドウは「ここぞ」というポイントだけで使う。全UIに適用すると統一感が崩れる。

---

## 11. CSS変数の実装例

### 11.1 :root レベルのコア定義（全トークン統合）

```css
:root {
  /* ========== Colors: Core ========== */
  --c-deep-ocean: #0A2E4E;
  --c-sea: #1B5F8C;
  --c-sky: #5BB4E0;
  --c-ice: #C9E2F0;
  --c-snow: #FFFFFF;
  --c-paper: #FAF6EE;

  /* Text & borders */
  --c-text-primary: #1F1B16;
  --c-text-secondary: #5C544A;
  --c-text-tertiary: #A39A8C;
  --c-text-inverse: #FAF6EE;
  --c-border-default: #E2D7C2;
  --c-border-subtle: #F0EBE0;

  /* Semantic */
  --c-success: #5FA88B;
  --c-warning: #F4B942;
  --c-danger: #D14E2B;
  --c-info: #1B5F8C;

  /* Pins (accents) */
  --c-pin-job: #FF7B5B;
  --c-pin-spot: #F4B942;
  --c-pin-event: #FF8FB1;
  --c-accent-lavender: #A98BC2;

  /* Seasonal defaults (spring fallback) */
  --c-mt-peak: #E8E4DA;
  --c-mt-mid: #6FA66F;
  --c-mt-base: #9FCB85;

  /* ========== Spacing ========== */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Semantic spacing aliases */
  --space-inline-xs: var(--space-1);
  --space-inline-sm: var(--space-2);
  --space-inline-md: var(--space-4);
  --space-stack-sm: var(--space-3);
  --space-stack-md: var(--space-6);
  --space-stack-lg: var(--space-12);
  --space-stack-xl: var(--space-20);

  /* Layout */
  --container-max: 1200px;
  --container-narrow: 720px;
  --container-padding-inline: var(--space-6);

  /* ========== Border radius ========== */
  --radius-0: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-2xl: 32px;
  --radius-full: 9999px;

  /* ========== Shadows ========== */
  --shadow-none: 0 0 0 transparent;
  --shadow-xs: 0 1px 2px rgba(10, 46, 78, 0.04);
  --shadow-sm: 0 1px 0 rgba(31, 27, 22, 0.04), 0 2px 8px -2px rgba(10, 46, 78, 0.06);
  --shadow-md: 0 1px 0 rgba(31, 27, 22, 0.04), 0 4px 16px -6px rgba(10, 46, 78, 0.10);
  --shadow-lg: 0 1px 0 rgba(31, 27, 22, 0.04), 0 12px 28px -16px rgba(10, 46, 78, 0.18);
  --shadow-xl: 0 1px 0 rgba(31, 27, 22, 0.04), 0 24px 48px -24px rgba(10, 46, 78, 0.22);

  /* Pop shadows (block-style, special) */
  --shadow-pop-sm: 0 4px 0 -1px var(--c-deep-ocean);
  --shadow-pop-md: 0 6px 0 -2px var(--c-deep-ocean);
  --shadow-pop-lg: 0 8px 0 -2px var(--c-deep-ocean);
  --shadow-pop-coral: 0 6px 0 -2px #D14E2B;
  --shadow-pop-gold: 0 6px 0 -2px #A07700;
}
```

### 11.2 季節別オーバーライド

```css
[data-season="spring"] {
  --c-mt-peak: #E8E4DA;
  --c-mt-mid: #6FA66F;
  --c-mt-base: #9FCB85;
}
[data-season="summer"] {
  --c-mt-peak: #B8BCB8;
  --c-mt-mid: #2D5F3C;
  --c-mt-base: #5AA862;
}
[data-season="autumn"] {
  --c-mt-peak: #DFE5EB;
  --c-mt-mid: #B5572E;
  --c-mt-base: #D4A04B;
}
[data-season="winter"] {
  --c-mt-peak: #FFFFFF;
  --c-mt-mid: #DCE6EE;
  --c-mt-base: #C8D4DC;
}
```

`<body data-season="autumn">` のように `<body>` または最上位要素に `data-season` を付与する。

---

## 12. TypeScript設計トークン

```ts
// /lib/design-tokens.ts

export const COLORS = {
  core: {
    deepOcean: '#0A2E4E',
    sea:       '#1B5F8C',
    sky:       '#5BB4E0',
    ice:       '#C9E2F0',
    snow:      '#FFFFFF',
    paper:     '#FAF6EE',
  },
  text: {
    primary:   '#1F1B16',
    secondary: '#5C544A',
    tertiary:  '#A39A8C',
    inverse:   '#FAF6EE',
  },
  border: {
    default: '#E2D7C2',
    subtle:  '#F0EBE0',
  },
  semantic: {
    success: '#5FA88B',
    warning: '#F4B942',
    danger:  '#D14E2B',
    info:    '#1B5F8C',
  },
  accent: {
    sunsetCoral: '#FF7B5B',
    konbuGold:   '#F4B942',
    sakuraPink:  '#FF8FB1',
    lavender:    '#A98BC2',
  },
  pin: {
    jobPosting:  '#FF7B5B',
    touristspot: '#F4B942',
    event:       '#FF8FB1',
  },
} as const;

export const SEASONAL_COLORS = {
  spring: { peak: '#E8E4DA', mid: '#6FA66F', base: '#9FCB85' },
  summer: { peak: '#B8BCB8', mid: '#2D5F3C', base: '#5AA862' },
  autumn: { peak: '#DFE5EB', mid: '#B5572E', base: '#D4A04B' },
  winter: { peak: '#FFFFFF', mid: '#DCE6EE', base: '#C8D4DC' },
} as const;

export type Season = keyof typeof SEASONAL_COLORS;

export const SPACING = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  '2xl': '32px',
  full: '9999px',
} as const;

export const SHADOW = {
  none: '0 0 0 transparent',
  xs: '0 1px 2px rgba(10, 46, 78, 0.04)',
  sm: '0 1px 0 rgba(31, 27, 22, 0.04), 0 2px 8px -2px rgba(10, 46, 78, 0.06)',
  md: '0 1px 0 rgba(31, 27, 22, 0.04), 0 4px 16px -6px rgba(10, 46, 78, 0.10)',
  lg: '0 1px 0 rgba(31, 27, 22, 0.04), 0 12px 28px -16px rgba(10, 46, 78, 0.18)',
  xl: '0 1px 0 rgba(31, 27, 22, 0.04), 0 24px 48px -24px rgba(10, 46, 78, 0.22)',
  popSm: '0 4px 0 -1px #0A2E4E',
  popMd: '0 6px 0 -2px #0A2E4E',
  popLg: '0 8px 0 -2px #0A2E4E',
  popCoral: '0 6px 0 -2px #D14E2B',
  popGold:  '0 6px 0 -2px #A07700',
} as const;
```

---

## 13. 季節判定ロジック

### 13.1 月から季節を自動判定

```ts
// /lib/season/get-current-season.ts

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function getSeasonByMonth(month: number): Season {
  if (month >= 3  && month <= 5)  return 'spring';
  if (month >= 6  && month <= 8)  return 'summer';
  if (month >= 9  && month <= 11) return 'autumn';
  return 'winter';
}

export function getCurrentSeason(date: Date = new Date()): Season {
  return getSeasonByMonth(date.getMonth() + 1);
}
```

### 13.2 オーバーライド機能

雪解けが遅い年・早い年など、運営者が手動で季節を上書きできる仕組みを用意:

- WPの設定ページに「現在の季節を上書き」セレクトを追加
- 値: `auto / spring / summer / autumn / winter`
- フロントは `auto` の場合のみ `getCurrentSeason()` を使用、それ以外は指定値を使う

### 13.3 適用例（Zustandストア）

```ts
// /store/season-store.ts
import { create } from 'zustand';

interface SeasonState {
  season: Season;
  isAuto: boolean;
  setSeason: (season: Season) => void;
  resetToAuto: () => void;
}

export const useSeasonStore = create<SeasonState>((set) => ({
  season: getCurrentSeason(),
  isAuto: true,
  setSeason: (season) => set({ season, isAuto: false }),
  resetToAuto: () => set({ season: getCurrentSeason(), isAuto: true }),
}));
```

---

## 14. 3Dマテリアルへの適用

利尻富士の3層は別マテリアルで管理し、季節tokenから動的に色変更する。

```tsx
// /components/scene/RishiriMountain.tsx
import { useSeasonStore } from '@/store/season-store';
import { SEASONAL_COLORS } from '@/lib/design-tokens';
import { useMemo } from 'react';
import * as THREE from 'three';

export function RishiriMountain({ geometry }) {
  const season = useSeasonStore((s) => s.season);
  const palette = SEASONAL_COLORS[season];

  const materials = useMemo(() => ({
    peak: new THREE.MeshStandardMaterial({ color: palette.peak, flatShading: true }),
    mid:  new THREE.MeshStandardMaterial({ color: palette.mid,  flatShading: true }),
    base: new THREE.MeshStandardMaterial({ color: palette.base, flatShading: true }),
  }), [palette]);

  return (
    <group>
      <mesh geometry={geometry.peak} material={materials.peak} />
      <mesh geometry={geometry.mid}  material={materials.mid} />
      <mesh geometry={geometry.base} material={materials.base} />
    </group>
  );
}
```

Blenderモデル側で `peak` / `mid` / `base` の3つのメッシュに分割しておく必要がある（`reference/blender-roadmap.html` の Step 03 参照）。

---

## 15. アクセシビリティ（コントラスト比）

WCAG AA を目標とする（コントラスト比 4.5:1 以上を推奨）。

主要な組み合わせの確認:

| 前景 | 背景 | 比率 | 判定 |
|---|---|---|---|
| `#1F1B16` (本文) | `#FAF6EE` (paper) | 14.5 | AAA ✓ |
| `#FFFFFF` (白) | `#0A2E4E` (deep ocean) | 14.6 | AAA ✓ |
| `#FFFFFF` (白) | `#FF7B5B` (coral) | 2.9 | × → 大きいサイズで使用 |
| `#FAF6EE` (paper) | `#1B5F8C` (sea) | 7.1 | AAA ✓ |

コーラル等の暖色は**ボタン背景に使用する場合、内側のテキストは白ではなく `#3A1A0E` (暗いコーラル)** を使うと可読性が確保できる。

---

## 16. 今後決定する事項（TBD）

| 項目 | 予定 |
|---|---|
| **ロゴ・シンボル** | 別作業中、完成後にここへ追記 |
| **タイポグラフィ（フォント選定）** | 別作業中、完成後にここへ追記 |
| **アニメーション・トランジション** | v3 で追加予定（duration / easing / 共通パターン） |
| アイコンセット | Tabler / Phosphor 等から検討 |
| 暗色モード対応 | 当面は実装しない方針 |

---

## 17. 改訂履歴

| Version | 日付 | 内容 |
|---|---|---|
| 1.0 | 2026-05-20 | 初版作成（コア + 季節変動 + アクセントの3レイヤー構造を確定） |
| 2.0 | 2026-05-20 | スペーシング（4pxベース・13段階）、角丸（6段階）、シャドウ（標準5段階 + ポップ5種）を追加 |
