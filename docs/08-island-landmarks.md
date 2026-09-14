# 利尻富士町の8ランドマーク

既存の地理座標を基準に、島全景でも通常の住宅と区別できる寸法・輪郭・配色で8か所を作成。スクロール、エリア切替、既存の表示倍率・背景・装飾コンポーネントは変更しない。GLB参照URLには更新用のクエリを付ける。

| 地点 | 強調した特徴 | 主な参照 |
| --- | --- | --- |
| ペシ岬 | 非対称の急な岩山、草地の頂上、白い鴛泊灯台 | [北海道観光公式](https://www.visit-hokkaido.jp/spot/detail_10395.html) |
| 利尻空港 | 実際の方向に沿った長い滑走路、白線、ガラス壁と曲面屋根のターミナル | OSM 442898211 / 442898213、[北海道観光公式の空港写真](https://www.visit-hokkaido.jp/en/plan/detail_85.html) |
| 鴛泊フェリーターミナル | 横長の白い二層の建物、ガラス帯、乗船通路 | OSM 416889951、[北海道開発局](https://www.hkd.mlit.go.jp/ky/kk/kou_kei/ud49g7000000uk7t.html) |
| 利尻富士町役場 | ベージュの庁舎、中央のガラス面、屋上通信塔、旗竿 | OSM 292985027、[庁舎外観写真](https://commons.wikimedia.org/wiki/File:Rishirifuji_Town_Office.jpg) |
| 利尻富士町役場前公園 | 芝生、滑り台、球形の遊具 | [Googleマップの位置と公園写真](https://www.google.com/maps/search/?api=1&query=45.2473222,141.2153879) |
| 姫沼 | 拡大したエメラルド色の水面、周回木道、湖畔の木々 | OSM 442979645、[北海道森林管理局](https://www.rinya.maff.go.jp/hokkaido/policy/system/rekumori/sizen_kyuuyourin/risiritou/index.html) |
| 沼浦展望台 | 丘の起伏、木製展望デッキ、階段と看板 | [Googleマップの位置と展望台写真](https://www.google.com/maps/search/?api=1&query=45.1168369,141.2896759) |
| オタトマリ沼 | 地図の不規則な輪郭を残した水面、湖畔の遊歩道、湿原の草、針葉樹 | OSM 416887304、[環境省](https://www.env.go.jp/nature/nationalparks/list/rishiri-rebun-sarobetsu/spot/)・[きた北海道観光公式](https://www.north-hokkaido.com/spot/detail_1109.html) |

外観の特徴を取り出したミニチュア表現であり、施設の精密復元ではない。写真は参照のみで、画像テクスチャを貼り付けていない。

役場と公園は実際の距離が短く、そのまま拡大すると重なるため、公園を表示上は南へ約660mずらした。その他にも小さな配置補正を施している。元の緯度経度、表示オフセット、通常の家屋・木々を避ける範囲は `reference/island-source/landmarks.json` に保存。姫沼は水面と地形が重ならないよう、拡大した池の範囲だけ地形をなだらかに調整する。

## 編集と出力

- `scripts/models/landmark_geometry.py`：8か所の形状。
- `scripts/models/build-miniature.py`：地形・住宅とランドマークの統合、PC/SP出力。
- `reference/island-source/rishiri-miniature.blend`：編集可能なPC用の元ファイル。
- `Landmarks` ルートの下に8つの名前付きグループを置く。同じランドマーク内でのみ同一材質のメッシュをまとめる。
- 一般の木を非表示にする現行の `Vegetation` 設定とは分離し、公園・姫沼の識別に必要な樹木はランドマークの一部として表示する。
- SP用GLBも8か所の形状を維持する。通常の森・地形を軽量化し、全体を約10万三角形以内・5MB以内に抑える。

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/models/build-miniature.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/models/validate-miniature.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/models/render-landmarks.py
```

確認画像は `artifacts/island-miniature/landmarks-overview.png`（一般樹木・土台の縁を隠した全景）と `landmarks-details.png`（名前付きの8か所一覧）。確認画像はサイトのDOMパネルを含まないBlenderレンダー。現行の拡大表示では、画面幅・回転角により島の端や北側の一部が画面外・情報パネル下へ回り込む場合がある。

検証：通常の建物・道路・ランドマークのメッシュ面中心を町境と照合、8グループの存在、テクスチャ0、GLB内の三角形数・容量を確認。詳細数値は `manifest.json` / `validation.json`。実機の性能計測は今回の対象外。

最終出力：PC **1,060,024 bytes / 99,789三角形**、SP **946,596 bytes / 77,457三角形**。6ルート・29材質・画像テクスチャ0。通常建物68棟、通常樹木330本。町境外のメッシュ面中心は Buildings / Roads / Landmarks とも0件。PCと390×844のブラウザ表示で読み込み、スクロール回転と鴛泊→鬼脇の切替を確認。`npm run typecheck` と対象コンポーネントのESLintが通過。ブラウザのモバイル幅確認であり、スマートフォン実機の検証ではない。

## オタトマリ沼の追加

既存の傾斜に沿う簡易水面を削除し、`Landmarks/OtatomariPond` に置き換えた。水面はOSMの湖岸線を1.8倍に拡大し、周囲に淡い緑の岸、クリーム色の遊歩道、針葉樹と湿原の草を配置。案内板とベンチはミニチュア上の簡略表現で、現地の個別設備を精密復元したものではない。

拡大済みの沼浦展望台との重なりを避け、表示位置を元座標から北へ約320m・西へ約80m調整。水面を水平に保つため周辺だけ地形をなだらかに整えた。元座標・表示補正は `landmarks.json` に保存。周辺の三日月沼やメヌウショロ沼とは別のオブジェクトとして扱う。

追加部分の確認画像は `artifacts/island-miniature/otatomari-preview.png`。`scripts/models/render-otatomari.py` で再生成できる。
