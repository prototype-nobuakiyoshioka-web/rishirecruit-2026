import { describe, expect, it } from "vitest";
import { eventLocation, jobLocation, spotLocation, toMapPoint } from "@/lib/map/island-locator";

const OSHIDOMARI = { id: "1", name: "鴛泊", slug: "oshidomari" };
const ONIWAKI = { id: "2", name: "鬼脇", slug: "oniwaki" };
const job = (areas: (typeof OSHIDOMARI)[], pin: string | null) =>
  ({ areas: { nodes: areas }, jobPostingFields: { pinLocation: pin ? [pin] : null } }) as Parameters<typeof jobLocation>[0];

describe("toMapPoint", () => {
  it("見本の説明の表と同じ位置になる", () => {
    expect(toMapPoint({ lat: 45.24756, lon: 141.21458 })).toEqual({ x: 43.3, y: 8.2 }); // 役場本庁舎
    expect(toMapPoint({ lat: 45.1394, lon: 141.3095 })).toEqual({ x: 88.7, y: 73.1 }); // 鬼脇
    expect(toMapPoint({ lat: 45.22662, lon: 141.24566 })).toEqual({ x: 58.2, y: 20.8 }); // 姫沼
  });
});

describe("jobLocation", () => {
  it("鬼脇地区はエリア名と重なるので、施設名を足さない", () => {
    const loc = jobLocation(job([ONIWAKI], "oniwaki"))!;
    expect(loc).toMatchObject({ label: "働く場所", areaName: "鬼脇", sub: "島の南東側", pins: [{ x: 88.7, y: 73.1 }] });
    expect(loc.ariaLabel).toBe("利尻島の地図。鬼脇エリア（島の南東側）の位置にピン");
  });
  it("施設のときは方角のあとに施設名を足す", () => {
    const loc = jobLocation(job([OSHIDOMARI], "town_hall"))!;
    expect(loc.sub).toBe("島の北側・役場本庁舎");
    expect(loc.pins).toEqual([{ x: 43.3, y: 8.2 }]);
  });
  it("保健センターは位置が未確定なので、鴛泊のエリアの位置にピンを立てる", () => {
    expect(jobLocation(job([OSHIDOMARI], "health_center"))!.pins).toEqual([{ x: 48, y: 11.7 }]);
  });
  it("文字は areas、ピンは pinLocation から作り、食い違いを補わない", () => {
    const loc = jobLocation(job([OSHIDOMARI], "oniwaki"))!;
    expect(loc.areaName).toBe("鴛泊");
    expect(loc.pins).toEqual([{ x: 88.7, y: 73.1 }]);
  });
  it("pinLocation がなければエリアの位置、エリアがなければ地図を出さない", () => {
    expect(jobLocation(job([ONIWAKI], null))!.pins).toEqual([{ x: 88.7, y: 73.1 }]);
    expect(jobLocation(job([], "town_hall"))).toBeNull();
  });
});

describe("spotLocation", () => {
  it("位置の表にある観光地は、その位置にピンを立てる", () => {
    const loc = spotLocation({ slug: "himenuma", title: "姫沼", areas: { nodes: [OSHIDOMARI] } })!;
    expect(loc).toMatchObject({ label: "場所", areaName: "鴛泊", sub: "島の北側", pins: [{ x: 58.2, y: 20.8 }] });
    expect(loc.ariaLabel).toBe("利尻島の地図。姫沼（鴛泊エリア、島の北側）の位置にピン");
  });
  it("表にない観光地は、エリアの位置にピンを立てる", () => {
    const loc = spotLocation({ slug: "mount-rishiri", title: "利尻山", areas: { nodes: [OSHIDOMARI] } })!;
    expect(loc.pins).toEqual([{ x: 48, y: 11.7 }]);
    expect(loc.ariaLabel).toBe("利尻島の地図。鴛泊エリア（島の北側）の位置にピン");
  });
  it("位置もエリアもなければ、地図を出さない", () => {
    expect(spotLocation({ slug: "unknown", title: "?", areas: { nodes: [] } })).toBeNull();
  });
});

describe("eventLocation", () => {
  it("エリアが2つなら、鴛泊・鬼脇の順でピンを2本立てる", () => {
    const loc = eventLocation({ areas: { nodes: [ONIWAKI, OSHIDOMARI] } })!;
    expect(loc).toMatchObject({ label: "会場", areaName: "鴛泊・鬼脇", sub: "島の北側・島の南東側" });
    expect(loc.pins).toHaveLength(2);
    expect(loc.ariaLabel).toBe("利尻島の地図。鴛泊エリア（島の北側）と鬼脇エリア（島の南東側）の位置にピン");
  });
  it("エリアがなければ、地図を出さない", () => {
    expect(eventLocation({ areas: null })).toBeNull();
  });
});
