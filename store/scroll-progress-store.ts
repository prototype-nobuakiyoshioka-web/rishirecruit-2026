import { create } from "zustand";

type ScrollProgressState = {
  isRotationComplete: boolean;
  setRotationComplete: (complete: boolean) => void;
  resetRotationComplete: () => void;
  rotationAngle: number;
  setRotationAngle: (angle: number) => void;
};

export const useScrollProgressStore = create<ScrollProgressState>((set) => ({
  isRotationComplete: false,
  setRotationComplete: (complete) => set({ isRotationComplete: complete }),
  resetRotationComplete: () => set({ isRotationComplete: false }),
  rotationAngle: 0,
  setRotationAngle: (angle) => set({ rotationAngle: angle }),
}));
