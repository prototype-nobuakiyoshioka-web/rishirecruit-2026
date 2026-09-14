import { CatmullRomCurve3, CubicBezierCurve3, CurvePath, Euler, Quaternion, Vector3 } from "three";
import runway from "./airport-runway.json";

export const AIRPLANE_SCALE = 0.8;
export const FLIGHT_SECONDS = 30;
export const WAIT_SECONDS = 3;
const GEAR_CLEARANCE = 0.67 * AIRPLANE_SCALE + 0.035;
const FRAME_COUNT = 1200;

/** 滑走路の標高を使い、拡大したターミナルを避けて海へ抜ける。 */
export function createAirplaneFlight() {
  const ground = runway.samples.map(([x, y, z]) => new Vector3(x, y + GEAR_CLEARANCE, z));
  const direction = ground[35].clone().sub(ground[0]).setY(0).normalize();
  const path = new CurvePath<Vector3>();
  // ターミナルが拡大されているため、南西側の滑走路から海へ離陸する。
  path.add(new CatmullRomCurve3(ground.slice(0, 4).reverse()));
  path.add(new CubicBezierCurve3(
    ground[0], ground[0].clone().addScaledVector(direction, -3),
    new Vector3(23, 9, -36), new Vector3(12, 14, -40),
  ));
  path.add(new CubicBezierCurve3(
    new Vector3(12, 14, -40), new Vector3(3, 19, -44),
    new Vector3(3, 24, 22), new Vector3(22, 20, 44),
  ));
  path.add(new CubicBezierCurve3(
    new Vector3(22, 20, 44), new Vector3(43, 16, 66),
    new Vector3(52, 21, 68), new Vector3(54, 26, 66),
  ));
  path.add(new CubicBezierCurve3(
    new Vector3(54, 26, 66), new Vector3(56, 31, 64),
    new Vector3(65, 60, 55), new Vector3(80, 70, 40),
  ));
  // 曲線の評価・接線・姿勢は初回だけ計算し、毎フレームは補間だけにする。
  const positions = Array.from({ length: FRAME_COUNT + 1 }, (_, i) => path.getPointAt(i / FRAME_COUNT));
  const rotations: Quaternion[] = [];
  const tangent = new Vector3();
  const nextTangent = new Vector3();
  const euler = new Euler(0, 0, 0, "YXZ");
  for (let i = 0; i <= FRAME_COUNT; i++) {
    const before = positions[Math.max(0, i - 1)];
    const after = positions[Math.min(FRAME_COUNT, i + 1)];
    tangent.subVectors(after, before).normalize();
    nextTangent.subVectors(positions[Math.min(FRAME_COUNT, i + 5)], positions[i]).normalize();
    const turn = tangent.z * nextTangent.x - tangent.x * nextTangent.z;
    const bank = Math.max(-0.22, Math.min(0.22, -turn * 5));
    euler.set(-Math.asin(tangent.y), Math.atan2(tangent.x, tangent.z), bank, "YXZ");
    rotations.push(new Quaternion().setFromEuler(euler));
  }
  return { positions, rotations, frameCount: FRAME_COUNT };
}

/** 発進を滑らかにし、遠方へ抜けた後に次の出発を待つ。 */
export function flightProgress(elapsed: number) {
  const t = Math.max(0, (elapsed % (WAIT_SECONDS + FLIGHT_SECONDS)) - WAIT_SECONDS) / FLIGHT_SECONDS;
  return t - Math.sin(t * Math.PI * 2) / (Math.PI * 2);
}
