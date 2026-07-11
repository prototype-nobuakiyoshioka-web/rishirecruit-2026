# Rishiri Recruit 2026

利尻島を3Dローポリ&ポップに表現したインタラクティブサイトのリポジトリ。
スクロールで島が回転し、ピン（求人 / イベント / 観光地 / コラム）から詳細を引き出す体験を目指します。

参考: <https://haru-ni.net>

## 構成

| レイヤー | 技術 | 役割 |
| --- | --- | --- |
| フロント | Next.js 16 (App Router) + React 19 + Tailwind v4 | 3Dシーン・UI |
| 3D | React Three Fiber / drei / postprocessing | 島・ピン描画 |
| データ | WordPress (Headless) + WPGraphQL + ACF Pro | コンテンツ管理 |
| WPテーマ | `style.css` / `index.php` / `front-page.php` / `functions.php` | 最小ヘッドレス構成 |

> このディレクトリはWordPressテーマ本体でもあり、Next.jsアプリケーションのルートでもあります。
> WordPress側は管理機能とAPIのみを担当し、表示はNext.jsに集約します。

## セットアップ

```bash
npm install
npm run dev   # http://localhost:3000
```

## ディレクトリ

```
/app                 Next.js App Router
/components
  /scene             3D（Canvas / Island / Pins / Lighting）
  /ui                DOM側UI（Modal / Filter / Nav）
/lib
  /wp                GraphQLクライアントとクエリ
  /three             clamp回転・Billboard等のヘルパ
/public/models       island.glb / island-mobile.glb
/store               Zustand（scene / ui / data）
/docs                要件・スキーマ
/reference           完全仕様HTML
```

## 参考

- 完全仕様: `reference/rishiri_3d_site_procedure_ai_optimized.html`
- 要件定義: `docs/01-requirements.md`
- コンテンツスキーマ: `docs/03-content-schema.md`
- Claude 用ガイド: `CLAUDE.md`（`AGENTS.md` は同内容のsymlink）

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Next.js 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番起動 |
| `npm run lint` | ESLint |


###作業者（人間）
確認方法
npm run dev → http://localhost:3000 