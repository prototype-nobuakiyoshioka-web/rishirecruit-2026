export interface PinPosition {
  x: number;
  y: number;
  z: number;
}

export const PIN_POSITIONS: Record<string, PinPosition> = {
  // job_posting クラスタピン(pin_location selectの値と対応)
  town_hall: { x: -3.0, y: 2.0, z: -3.0 },
  health_center: { x: -2.0, y: 2.0, z: -2.5 },
  airport: { x: 4.0, y: 2.0, z: -4.0 },
  oniwaki: { x: 2.0, y: 2.0, z: 5.0 },

  // touristspot ピン(WP slugと対応)
  himenuma: { x: -1.0, y: 2.0, z: -5.0 },
  peshi_misaki: { x: -6.0, y: 2.0, z: -1.0 },
  otatomari_numa: { x: 3.0, y: 2.0, z: 5.0 },
  "姫沼": { x: -1.0, y: 2.0, z: -5.0 },
  "ペシ岬展望台": { x: -6.0, y: 2.0, z: -1.0 },
  "オタトマリ沼": { x: 3.0, y: 2.0, z: 5.0 },
  "夕日ヶ丘展望台": { x: -4.5, y: 2.0, z: -2.5 },
  "富士野園地": { x: -3.5, y: 2.0, z: -3.5 },
  "りしり-アート-･-ビジターセンター": { x: -4.5, y: 2.0, z: -1.0 },
  "野塚展望台": { x: 4.5, y: 2.0, z: -2.5 },
  "南浜湿原": { x: 1.5, y: 2.0, z: 5.5 },
  "高山植物展示園": { x: -1.0, y: 2.4, z: -2.0 },
  "甘露泉水": { x: -1.5, y: 2.3, z: -1.5 },
  "利尻山神社": { x: -2.5, y: 2.0, z: -2.0 },
  "利尻山": { x: 0, y: 3.5, z: 0 },
  izumi_no_fukuroma: { x: -1.0, y: 2.0, z: 3.0 },
  numaura_observatory: { x: 4.0, y: 2.0, z: 4.0 },
  test_spot: { x: 0.0, y: 2.0, z: 0.0 },

  // event 専用ピン(event の pin_reference と対応)
  rishirisan_opening: { x: 0, y: 3.5, z: 0 },
};
