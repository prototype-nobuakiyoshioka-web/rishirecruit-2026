export interface PinPosition {
  x: number;
  y: number;
  z: number;
}

export const PIN_POSITIONS: Record<string, PinPosition> = {
  town_hall: { x: -3.0, y: 2.0, z: -3.0 },
  health_center: { x: -2.0, y: 2.0, z: -2.5 },
  airport: { x: 4.0, y: 2.0, z: -4.0 },
  oniwaki: { x: 2.0, y: 2.0, z: 5.0 },
  izumi_no_fukuroma: { x: -1.0, y: 2.0, z: 3.0 },
  numaura_observatory: { x: 4.0, y: 2.0, z: 4.0 },
  test_spot: { x: 0.0, y: 2.0, z: 0.0 },
  rishirisan_opening: { x: 0, y: 3.5, z: 0 },
};
