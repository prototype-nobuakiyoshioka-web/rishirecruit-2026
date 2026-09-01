// 新モデル (rishiri-prototype3.glb) 基準の座標。
// GLB world size: x=94.11, y=21.85, z=89.77 / center: (-1.54, 10.92, 0.85)
// Y は海岸沿いの街なので低めに設定。値は微調整可能。
export const AREA_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  oshidomari: { x: 18, y: 6, z: 22 },
  oniwaki: { x: -25, y: 7, z: -5 },
};
