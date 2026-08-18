| 要素 | 内容 |
|---|---|
| ラベル | "Area"(英字・小さめ) |
| エリア名 | 「鴛泊」+ ローマ字「OSHIDOMARI」 |
| キャッチコピー | 2行程度の見出し |
| 説明文 | 2〜3行の補足テキスト |

## 実装

### Step 4-1: エリア情報の定数を作成

新規ファイル: lib/constants/areas.ts

export interface AreaInfo {
  slug: string;
  name: string;         // 「鴛泊」
  nameEn: string;       // 「OSHIDOMARI」
  catchCopy: string[];  // キャッチコピー(改行で配列)
  description: string[];// 説明文(改行で配列)
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
    catchCopy: [
      "利尻山の南麓に広がる",
      "自然豊かなエリア",
    ],
    description: [
      "オタトマリ沼をはじめとした",
      "雄大な自然が魅力の鬼脇エリア。",
    ],
  },
};

【注意】
テキストは仮のものです。後で実際の内容に差し替えます。

### Step 4-2: エリア情報パネルコンポーネント作成

新規ファイル: components/scene/AreaInfoPanel.tsx

"use client";
import { AREA_INFO } from "@/lib/constants/areas";

interface AreaInfoPanelProps {
  areaSlug: string;
}

export function AreaInfoPanel({ areaSlug }: AreaInfoPanelProps) {
  const info = AREA_INFO[areaSlug];
  if (!info) return null;

  return (
    <div
      className="fixed z-40 hidden md:block"
      style={{
        top: "calc(var(--space-6) + 6rem)",  // Header の下
        right: "var(--space-6)",
        width: "26rem",
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* ラベル */}
      <p style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "var(--c-pin-spot)",
        letterSpacing: "0.05em",
        marginBottom: "var(--space-2)",
      }}>
        Area
      </p>

      {/* エリア名 */}
      <h2 style={{
        fontSize: "1.75rem",
        fontWeight: 700,
        color: "var(--c-deep-ocean)",
        marginBottom: "var(--space-4)",
      }}>
        {info.name}
        <span style={{
          fontSize: "1rem",
          marginLeft: "var(--space-2)",
          fontWeight: 600,
        }}>
          - {info.nameEn}
        </span>
      </h2>

      {/* キャッチコピー */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        {info.catchCopy.map((line, i) => (
          <p key={i} style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--c-deep-ocean)",
            lineHeight: 1.6,
          }}>
            {line}
          </p>
        ))}
      </div>

      {/* 説明文 */}
      <div>
        {info.description.map((line, i) => (
          <p key={i} style={{
            fontSize: "0.9rem",
            color: "var(--c-text-secondary)",
            lineHeight: 1.7,
          }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

【デザイントークンについて】
docs/04-design-tokens.md を参照し、実際に定義されている
CSS変数名を使ってください。存在しない変数がある場合は
近いものに置き換えるか、直接値を指定してください。

### Step 4-3: app/page.tsx に配置

<AreaInfoPanel areaSlug="oshidomari" /> を追加してください。
暫定的に "oshidomari" 固定です(スクロール連動は Step 6)。

配置場所は IslandCanvas の後、ColumnBoard と同じ階層です。

## 確認手順

1. npm run dev で表示確認
2. 画面右上(Headerの下)にパネルが表示されるか
3. 「Area」「鴛泊 - OSHIDOMARI」「キャッチコピー」「説明文」が
   すべて表示されているか
4. 3D島が見えなくなっていないか(パネルが大きすぎないか)
5. モバイル幅でパネルが非表示になるか(hidden md:block)
6. スクリーンショットを報告

## 制約

- 新規ファイル2つ + app/page.tsx の更新のみ
- Header, Footer, ColumnBoard, 3D関連ファイルは変更しない
- WordPress側ファイルへの変更は行わない
- TypeScript の型エラーを出さない
