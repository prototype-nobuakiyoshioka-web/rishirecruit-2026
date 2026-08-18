# Phase 5 Task 06: スクロールでエリア自動切替

## 目的

スクロール量に応じて、表示するエリアを鴛泊 → 鬼脇に自動で切り替える。
現在は "oshidomari" 固定になっている箇所を動的にする。

## 仕様

| スクロール範囲 | 表示エリア |
|---|---|
| 0% 〜 50% | 鴛泊(oshidomari) |
| 50% 〜 100% | 鬼脇(oniwaki) |

- 島の回転(Phase 4 Task 02)は維持する
- エリア切替は自動のみ(ピンクリックでの切替は実装しない)
- 切替時、エリア情報パネルとスライダーの内容が同時に変わる
- アクティブなエリアのピンが大きく表示される(Pin.tsx の isActive)

## 実装

### Step 6-1: Zustandストアにエリア状態を追加

store/scroll-progress-store.ts に以下を追加:

```ts
interface ScrollProgressState {
  // 既存
  isRotationComplete: boolean;
  setRotationComplete: (complete: boolean) => void;
  rotationAngle: number;
  setRotationAngle: (angle: number) => void;

  // 追加
  activeAreaSlug: string;
  setActiveAreaSlug: (slug: string) => void;
}

export const useScrollProgressStore = create<ScrollProgressState>((set) => ({
  // 既存の初期値
  isRotationComplete: false,
  setRotationComplete: (complete) => set({ isRotationComplete: complete }),
  rotationAngle: 0,
  setRotationAngle: (angle) => set({ rotationAngle: angle }),

  // 追加
  activeAreaSlug: "oshidomari",
  setActiveAreaSlug: (slug) => set({ activeAreaSlug: slug }),
}));
```

### Step 6-2: IslandModel.tsx でスクロール量からエリアを判定

useFrame 内で scroll.offset を見てエリアを切り替える。
毎フレーム set を呼ばないよう、値が変化した時のみ更新する。

```ts
const setActiveAreaSlug = useScrollProgressStore((s) => s.setActiveAreaSlug);
const currentAreaRef = useRef<string>("oshidomari");

useFrame((_, delta) => {
  // 既存の clamp → damp 回転ロジック(変更しない)
  // ...

  // 追加: スクロール量からエリアを判定
  const nextArea = scroll.offset < 0.5 ? "oshidomari" : "oniwaki";
  if (nextArea !== currentAreaRef.current) {
    currentAreaRef.current = nextArea;
    setActiveAreaSlug(nextArea);
  }
});
```

【重要】
- 既存の回転ロジックは一切変更しないこと
- ref で前回値を保持し、変化時のみ set を呼ぶこと
  (毎フレーム set すると無駄な再レンダリングが発生する)

### Step 6-3: PinLayer に activeAreaSlug を渡す

IslandCanvas.tsx で固定値を渡していた箇所を
ストアから取得するように変更:

```tsx
"use client";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

export function IslandCanvas() {
  const activeAreaSlug = useScrollProgressStore((s) => s.activeAreaSlug);

  return (
    <Canvas camera={{ position: [-6, 5, 12], fov: 55 }}>
      <Background />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ScrollControls pages={3} damping={0}>
        <Suspense fallback={null}>
          <IslandModel>
            {SHOW_PINS && <PinLayer activeAreaSlug={activeAreaSlug} />}
          </IslandModel>
        </Suspense>
      </ScrollControls>
    </Canvas>
  );
}
```

### Step 6-4: AreaInfoPanel をストア連動に変更

components/scene/AreaInfoPanel.tsx を props ではなく
ストアから取得する形に変更:

```tsx
"use client";
import { AREA_INFO } from "@/lib/constants/areas";
import { useScrollProgressStore } from "@/store/scroll-progress-store";

export function AreaInfoPanel() {
  const areaSlug = useScrollProgressStore((s) => s.activeAreaSlug);
  const info = AREA_INFO[areaSlug];
  if (!info) return null;

  // 以下、既存のJSXはそのまま
  // ...
}
```

app/page.tsx の <AreaInfoPanel areaSlug="oshidomari" /> は
<AreaInfoPanel /> に変更してください。

### Step 6-5: AreaPostSlider をストア連動に変更

components/scene/AreaPostSlider.tsx も同様に変更:

```tsx
interface AreaPostSliderProps {
  areaData: Record<string, AreaWithPosts | null>;  // areaSlug を削除
}

export function AreaPostSlider({ areaData }: AreaPostSliderProps) {
  const areaSlug = useScrollProgressStore((s) => s.activeAreaSlug);
  const [activeTab, setActiveTab] = useState<TabType>("job");
  const [slideIndex, setSlideIndex] = useState(0);

  // エリアが変わったらスライドを先頭に戻す
  useEffect(() => {
    setSlideIndex(0);
  }, [areaSlug]);

  const area = areaData[areaSlug];
  // 以下、既存のロジックはそのまま
  // ...
}
```

app/page.tsx の呼び出しも
<AreaPostSlider areaData={areaData} /> に変更してください。

### Step 6-6: 切替時のフェードアニメーション(任意)

エリア切替が唐突に見える場合、
AreaInfoPanel と AreaPostSlider に
CSS transition を追加してもよい:

transition: "opacity 300ms ease",

ただし今回は必須ではありません。
まず切替が動作することを優先してください。

## 制約

- Phase 4 Task 02 の clamp → damp 回転ロジックは変更しない
- useFrame 内で毎フレーム Zustand の set を呼ばない(ref でガード)
- Background.tsx, Pin.tsx は変更しない
- WordPress側ファイルへの変更は行わない
- TypeScript の型エラーを出さない

## 確認手順

1. npm run dev で表示確認
2. 初期表示で「鴛泊 - OSHIDOMARI」が表示されるか
3. スクロールして島が回転するか(既存機能が壊れていないか)
4. スクロール50%を超えたところで「鬼脇 - ONIWAKI」に切り替わるか
5. 切替時にスライダーの内容も鬼脇の投稿に変わるか
6. アクティブなエリアのピンが大きく表示されるか
7. スクロールを戻すと鴛泊に戻るか(双方向)
8. スクリーンショットを2枚(鴛泊時・鬼脇時)報告
