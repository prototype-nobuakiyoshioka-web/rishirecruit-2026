import { create } from "zustand";

/**
 * 現在アクティブなエリアピンの画面（CSS pixel）座標。
 * 3D側の Pin コンポーネントが useFrame で毎フレーム更新し、
 * DOM側の PinConnectorOverlay が rAF で読み取り描画に使う。
 *
 * 高頻度更新（60fps）を想定するため、購読は React 再レンダを避けて
 * `getState()` を rAF ループで直接読む使い方を推奨する。
 */
export interface ActivePinScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

interface ActivePinPositionState {
  position: ActivePinScreenPosition;
  setPosition: (position: ActivePinScreenPosition) => void;
}

export const useActivePinPositionStore = create<ActivePinPositionState>((set) => ({
  position: { x: 0, y: 0, visible: false },
  setPosition: (position) => set({ position }),
}));
