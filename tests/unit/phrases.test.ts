import { describe, expect, it } from "vitest";
import { mergePhrases, splitPhrases } from "@/lib/text/phrases";

describe("mergePhrases", () => {
  it("記号以外の1文字の文節は前とつなぐ", () => {
    expect(mergePhrases(["白い", "恋人の", "丘", "（沼浦展望台）"])).toEqual(["白い", "恋人の丘", "（沼浦展望台）"]);
  });
  it("記号を除いて1文字の文節も前とつなぐ", () => {
    expect(mergePhrases(["「心動かされた", "島」"])).toEqual(["「心動かされた島」"]);
  });
  it("記号だけの文節はつながない", () => {
    expect(mergePhrases(["北海島まつり", "（鴛泊・鬼脇）"])).toEqual(["北海島まつり", "（鴛泊・鬼脇）"]);
  });
  it("漢字2文字以下 + 漢字始まりはつなぐ", () => {
    expect(mergePhrases(["航空", "機利用旅客の", "案内スタッフ"])).toEqual(["航空機利用旅客の", "案内スタッフ"]);
  });
  it("ひらがな2文字以下の文節は前とつなぐ", () => {
    expect(mergePhrases(["「島で", "働く」と", "いう", "選択を"])).toEqual(["「島で", "働く」という", "選択を"]);
  });
  it("それ以外はそのまま", () => {
    expect(mergePhrases(["うにうに", "フェスティバル"])).toEqual(["うにうに", "フェスティバル"]);
  });
});

describe("splitPhrases", () => {
  it("単語の途中で切らない", () => {
    expect(splitPhrases("うにうにフェスティバル")).toEqual(["うにうに", "フェスティバル"]);
  });
  it("空文字は空配列", () => {
    expect(splitPhrases("")).toEqual([]);
  });
});
