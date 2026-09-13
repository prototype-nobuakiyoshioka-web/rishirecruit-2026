# 利尻島ミニチュアモデル（2026-09-14）

現行サイトを、パステル色のローポリ地形・丸い樹木・小さな家屋からなるモデルへ差し替えた。人物・動物は配置しない。既存の鳥・船・飛行機・雲の装飾コンポーネントはシーンの呼び出しから外した。

## 納品ファイル

| 用途 | ファイル | 容量 | 三角形 |
| --- | --- | ---: | ---: |
| PC用 | `public/models/rishiri-miniature.glb` | 890,572 bytes | 96,498 |
| SP用 | `public/models/rishiri-miniature-mobile.glb` | 814,132 bytes | 69,362 |
| 編集用 | `reference/island-source/rishiri-miniature.blend` | — | PCモデル |
| 確認画像 | `artifacts/island-miniature/model-preview.png` | — | Blenderレンダー |

GLBは `Terrain / Buildings / Roads / Vegetation / Water` の5ルートに分類。同一マテリアルのメッシュを各グループ内で結合し、22マテリアル、画像テクスチャ0、Draco圧縮。Three.js付属のDracoデコーダーを `public/draco/` に同梱して外部CDNへの依存を避けた。ライセンスは同ディレクトリ。

Blenderファイルの `Presentation` はプレビュー用カメラ・照明・海面。Web用のGLBには含めない。再エクスポートするときは上記5グループのみを選択して出力する。

## 資料とデフォルメ

- [Googleマップ・利尻島の地形](https://www.google.com/maps/@45.180,141.242,12z/data=!5m1!1e4)で山・海岸・町の位置関係を目視確認。Googleの3Dメッシュや画像を抽出・転載していない。
- 地形の標高は[国土地理院のDEM10B標高タイル](https://maps.gsi.go.jp/development/ichiran.html)、zoom 12のテキスト値から生成。海上の欠損は0mとして扱う。テキストタイルは2024年10月以降更新停止のデータ。
- 海岸線、道路中心線、建物の元位置、港の防波堤、湖沼は[OpenStreetMap](https://www.openstreetmap.org/copyright)。取得日2026-09-14。町域は利尻富士町の行政界relation `4088083`。
- [参考投稿](https://x.com/ouchi/status/2096060921785503819)の表示画像から、淡い配色、丸い樹冠、玩具のようなエッジを参照。キャラクターは制作対象外。
- 水平方向は1km=5単位、標高は2.5倍に強調。海岸線は約70m間隔に簡略化。敷地ごとの精密な測量模型ではない。
- 元の建物5,436件から、町内で道路や他の家と重ならない83棟を代表として配置。住宅の外観・屋根色はデザイン上の創作。実建物の個別形状を再現したものではない。視認性のため建物を拡大し、道路の直近では位置を最大約100m程度ずらす場合がある。元座標と表示座標は `manifest.json` に保存。
- 木330本は、町内の低・中標高帯へ景観表現として配置。個々の樹木の実測位置ではない。町域外は島全体のシルエットを構成する地形のみとし、構造物を配置しない。
- 家屋・岩・防波堤はベベルを適用。建物の微小面とSP版の地形・植物はDecimateで削減。

加工元のデータ・出典情報は `reference/island-source/` に保存。GSI出典とOSM帰属表示をサイトフッターにも追加。OSM由来の地理データはODbL 1.0に従う。

## 再生成

通常は保存済み地理データから、ネットワークなしでBlender生成できる。

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/models/build-miniature.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/models/validate-miniature.py
```

地理データを取り直す場合は `python3 scripts/models/fetch-geodata.py`。GSIタイルとOSM公式APIを使用し、OSMの中間XMLはOSの一時ディレクトリに保存する。APIの混雑・件数制限時には取得が失敗することがある。生成スクリプトは完全な島の海岸線・閉じた町境がない場合に停止する。

座標系はGLBでX=北、Y=上、Z=東、原点は東経141.225・北緯45.18。ピンの緯度経度から生成した値は `manifest.json` の `pins` にあり、`lib/three/pin-positions.ts` と一致させる。

## サイト組み込みと検証

- ±45°・clamp→damp、ScrollControlsのページ数、エリア切替・投稿スライダーは現行処理を維持。
- デバイス判定後に必要なGLBだけをロード。SPはDPR上限1.5、影・ポストエフェクトなし。
- GLB内の色とベベル法線を使い、旧モデル用の強制色置換を除去。海・空・照明もパステル色に調整。
- PC 1280×720、および独立した390×844・375×667のiframe内で実表示確認。鴛泊→鬼脇→鴛泊の切替とピン追従、モバイルでの読み込みエラー0を確認。
- `validate-miniature.py` で完成Blenderメッシュの建物18,615面・道路4,112面の面中心を町境と照合し、町外0件。これは面中心での判定であり、ミリ単位の境界精度保証ではない。
- `npm run typecheck` 通過。`npm run lint` はエラー0件、未変更の `Birds.tsx` に既存の未使用import警告1件。
- `npm run build` 通過（Turbopackの内部ポート生成のため制限環境外で実行）。
- iOS Safari / Android Chromeの実機での性能測定は未実施。
