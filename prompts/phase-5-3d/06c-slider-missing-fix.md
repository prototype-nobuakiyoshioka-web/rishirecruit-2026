# Phase 5 Task 06c: スライドショーが表示されない問題の修正

## 問題

Task 06(スクロールでエリア自動切替)の実装後、
画面右下に表示されていたタブ付きスライドショー
(AreaPostSlider)が表示されなくなった。

エリア情報パネル(AreaInfoPanel)は正常に表示されている。

## 調査手順

以下を順番に確認してください。

### 確認1: app/page.tsx で AreaPostSlider が呼ばれているか

Task 06 で props を areaSlug から削除して areaData のみに
変更した際、呼び出し自体が消えていないか確認してください。

期待する形:
<AreaPostSlider areaData={areaData} />

### 確認2: areaData が正しく渡っているか

app/page.tsx で以下のログを一時的に追加して確認:

console.log('areaData:', areaData);
console.log('oshidomari posts:', areaData.oshidomari);

WordPressからデータが取得できているか、
両エリアのキーが存在するか確認してください。

### 確認3: AreaPostSlider 内部で早期 return していないか

components/scene/AreaPostSlider.tsx で
以下のような早期 return がないか確認:

const area = areaData[areaSlug];
if (!area) return null;   // ← ここで null が返っている可能性

areaSlug がストアから正しく取得できているか、
areaData のキーと一致しているか確認してください。

一時的にログを追加:
console.log('areaSlug:', areaSlug, 'area:', area);

### 確認4: props の型不一致

Task 06 で AreaPostSliderProps から areaSlug を削除したが、
app/page.tsx 側で古い props を渡したまま、または
コンポーネント内部で削除した areaSlug を参照したままに
なっていないか確認してください。

TypeScriptのビルドエラーが出ていないかも確認:
npm run build

### 確認5: CSS(表示位置)の問題

コンポーネントは描画されているが画面外に出ている可能性。
ブラウザの開発者ツールで DOM を検索し、
AreaPostSlider の要素が存在するか確認してください。

存在する場合、以下を確認:
- bottom / right の値が適切か
- z-index が他の要素より低くなっていないか
- hidden md:block のクラスが効いているか(画面幅の問題)

## 修正

上記の調査で原因を特定し、修正してください。
修正後、一時的に追加したログはすべて削除してください。

## 確認手順

1. npm run dev で表示確認
2. 画面右下にタブ(Job/Event/Spot)とスライドショーが表示されるか
3. タブを切り替えて内容が変わるか
4. スクロールでエリアが切り替わった時、
   スライドショーの内容も鬼脇のものに変わるか
5. エリア情報パネルが引き続き正常に動作するか
6. npm run build が通るか
7. スクリーンショットを報告

## 制約

- Background.tsx, IslandModel.tsx, Pin.tsx は変更しない
- Task 06 で実装したエリア自動切替の機能は維持する
- WordPress側ファイルへの変更は行わない
