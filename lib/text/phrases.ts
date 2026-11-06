import { loadDefaultJapaneseParser } from "budoux";

// 見出しを文節で折り返すための区切り。Safari は word-break: auto-phrase に未対応なので、
// BudouX で文節に分け、<wbr> と .text-phrase(keep-all)で折り返し位置を決める。
// サーバー側でだけ使う(辞書をクライアントに送らない)。
const parser = loadDefaultJapaneseParser();

const KANJI = /[一-鿿々]/;
const PUNCT = /[\s、。，．・！？!?「」『』（）()〜…]/g;

/**
 * BudouX の結果のうち、見出しで不自然になる切れ目をつなぐ。
 * - 記号を除くと1文字だけの文節(例:「恋人の / 丘」「心動かされた / 島」」)は前とつなぐ
 * - 漢字で終わる2文字以下の文節が漢字で始まる文節に続く場合(例:「航空 / 機利用」)はつなぐ
 * - ひらがな2文字以下の文節(例:「働く」と / いう」)は前とつなぐ
 */
export function mergePhrases(phrases: string[]): string[] {
  const out: string[] = [];
  for (const phrase of phrases) {
    const prev = out[out.length - 1];
    if (prev !== undefined) {
      const single = phrase.replace(PUNCT, "").length === 1;
      const compound =
        prev.length <= 2 && KANJI.test(prev.slice(-1)) && KANJI.test(phrase[0] ?? "");
      const shortKana = /^[\u3041-\u309F]{1,2}$/.test(phrase.replace(PUNCT, "")) && phrase.replace(PUNCT, "") === phrase;
      if (single || compound || shortKana) {
        out[out.length - 1] = prev + phrase;
        continue;
      }
    }
    out.push(phrase);
  }
  return out;
}

export function splitPhrases(text: string): string[] {
  if (!text) return [];
  // 「アート ･ ビジター」のような区切りの中黒が行頭に来ないよう、前の空白を改行しない空白にする
  const normalized = text.replace(/\s+([･・])/g, "\u00A0$1");
  return mergePhrases(parser.parse(normalized));
}

/** いちばん長い文節の文字数。スマホで見出しの文字の大きさを決めるのに使う */
export function longestPhraseLength(texts: string[]): number {
  return Math.max(0, ...texts.flatMap((text) => splitPhrases(text).map((phrase) => [...phrase].length)));
}
