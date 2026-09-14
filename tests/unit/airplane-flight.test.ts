import { describe, expect, it } from "vitest";
import { AIRPLANE_SCALE, createAirplaneFlight, flightProgress, FLIGHT_SECONDS, WAIT_SECONDS } from "@/lib/three/airplane-flight";
import runway from "@/lib/three/airport-runway.json";

const flight = createAirplaneFlight();
describe("airport flight", () => {
  it("滑走路上で車輪が接地し、上空へ飛び去る", () => {
    const start = flight.positions[0];
    expect(start.x).toBeCloseTo(runway.samples[3][0]);
    expect(start.z).toBeCloseTo(runway.samples[3][2]);
    expect(start.y - 0.67 * AIRPLANE_SCALE).toBeCloseTo(runway.samples[3][1] + 0.035);
    expect(flight.positions.at(-1)!.y).toBeGreaterThan(60);
  });
  it("停機中は移動せず、出発と遠方で減速する", () => {
    expect(flightProgress(0)).toBe(0);
    expect(flightProgress(WAIT_SECONDS)).toBe(0);
    expect(flightProgress(FLIGHT_SECONDS + WAIT_SECONDS)).toBe(0);
    const end = flightProgress(FLIGHT_SECONDS + WAIT_SECONDS - 0.001);
    expect(end).toBeCloseTo(1, 8);
  });
  it("北東の海から北麓上空を回り、有限な姿勢で滑らかに飛ぶ", () => {
    expect(Math.max(...flight.positions.map(p => p.y))).toBeGreaterThan(15);
    expect(Math.min(...flight.positions.map(p => p.x))).toBeGreaterThan(5);
    for (let i = 1; i <= flight.frameCount; i++) {
      expect(flight.positions[i].distanceTo(flight.positions[i - 1])).toBeLessThan(0.25);
      expect(flight.rotations[i].length()).toBeCloseTo(1);
      expect(flight.rotations[i].angleTo(flight.rotations[i - 1])).toBeLessThan(0.25);
    }
  });
});
