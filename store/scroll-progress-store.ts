import { create } from "zustand";

type ScrollProgressState = {
  isRotationComplete: boolean;
  setRotationComplete: (complete: boolean) => void;
  resetRotationComplete: () => void;
  rotationAngle: number;
  setRotationAngle: (angle: number) => void;
  activeAreaSlug: string;
  setActiveAreaSlug: (slug: string) => void;
  // ScrollControls の内部スクロール要素。カードなどキャンバス外の操作から島を回すときに使う。
  scrollElement: HTMLElement | null;
  setScrollElement: (element: HTMLElement | null) => void;
  // 詳細ページから戻ったときに同じ位置へ復元するための、直近のスクロール位置(0〜1)。
  lastScrollOffset: number;
  setLastScrollOffset: (offset: number) => void;
};

export const useScrollProgressStore = create<ScrollProgressState>((set) => ({
  isRotationComplete: false,
  setRotationComplete: (complete) => set({ isRotationComplete: complete }),
  resetRotationComplete: () => set({ isRotationComplete: false }),
  rotationAngle: 0,
  setRotationAngle: (angle) => set({ rotationAngle: angle }),
  activeAreaSlug: "oshidomari",
  setActiveAreaSlug: (slug) => set({ activeAreaSlug: slug }),
  scrollElement: null,
  setScrollElement: (element) => set({ scrollElement: element }),
  lastScrollOffset: 0,
  setLastScrollOffset: (offset) => set({ lastScrollOffset: offset }),
}));
