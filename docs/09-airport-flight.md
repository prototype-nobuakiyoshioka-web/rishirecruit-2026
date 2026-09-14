# 空港から飛び立つパステル機

丸いウォームホワイトの胴体、ミント色の主翼、コーラルの翼端と尾翼、バター色の回転プロペラを持つ小型双発機。架空の玩具風デザインで、実在航空会社の機体の再現ではない。人物・動物はモデル内に含めない。

- `public/models/rishiri-airplane.glb`：168,328 bytes、4,044三角形、6材質、画像テクスチャ0。PC/SPで共通利用。
- `reference/island-source/rishiri-airplane.blend`：編集可能な元ファイル。
- `scripts/models/build-airplane.py`：Blenderで再生成。島の元ファイルから滑走路の標高も抽出する。
- `lib/three/airport-runway.json`：既存のOSM滑走路442898211を36区間でサンプリング。座標系は島のGLBと同じ。
- `lib/three/airplane-flight.ts`：飛行曲線と事前計算した位置・姿勢。
- `components/scene/Airplane.tsx`：島の子として配置し、島のスクロール回転・倍率に追従。左右のプロペラを回す。

## 動き

滑走路の南西側で3秒待機し、短く滑走して海へ離陸。北側上空から遠方へ抜ける約30秒の飛行を繰り返す。着陸・空港への折り返しは行わず、飛び去った後に次の出発へ戻す装飾アニメーション。速度、距離、機体寸法はジオラマ向けにデフォルメしている。

拡大した空港ターミナルとの接触を避けるため、離陸方向は南西向き。機体全体を島座標で扱い、既存のカメラ、表示倍率、背景、他の装飾は変更しない。画面幅・回転角・飛行位置によって情報パネルの下や画面外に入る時間がある。

毎フレームは事前計算した位置・姿勢の補間とプロペラ回転のみ。`prefers-reduced-motion: reduce` では滑走路上に静止させる。背景タブから復帰した際は、フレーム時間を上限50msに抑えて急な飛行位置の飛びを防ぐ。

## 確認

型チェック、対象ファイルのESLint、飛行経路のVitest 3件が通過。PC表示と390×844のブラウザ幅で読み込み、スクロール切替を確認（スマートフォン実機の性能検証ではない）。

Blenderで飛行経路301か所の機体頂点をPC用島の地形・建物・ランドマークの表面と照合し、接触0件。詳細は `reference/island-source/airplane-validation.json`。離散的なサンプリングであり、連続時間の完全な衝突保証ではない。

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/models/build-airplane.py
npx vitest run tests/unit/airplane-flight.test.ts
```

機体の確認画像：`artifacts/island-miniature/airplane-preview.png`。
