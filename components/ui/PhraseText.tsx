import { Fragment } from "react";
import { splitPhrases } from "@/lib/text/phrases";

// 文節の間にだけ折り返し位置(<wbr>)を置く。親に .text-phrase を付けて使う。
export function PhraseText({ text }: { text: string }) {
  return (
    <>
      {splitPhrases(text).map((phrase, i) => (
        <Fragment key={i}>
          {i > 0 ? <wbr /> : null}
          {phrase}
        </Fragment>
      ))}
    </>
  );
}
